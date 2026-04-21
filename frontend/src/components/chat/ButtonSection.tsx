import React, { useEffect, useState } from 'react';
import css from './ButtonSection.module.css';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useUser } from '@/contexts/UserContext';
import { useSelectedConversation } from '@/contexts/SelectedConversationContext';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWebSocketChat } from '@/contexts/WebSocketChatProvider';
import { MessageCircleX } from 'lucide-react';



const ButtonSection: React.FC = () => {
  const { user } = useUser();
  const { sendMessage } = useWebSocket();
  const { selectedConversation, setSelectedConversation } = useSelectedConversation();
  const { updateActiveConversation } = useWebSocketChat();
  const navigate = useNavigate();
  const [isInviteDisabled, setIsInviteDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { t } = useTranslation();


  const handleSendInvite = () => {
    if (isInviteDisabled) return;

    sendMessage({
      event: 'game_invite',
      from: user?.username,
      to: selectedConversation?.name,
    });

    setIsInviteDisabled(true);
    setTimeLeft(10);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isInviteDisabled && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isInviteDisabled) {
      setIsInviteDisabled(false);
    }

    return () => clearInterval(timer);
  }, [isInviteDisabled, timeLeft]);


  const handleClose = () => {
    if (selectedConversation !== null) {
      updateActiveConversation(-1);
      setSelectedConversation(null);
    }
  };

  return (
    <div className={css.buttonSection}>
      <div className={css.button}>
        <div
          className={css.icon}
          onClick={() => navigate(`/profile/${selectedConversation?.name}`)}
        >
          <User size={30} color="#F8F3E3" />
        </div>
        <p>{t('settingsSection.profileButton')}</p>
      </div>
      <div className={css.button}>
        <div
          className={css.icon}
          onClick={handleClose}
        >
          <MessageCircleX size={30} color="#F8F3E3" />
        </div>
        <p>{t('settingsSection.closeChat')}</p>
      </div>
      <div className={css.button}>
        <div
          onClick={handleSendInvite}
          className={`${css.iconInvite} ${isInviteDisabled ? css.disabled : ''}`}
        >
          <img
            src="/icons/chat/Invite.svg"
            alt="Invite Button"
          />
        </div>
        <p>{t('settingsSection.inviteButton')}</p>
        {isInviteDisabled && (
          <span className={css.cooldownTimer}>{timeLeft}s</span>
        )}
      </div>
    </div>
  );
};

export default ButtonSection;
