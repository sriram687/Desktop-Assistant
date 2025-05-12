import { config } from 'dotenv';
config();

import '@/ai/flows/interpret-command.ts';
import '@/ai/flows/summarize-command.ts';
import '@/ai/flows/personalized-suggestions.ts';