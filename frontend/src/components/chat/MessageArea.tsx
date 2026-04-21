import React, { useEffect, useRef } from 'react';
import css from './MessageArea.module.css';
import Message from './Message';
import { useTyping } from '@/contexts/TypingContext';
import { useSelectedConversation } from '@/contexts/SelectedConversationContext';
import { MessageProps } from '@/types/apiTypes';
import { RefreshCcw } from 'lucide-react';

interface MessageAreaProps {
  messages: MessageProps[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const MessageArea: React.FC<MessageAreaProps> = ({ messages, onLoadMore, hasMore }) => {
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const { typing } = useTyping();
  const { selectedConversation } = useSelectedConversation();

  const isReceiver = typing.senderId === selectedConversation?.user_id;

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    
    }
  }, [messages, typing.typing]);

  return (
    <div className={css.messageArea}>
      {hasMore && (
        <button className={css.loadMoreButton} onClick={onLoadMore}>
          <RefreshCcw />
        </button>
      )}
      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}

      { typing.typing && isReceiver &&(
        <div
          className={`${css.messageWrapper} ${false ? css.sender : css.receiver}`}
        >
          <img
            src={selectedConversation?.avatar}
            alt="avatar"
            className={css.avatar}
          />
          <div className={css.sideMessage}>
            <div className={css.nameAndTime}>
                <div className={css.receiverInfo}>
                  <p>{selectedConversation?.name}</p>
                </div>
            </div>
            <div className={css.messageBubble}>
              <div className={css.typingIndicator}>
                <span className={css.typingDot}></span>
                <span className={css.typingDot}></span>
                <span className={css.typingDot}></span>
              </div>
            </div>
          </div>
        </div>)
      }
      <div ref={messageEndRef} />
    </div>
  );
};

export default MessageArea;