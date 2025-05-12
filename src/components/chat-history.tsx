"use client";

import type { ChatMessage } from '@/types';
import { ChatBubble } from './chat-bubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useRef } from 'react';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <ScrollArea className="h-[400px] md:h-[500px] w-full rounded-md border border-border p-4 shadow-inner bg-background/50" ref={scrollAreaRef}>
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Say something to start the conversation!</p>
        </div>
      )}
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
    </ScrollArea>
  );
}
