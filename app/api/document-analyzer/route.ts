import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '@/app/document-analyzer/config';

// Ensure this route is always dynamically rendered
export const dynamic = 'force-dynamic';

// Timeout for document analysis in milliseconds (2 minutes)
const ANALYSIS_TIMEOUT = 2 * 60 * 1000;

// Handle file upload and document analysis
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    // Get file extension
    const fileExt = path.extname(file.name).toLowerCase();
    
    // Check file type
    const isValidType = SUPPORTED_FILE_TYPES.some(type => type.extension === fileExt);
    if (!isValidType) {
      return NextResponse.json(
        { error: `Invalid file type. Only ${SUPPORTED_FILE_TYPES.map(t => t.name).join(', ')} are supported.` },
        { status: 400 }
      );
    }

    // Generate a unique temporary file path
    const tempDir = os.tmpdir();
    const uniqueId = uuidv4();
    const filePath = path.join(tempDir, `${uniqueId}${fileExt}`);
    
    try {
      // Save the file to the temporary location
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, fileBuffer);
    } catch (err) {
      console.error('Error saving uploaded file:', err);
      return NextResponse.json({ error: 'Failed to process uploaded file' }, { status: 500 });
    }
    
    // Execute the document_analyzer.py script with the file as input
    return new Promise((resolve) => {
      // Create a timeout to prevent hanging processes
      const timeoutId = setTimeout(() => {
        console.error('Document analysis timed out');
        cleanup();
        return resolve(NextResponse.json({ 
          error: 'Analysis timed out. Your document may be too large or complex.' 
        }, { status: 504 }));
      }, ANALYSIS_TIMEOUT);
      
      // Function to clean up resources
      const cleanup = async () => {
        clearTimeout(timeoutId);
        try {
          // Check if file exists before deleting
          const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);
          if (fileExists) {
            await fs.unlink(filePath);
          }
        } catch (err) {
          console.error('Error cleaning up temporary file:', err);
        }
      };
      
      // Set environment variables for the child process to ensure proper encoding
      const env = {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1'
      };
      
      // Add flag to capture the document text for Q&A
      const command = `python document_analyzer.py "${filePath}" --no-interactive --capture-text`;
      
      // Run the document analyzer script
      const childProcess = exec(
        command, 
        { 
          maxBuffer: 1024 * 1024 * 10,
          env: env
        }, 
        async (error, stdout, stderr) => {
          try {
            // Clean up the temporary file
            await cleanup();
            
            if (error) {
              console.error(`Error executing script: ${error.message}`);
              console.error(`stderr: ${stderr}`);
              return resolve(NextResponse.json({ 
                error: 'Error analyzing document', 
                details: stderr
              }, { status: 500 }));
            }
            
            // Check for analysis results in the output
            const analysisStartMarker = '─── ANALYSIS OUTPUT FOR API ───';
            const documentTextMarker = '─── DOCUMENT TEXT FOR QA ───';
            
            let analysis = '';
            let documentText = '';
            
            // Extract analysis
            if (stdout.includes(analysisStartMarker)) {
              const parts = stdout.split(analysisStartMarker);
              if (parts.length > 1) {
                // If document text marker exists, extract both parts
                if (parts[1].includes(documentTextMarker)) {
                  const subparts = parts[1].split(documentTextMarker);
                  analysis = subparts[0].trim();
                  documentText = subparts[1].trim();
                } else {
                  analysis = parts[1].trim();
                }
              }
            } else {
              analysis = stdout.trim();
            }
            
            // Process the output from document_analyzer.py
            const result = {
              analysis: analysis,
              documentText: documentText,
              filename: file.name,
              timestamp: new Date().toISOString()
            };
            
            return resolve(NextResponse.json(result));
          } catch (cleanupError) {
            console.error('Error in cleanup:', cleanupError);
            return resolve(NextResponse.json({ error: 'Error during processing' }, { status: 500 }));
          }
        }
      );
      
      // Handle potential child process errors
      childProcess.on('error', async (err) => {
        console.error('Child process error:', err);
        await cleanup();
        return resolve(NextResponse.json({ error: 'Failed to execute analysis script' }, { status: 500 }));
      });
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 