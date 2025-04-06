"use client";

import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const LegalResearch = () => {
  const [researchTopic, setResearchTopic] = useState("Contract Breach in Indian Law");
  const [reportText, setReportText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const GEMINI_API_KEY = "AIzaSyABP0FhpPcNotV7TqlUw38Qm0YpAovfoIY";
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const handleGenerateReport = async () => {
    if (!researchTopic.trim()) {
      setError("Please enter a legal topic.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Conduct thorough legal research on the topic '${researchTopic}', focusing specifically on Indian law. 
        Generate a detailed and comprehensive research document covering the following aspects:
        1. Applicable Indian statutes and the relevant legal framework.
        2. Leading case laws and significant legal precedents from Indian courts.
        3. Key legal principles and common interpretations related to the topic.
        4. Any recent developments, amendments, or important judicial trends in India.
        5. Different perspectives or nuances on any contentious issues within the topic.

        Structure the output logically with clear headings and sections. Provide proper citations for statutes and case laws where possible. 
        Ensure the information is accurate and reflects the current state of Indian law.
        
        IMPORTANT FORMATTING INSTRUCTIONS:
        - Always format replies using clean Markdown with clear headings, bullet points, and spacing between sections.
        - Use level 2 headings (##) for main sections and level 3 headings (###) for subsections.
        - Use bold text (**text**) for emphasis on important points or case names.
        - Use bullet points or numbered lists for clarity when presenting multiple items.
        - Use line breaks and indentation to enhance readability.
        - Format citations in italics.
        - Include a summary section at the beginning.
        - For any code sections or legal provisos, use markdown code blocks with appropriate language indication.
        - Put section titles in bold and use a consistent structure throughout.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setReportText(text);
      setSuccess(true);

      console.log("--- Legal Research ---");
      console.log(`Topic: ${researchTopic}`);
      console.log("Gemini Output:");
      console.log(text);
      console.log("--- End Research ---");

    } catch (err) {
      console.error("Research generation error:", err);
      setError(`An error occurred during research generation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([reportText], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${researchTopic.replace(/\s+/g, '_')}_Research_Report.md`;
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
              <Label htmlFor="researchTopic">Enter legal topic:</Label>
              <Input
                id="researchTopic"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="Contract Breach in Indian Law"
                className="mt-1"
              />
            </div>
            
            <div>
              <Button 
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Generating Research Report..." : "Generate Research Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && <p className="text-amber-600">Researching &quot;{researchTopic}&quot;...</p>}
      
      {error && <p className="text-red-500 p-4 bg-red-50 rounded-md">{error}</p>}
      
      {success && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4">Research Report: {researchTopic}</h3>
            
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
                }}
              >
                {reportText}
              </ReactMarkdown>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button onClick={handleDownload} variant="outline">
                Download Research Report
              </Button>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(reportText);
                  alert("Research report copied to clipboard!");
                }} 
                variant="outline"
              >
                Copy to Clipboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LegalResearch; 