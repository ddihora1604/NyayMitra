import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Import the Graphviz component - you'll need to install this package!
import { Graphviz } from 'graphviz-react';

const LegalAdvice = () => {
  const [legalQuery, setLegalQuery] = useState("What rights do I have if my landlord refuses to fix maintenance issues?");
  const [adviceText, setAdviceText] = useState("");
  const [flowchartDot, setFlowchartDot] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingFlowchart, setIsGeneratingFlowchart] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const GEMINI_API_KEY = "AIzaSyCLoBWpcOAWurtUAWS8nL9haUtt17u15Vg"; // Replace with your actual API key or use environment variables
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
        You are a legal advisor specializing in Indian law. Provide comprehensive yet practical legal advice 
        tailored to this specific query: "${legalQuery}"

        Your advice should:
        1. Analyze the legal issues presented in the query
        2. Identify relevant Indian laws, statutes, and precedents
        3. Explain legal rights, obligations, and potential liabilities
        4. Outline practical steps and actionable recommendations
        5. Address potential risks and alternatives
        6. Highlight any time-sensitive actions or deadlines

        Structure your response with clear headings and use plain language while maintaining legal accuracy.
        Include a brief disclaimer about the general nature of the advice.
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
        - Use shape=box, style=filled, fillcolor="#a9d1f7" for regular steps
        - Use shape=diamond, style=filled, fillcolor="#f7e8a9" for decision points
        - Use color="#4a86e8" for arrows
        - Represent the flow logically using arrows (->)
        - Use labels on arrows for decision outcomes (e.g., [label="Yes"], [label="No"])
        - Ensure the output is ONLY valid DOT code, starting with 'digraph G {' and ending with '}'
  
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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Legal Advice</h2>
      <p className="italic mb-6">Get personalized legal advice on your specific query</p>
      
      <div className="mb-4">
        <label htmlFor="legalQuery" className="block mb-2">Enter your legal question:</label>
        <textarea
          id="legalQuery"
          value={legalQuery}
          onChange={(e) => setLegalQuery(e.target.value)}
          rows={6}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      
      <div className="mb-6">
        <button 
          onClick={handleGetAdvice}
          disabled={isLoading}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "Analyzing your legal query..." : "Get Legal Advice"}
        </button>
      </div>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {success && (
        <>
          <p className="text-green-500 mb-2">Analysis completed!</p>
          <h3 className="text-xl font-semibold mb-2">Legal Advice:</h3>
          
          <details open className="mb-6 border border-gray-200 rounded p-4">
            <summary className="font-semibold cursor-pointer">View Complete Legal Advice</summary>
            <div className="mt-4 whitespace-pre-wrap">{adviceText}</div>
          </details>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Suggested Action Pathway:</h3>
            
            {!flowchartDot && (
              <button 
                onClick={generateFlowchart}
                disabled={isGeneratingFlowchart}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400 mb-4"
              >
                {isGeneratingFlowchart ? "Generating diagram..." : "Generate Action Pathway"}
              </button>
            )}
            
            {flowchartDot && (
              <div className="mt-4 border border-gray-200 rounded p-4">
                {/* Render DOT code as an actual flowchart using graphviz-react */}
                <div className="overflow-auto">
                  <Graphviz dot={flowchartDot} options={{ width: "100%", height: "100%" }} />
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleDownload}
            className="mt-6 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Download Legal Advice
          </button>
        </>
      )}
    </div>
  );
};

export default LegalAdvice;