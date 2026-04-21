import React from 'react';
import css from './MessageArea.module.css';
import { useUser } from '@/contexts/UserContext';
import { useSelectedConversation } from '@/contexts/SelectedConversationContext';
import { MessageProps } from '@/types/apiTypes';
import { useTranslation } from 'react-i18next';



interface MessageComponentProps {
  message: MessageProps;
}

const Message: React.FC<MessageComponentProps> = ({ message }) => {
  const { content, timestamp } = message;
  const {user} = useUser()
  const { selectedConversation } = useSelectedConversation();
  const { t } = useTranslation(); 


  const isSender = user?.id === message.sender;
  return (
    <div
      className={`${css.messageWrapper} ${isSender ? css.sender : css.receiver}`}
    >
      {!isSender && (
        <img
          src={selectedConversation?.avatar}
          alt="avatar"
          className={css.avatar}
        />
      )}
      <div className={css.sideMessage}>
        <div className={css.nameAndTime}>
          {isSender ? (
            <div className={css.senderInfo}>
              <span>{timestamp}</span> • <p>{t('message.sender')}</p>
            </div>
          ) : (
            <div className={css.receiverInfo}>
              <p>{selectedConversation?.name}</p>
              • <span>{timestamp}</span>
            </div>
          )}
        </div>
          <div className={css.messageBubble}>
            <p>{content}</p>
          </div>
      </div>
    </div>
  );
};

export default Message;
