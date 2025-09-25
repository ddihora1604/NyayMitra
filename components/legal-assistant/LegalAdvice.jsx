"use client";

import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Dynamically import Graphviz to avoid SSR issues
const Graphviz = dynamic(
  () => import('graphviz-react').then((mod) => mod.Graphviz),
  { ssr: false }
);

const LegalAdvice = () => {
  const [legalQuery, setLegalQuery] = useState("What rights do I have if my landlord refuses to fix maintenance issues?");
  const [adviceText, setAdviceText] = useState("");
  const [flowchartDot, setFlowchartDot] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingFlowchart, setIsGeneratingFlowchart] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const GEMINI_API_KEY = "AIzaSyCLoBWpcOAWurtUAWS8nL9haUtt17u15Vg";
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const handleGetAdvice = async () => {
    if (!legalQuery.trim()) {
      setError("Please enter your legal question.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setFlowchartDot("");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        You are a legal advisor specializing in Indian law. Provide brief, concise, and practical legal advice 
        tailored to this specific query: "${legalQuery}"

        Your advice should briefly cover:
        1. The key legal issues presented in the query
        2. Only the most relevant Indian laws or statutes that apply
        3. A concise explanation of main legal rights or obligations
        4. 2-3 actionable recommendations or steps
        5. 1-2 potential risks to be aware of

        IMPORTANT FORMATTING AND CONTENT INSTRUCTIONS:
        - Keep your response short, direct, and to the point (maximum 300 words total)
        - Focus solely on the most important legal points, avoiding unnecessary background information
        - Always format using clean Markdown with concise headings, bullet points, and minimal spacing
        - Use level 2 headings (##) for main sections only (limit to 3-4 sections maximum)
        - Make relevant legal acts and statutes **bold** for emphasis
        - Use bullet points for recommendations and numbered lists for sequential steps
        - Format key legal terms in italics
        - Start with a very brief 1-2 sentence summary
        - Avoid lengthy explanations, theoretical discussions, or background information
        - Prioritize practical advice over comprehensive coverage
        
        End with a 1-line disclaimer about the general nature of the advice.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setAdviceText(text);
      setSuccess(true);

      console.log("Legal advice generated successfully:", text);

    } catch (err) {
      console.error("Advice generation error:", err);
      setError(`An error occurred during advice generation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFlowchart = async () => {
    if (!adviceText) return;
  
    setIsGeneratingFlowchart(true);
    setError(null);
  
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
      const flowchartPrompt = `
        Analyze the following legal advice text and generate a flowchart in Graphviz DOT language syntax 
        that outlines the recommended steps or actions for the user.
  
        Instructions for DOT generation:
        - Use rankdir=TB for top-to-bottom flow
        - Use shape=box, style=filled, fillcolor="#FFC526" for regular steps
        - Use shape=diamond, style=filled, fillcolor="#FFEDA8" for decision points
        - Use color="#E0A000" for arrows
        - Represent the flow logically using arrows (->)
        - Use labels on arrows for decision outcomes (e.g., [label="Yes"], [label="No"])
        - Ensure the output is ONLY valid DOT code, starting with 'digraph G {' and ending with '}'
        - Keep the flowchart concise and focused on key actions

        Legal Advice Text:
        ${adviceText}
  
        Generate the DOT code now:
      `;
  
      const result = await model.generateContent(flowchartPrompt);
      const response = await result.response;
      let dotCode = response.text();
  
      if (!dotCode) {
        throw new Error("No valid response text received from Gemini");
      }
  
      // Clean up the response
      dotCode = dotCode.trim();
      if (dotCode.startsWith("```dot")) {
        dotCode = dotCode.substring(6).trim();
      }
      if (dotCode.startsWith("```")) {
        dotCode = dotCode.substring(3).trim();
      }
      if (dotCode.endsWith("```")) {
        dotCode = dotCode.substring(0, dotCode.length - 3).trim();
      }
  
      if (dotCode.startsWith('digraph') && dotCode.endsWith('}')) {
        setFlowchartDot(dotCode);
        console.log("Flowchart DOT code generated:", dotCode);
      } else {
        throw new Error("Invalid DOT code format received");
      }
  
    } catch (err) {
      console.error("Flowchart generation error:", err);
      setError(`Could not generate flowchart: ${err.message}`);
    } finally {
      setIsGeneratingFlowchart(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([adviceText], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = "Legal_Advice.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="legalQuery">Enter your legal question:</Label>
              <Textarea
                id="legalQuery"
                value={legalQuery}
                onChange={(e) => setLegalQuery(e.target.value)}
                rows={6}
                className="mt-1"
                placeholder="What rights do I have if my landlord refuses to fix maintenance issues?"
              />
            </div>
            
            <div>
              <Button 
                onClick={handleGetAdvice}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Analyzing your legal query..." : "Get Legal Advice"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && <p className="text-amber-600">Analyzing your legal question...</p>}
      
      {error && <p className="text-red-500 p-4 bg-red-50 rounded-md">{error}</p>}
      
      {success && (
        <>
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Legal Advice</h3>
              
              <div className="prose prose-amber prose-headings:text-amber-700 prose-h2:text-xl prose-h3:text-lg prose-h4:font-semibold prose-strong:text-amber-700 prose-a:text-amber-600 max-w-none overflow-auto">
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          style={oneLight}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-md border border-amber-100"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      );
                    },
                    // Customize other elements
                    h2: ({node, ...props}) => <h2 className="text-amber-700 font-bold text-xl mt-6 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-amber-600 font-semibold text-lg mt-5 mb-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-200 pl-4 italic text-gray-700 my-4" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-amber-700" {...props} />,
                    em: ({node, ...props}) => <em className="text-gray-800" {...props} />,
                  }}
                >
                  {adviceText}
                </ReactMarkdown>
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button onClick={handleDownload} variant="outline">
                  Download Legal Advice
                </Button>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(adviceText);
                    alert("Legal advice copied to clipboard!");
                  }} 
                  variant="outline"
                >
                  Copy to Clipboard
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Suggested Action Pathway:</h3>
            
            {!flowchartDot && (
              <Button 
                onClick={generateFlowchart}
                disabled={isGeneratingFlowchart}
                variant="secondary"
                className="mb-4"
              >
                {isGeneratingFlowchart ? "Generating diagram..." : "Generate Action Pathway"}
              </Button>
            )}
            
            {flowchartDot && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="overflow-auto">
                    <Graphviz dot={flowchartDot} options={{ width: "100%", height: "100%" }} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LegalAdvice; 