import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
        Format the output using Markdown.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setReportText(text);
      setSuccess(true);

      // Console logging similar to Python version
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
    <div>
      <h2>📚 Legal Research</h2>
      <p><em>Generate a structured legal research report on your chosen topic</em></p>
      
      <div>
        <label htmlFor="researchTopic">Enter legal topic:</label>
        <input
          id="researchTopic"
          type="text"
          value={researchTopic}
          onChange={(e) => setResearchTopic(e.target.value)}
          placeholder="Contract Breach in Indian Law"
        />
      </div>
      
      <div>
        <button 
          onClick={handleGenerateReport}
          disabled={isLoading}
        >
          {isLoading ? "Generating Research Report..." : "Generate Research Report"}
        </button>
      </div>
      
      {isLoading && <p>Researching '{researchTopic}'...</p>}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {success && (
        <>
          <p style={{ color: 'green' }}>Research completed successfully!</p>
          <h3>Generated Legal Research Report:</h3>
          
          <details open>
            <summary>View Full Research Report</summary>
            <pre>{reportText}</pre>
          </details>
          
          <button onClick={handleDownload}>
            Download Research Report
          </button>
        </>
      )}
    </div>
  );
};

export default LegalResearch;