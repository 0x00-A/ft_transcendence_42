import React, { useEffect, useState } from 'react';
import css from './OnlineFriends.module.css';
import { useNavigate } from 'react-router-dom';
import { useGetData } from '../../api/apiHooks';
import NoOnlineFriends from './NoOnlineFriends';
import { MessageSquareText } from 'lucide-react';
import FriendSkeleton from './FriendSkeleton';
import { useUser } from '@/contexts/UserContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useTranslation } from 'react-i18next';


interface Friend {
  id: number;
  username: string;
  profile: {
    id: number;
    avatar: string;
    is_online: boolean;
  }
}

const OnlineFriends: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { sendMessage } = useWebSocket();
  const { data: onlineFriends, isLoading, error } = useGetData<Friend[]>('online-friends');
  const [isInviteDisabled, setIsInviteDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { t } = useTranslation();


  const handleSendInvite = (username: string) => {

    if (isInviteDisabled) return;
    sendMessage({
      event: 'game_invite',
      from: user?.username,
      to: username,
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

  const handleMessageClick = (username: string) => {
    navigate('/chat', { state: { selectedFriend: username } });
  };


  return (
    <div className={css.onlineFriends}>
      <h1 className={css.title}>{t('onlineFriends.title')}</h1>
      <div className={css.friendList}>
        {isLoading ? (
          <FriendSkeleton/>
        ) : error ? (
          <p>Error: loading</p>
        ) : onlineFriends && onlineFriends.length > 0 ? (
          onlineFriends.map((friend) => (
            <div key={friend.id} className={css.friendCard}>
              <img
                onClick={() => navigate(`/profile/${friend.username}`)}
                src={friend.profile.avatar}
                alt={friend.username}
                className={css.avatar}
              />
              <div className={css.userInfo}>
                <span className={css.username} onClick={() => navigate(`/profile/${friend.username}`)}>{friend.username}</span>
                <span className={css.online}>{t('onlineFriends.online')}</span>
              </div>
              <div className={css.actions}>
              <button
                  className={`${css.actionButton} ${css.messageButton}`}
                  onClick={() => handleMessageClick(friend.username)}
                  title={t('allFriends.pupMessage')}
                >
                  <MessageSquareText size={20} />
                </button>
                <button
                  className={`${css.actionButton} ${isInviteDisabled ? css.disabled : ''}`}
                  onClick={ () =>  handleSendInvite(friend.username)}
                  title={t('allFriends.pupInvite')}
                  >
                  
                  {isInviteDisabled ? (
                    <> <img src="/icons/chat/Invite.svg" alt="Invite" /> <span className={css.cooldownTimer}>{timeLeft}s</span> </>  ): <img src="/icons/chat/Invite.svg" alt="Invite" />
                  }
                </button>
              </div>
            </div>
          ))
        ) : (
          <NoOnlineFriends />
        )}
      </div>
    </div>
  );
};

export default OnlineFriends;