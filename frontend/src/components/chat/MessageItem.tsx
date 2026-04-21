import React, { forwardRef } from 'react';
import css from './MessageItem.module.css';
import { CgMoreO } from 'react-icons/cg';
import { useTyping } from '@/contexts/TypingContext';
import { conversationProps } from '@/types/apiTypes';
import { formatTime } from '@/utils/formatConversationTime';
// import { useTranslation } from 'react-i18next';


interface conversationListProps {
  isSelected: boolean;
  onClick: () => void;
  onMoreClick: (e: React.MouseEvent) => void;
  showMoreIcon: boolean;
  isActive: boolean;
  conversation: conversationProps;
}

const MessageItem = forwardRef<HTMLDivElement, conversationListProps>(
  (
    {
      conversation,
      isSelected,
      onClick,
      onMoreClick,
      showMoreIcon,
      isActive,
    },
    ref
  ) => {
    const { typing } = useTyping();
    // const { t } = useTranslation();

    const isReceiver = typing.senderId == conversation.user_id;

    return (
      <div
        ref={ref}
        className={`${css.messageItemWrapper} ${isSelected ? css.selected : ''}`}
        onClick={onClick}
      >
        <div className={css.messageItem}>
          <div className={`${css.userAvatar} ${conversation.status && !(typing.typing && isReceiver) ? css.online : ''}`}>
              <img
                src={conversation.avatar}
                alt="User"
                className={css.imageAvatar}
              />
              {typing.typing && isReceiver && (
                <div className={css.typingIndicator}>
                  <span className={css.typingDot}></span>
                  <span className={css.typingDot}></span>
                  <span className={css.typingDot}></span>
                </div>
              )}
          </div>
          <div className={css.messageContent}>
            <div className={css.messageHeader}>
              <span className={css.name}>{conversation.name}</span>
              <span className={css.time}>{formatTime(conversation.time)}</span>
            </div>
            <div className={css.messageBody}>
              <span className={`${css.lastMessage}`}>
                {conversation.lastMessage}
              </span>
              {conversation.unreadCount && conversation.unreadCount > 0 && (
                <span className={css.unreadCount}>{conversation.unreadCount}</span>
              )}
            </div>
          </div>
          {showMoreIcon && (
            <CgMoreO
              className={`${css.icon} ${isActive ? css.active : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onMoreClick(e);
              }}
            />
          )}
        </div>
      </div>
    );
  }
);

export default MessageItem;
