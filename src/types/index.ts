export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

export interface CommandResponse {
  responseText: string;
  speak: boolean;
  action?: {
    type: 'open_url';
    url: string;
  } | {
    type: 'execute_local'; // For commands that would run locally
    command_description: string;
  }
}
