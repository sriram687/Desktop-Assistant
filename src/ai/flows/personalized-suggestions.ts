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
import * as fs from 'fs';
import * as os from 'os';
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
    const userDataPath = path.join(os.cwd(), 'user_data.json');

    let frequentCommands: { [key: string]: number } = {};

    try {
      const fileContent = fs.readFileSync(userDataPath, 'utf-8');
      const userData: z.infer<typeof UserDataSchema> = JSON.parse(fileContent);
      frequentCommands = userData.frequent_commands;
    } catch (error) {
      console.error('Error reading user_data.json:', error);
      // If the file doesn't exist or is invalid, start with an empty object.
      frequentCommands = {};
    }

    // Sort commands by frequency and get the top N.
    const sortedCommands = Object.entries(frequentCommands)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([command]) => command)
      .slice(0, input.numSuggestions);

    return sortedCommands;
  }
);
