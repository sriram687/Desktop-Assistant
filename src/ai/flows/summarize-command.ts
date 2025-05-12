// Summarize command
'use server';
/**
 * @fileOverview Summarizes a complex command for user confirmation using Google Gemini.
 *
 * - summarizeCommand - A function that summarizes the command.
 * - SummarizeCommandInput - The input type for the summarizeCommand function.
 * - SummarizeCommandOutput - The return type for the summarizeCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCommandInputSchema = z.object({
  command: z.string().describe('The complex command to summarize.'),
});
export type SummarizeCommandInput = z.infer<typeof SummarizeCommandInputSchema>;

const SummarizeCommandOutputSchema = z.object({
  summary: z.string().describe('A short summary of the command.'),
});
export type SummarizeCommandOutput = z.infer<typeof SummarizeCommandOutputSchema>;

export async function summarizeCommand(input: SummarizeCommandInput): Promise<SummarizeCommandOutput> {
  return summarizeCommandFlow(input);
}

const summarizeCommandPrompt = ai.definePrompt({
  name: 'summarizeCommandPrompt',
  input: {schema: SummarizeCommandInputSchema},
  output: {schema: SummarizeCommandOutputSchema},
  prompt: `Summarize the following command in a concise way for user confirmation:\n\nCommand: {{{command}}}`,
});

const summarizeCommandFlow = ai.defineFlow(
  {
    name: 'summarizeCommandFlow',
    inputSchema: SummarizeCommandInputSchema,
    outputSchema: SummarizeCommandOutputSchema,
  },
  async input => {
    const {output} = await summarizeCommandPrompt(input);
    return output!;
  }
);
