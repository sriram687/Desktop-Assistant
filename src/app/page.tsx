"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatHistory } from '@/components/chat-history';
import { MicButton } from '@/components/mic-button';
import { CommandSuggestions } from '@/components/command-suggestions';
import useSpeechRecognition from '@/hooks/use-speech-recognition';
import useSpeechSynthesis from '@/hooks/use-speech-synthesis';
import { processUserCommand, fetchPersonalizedSuggestionsList } from '@/lib/actions';
import type { ChatMessage, CommandResponse } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // For potential manual input or retry

export default function AssistantPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const { toast } = useToast();
  const { transcript, isListening, error: speechError, startListening, stopListening, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const { speak, isSpeaking, error: synthesisError, browserSupportsSpeechSynthesis } = useSpeechSynthesis();

  const lastSpokenTextRef = useRef<string | null>(null);
  const lastProcessedTranscriptRef = useRef<string | null>(null);


  const addMessage = useCallback((text: string, sender: ChatMessage['sender']) => {
    setChatMessages(prev => [...prev, { id: Date.now().toString(), text, sender, timestamp: new Date() }]);
  }, []);
  
  const loadSuggestions = useCallback(async () => {
    const fetchedSuggestions = await fetchPersonalizedSuggestionsList(3);
    setSuggestions(fetchedSuggestions);
  }, []);

  useEffect(() => {
    loadSuggestions();
    addMessage("Welcome to your Gemini Desktop Assistant! Click the mic to speak.", 'system');

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [loadSuggestions, addMessage]);


  useEffect(() => {
    if (speechError) {
      const errorMessage = `Speech error: ${speechError}`;
      addMessage(errorMessage, 'system');
      toast({ title: "Speech Error", description: speechError, variant: "destructive" });
    }
  }, [speechError, toast, addMessage]);

  useEffect(() => {
    if (synthesisError) {
      const errorMessage = `Synthesis error: ${synthesisError}`;
      // Don't add to chat, as it might be annoying if it happens often for minor reasons.
      toast({ title: "Synthesis Error", description: synthesisError, variant: "destructive" });
    }
  }, [synthesisError, toast]);


  const handleProcessCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    addMessage(command, 'user');
    setIsLoadingResponse(true);

    try {
      const response: CommandResponse = await processUserCommand(command);
      addMessage(response.responseText, 'assistant');
      
      if (response.speak && browserSupportsSpeechSynthesis && response.responseText !== lastSpokenTextRef.current) {
        speak(response.responseText);
        lastSpokenTextRef.current = response.responseText;
      }

      if (response.action?.type === 'open_url' && response.action.url) {
        window.open(response.action.url, '_blank');
      }
      if (response.action?.type === 'execute_local') {
        // This is just a notification for the user
        toast({ title: "Local Command", description: `Action '${response.action.command_description}' would run locally. Not supported in web version.` });
      }

      await loadSuggestions(); // Refresh suggestions after a command
    } catch (e: any) {
      const errorMsg = "Sorry, I encountered an error processing your command.";
      addMessage(errorMsg, 'assistant');
      toast({ title: "Command Error", description: e.message || "Unknown error", variant: "destructive" });
      if (browserSupportsSpeechSynthesis) speak(errorMsg);
    } finally {
      setIsLoadingResponse(false);
    }
  }, [addMessage, speak, toast, loadSuggestions, browserSupportsSpeechSynthesis]);

 useEffect(() => {
    if (transcript && transcript !== lastProcessedTranscriptRef.current && !isListening && !isLoadingResponse) {
      if (transcript.trim().length > 0) {
        lastProcessedTranscriptRef.current = transcript; // Mark as processed
        handleProcessCommand(transcript);
      }
    } else if (!transcript && lastProcessedTranscriptRef.current !== null) { 
      // Reset if transcript is cleared (e.g., on new listen cycle by startListening)
      lastProcessedTranscriptRef.current = null;
    }
  }, [transcript, isListening, isLoadingResponse, handleProcessCommand]);

  const handleMicClick = () => {
    if (!browserSupportsSpeechRecognition) {
      toast({ title: "Unsupported Browser", description: "Speech recognition is not supported in your browser.", variant: "destructive" });
      return;
    }
    if (!isOnline) {
      toast({ title: "Offline", description: "You are currently offline. Speech recognition requires an internet connection.", variant: "destructive" });
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      // When starting to listen, clear the last processed transcript ref so a new utterance of the same text can be processed
      lastProcessedTranscriptRef.current = null; 
      startListening();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isOnline) {
      toast({ title: "Offline", description: "You are currently offline. This feature requires an internet connection.", variant: "destructive" });
      return;
    }
    lastProcessedTranscriptRef.current = suggestion; // Pre-mark as processed for suggestions
    handleProcessCommand(suggestion);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 font-sans">
      <Card className="w-full max-w-2xl shadow-2xl border-border overflow-hidden bg-card rounded-xl">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-3xl font-bold text-center text-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 lucide lucide-gemini"><path d="M10.5 2.5 13.5 5.5"/><path d="M2.5 13.5 5.5 10.5"/><path d="M13.5 21.5 10.5 18.5"/><path d="M21.5 10.5 18.5 13.5"/><path d="M12 8A4 4 0 1 0 8 4"/><path d="M12 16a4 4 0 1 0 4 4"/><path d="M12 16a4 4 0 1 0-4-4"/><path d="M12 8a4 4 0 1 0 4-4"/></svg>
            Gemini Desktop Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {!isOnline && (
            <div className="mb-4 p-3 bg-destructive/20 text-destructive rounded-md flex items-center">
              <WifiOff className="w-5 h-5 mr-2"/>
              You are currently offline. Some features may be unavailable.
            </div>
          )}
          {!browserSupportsSpeechRecognition && (
             <div className="mb-4 p-3 bg-destructive/20 text-destructive-foreground rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2"/>
              Speech recognition is not supported by your browser.
            </div>
          )}
          {!browserSupportsSpeechSynthesis && (
             <div className="mb-4 p-3 bg-destructive/20 text-destructive-foreground rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2"/>
              Speech synthesis is not supported by your browser.
            </div>
          )}
          
          <ChatHistory messages={chatMessages} />

          <div className="mt-6 flex flex-col items-center">
            <MicButton 
              isListening={isListening} 
              isLoading={isLoadingResponse}
              onClick={handleMicClick}
              disabled={!browserSupportsSpeechRecognition || !isOnline}
            />
             {isListening && <p className="text-sm text-muted-foreground mt-2">Listening...</p>}
          </div>
          
          <CommandSuggestions 
            suggestions={suggestions} 
            onSuggestionClick={handleSuggestionClick}
            isLoading={isLoadingResponse}
          />
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Gemini Desktop Assistant. Powered by Next.js and Google Gemini.</p>
      </footer>
    </div>
  );
}
