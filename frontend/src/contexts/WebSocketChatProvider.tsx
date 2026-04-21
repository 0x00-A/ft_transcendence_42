import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import getWebSocketUrl from '@/utils/getWebSocketUrl';
import { useTyping } from './TypingContext';
import moment from 'moment';
import { toast } from 'react-toastify';



interface MessageProps {
  id: number;
  conversation: number;
  sender: number;
  receiver: number;
  content: string;
  timestamp: string;
  seen: boolean;
}

interface BlockStatusUpdate {
  conversationId: number;
  blockerId: number;
  blockedId: number;
  blockStatus: string;
}

interface WebSocketContextType {
  sendMessage: (receiverId: number, message: string) => void;
  sendTypingStatus: (receiverId: number, typing: boolean) => void;
  messages: MessageProps[];
  markAsRead: (conversationId: number) => void;
  clearMessages: () => void;
  updateActiveConversation: (conversationId: number) => void;
  lastMessage: {
    conversationId: number;
    content: string;
    timestamp: string;
  } | null;
  markAsReadData: {
    status: string;
    conversationId: number;
  } | null;
  toggleBlockStatus: (conversation_id: number, blocker_id: number, blocked_id: number, status: boolean) => void;
  blockStatusUpdate: BlockStatusUpdate | null;
}


const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  userId: number;
}

export const WebSocketChatProvider: React.FC<WebSocketProviderProps> = ({ children, userId }) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [lastMessage, setLastMessage] = useState<{
    conversationId: number;
    content: string;
    timestamp: string;
  } | null>(null);
  const [markAsReadData, setMarkAsReadData] = useState<{
    status: string;
    conversationId: number;
  } | null>(null);
  const [blockStatusUpdate, setBlockStatusUpdate] = useState<BlockStatusUpdate | null>(null);
  const { setTyping } = useTyping();
  const socketRef = useRef<WebSocket | null>(null);



  useEffect(() => {
    const wsUrl = `${getWebSocketUrl(`chat/`)}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'error') {
        toast.error(data.message);
      }
      else if (data.type === 'chat_message') {
        const newMessage: MessageProps = {
          id: data.id,
          conversation: data.conversation_id,
          sender: data.sender_id,
          receiver: userId,
          content: data.message,
          timestamp: moment().format('HH:mm'),
          seen: false,
        };
        setMessages((prev) => [...prev, newMessage]);
        setLastMessage({
          conversationId: data.conversation_id,
          content: data.message,
          timestamp: moment().format('HH:mm'),
        });

      } else if (data.type === 'typing_status') {
        setTyping({ typing: data.typing, senderId: data.sender_id });
      } else if (data.type === 'mark_as_read') {
        setMarkAsReadData({ status: data.status, conversationId: data.conversation_id, });
      } else if (data.type === 'block_status_update') {
        const blockStatusData: BlockStatusUpdate = {
          conversationId: data.conversation_id,
          blockerId: data.blocker_id,
          blockedId: data.blocked_id,
          blockStatus: data.block_status,
        };
        setBlockStatusUpdate(blockStatusData);
      }
    };

    socket.onclose = () => {
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = (receiverId: number, message: string) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: 'send_message',
          receiver_id: receiverId,
          message,
        })
      );
    }
  };

  const sendTypingStatus = (receiverId: number, typing: boolean) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: 'typing',
          receiver_id: receiverId,
          typing,
        })
      );
    }
  };

  const markAsRead = (conversationId: number) => {
    const socket = socketRef.current;
    let retryCount = 0;
    const maxRetries = 5; 
  
    const sendMarkAsRead = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            action: 'mark_as_read',
            conversation_id: conversationId,
          })
        );
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(sendMarkAsRead, 1000);
      }
    };
    sendMarkAsRead();
  };

  const clearMessages = () => {
    setMessages([]);
  };
  

  const updateActiveConversation = (conversationId: number) => {
    const socket = socketRef.current;
    clearMessages();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: "update_active_conversation",
          conversation_id: conversationId,
        })
      );
    }
  };


  const toggleBlockStatus = (conversationId: number, blockerId: number, blockedId: number, status: boolean) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: 'toggle_block_status',
          conversation_id: conversationId,
          blocker_id: blockerId,
          blocked_id: blockedId,
          status,
        })
      );
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, sendTypingStatus, markAsRead, updateActiveConversation, clearMessages, messages, lastMessage, markAsReadData, toggleBlockStatus, blockStatusUpdate }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketChat = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};