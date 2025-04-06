import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ContractDrafting = () => {
  const [contractType, setContractType] = useState("Service Agreement");
  const [contractDetails, setContractDetails] = useState(
    "- Between a software developer and client\n- 6-month project\n- Payment structure: 30% upfront, 30% at midpoint, 40% upon completion\n- Include confidentiality and IP ownership clauses"
  );
  const [contractText, setContractText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const GEMINI_API_KEY = "AIzaSyABP0FhpPcNotV7TqlUw38Qm0YpAovfoIY";
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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        Structure the contract with:
        - Clear headings and numbered sections
        - Professional formatting
        - Plain language where possible while maintaining legal precision
        - All necessary legal clauses for enforceability in India

        Output the complete contract in Markdown format with proper section headings.
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
    <div>
      <h2>Contract Drafting</h2>
      <p><em>Generate a customized contract based on your requirements</em></p>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="contractType">Contract type:</label>
          <input
            id="contractType"
            type="text"
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            placeholder="Service Agreement"
            style={{ width: '100%' }}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="contractDetails">Contract details and requirements:</label>
        <textarea
          id="contractDetails"
          value={contractDetails}
          onChange={(e) => setContractDetails(e.target.value)}
          rows={6}
          style={{ width: '100%' }}
        />
      </div>
      
      <div>
        <button 
          onClick={handleDraftContract}
          disabled={isLoading}
        >
          {isLoading ? `Drafting ${contractType} contract...` : "Draft Contract"}
        </button>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {success && (
        <>
          <p style={{ color: 'green' }}>Contract drafted successfully!</p>
          <h3>Generated Contract:</h3>
          
          <details open>
            <summary>View Complete Contract</summary>
            <pre style={{ 
              whiteSpace: 'pre-wrap',
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px'
            }}>
              {contractText}
            </pre>
          </details>
          
          <button 
            onClick={handleDownload}
            style={{ marginTop: '20px' }}
          >
            Download Contract
          </button>
        </>
      )}
    </div>
  );
};

export default ContractDrafting;