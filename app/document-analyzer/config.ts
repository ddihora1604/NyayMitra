// Configuration for the document-analyzer page to ensure proper behavior
export const dynamic = 'force-dynamic'; // Force dynamic rendering to handle file uploads properly
export const dynamicParams = true; // Allow for dynamic parameters
export const revalidate = 0; // Disable caching for this route to ensure fresh uploads

// Supported file types for document analysis
export const SUPPORTED_FILE_TYPES = [
  {
    extension: '.pdf',
    mimeType: 'application/pdf',
    name: 'PDF Document'
  },
  {
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    name: 'Word Document'
  },
  {
    extension: '.txt',
    mimeType: 'text/plain',
    name: 'Text File'
  }
];

// Maximum file size in bytes (default: 10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; 