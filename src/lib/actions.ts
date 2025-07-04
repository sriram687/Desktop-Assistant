"use server";

import type { CommandResponse } from '@/types';
import { interpretCommand } from '@/ai/flows/interpret-command';
import { summarizeCommand, type SummarizeCommandInput } from '@/ai/flows/summarize-command';
import { getPersonalizedSuggestions, type PersonalizedSuggestionsInput } from '@/ai/flows/personalized-suggestions';
import fs from 'fs/promises';
import path from 'path';

const USER_DATA_PATH = path.join(process.cwd(), 'user_data.json');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "AIzaSyDYkM4stAzLk-tJ09a5UvZOp5dqCQXLLDY"; // Fallback to user provided key

async function readUserData(): Promise<{ frequent_commands: Record<string, number> }> {
  try {
    const data = await fs.readFile(USER_DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    // If file doesn't exist or is invalid, return default structure
    if (error.code === 'ENOENT') {
      // console.log('user_data.json not found, returning default.');
      return { frequent_commands: {} };
    }
    console.error("Error reading user_data.json in readUserData:", error);
    return { frequent_commands: {} };
  }
}

async function writeUserData(data: { frequent_commands: Record<string, number> }): Promise<void> {
  try {
    await fs.writeFile(USER_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing user_data.json in writeUserData:", error);
  }
}

export async function updateUserPreferences(command: string): Promise<void> {
  if(!command || command.trim() === "") return;
  const userData = await readUserData();
  userData.frequent_commands[command] = (userData.frequent_commands[command] || 0) + 1;
  await writeUserData(userData);
}

async function getMostFrequentCommand(): Promise<string> {
  const userData = await readUserData();
  const commands = userData.frequent_commands;
  if (Object.keys(commands).length === 0) return "None yet.";

  let mostFrequent = "";
  let maxCount = 0;
  for (const cmd in commands) {
    if (commands[cmd] > maxCount) {
      mostFrequent = cmd;
      maxCount = commands[cmd];
    }
  }
  return mostFrequent;
}

async function getWeather(city: string): Promise<string> {
  if (!city) return "Please specify a city for the weather.";
  if (!WEATHER_API_KEY || WEATHER_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY_PLACEHOLDER" || WEATHER_API_KEY.includes("AIzaSyD")) { // Checking for placeholder or incorrect key pattern
      return "Weather API key is not configured correctly. Please set it in your environment variables.";
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error communicating with weather service" }));
      return `Sorry, I couldn't fetch the weather for ${city}. Server responded with: ${errorData.message || response.statusText}`;
    }
    const res = await response.json();
    if (res.cod && res.cod !== 200) { // OpenWeatherMap uses 'cod' for status
        return `Sorry, I couldn't fetch the weather for ${city}. Reason: ${res.message}`;
    }
    if (res.main && res.weather && res.weather.length > 0) {
      // Enhanced weather response with more details
      return `The current weather in ${res.name}:
• Temperature: ${Math.round(res.main.temp)}°C (feels like ${Math.round(res.main.feels_like)}°C)
• Conditions: ${res.weather[0].description}
• Humidity: ${res.main.humidity}%
• Wind: ${res.wind.speed} m/s
${res.visibility ? `• Visibility: ${(res.visibility / 1000).toFixed(1)} km` : ''}`;
    }
    return `Sorry, I couldn't get detailed weather information for ${city}. The response was unusual.`;
  } catch (error: any) {
    console.error("Error fetching weather:", error);
    return `Sorry, an error occurred while fetching weather: ${error.message}`;
  }
}

function tellJoke(): string {
  const jokes = [
    "Why don’t skeletons fight each other? Because they don’t have the guts!",
    "Why did the computer catch a cold? Because it left its Windows open!",
    "Why don’t some couples go to the gym? Because some relationships don’t work out!"
  ];
  return jokes[Math.floor(Math.random() * jokes.length)];
}

async function checkSystemStatusWeb(): Promise<string> {
  // Browser environment cannot access detailed CPU/Memory like psutil.
  // navigator.getBattery() is available client-side, but this is a server action.
  // We'll return a simplified message.
  return "System status checks for CPU and Memory are not available in the web version. Battery status can be checked by your browser.";
}

export async function processUserCommand(command: string): Promise<CommandResponse> {
  await updateUserPreferences(command);
  const lowerCaseCommand = command.toLowerCase();

  if (lowerCaseCommand.startsWith("hello")) {
    return { responseText: "Hello! How can I assist you today?", speak: true };
  }
  if (lowerCaseCommand.includes("time")) {
    return { responseText: `The current time is ${new Date().toLocaleTimeString()}.`, speak: true };
  }
  if (lowerCaseCommand.includes("date")) {
    return { responseText: `Today's date is ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`, speak: true };
  }
  if (lowerCaseCommand.includes("open youtube")) {
    return { responseText: "Opening YouTube.", speak: true, action: { type: 'open_url', url: 'https://www.youtube.com' } };
  }
  if (lowerCaseCommand.includes("play music")) {
    return { responseText: "Playing music. (Desktop player control is not available in web version)", speak: true };
  }
  if (lowerCaseCommand.includes("shutdown") || lowerCaseCommand.includes("restart")) {
     return { responseText: `Simulating system ${lowerCaseCommand.includes("shutdown") ? "shutdown" : "restart"}. This action is not available in the web version.`, speak: true };
  }
  if (lowerCaseCommand.includes("check system")) {
    const status = await checkSystemStatusWeb();
    return { responseText: status, speak: true };
  }
  if (lowerCaseCommand.includes("tell me a joke") || lowerCaseCommand.includes("tell joke")) {
    return { responseText: tellJoke(), speak: true };
  }
   if (["play", "pause", "stop", "next", "previous"].some(c => lowerCaseCommand.includes(c)) && lowerCaseCommand.length < 15) { // Avoid triggering for long sentences containing these words
    const mediaAction = lowerCaseCommand.match(/play|pause|stop|next|previous/)?.[0] || "media";
    return { responseText: `Simulating ${mediaAction} media. This action is not available for desktop players in the web version.`, speak: true };
  }
  if (lowerCaseCommand.includes("check preferences")) {
    const mostFrequent = await getMostFrequentCommand();
    return { responseText: `Your most used command is: ${mostFrequent}`, speak: true };
  }

  // Enhanced Local app actions with paths
  const appMap: Record<string, string> = {
    'notepad': 'C:\\Windows\\System32\\notepad.exe',
    'calculator': 'C:\\Windows\\System32\\calc.exe',
    'paint': 'C:\\Windows\\System32\\mspaint.exe',
    'word': 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE',
    'excel': 'C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE',
    'powerpoint': 'C:\\Program Files\\Microsoft Office\\root\\Office16\\POWERPNT.EXE',
    'chrome': 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'edge': 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'firefox': 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
    'recycle bin': 'shell:RecycleBinFolder',
    'file explorer': 'explorer.exe',
    'command prompt': 'C:\\Windows\\System32\\cmd.exe',
    'task manager': 'taskmgr.exe',
    'control panel': 'control.exe',
    'settings': 'ms-settings:',
    'photos': 'ms-photos:',
    'camera': 'microsoft.windows.camera:',
    'mail': 'outlookmail:',
    'calendar': 'outlookcal:',
    'spotify': 'spotify:',
    'netflix': 'netflix:',
    'youtube': 'https://www.youtube.com',
    'google': 'https://www.google.com',
    'facebook': 'https://www.facebook.com',
    'twitter': 'https://www.twitter.com',
    'instagram': 'https://www.instagram.com',
    'amazon': 'https://www.amazon.com',
    'maps': 'https://www.google.com/maps',
    'gmail': 'https://mail.google.com',
  };

  // Match more app opening patterns
  const appOpenRegex = /(?:open|launch|start|run|execute) ([\w\s]+)/i;
  const appMatch = lowerCaseCommand.match(appOpenRegex);

  if (appMatch && appMatch[1]) {
    const requestedApp = appMatch[1].trim().toLowerCase();

    // Find the closest match in our app map
    let bestMatch = '';
    let highestScore = 0;

    for (const app in appMap) {
      // Simple matching algorithm - can be improved
      if (requestedApp === app) {
        bestMatch = app;
        break;
      } else if (requestedApp.includes(app) || app.includes(requestedApp)) {
        const score = app.length / requestedApp.length;
        if (score > highestScore && score <= 1) {
          highestScore = score;
          bestMatch = app;
        }
      }
    }

    if (bestMatch) {
      const appPath = appMap[bestMatch];
      const isWebApp = appPath.startsWith('http');

      if (isWebApp) {
        return {
          responseText: `Opening ${bestMatch} in your browser.`,
          speak: true,
          action: { type: 'open_url', url: appPath }
        };
      } else {
        return {
          responseText: `I'll try to open ${bestMatch} for you. Note that local application access is limited in the web version.`,
          speak: true,
          action: {
            type: 'execute_local',
            command_description: `open ${bestMatch} (${appPath})`
          }
        };
      }
    } else {
      // If no match found, use AI to respond
      try {
        const aiResponse = await interpretCommand({ command: `I want to open ${requestedApp}` });
        return { responseText: aiResponse.interpretedCommand, speak: true };
      } catch (error) {
        return {
          responseText: `I'm not sure how to open "${requestedApp}". Could you try with a more specific application name?`,
          speak: true
        };
      }
    }
  }

  // Enhanced Weather handling with more patterns
  const weatherMatch =
    lowerCaseCommand.match(/weather (?:in|at|for) (.+)/i) ||
    lowerCaseCommand.match(/what(?:'s| is) the weather (?:in|at|for) (.+)/i) ||
    lowerCaseCommand.match(/how(?:'s| is) the weather (?:in|at|for) (.+)/i) ||
    lowerCaseCommand.match(/temperature (?:in|at|of) (.+)/i) ||
    lowerCaseCommand.match(/forecast (?:for|in) (.+)/i);

  if (weatherMatch && weatherMatch[1]) {
    const city = weatherMatch[1].trim();
    const weatherInfo = await getWeather(city);
    return { responseText: weatherInfo, speak: true };
  }

  // Generic weather query without location
  if (/weather|temperature|forecast|rain|snow|sunny|cloudy|humidity|wind/i.test(lowerCaseCommand) &&
      !lowerCaseCommand.match(/weather (?:in|at|for)|temperature (?:in|at|of)|forecast (?:for|in)/i)) {
    return { responseText: "I'd be happy to provide weather information. Which city are you interested in?", speak: true };
  }

  const wikipediaSearchMatch = lowerCaseCommand.match(/search wikipedia for (.+)/i) || lowerCaseCommand.match(/wikipedia (.+)/i);
  if (wikipediaSearchMatch && wikipediaSearchMatch[1]) {
    const query = encodeURIComponent(wikipediaSearchMatch[1].trim());
    return { responseText: `Searching Wikipedia for "${wikipediaSearchMatch[1].trim()}".`, speak: true, action: { type: 'open_url', url: `https://en.wikipedia.org/wiki/${query}` } };
  }

  const googleSearchMatch = lowerCaseCommand.match(/google search (.+)/i) || lowerCaseCommand.match(/search for (.+)/i)  ;
  if (googleSearchMatch && googleSearchMatch[1]) {
    const query = encodeURIComponent(googleSearchMatch[1].trim());
    return { responseText: `Searching Google for "${googleSearchMatch[1].trim()}".`, speak: true, action: { type: 'open_url', url: `https://www.google.com/search?q=${query}` } };
  }


  // Default to Genkit AI for other commands
  try {
    const aiResponse = await interpretCommand({ command });
    return { responseText: aiResponse.interpretedCommand, speak: true };
  } catch (error: any) {
    console.error("Error with AI command interpretation:", error);
    return { responseText: "Sorry, I had trouble understanding that. Can you try rephrasing?", speak: true };
  }
}

export async function fetchPersonalizedSuggestionsList(numSuggestions: number = 3): Promise<string[]> {
  try {
    const input: PersonalizedSuggestionsInput = { numSuggestions };
    const suggestions = await getPersonalizedSuggestions(input);
    return suggestions;
  } catch (error) {
    console.error("Error fetching personalized suggestions:", error);
    return []; // Return empty array on error as per existing behavior
  }
}