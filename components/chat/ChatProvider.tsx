'use client';

import React, { createContext, useContext, useState } from 'react';
import ChatWidget from './ChatWidget';
import { useChatContext } from '@/lib/hooks/useChatContext';

interface ChatContextType {
  context: any;
  updateContext: (newContext: any) => void;
  clearContext: () => void;
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: React.ReactNode;
}

export default function ChatProvider({ children }: ChatProviderProps) {
  const chatContext = useChatContext();
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen(!isOpen);

  const value = {
    ...chatContext,
    isOpen,
    openChat,
    closeChat,
    toggleChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
      <ChatWidget 
        context={chatContext.context} 
        isOpen={isOpen}
        onClose={closeChat}
      />
    </ChatContext.Provider>
  );
}
