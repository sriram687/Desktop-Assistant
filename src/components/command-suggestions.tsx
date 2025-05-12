"use client";

import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface CommandSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
}

export function CommandSuggestions({ suggestions, onSuggestionClick, isLoading }: CommandSuggestionsProps) {
  if (isLoading || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-card rounded-lg shadow-md">
      <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center">
        <Lightbulb className="w-4 h-4 mr-2 text-accent" />
        Try saying:
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            className="bg-secondary hover:bg-accent hover:text-accent-foreground text-secondary-foreground border-border transition-colors duration-200"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
