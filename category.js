const categoryStyles = {
    category1: {
      label: "Rent Maintainance Issue",
      base: "bg-amber-100 text-amber-700",
      active: "bg-amber-600 text-white border-black",
    },
    category2: {
      label: "Corporate Threat",
      base: "bg-amber-100 text-amber-700",
      active: "bg-amber-600 text-white border-black",
    },
    category3: {
      label: "Wrong Accusation",
      base: "bg-amber-100 text-amber-700",
      active: "bg-amber-600 text-white border-black",
    },
    category4: {
      label: "Divorce",
      base: "bg-amber-100 text-amber-700",
      active: "bg-amber-600 text-white border-black",
    },
    category5: {
      label: "Non-consensual Disclosure",
      base: "bg-amber-100 text-amber-700",
      active: "bg-amber-600 text-white border-black",
    },
  };
  
  const categoryDescriptions = {
    category1:
      "What rights do I have if my landlord refuses to fix maintenance issues?",
    category2:
      "My employer has forced me to work overtime beyond legal hours without my consent and no bonuses or overtime pay and rather threatening me with firing me from my position, making use of his senior position",
    category3:
      "Traffic police officer has falsely stopped me and accused me of traffic violation(not wearing helmet) despite me wearing one. He seized my bike keys and demanded a bribe else he claimed he would arrest me",
    category4:
      "Me and my wife who have being happily married for 25 years have mutually decided to split apart as things are not working",
    category5:
      "My university share my academic or personal information with third parties without my consent for profit",
  };
  
  const categoryFlowcharts = {
    category1: {
      nodes: [
        {
          id: "1",
          data: { label: "Initial Steps" },
          position: { x: 400, y: 0 },
          className: "bg-amber-100",
        },
        {
          id: "2",
          data: { label: "Identify Applicable Rent Control Act" },
          position: { x: 400, y: 120 },
          className: "bg-amber-200",
        },
        {
          id: "3",
          data: {
            label:
              "Understand Landlord's Obligations (Implied Warranty of Habitability)",
          },
          position: { x: 400, y: 240 },
          className: "bg-amber-200",
        },
        {
          id: "4",
          data: { label: "Formal Actions" },
          position: { x: 400, y: 360 },
          className: "bg-amber-100",
        },
        {
          id: "5",
          data: { label: "Send Formal Registered Letter (Step 1)" },
          position: { x: 400, y: 480 },
          className: "bg-amber-200",
        },
        {
          id: "6",
          data: { label: "Landlord Fails to Act" },
          position: { x: 400, y: 600 },
          className: "bg-amber-100",
        },
        {
          id: "7",
          data: { label: "Follow Up with Another Registered Letter (Step 2)" },
          position: { x: 400, y: 720 },
          className: "bg-amber-200",
        },
        {
          id: "8",
          data: { label: "File Case Under Rent Control Act (Step 3)" },
          position: { x: 100, y: 870 },
          className: "bg-amber-200",
        },
        {
          id: "9",
          data: {
            label: "File Complaint Under Consumer Protection Act (Step 4)",
          },
          position: { x: 700, y: 870 },
          className: "bg-amber-200",
        },
        {
          id: "10",
          data: { label: "Seek Legal Advice (Step 5)" },
          position: { x: 400, y: 1020 },
          className: "bg-amber-200",
        },
        {
          id: "11",
          data: { label: "Legal Counsel" },
          position: { x: 400, y: 1140 },
          className: "bg-amber-100",
        },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
        { id: "e3-4", source: "3", target: "4" },
        { id: "e4-5", source: "4", target: "5" },
        { id: "e5-6", source: "5", target: "6" },
        { id: "e6-7", source: "6", target: "7" },
        {
          id: "e7-8",
          source: "7",
          target: "8",
          label: "No Action",
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: "#ffffff" },
        },
        {
          id: "e7-9",
          source: "7",
          target: "9",
          label: "Significant Service Deficiency",
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: "#ffffff" },
        },
        { id: "e8-10", source: "8", target: "10" },
        { id: "e9-10", source: "9", target: "10" },
        { id: "e10-11", source: "10", target: "11" },
      ],
    },
    category2: {
      nodes: [
        {
          id: "1",
          data: {
            label: "Document Everything (Overtime, Communication, Threats)",
          },
          position: { x: 250, y: 0 },
          className: "bg-amber-100",
        },
        {
          id: "2",
          data: { label: "Consult a Labor Lawyer in India" },
          position: { x: 250, y: 100 },
          className: "bg-amber-100",
        },
        {
          id: "3",
          data: { label: "Explore Internal Grievance Mechanisms" },
          position: { x: 250, y: 200 },
          className: "bg-amber-100",
        },
        {
          id: "4",
          data: { label: "Internal Resolution Successful?" },
          position: { x: 75, y: 300 },
          className: "bg-amber-50",
        },
        {
          id: "5",
          data: { label: "File a Complaint with Labor Authorities" },
          position: { x: 250, y: 400 },
          className: "bg-amber-100",
        },
        {
          id: "6",
          data: { label: "Legal Action Necessary?" },
          position: { x: 250, y: 500 },
          className: "bg-amber-50",
        },
        {
          id: "7",
          data: { label: "Consider Alternative Dispute Resolution (ADR)" },
          position: { x: 0, y: 600 },
          className: "bg-amber-100",
        },
        {
          id: "8",
          data: { label: "Initiate Legal Proceedings" },
          position: { x: 500, y: 600 },
          className: "bg-amber-100",
        },
        {
          id: "9",
          data: { label: "END" },
          position: { x: 250, y: 700 },
          className: "bg-amber-100",
        },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
        { id: "e3-4", source: "3", target: "4" },
        { id: "e4-5", source: "4", target: "5", label: "No" },
        { id: "e4-9", source: "4", target: "9", label: "Yes" }, // <-- Missing edge added here
        { id: "e5-6", source: "5", target: "6" },
        { id: "e6-7", source: "6", target: "7", label: "No" },
        { id: "e6-8", source: "6", target: "8", label: "Yes" },
        { id: "e8-9", source: "8", target: "9" },
        { id: "e7-9", source: "7", target: "9" },
      ],
    },
    category3: {
      nodes: [
        {
          id: "1",
          data: { label: "Start" },
          position: { x: 250, y: 0 },
          className: "bg-amber-100",
        },
        {
          id: "2",
          data: { label: "Gather Evidence (Photos, Witness Testimony)" },
          position: { x: 250, y: 100 },
          className: "bg-amber-100",
        },
        {
          id: "3",
          data: { label: "Is there sufficient evidence?" },
          position: { x: 250, y: 200 },
          className: "bg-amber-50",
        },
        {
          id: "4",
          data: { label: "File a Formal Complaint (Senior Officer/PCA)" },
          position: { x: 450, y: 300 },
          className: "bg-amber-100",
        },
        {
          id: "5",
          data: {
            label:
              "Document Details (Date, Time, Location, Names, Badge Numbers, Relevant Law Sections)",
          },
          position: { x: 450, y: 400 },
          className: "bg-amber-100",
        },
        {
          id: "6",
          data: { label: "Seek Legal Counsel (Criminal Law Specialist)" },
          position: { x: 250, y: 550 },
          className: "bg-amber-100",
        },
        {
          id: "7",
          data: {
            label:
              "Consider Other Recourse (Anti-Corruption Branch/Human Rights Org)",
          },
          position: { x: 250, y: 650 },
          className: "bg-amber-100",
        },
        {
          id: "8",
          data: { label: "End" },
          position: { x: 250, y: 825 },
          className: "bg-amber-100",
        },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
        { id: "e3-4", source: "3", target: "4", label: "Yes" },
        { id: "e3-6", source: "3", target: "6", label: "No" },
        { id: "e4-5", source: "4", target: "5" },
        { id: "e5-6", source: "5", target: "6" },
        { id: "e6-7", source: "6", target: "7" },
        { id: "e7-8", source: "7", target: "8" },
      ],
    },
    category4: {
      nodes: [
        {
          id: "1",
          data: { label: "Start" },
          position: { x: 300, y: 0 },
          className: "bg-amber-100",
        },
        {
          id: "2",
          data: { label: "Consult a Lawyer" },
          position: { x: 300, y: 75 },
          className: "bg-amber-100",
        },
        {
          id: "3",
          data: {
            label:
              "Negotiate a Mutual Agreement (Asset Division, Alimony, Child Custody, Visitation Rights)",
          },
          position: { x: 300, y: 150 },
          className: "bg-amber-100",
        },
        {
          id: "4",
          data: { label: "Mutual Consent Achieved?" },
          position: { x: 500, y: 300 },
          className: "bg-amber-50",
        },
        {
          id: "5",
          data: {
            label:
              "File Joint Petition with Appropriate Court (Based on Religious Law)",
          },
          position: { x: 300, y: 400 },
          className: "bg-amber-100",
        },
        {
          id: "6",
          data: { label: "Cooling-Off Period" },
          position: { x: 300, y: 550 },
          className: "bg-amber-100",
        },
        {
          id: "7",
          data: { label: "File Second Motion for Divorce" },
          position: { x: 300, y: 600 },
          className: "bg-amber-100",
        },
        {
          id: "8",
          data: { label: "Court Hearing (to Verify Genuine Consent)" },
          position: { x: 300, y: 700 },
          className: "bg-amber-100",
        },
        {
          id: "9",
          data: { label: "Final Decree of Divorce" },
          position: { x: 300, y: 800 },
          className: "bg-amber-100",
        },
        {
          id: "10",
          data: { label: "End" },
          position: { x: 500, y: 900 },
          className: "bg-amber-100",
        },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
        { id: "e3-4", source: "3", target: "4" },
        { id: "e4-5", source: "4", target: "5", label: "Yes" },
        { id: "e5-6", source: "5", target: "6" },
        { id: "e6-7", source: "6", target: "7" },
        { id: "e7-8", source: "7", target: "8" },
        { id: "e8-9", source: "8", target: "9" },
        { id: "e9-10", source: "9", target: "10" },
        {
          id: "e4-10",
          source: "4",
          target: "10",
          label: "No",
          style: { stroke: "#b45309" }, // amber-700
          labelStyle: { fill: "#b45309" }, // amber-700
        },
      ],
    },
    category5: {
      nodes: [
        {
          id: "1",
          data: { label: "Gather Evidence (emails, agreements, notices)" },
          position: { x: 300, y: 0 },
          className: "bg-amber-100",
        },
        {
          id: "2",
          data: { label: "Evidence Sufficient?" },
          position: { x: 300, y: 100 },
          className: "bg-amber-50",
        },
        {
          id: "3",
          data: {
            label:
              "Review University Policies (privacy policies, student handbooks)",
          },
          position: { x: 175, y: 200 },
          className: "bg-amber-100",
        },
        {
          id: "4",
          data: { label: "Send Formal Complaint to University" },
          position: { x: 175, y: 325 },
          className: "bg-amber-100",
        },
        {
          id: "5",
          data: {
            label: "File RTI Request for information on data sharing practices",
          },
          position: { x: 175, y: 400 },
          className: "bg-amber-100",
        },
        {
          id: "6",
          data: { label: "Consult a Legal Professional" },
          position: { x: 300, y: 500 },
          className: "bg-amber-100",
        },
        {
          id: "7",
          data: { label: "End" },
          position: { x: 300, y: 600 },
          className: "bg-amber-100",
        },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3", label: "Yes" },
        { id: "e3-4", source: "3", target: "4" },
        { id: "e4-5", source: "4", target: "5" },
        { id: "e5-6", source: "5", target: "6" },
        { id: "e6-7", source: "6", target: "7" },
        {
          id: "e2-6",
          source: "2",
          target: "6",
          label: "No",
          style: { stroke: "#d97706" }, // amber-600
          labelStyle: { fill: "#d97706" }, // amber-600
        },
      ],
    },
  };
  
  export { categoryStyles, categoryDescriptions, categoryFlowcharts };