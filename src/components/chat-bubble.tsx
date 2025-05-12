"use client";

import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { User, Bot, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === 'user';
  const isAssistant = message.sender === 'assistant';
  const isSystem = message.sender === 'system';

  return (
    <div
      className={cn(
        'flex mb-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <Card
        className={cn(
          'max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl shadow-lg',
          isUser ? 'bg-primary text-primary-foreground rounded-tl-xl rounded-tr-xl rounded-bl-xl' : 
          isAssistant ? 'bg-card text-card-foreground rounded-tr-xl rounded-tl-xl rounded-br-xl' :
          'bg-muted text-muted-foreground w-full text-center py-2 px-4 rounded-lg'
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            {!isUser && !isSystem && <Bot className="h-5 w-5 mt-0.5 text-accent flex-shrink-0" />}
            {isSystem && <Info className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />}
            
            <p className={cn('text-sm whitespace-pre-wrap break-words', isSystem ? 'italic' : '')}>
              {message.text}
            </p>
            {isUser && <User className="h-5 w-5 mt-0.5 text-primary-foreground flex-shrink-0" />}
          </div>
          {!isSystem && (
            <p className={cn(
                "text-xs mt-1",
                isUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"
            )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
