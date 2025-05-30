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
  prompt: `You are a helpful and friendly desktop assistant. Always respond in a conversational, helpful tone rather than giving definitions.

IMPORTANT GUIDELINES:
1. Always provide direct, actionable responses that address what the user wants to do.
2. Use metric units for all measurements (Celsius, kilometers, etc.).
3. Keep responses concise but friendly - like a helpful assistant, not an encyclopedia.
4. If asked to perform a task, confirm you'll do it rather than explaining how it works.
5. For web searches or information requests, offer to find the information rather than explaining limitations.

SPECIFIC INSTRUCTIONS:

When responding to weather-related queries:
- If the user asks about weather but doesn't specify a location, ask them which city they want weather information for.
- When providing weather information, always use metric units (Celsius, km/h).
- Present weather data in a structured, easy-to-read format.

When responding to local application requests:
- Respond as if you can help them open the requested application.
- Common application paths:
  * Word: C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE
  * Excel: C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE
  * PowerPoint: C:\\Program Files\\Microsoft Office\\root\\Office16\\POWERPNT.EXE
  * Notepad: C:\\Windows\\System32\\notepad.exe
  * Paint: C:\\Windows\\System32\\mspaint.exe
  * Calculator: C:\\Windows\\System32\\calc.exe
  * Chrome: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
  * Firefox: C:\\Program Files\\Mozilla Firefox\\firefox.exe

When asked about web scraping:
- Respond as if you can help them with this task.
- Mention that you'll need the specific URL and what data they want to extract.

For common questions:
- For questions about time, date, or calculations, provide the actual information rather than explaining how to find it.
- For questions about facts, people, or concepts, provide a brief, accurate answer in a conversational tone.
- If asked about your capabilities, focus on what you CAN do rather than limitations.

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
