import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import css from './AllFriends.module.css';
import { MessageSquareText, Ban, Search, UserX } from 'lucide-react';
import { useGetData } from '../../api/apiHooks';
import NoFound from './NoFound';
import { apiBlockRequest, apiRemoveFriend } from '@/api/friendApi';
import { toast } from 'react-toastify';
import FriendSkeleton from './FriendSkeleton';
import { useUser } from '@/contexts/UserContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useTranslation } from 'react-i18next';


interface FriendProfile {
  avatar: string;
  is_online: boolean;
}

interface Friend {
  id: string;
  username: string;
  profile: FriendProfile;
}

const AllFriends: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useUser();
  const { sendMessage } = useWebSocket();
  const { data: friendsData, isLoading, error, refetch } = useGetData<Friend[]>('friends');
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

  const filteredFriends = friendsData
    ? friendsData.filter((friend) =>
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleMessageClick = (username: string) => {
    navigate('/chat', { state: { selectedFriend: username } });
  };

  const blockRequest = async (username: string) => {
    try {
      await apiBlockRequest(username);
      refetch();
    } catch (error: any) {
      toast.error(error.message || t('errorsFriends.block'));
    }
  };
  const removeFriend = async (username: string) => {
    try {
      await apiRemoveFriend(username);
      refetch();
    } catch (error: any) {
      toast.error(error.message || t('errorsFriends.remove'));
    }
  };

  return (
    <div className={css.allFriends}>
      <h1 className={css.title}>{t('allFriends.title')}</h1>
      
      <div className={css.searchContainer}>
        <Search className={css.searchIcon} />
        <input
          type="text"
          className={css.searchInput}
          placeholder={t('allFriends.placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className={css.friendList}>
        {isLoading ? (
          <FriendSkeleton/>
        ) : error ? (
          <p>Error loading friends</p>
        ) : filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => (
            <div key={friend.id} className={css.friendCard}>
              <img
                onClick={() => navigate(`/profile/${friend.username}`)}
                src={friend.profile.avatar}
                alt={friend.username}
                className={css.avatar}
              />
              <div className={css.userInfo}>
                <span className={css.username} onClick={() => navigate(`/profile/${friend.username}`)} >{friend.username}</span>
                {friend.profile.is_online ? (
                  <span className={css.Online}>{t('allFriends.online')}</span>
                ) : (
                  <span className={css.Offline}>{t('allFriends.offline')}</span>
                )}
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
                <button
                  className={`${css.actionButton} ${css.blockButton}`}
                  onClick={() => blockRequest(friend.username)}
                  title={t('allFriends.pupBlock')}
                >
                  <Ban size={20} />
                </button>
                <button
                  className={`${css.actionButton} ${css.removeButton}`}
                  onClick={() => removeFriend(friend.username)}
                  title={t('allFriends.pupMessage')}
                >
                  <UserX size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <NoFound />
        )}
      </div>
    </div>
  );
};

export default AllFriends;