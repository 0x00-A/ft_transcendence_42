import React, { useState } from 'react';
import css from './BlockedList.module.css';
import { Search, Ban } from 'lucide-react';
import { useGetData } from '../../api/apiHooks';
import { apiUnBlockRequest } from '@/api/friendApi';
import { toast } from 'react-toastify';
import FriendSkeleton from './FriendSkeleton';
import { useTranslation } from 'react-i18next';
import { CgUnblock } from "react-icons/cg";
import { formatDate } from '@/utils/helpers';
import { useNavigate } from 'react-router-dom';



interface BlockedUser {
  blocker: {
    id: string;
    username: string;
    profile: {
      avatar: string;
    };
  };
  blocked: {
    id: string;
    username: string;
    profile: {
      avatar: string;
    };
  };
  date_blocked: string;
}

const BlockedList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();


  const { data: blockedUsers = [], isLoading, error, refetch } = useGetData<BlockedUser[]>('blocked');

  const unBlockRequest = async (username: string) => {
    try {
      const response = await apiUnBlockRequest(username);
      toast.success(response.message);
      refetch();
    } catch (error: any) {
      toast.error(error.message || t('errorsFriends.unblock'));
    }
  };

  const filteredUsers = blockedUsers.filter((user) =>
    user.blocked.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderNoBlockedUsers = () => (
    <div className={css.emptyState}>
      <Ban size={80} color='#6b7280'/>
      <h3 className={css.emptyTitle}>{t('blockedList.noRequests')}</h3>
      <p className={css.emptyDescription}>{t('blockedList.description')}</p>
    </div>
  );

  return (
    <div className={css.blockedList}>
      <h1 className={css.title}>{t('blockedList.title')}</h1>

      {/* Search input */}
      <div className={css.searchContainer}>
        <Search className={css.searchIcon} />

        <input
          type="text"
          className={css.searchInput}
          placeholder={t('blockedList.placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={css.list}>
      {isLoading ? (
          <FriendSkeleton/>
        ) : error ? (
          <p>Error loading friends</p>
        ) :
        filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.blocked.id} className={css.userCard}>
              <img
                onClick={() => navigate(`/profile/${user.blocked.username}`)}
                src={user.blocked.profile.avatar}
                alt={user.blocked.username}
                className={css.avatar}
              />
              <div className={css.userInfo}>
              <span className={css.username} onClick={() => navigate(`/profile/${user.blocked.username}`)}>{user.blocked.username}</span>
                <span className={css.timestamp}> {formatDate(new Date(user.date_blocked), t('lang'))} </span>
              </div>
              <button
                className={css.unblockButton}
                onClick={() => unBlockRequest(user.blocked.username)}
                title={t('blockedList.pupUnblock')}
              >
                <CgUnblock size={20}/>
              </button>
            </div>
          ))
        ) : (
          renderNoBlockedUsers()
        )}
      </div>
    </div>
  );
};

export default BlockedList;
