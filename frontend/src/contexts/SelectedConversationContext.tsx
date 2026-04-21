import { conversationProps } from '@/types/apiTypes';
import { createContext, useContext, useState, ReactNode } from 'react';


interface SelectedConversationContextType {
  selectedConversation: conversationProps | null;
  setSelectedConversation: (conversation: conversationProps | null) => void;
}

const SelectedConversationContext = createContext<SelectedConversationContextType | undefined>(undefined);

export const SelectedConversationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedConversation, setSelectedConversation] = useState<conversationProps | null>(null);

  return (
    <SelectedConversationContext.Provider value={{ selectedConversation, setSelectedConversation }}>
      {children}
    </SelectedConversationContext.Provider>
  );
};

export const useSelectedConversation = () => {
  const context = useContext(SelectedConversationContext);
  if (!context) {
    throw new Error('useSelectedConversation must be used within a SelectedConversationProvider');
  }
  return context;
};
