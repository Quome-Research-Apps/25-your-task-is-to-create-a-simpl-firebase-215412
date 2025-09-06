import { format } from "date-fns";

export type NdaData = {
  disclosingParty: string;
  receivingParty: string;
  effectiveDate: Date;
};

const preamble = (data: NdaData) => `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into as of ${format(
  data.effectiveDate,
  "MMMM d, yyyy"
)} (the "Effective Date"), by and between:

Disclosing Party: ${data.disclosingParty}
Receiving Party: ${data.receivingParty}

(Each, a "Party" and collectively, the "Parties").

In consideration of the mutual covenants contained herein, the Parties agree as follows:
`;

const signatureBlock = (data: NdaData) => `
IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.

DISCLOSING PARTY:

By: _________________________
Name: ${data.disclosingParty}


RECEIVING PARTY:

By: _________________________
Name: ${data.receivingParty}
`;

const clauses: Record<string, (data: NdaData) => string> = {
  "Confidential Information Definition": () => `
1.  **Definition of Confidential Information.** "Confidential Information" means all non-public information disclosed by the Disclosing Party to the Receiving Party, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.`,
  "Non-Use and Non-Disclosure": () => `
2.  **Non-Use and Non-Disclosure.** The Receiving Party agrees not to use any Confidential Information for any purpose except to evaluate and engage in discussions concerning a potential business relationship between the Parties. The Receiving Party agrees not to disclose any Confidential Information to third parties or to its employees, except to those employees who are required to have the information in order to evaluate or engage in discussions concerning the contemplated business relationship.`,
  "Exclusions from Confidential Information": () => `
3.  **Exclusions.** Confidential Information does not include information that: (a) is or becomes generally available to the public other than as a result of a disclosure by the Receiving Party; (b) was in its possession or known by it prior to receipt from the Disclosing Party; (c) was rightfully disclosed to it without restriction by a third party; or (d) was independently developed without use of any Confidential Information of the Disclosing Party.`,
  "Term and Termination": () => `
4.  **Term.** The obligations of the Receiving Party under this Agreement shall survive for a period of five (5) years from the date of disclosure of the Confidential Information. The term of this Agreement shall be one (1) year from the Effective Date, unless terminated earlier by either Party with 30 days written notice.`,
  "Intellectual Property": () => `
5.  **Intellectual Property.** Nothing in this Agreement is intended to grant any rights to the Receiving Party under any patent, copyright, or other intellectual property right of the Disclosing Party, nor shall this Agreement grant the Receiving Party any rights in or to the Confidential Information except as expressly set forth herein.`,
  "Permitted Use": () => `
6.  **Permitted Use.** The Receiving Party may use the Confidential Information solely for the purpose of evaluating a potential business relationship between the Parties. Any other use of the Confidential Information by the Receiving Party is strictly prohibited without the prior written consent of the Disclosing Party.`,
  "Governing Law and Jurisdiction": () => `
7.  **Governing Law.** This Agreement shall be governed by the laws of the State of Delaware, without regard to its conflict of laws principles. Any legal action or proceeding arising under this Agreement will be brought exclusively in the federal or state courts located in Delaware and the Parties irrevocably consent to the personal jurisdiction and venue therein.`,
  "Entire Agreement": () => `
8.  **Entire Agreement.** This Agreement contains the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, understandings, negotiations, and discussions, whether oral or in writing, of the Parties.`,
};

export function generateNdaText(
  data: NdaData,
  selectedClauseNames: string[]
): string {
  let fullText = preamble(data);

  // A minimal set of essential clauses
  const defaultClauses = [
    "Confidential Information Definition",
    "Non-Use and Non-Disclosure",
    "Exclusions from Confidential Information",
    "Term and Termination",
    "Governing Law and Jurisdiction",
    "Entire Agreement",
  ];

  const clausesToInclude = Array.from(
    new Set([...defaultClauses, ...selectedClauseNames])
  );

  // A canonical order for all possible clauses to ensure consistent document structure
  const canonicalOrder = [
    "Confidential Information Definition",
    "Non-Use and Non-Disclosure",
    "Exclusions from Confidential Information",
    "Permitted Use",
    "Intellectual Property",
    "Term and Termination",
    "Governing Law and Jurisdiction",
    "Entire Agreement",
  ];

  const sortedClausesToInclude = canonicalOrder.filter((name) =>
    clausesToInclude.includes(name)
  );

  let clauseCounter = 1;
  for (const clauseName of sortedClausesToInclude) {
    if (clauses[clauseName]) {
      let clauseText = clauses[clauseName](data);
      // Replace the hardcoded number with the new dynamic number
      clauseText = clauseText.replace(/^\s*\d+\.\s*/, `\n${clauseCounter++}. `);
      fullText += clauseText;
    }
  }

  fullText += signatureBlock(data);
  return fullText.trim();
}
