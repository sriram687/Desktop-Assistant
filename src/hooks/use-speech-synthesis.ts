"use client";

import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  isSpeaking: boolean;
  error: string | null;
  browserSupportsSpeechSynthesis: boolean;
}

const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [browserSupportsSpeechSynthesis, setBrowserSupportsSpeechSynthesis] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setBrowserSupportsSpeechSynthesis(true);
      setSynth(window.speechSynthesis);
    } else {
      setBrowserSupportsSpeechSynthesis(false);
      setError("Speech synthesis not supported in this browser.");
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (synth && text) {
      if (synth.speaking) {
        synth.cancel(); // Cancel current speech before starting new one
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => {
        setIsSpeaking(true);
        setError(null);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = (event) => {
        setError(`Speech synthesis error: ${event.error}`);
        setIsSpeaking(false);
      };
      // You might want to select a voice if needed
      // const voices = synth.getVoices();
      // utterance.voice = voices[0]; // Example
      synth.speak(utterance);
    }
  }, [synth]);

  return { speak, isSpeaking, error, browserSupportsSpeechSynthesis };
};

export default useSpeechSynthesis;
