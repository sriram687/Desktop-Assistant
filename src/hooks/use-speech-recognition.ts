"use client";

import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  browserSupportsSpeechRecognition: boolean;
}

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setBrowserSupportsSpeechRecognition(true);
        const newRecognition = new SpeechRecognitionAPI();
        newRecognition.continuous = false;
        newRecognition.interimResults = false;
        newRecognition.lang = 'en-US';

        newRecognition.onresult = (event: SpeechRecognitionEvent) => {
          const currentTranscript = event.results[event.results.length -1][0].transcript.trim();
          setTranscript(currentTranscript);
          setIsListening(false); 
        };

        newRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };
        
        newRecognition.onend = () => {
          setIsListening(false);
        };

        setRecognition(newRecognition);
      } else {
        setBrowserSupportsSpeechRecognition(false);
        setError("Speech recognition not supported in this browser.");
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript('');
      setError(null);
      try {
        recognition.start();
        setIsListening(true);
      } catch (e: any) {
        setError(`Could not start recognition: ${e.message}`);
        setIsListening(false);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  return { transcript, isListening, error, startListening, stopListening, browserSupportsSpeechRecognition };
};

export default useSpeechRecognition;
