# Gemini Desktop Assistant

This is a Next.js web application that acts as a desktop AI assistant, powered by Google Gemini. It allows users to interact with the assistant using voice commands.

## Features

- **AI Command Execution**: Uses Google Gemini to interpret commands and provide responses.
- **Voice Input**: Leverages browser's SpeechRecognition API for voice commands.
- **Voice Feedback**: Uses browser's SpeechSynthesis API for assistant's spoken responses.
- **Chat Interface**: Displays conversation history in a modern chat UI.
- **Command Suggestions**: Shows frequently used or personalized command suggestions.
- **Weather Information**: Fetches and displays weather information for a specified city.
- **Jokes & Basic Info**: Tells jokes, current time, and date.
- **Web Actions**: Can open websites like YouTube, Wikipedia, or perform Google searches.

## Tech Stack

- Next.js (App Router, Server Components, Server Actions)
- React
- TypeScript
- Tailwind CSS
- ShadCN UI Components
- Genkit with Google Gemini
- Web Speech API (SpeechRecognition & SpeechSynthesis)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

\`\`\`env
# Required for Genkit to use Google Gemini
GOOGLE_API_KEY=AIzaSyBWhTPNS2rWOFQ5w3fmES5ZwH3t0ZBW0e8 

# Required for fetching weather information
WEATHER_API_KEY=AIzaSyDYkM4stAzLk-tJ09a5UvZOp5dqCQXLLDY 
\`\`\`

Replace placeholder values with your actual API keys.
- `GOOGLE_API_KEY`: Your Google AI Studio API key for Gemini.
- `WEATHER_API_KEY`: Your OpenWeatherMap API key.

### Installation

1.  Clone the repository:
    \`\`\`bash
    git clone <repository_url>
    cd <repository_name>
    \`\`\`

2.  Install dependencies:
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`

### Running the Development Server

1.  Start the Genkit development server (if you need to monitor/debug Genkit flows, otherwise Next.js dev server is enough for app functionality):
    \`\`\`bash
    npm run genkit:dev
    # or in a separate terminal:
    # npx genkit start -- tsx src/ai/dev.ts
    \`\`\`

2.  Start the Next.js development server:
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`

Open [http://localhost:9002](http://localhost:9002) (or the specified port) with your browser to see the application.

## Project Structure

-   `src/app/`: Main application pages and layout.
-   `src/components/`: Reusable React components.
-   `src/hooks/`: Custom React hooks (e.g., for speech recognition/synthesis).
-   `src/lib/`: Utility functions and server actions.
-   `src/ai/`: Genkit AI flows (provided, not to be modified by this process).
-   `user_data.json`: Stores data about frequently used commands (created/managed by the app).
-   `public/`: Static assets.

## Important Notes

-   **Browser Compatibility**: This application relies on the Web Speech API. Ensure your browser supports `SpeechRecognition` and `SpeechSynthesis` for full functionality. Google Chrome is generally recommended for best compatibility.
-   **Microphone Access**: The browser will request permission to use your microphone. You must grant permission for voice input to work.
-   **Local Application Control**: Unlike a native desktop application, this web app cannot directly control local applications (e.g., open Notepad, shutdown PC) due to browser security restrictions. It will simulate or inform about these actions.
-   **API Keys**: Keep your API keys secure and do not commit them directly to your repository if it's public. Use environment variables as described.
