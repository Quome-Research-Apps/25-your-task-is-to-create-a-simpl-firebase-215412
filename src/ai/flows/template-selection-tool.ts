'use server';

/**
 * @fileOverview An AI agent for selecting relevant clauses from an NDA template based on keywords/topics.
 *
 * - selectNdaClauses - A function that takes conversation context and returns selected NDA clauses.
 * - SelectNdaClausesInput - The input type for the selectNdaClauses function.
 * - SelectNdaClausesOutput - The return type for the selectNdaClauses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SelectNdaClausesInputSchema = z.object({
  conversationContext: z
    .string()
    .describe(
      'The context of the conversation, including topics discussed, to determine relevant NDA clauses.'
    ),
});
export type SelectNdaClausesInput = z.infer<typeof SelectNdaClausesInputSchema>;

const SelectNdaClausesOutputSchema = z.object({
  selectedClauses: z
    .array(z.string())
    .describe('The list of selected NDA clauses relevant to the conversation context.'),
});
export type SelectNdaClausesOutput = z.infer<typeof SelectNdaClausesOutputSchema>;

export async function selectNdaClauses(input: SelectNdaClausesInput): Promise<SelectNdaClausesOutput> {
  return selectNdaClausesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'selectNdaClausesPrompt',
  input: {schema: SelectNdaClausesInputSchema},
  output: {schema: SelectNdaClausesOutputSchema},
  prompt: `You are an AI assistant that selects relevant clauses from an NDA template based on the provided conversation context.

  The NDA template includes the following clauses:
  - Confidential Information Definition
  - Non-Use and Non-Disclosure
  - Exclusions from Confidential Information
  - Term and Termination
  - Intellectual Property
  - Permitted Use
  - Governing Law and Jurisdiction
  - Entire Agreement

  Given the following conversation context, identify and return only the clauses that are most relevant. Return the clauses as a JSON array.

  Conversation Context: {{{conversationContext}}}
  `,
});

const selectNdaClausesFlow = ai.defineFlow(
  {
    name: 'selectNdaClausesFlow',
    inputSchema: SelectNdaClausesInputSchema,
    outputSchema: SelectNdaClausesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
