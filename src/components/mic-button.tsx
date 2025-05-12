"use client";

import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MicButtonProps {
  isListening: boolean;
  isLoading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function MicButton({ isListening, isLoading, onClick, disabled }: MicButtonProps) {
  const Icon = isListening ? Mic : isLoading ? Loader2 : MicOff;
  
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      variant="default"
      size="lg"
      className={cn(
        'rounded-full w-20 h-20 p-0 shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:scale-105 active:scale-95',
        isListening ? 'bg-destructive hover:bg-destructive/90 animate-pulse' : 'bg-primary hover:bg-primary/90',
        isLoading ? 'bg-secondary hover:bg-secondary/90 cursor-not-allowed' : ''
      )}
      aria-label={isListening ? "Stop listening" : "Start listening"}
    >
      <Icon className={cn("w-10 h-10", isLoading ? "animate-spin" : "")} />
    </Button>
  );
}
