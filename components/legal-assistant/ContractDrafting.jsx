"use client";

import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const ContractDrafting = () => {
  const [contractType, setContractType] = useState("Service Agreement");
  const [contractDetails, setContractDetails] = useState(
    "- Between a software developer and client\n- 6-month project\n- Payment structure: 30% upfront, 30% at midpoint, 40% upon completion\n- Include confidentiality and IP ownership clauses"
  );
  const [contractText, setContractText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const GEMINI_API_KEY = "AIzaSyCLoBWpcOAWurtUAWS8nL9haUtt17u15Vg";
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const handleDraftContract = async () => {
    if (!contractType.trim() || !contractDetails.trim()) {
      setError("Please enter both contract type and details.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        You are a legal contract drafter specializing in Indian contract law. 
        Draft a comprehensive ${contractType} contract based on the following requirements:

        Contract Type: ${contractType}
        Specific Requirements:
        ${contractDetails}

        The contract should:
        1. Begin with proper parties, recitals, and definitions sections
        2. Include all necessary clauses and provisions specific to this contract type
        3. Address the specific requirements provided above
        4. Incorporate appropriate risk management and protection clauses
        5. Ensure compliance with Indian contract law and relevant statutes
        6. Include proper execution provisions

        IMPORTANT FORMATTING INSTRUCTIONS:
        - Format the entire contract using clean Markdown with clear headings, bullet points, and spacing between sections
        - Use level 1 heading (#) for the contract title
        - Use level 2 headings (##) for main sections (Parties, Recitals, Definitions, etc.)
        - Use level 3 headings (###) for subsections and clauses
        - Use **bold text** for key terms, dates, amounts, and parties' names
        - Use bullet points or numbered lists for enumerated items, rights, or obligations
        - Use horizontal rules (---) to separate major sections
        - Use tables (if needed) for payment schedules or deliverables
        - Use block quotes for special notes, disclaimers, or important notices
        - Maintain consistent indentation and spacing for readability
        - Ensure section numbers are properly formatted and hierarchical
        
        SIGNATURE BLOCK FORMATTING:
        - Create a dedicated section called "## IN WITNESS WHEREOF" for signatures
        - Format each party's signature block as follows:

        ### For [First Party Name]:
        
        **Signature:** ____________________
        
        **Name:** ____________________
        
        **Title:** ____________________
        
        **Date:** ____________________
        
        ### For [Second Party Name]:
        
        **Signature:** ____________________
        
        **Name:** ____________________
        
        **Title:** ____________________
        
        **Date:** ____________________
        
        - Ensure each signature block is properly spaced and formatted
        - Use actual underscores for signature lines (e.g., ____________________)
        - Do NOT use placeholder text like [Client Name], [Title], etc. in the final signature format
        - Do NOT put multiple pieces of information on a single line
        - Add a "Witnesses" section if appropriate for the contract type
        
        The output must be well-structured, professional, and easy to read. Use plain language where possible while maintaining legal precision.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setContractText(text);
      setSuccess(true);

      console.log("Contract drafted successfully:", text);

    } catch (err) {
      console.error("Contract drafting error:", err);
      setError(`An error occurred while drafting the contract: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([contractText], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${contractType.replace(/\s+/g, '_')}_Contract.md`;
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
              <Label htmlFor="contractType">Contract type:</Label>
              <Input
                id="contractType"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                placeholder="Service Agreement"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="contractDetails">Contract details and requirements:</Label>
              <Textarea
                id="contractDetails"
                value={contractDetails}
                onChange={(e) => setContractDetails(e.target.value)}
                rows={6}
                className="mt-1"
                placeholder="Specify contract parties, terms, and special requirements"
              />
            </div>
            
            <div>
              <Button 
                onClick={handleDraftContract}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? `Drafting ${contractType} contract...` : "Draft Contract"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && <p className="text-amber-600">Drafting your {contractType} contract...</p>}
      
      {error && <p className="text-red-500 p-4 bg-red-50 rounded-md">{error}</p>}
      
      {success && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4">{contractType} Contract</h3>
            
            <div className="prose prose-amber prose-headings:text-amber-700 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:font-semibold prose-strong:text-amber-700 prose-a:text-amber-600 max-w-none overflow-auto">
              <style jsx global>{`
                @media (min-width: 768px) {
                  .signature-section {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 2rem;
                    justify-content: space-between;
                    margin-top: 2rem;
                  }
                  .signature-block {
                    flex: 1;
                    min-width: 250px;
                    border: 1px solid #FBD38D;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    background-color: #FFFBEB;
                  }
                  .signature-block h3 {
                    margin-top: 0 !important;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #F6AD55;
                  }
                  .signature-block p {
                    border-left: none !important;
                    padding-left: 0 !important;
                  }
                }
              `}</style>
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
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-amber-800 mt-6 mb-4 pb-2 border-b border-amber-200" {...props} />,
                  h2: ({node, children, ...props}) => {
                    // Special formatting for signature section
                    if (children && typeof children === 'string' && children.includes('IN WITNESS WHEREOF')) {
                      return (
                        <div>
                          <h2 className="text-xl font-bold text-amber-700 mt-10 mb-3" {...props}>
                            {children}
                          </h2>
                          <div className="signature-section"></div>
                        </div>
                      );
                    }
                    return <h2 className="text-xl font-bold text-amber-700 mt-6 mb-3" {...props}>{children}</h2>;
                  },
                  h3: ({node, children, ...props}) => {
                    // Special formatting for signature blocks
                    if (children && typeof children === 'string' && children.includes('For ')) {
                      return (
                        <div className="signature-block">
                          <h3 className="text-lg font-semibold text-amber-600 mb-3 pb-1" {...props}>
                            {children}
                          </h3>
                        </div>
                      );
                    }
                    return <h3 className="text-lg font-semibold text-amber-600 mt-5 mb-2" {...props}>{children}</h3>;
                  },
                  h4: ({node, ...props}) => <h4 className="text-base font-semibold text-amber-600 mt-4 mb-2" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, children, ...props}) => {
                    // Special formatting for signature lines
                    if (children && typeof children === 'string' && 
                        (children.includes('Signature:') || 
                         children.includes('Name:') || 
                         children.includes('Title:') || 
                         children.includes('Date:'))) {
                      return (
                        <p className="mb-3 pl-4 border-l-2 border-amber-100" {...props}>
                          {children}
                        </p>
                      );
                    }
                    return <p className="mb-4" {...props}>{children}</p>;
                  },
                  hr: ({node, ...props}) => <hr className="my-6 border-t border-amber-200" {...props} />,
                  table: ({node, ...props}) => <div className="overflow-x-auto"><table className="min-w-full divide-y divide-amber-200 my-6 border border-amber-100 rounded-md" {...props} /></div>,
                  th: ({node, ...props}) => <th className="px-4 py-2 bg-amber-50 font-medium text-amber-700" {...props} />,
                  td: ({node, ...props}) => <td className="px-4 py-2 border-t border-amber-100" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-200 pl-4 italic text-gray-700 my-4" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-amber-700" {...props} />,
                  em: ({node, ...props}) => <em className="text-gray-800" {...props} />,
                }}
              >
                {contractText}
              </ReactMarkdown>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button onClick={handleDownload} variant="outline">
                Download Contract
              </Button>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(contractText);
                  alert("Contract copied to clipboard!");
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

export default ContractDrafting; 