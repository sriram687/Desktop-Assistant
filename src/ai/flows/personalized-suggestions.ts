// src/ai/flows/personalized-suggestions.ts
'use server';
/**
 * @fileOverview Provides personalized command suggestions based on user's frequent commands.
 *
 * - getPersonalizedSuggestions - A function that returns personalized command suggestions.
 * - PersonalizedSuggestionsInput - The input type for the getPersonalizedSuggestions function.
 * - PersonalizedSuggestionsOutput - The return type for the getPersonalizedSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as fs from 'fs/promises'; // Changed to fs/promises
import * as path from 'path';

const UserDataSchema = z.object({
  frequent_commands: z.record(z.string(), z.number()),
});

const PersonalizedSuggestionsInputSchema = z.object({
  numSuggestions: z.number().default(3).describe('The number of personalized command suggestions to return.'),
});
export type PersonalizedSuggestionsInput = z.infer<typeof PersonalizedSuggestionsInputSchema>;

const PersonalizedSuggestionsOutputSchema = z.array(z.string());
export type PersonalizedSuggestionsOutput = z.infer<typeof PersonalizedSuggestionsOutputSchema>;

export async function getPersonalizedSuggestions(input: PersonalizedSuggestionsInput): Promise<PersonalizedSuggestionsOutput> {
  return personalizedSuggestionsFlow(input);
}

const personalizedSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedSuggestionsFlow',
    inputSchema: PersonalizedSuggestionsInputSchema,
    outputSchema: PersonalizedSuggestionsOutputSchema,
  },
  async input => {
    const userDataPath = path.join(process.cwd(), 'user_data.json'); // Use process.cwd() for consistency
    let frequentCommands: { [key: string]: number } = {};

    try {
      const fileContent = await fs.readFile(userDataPath, 'utf-8'); // Asynchronous read
      const parsedJson = JSON.parse(fileContent);
      const userDataValidation = UserDataSchema.safeParse(parsedJson);
      
      if (userDataValidation.success) {
        frequentCommands = userDataValidation.data.frequent_commands;
      } else {
        console.error('Invalid user_data.json structure:', userDataValidation.error.flatten());
        // If structure is invalid, treat as if no data, or handle as appropriate
        frequentCommands = {};
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // console.log('user_data.json not found, starting with empty suggestions.');
        // This is a normal case if the file hasn't been created yet.
      } else {
        console.error('Error reading user_data.json in personalizedSuggestionsFlow:', error);
      }
      frequentCommands = {}; // Default to empty if file not found or other read error
    }

    // Sort commands by frequency and get the top N.
    const sortedCommands = Object.entries(frequentCommands)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([command]) => command)
      .slice(0, input.numSuggestions);

    return sortedCommands;
  }
);