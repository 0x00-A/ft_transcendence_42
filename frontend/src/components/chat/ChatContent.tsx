import React, { useCallback, useEffect, useRef, useState } from 'react';
import css from './ChatContent.module.css';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';
import { useGetData } from '@/api/apiHooks';
import { useWebSocket } from '@/contexts/WebSocketChatProvider';
import { conversationProps } from '@/types/apiTypes';

interface MessageProps {
  id: number;
  conversation: number;
  sender: number;
  receiver: number;
  content: string;
  timestamp: string;
  seen?: boolean;
}


interface ChatContentProps {
  customSticker: string;
  onSelectedConversation: conversationProps;
}

const ChatContent: React.FC<ChatContentProps> = ({
  onSelectedConversation,
  customSticker,
}) => {
  const [chatMessages, setChatMessages] = useState<MessageProps[]>([]);
  const { data: fetchedMessages, isLoading, error } = useGetData<MessageProps[]>(
    `chat/conversations/${onSelectedConversation?.id}/messages`
  );

  const { messages: websocketMessages, sendMessage, sendTypingStatus, markAsRead } = useWebSocket();


  useEffect(() => {
    if (onSelectedConversation?.id) {
      markAsRead(onSelectedConversation.id);
    }
  }, [onSelectedConversation?.id, markAsRead]);

  useEffect(() => {
    setChatMessages(() => [
      ...(fetchedMessages || []),
      ...websocketMessages,
    ]);
  }, [fetchedMessages, websocketMessages]);

  
  const handleSendMessage = useCallback(
    (message: string) => {
      if (message.trim()) {
        sendMessage(onSelectedConversation.user_id, message); 
      }
    },
    [sendMessage, onSelectedConversation.user_id]
  );
  
    const handleTyping = useCallback(
      (isTyping: boolean) => {
        sendTypingStatus(onSelectedConversation.user_id, isTyping); 
      },
      [sendTypingStatus, onSelectedConversation.user_id]
    );

  return (
    <>
      <div className={css.messageArea}>
        {isLoading ? (
          <div>Loading messages...</div>
        ) : error ? (
          <div>Error loading messages</div>
        ) : (
          <MessageArea
            messages={chatMessages}
            conversationData={onSelectedConversation}
          />
        )}
      </div>
      <MessageInput
        customSticker={customSticker}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
      />
    </>
  );
};

export default ChatContent;

