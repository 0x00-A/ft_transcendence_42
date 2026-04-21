import { useCallback, useEffect, useMemo, useState } from 'react';
import css from './ChatContent.module.css';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';
import { useWebSocketChat } from '@/contexts/WebSocketChatProvider';
import { useSelectedConversation } from '@/contexts/SelectedConversationContext';
import ChatSkeleton from './ChatSkeleton';
import { apiGetConversationMessages } from '@/api/chatApi';
import { OctagonAlert } from 'lucide-react';
import moment from 'moment';

interface MessageProps {
  id: number;
  conversation: number;
  sender: number;
  receiver: number;
  content: string;
  timestamp: string;
  seen?: boolean;
}

const ChatContent = () => {
  const { selectedConversation } = useSelectedConversation();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [websocketChatMessages, setWebsocketChatMessages] = useState<MessageProps[]>([]);
  const { messages: websocketMessages, sendMessage, sendTypingStatus, markAsRead, updateActiveConversation, clearMessages } = useWebSocketChat();
  const [fetchedChatMessages, setFetchedChatMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiGetConversationMessages(selectedConversation.id, page);
        if (data) {
          const updatedMessages = data.results.map((message: MessageProps) => {
            const localTime = moment.utc(message.timestamp).local().format("HH:mm");
            return { ...message, timestamp: localTime };
          });

          if (page === 1) {
            setWebsocketChatMessages([]);
          }
          setFetchedChatMessages((prevMessages) =>
            page === 1 ? updatedMessages : [...prevMessages, ...updatedMessages]
          );
          setHasMore(!!data.next);
        }
      } catch {
        setError('Failed to load messages. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [page, selectedConversation]);

  useEffect(() => {
    if (!selectedConversation) return;

    const filteredMessages = websocketMessages.filter(
      (message) => message.conversation === selectedConversation.id
    );
    
    if (filteredMessages.length > 0) {
      setWebsocketChatMessages(filteredMessages);
    }
  }, [websocketMessages]);

  useEffect(() => {
    if (selectedConversation?.id) {
      updateActiveConversation(selectedConversation.id);
      if (selectedConversation.unreadCount) {
        markAsRead(selectedConversation.id);
      }
    }
  }, [selectedConversation]);

  const combinedMessages = useMemo(() => {
    const reversedFetched = [...fetchedChatMessages].reverse();
    return [...reversedFetched, ...websocketChatMessages];
  }, [fetchedChatMessages, websocketChatMessages]);

  const handleSendMessage = useCallback(
    (message: string) => {
      if (message.trim() && selectedConversation) {
        sendMessage(selectedConversation.user_id, message);
      }
    },
    [sendMessage, selectedConversation]
  );

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (selectedConversation) {
        sendTypingStatus(selectedConversation.user_id, isTyping);
      }
    },
    [sendTypingStatus, selectedConversation]
  );

  const loadMoreMessages = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);

  return (
    <>
      <div className={css.messageArea}>
        {isLoading && page === 1 ? (
          <ChatSkeleton />
        ) : error ? (
          <OctagonAlert />
        ) : (
          <MessageArea
            messages={combinedMessages}
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
          />
        )}
      </div>
      <MessageInput
        conversationData={selectedConversation}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
      />
    </>
  );
};

export default ChatContent;
