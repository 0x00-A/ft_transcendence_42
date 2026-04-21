import css from './FriendsList.module.css';
import { useGetData } from '@/api/apiHooks';
import { Friends } from '@/types/apiTypes';
import { API_GET_DASHBOARD_FRIENDS_URL } from '@/api/apiConfig';
import { useTranslation } from 'react-i18next';
import { Swords, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FriendSkeleton from '../Friends/FriendSkeleton';
import { useEffect, useState } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useUser } from '@/contexts/UserContext';


const FriendsList = ({ username }: { username: string | undefined }) => {
  const {
    data: friendsData,
    isLoading,
    error,
  } = useGetData<Friends[]>(`${API_GET_DASHBOARD_FRIENDS_URL}${username}`);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isInviteDisabled, setIsInviteDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { sendMessage } = useWebSocket();
  const { user } = useUser();


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

  return (
    <>
      <div className={css.header}>
        <h3 className={css.title}>{t('dashboard.FriendsList.headerTitle')}</h3>
        <button
          className={css.viewMore}
          onClick={() => navigate('/friends?view=all')}
        >
          {t('dashboard.FriendsList.viewMore')}
        </button>
      </div>

      {isLoading ? (
        <FriendSkeleton />
      ) : (
        <div className={css.friendList}>
          {error && <p>{error.message}</p>}
          {friendsData?.length == 0 && (
            <div className={css.noFriends}>
              <span>{t('dashboard.FriendsList.noFriends.message')}</span>
              <button
                className={css.addFriendsBtn}
                onClick={() => navigate('/friends?view=add')}
              >
                <UserPlus />
                <span>{t('dashboard.FriendsList.noFriends.addFriendsButton')}</span>
              </button>
            </div>
          )}
          {friendsData &&
            friendsData?.length > 0 &&
            friendsData?.map((friend: Friends, index: number) => (
              <div className={css.friendItem} key={index}>
                <img
                  src={friend.profile.avatar}
                  alt={friend.username}
                  className={css.avatar}
                  onClick={() => navigate(`/profile/${friend.username}`)}
                />
                <div className={css.friendInfo}>
                  <span className={css.name} onClick={() => navigate(`/profile/${friend.username}`)}>{friend.username}</span>
                  <span className={css.level}>
                    {t('dashboard.FriendsList.friendItem.levelLabel')} {friend.profile.level}
                  </span>
                </div>
                <div
                  className={`${css.status} ${friend.profile.is_online ? css.online : css.offline}`}
                >
                  <span className={css.statusIndicator}></span>
                  {friend.profile.is_online ? t('dashboard.FriendsList.friendItem.status.online') : t('dashboard.FriendsList.friendItem.status.offline')}
                </div>

                <div
                  className={`${css.challenge} ${isInviteDisabled ? css.disabled : ''}`}
                  onClick={() => handleSendInvite(friend.username)}
                >
                    <Swords color="#f8c35c"/>
                    {isInviteDisabled ? (
                      <span className={css.cooldownTimer}>{timeLeft}s</span>
                    ) : (
                      <span>{t('Profile.profileHeader.buttons.challengeBtn')}</span>
                    )}
                </div>
              </div>
            ))}
        </div>
      )}

    </>
  );
};

export default FriendsList;
