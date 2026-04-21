import React from 'react';
import css from './ChatHeader.module.css';
import { Info } from 'lucide-react';
import { useTyping } from '@/contexts/TypingContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelectedConversation } from '@/contexts/SelectedConversationContext';
// import { useWebSocketChat } from '@/contexts/WebSocketChatProvider';


interface ChatHeaderProps {
  toggleSidebar: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  toggleSidebar
}) => {

  const { typing } = useTyping();
  const { selectedConversation } = useSelectedConversation();
  const isReceiver = typing.senderId == selectedConversation?.user_id;
  const navigate = useNavigate();
  const { t } = useTranslation();

const renderUserStatus = () => {
    if (!selectedConversation) return null;

    if (typing.typing && isReceiver ) {
      return <p className={`${css.userStatus} ${css.typing}`}>{t('chatHeader.typing')}</p>;
    }

    switch (selectedConversation.status) {
      case true:
        return <p className={`${css.userStatus} ${css.online}`}>{t('chatHeader.activeNow')}</p>;
      case false:
        return (
          <p className={`${css.userStatus} ${css.offline}`}>
            {t('chatHeader.lastSeen')} {selectedConversation.last_seen}
          </p>
        );
    }
  };


  return (
    <header className={css.chatHeader}>
        <div className={css.chatHeaderContent}>
          <div className={css.userInfo}>
            <div className={`${css.userAvatar} ${selectedConversation?.status ? css.online : ''}`} onClick={() => navigate(`/profile/${selectedConversation?.name}`)}>
              <img
                src={selectedConversation?.avatar}
                alt="User"
                className={css.imageAvatar}
              />
            </div>
            <div className={css.userDetails}>
              <div className={css.usernameheader} onClick={() => navigate(`/profile/${selectedConversation?.name}`)}>
                <h2 className={css.userName}>{selectedConversation?.name} </h2>
              </div>
              {renderUserStatus()}
            </div>
          </div>
          <div className={css.chatActions}>
            <button className={css.backButton} onClick={toggleSidebar}>
              <i>
                <Info color="#F8F3E3" />
              </i>
            </button>
          </div>
        </div>
    </header>
  );
};

export default ChatHeader;
