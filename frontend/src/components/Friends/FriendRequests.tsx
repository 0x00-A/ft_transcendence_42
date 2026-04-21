import React from 'react';
import css from './FriendRequests.module.css';
import { useGetData } from '../../api/apiHooks';
import NoFriendRequests from './NoFriendRequests';
import { apiAcceptFriendRequest, apiRejectFriendRequest } from '@/api/friendApi';
import { toast } from 'react-toastify';
import { Check, X } from 'lucide-react';
import FriendSkeleton from './FriendSkeleton';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/helpers';
import { useNavigate } from 'react-router-dom';


interface Profile {
  id: number;
  username: string;
  profile: {
    avatar: string;
    level: number | null;
  };
}

interface FriendRequest {
  id: number;
  sender: Profile;
  receiver: Profile;
  status: string;
  timestamp: string;
}

const FriendRequests: React.FC = () => {

  const {
    data: friendPending,
    isLoading,
    error,
    refetch
  } = useGetData<FriendRequest[]>('friend-requests/pending');
  const { t } = useTranslation();
  const navigate = useNavigate();




  const acceptFriendRequest = async (username: string) => {
    try {
      await apiAcceptFriendRequest(username);
      refetch();
    } catch (error: any) {
      toast.error(error.message || t('errorsFriends.request'));
    }
  };
  
  
  const rejectFriendRequest = async (username: string) => {
    try {
      const response = await apiRejectFriendRequest(username);
      toast.success(response.message);
      refetch();
    } catch (error: any) {
      toast.error(error.message || t('errorsFriends.reject'));
    }
  };


  return (
    <div className={css.friendRequests}>
      <div className={css.header}>
        <h1 className={css.title}>{t('friendRequests.title')}</h1>
      </div>

      <div className={css.listContainer}>
        {isLoading ? (
          <FriendSkeleton/>
        ) : error ? (
          <p className={css.errorMessage}>Error fetching friend requests: {error.message}</p>
        ) : friendPending && friendPending.length > 0 ? (
          <div className={css.list}>
            {friendPending.map((request) => (
              <div key={request.id} className={css.requestCard}>
                <img
                  src={request.sender.profile.avatar}
                  alt={request.sender.username}
                  onClick={() => navigate(`/profile/${request.sender.username}`)}
                  className={css.avatar}
                />
                <div className={css.userInfo}>
                  <span className={css.username} onClick={() => navigate(`/profile/${request.sender.username}`)}>{request.sender.username}</span>
                  <span className={css.timestamp}>{formatDate(new Date(request.timestamp), t('lang'))}</span>
                </div>
                <div className={css.actions}>
                  <button
                    className={css.acceptButton}
                    onClick={() => acceptFriendRequest(request.sender.username)}
                    title={t('friendRequests.pupAccept')}
                    >
                    <Check size={20} />

                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request.sender.username)}
                    className={css.rejectBtn}
                    title={t('friendRequests.pupReject')}
                    >
                    <X size={20} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <NoFriendRequests />
        )}
      </div>
    </div>
  );
};

export default FriendRequests;