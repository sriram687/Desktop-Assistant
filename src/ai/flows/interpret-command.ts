// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for interpreting user commands using Gemini.
 *
 * The flow takes a user command as input and returns an actionable interpretation of the command.
 *
 * @interface InterpretCommandInput - The input type for the interpretCommand function, containing the user's command.
 * @interface InterpretCommandOutput - The output type for the interpretCommand function, containing the interpreted command.
 * @function interpretCommand - The main function to interpret the command.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretCommandInputSchema = z.object({
  command: z.string().describe('The user command to interpret.'),
});
export type InterpretCommandInput = z.infer<typeof InterpretCommandInputSchema>;

const InterpretCommandOutputSchema = z.object({
  interpretedCommand: z
    .string()
    .describe('The actionable interpretation of the user command.'),
});
export type InterpretCommandOutput = z.infer<typeof InterpretCommandOutputSchema>;

export async function interpretCommand(input: InterpretCommandInput): Promise<InterpretCommandOutput> {
  return interpretCommandFlow(input);
}

const interpretCommandPrompt = ai.definePrompt({
  name: 'interpretCommandPrompt',
  input: {schema: InterpretCommandInputSchema},
  output: {schema: InterpretCommandOutputSchema},
  prompt: `You are an AI assistant that interprets user commands and translates them into actionable steps.

  User Command: {{{command}}}

  Actionable Interpretation:`,
});

const interpretCommandFlow = ai.defineFlow(
  {name: 'interpretCommandFlow', inputSchema: InterpretCommandInputSchema, outputSchema: InterpretCommandOutputSchema},
  async input => {
    const {output} = await interpretCommandPrompt(input);
    return output!;
  }
);
