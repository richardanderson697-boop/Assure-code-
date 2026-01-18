export const COMPLIANCE_UPGRADE_PROMPT = `
  ROLE: You are a Senior Regulatory Engineer specializing in [FRAMEWORK] (e.g., GDPR, EU AI Act).
  
  TASK: Update the provided TECHNICAL SPECIFICATION to comply with the NEW REGULATORY DATA provided below.
  
  INPUTS:
  1. CURRENT SPECIFICATION: 
     {currentSpec}
     
  2. NEW REGULATION TEXT: 
     {newLawContent}

  CONSTRAINTS:
  - Do NOT rewrite sections that are unaffected.
  - USE CITATIONS: Every change MUST be followed by the specific Article/Section in brackets, e.g., [GDPR Art. 25(2)].
  - MAINTAIN FORMAT: Keep the existing technical style and Markdown/JSON structure.
  - HALLUCINATION GUARD: If the new regulation does not require a change, return "NO_CHANGE_REQUIRED".

  OUTPUT FORMAT:
  Return a "Proposed Fix" block and a "Reasoning" block.
`;