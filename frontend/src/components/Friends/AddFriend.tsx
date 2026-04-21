import React, { useState, useEffect } from 'react';
import css from './AddFriend.module.css';
import { useGetData } from '../../api/apiHooks';
import { toast } from 'react-toastify';
import { apiAcceptFriendRequest, apiCancelFriendRequest, apiRejectFriendRequest, apiSendFriendRequest } from '../../api/friendApi';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus,
  X,       
  Check,   
  Users,
  Clock,    
  Eye,
  Search,   
} from 'lucide-react';
import FriendSkeleton from './FriendSkeleton';
import { useTranslation } from 'react-i18next';


interface Profile {
  user: number;
  avatar: string;
  age: number | null;
  level: number | null;
  stats: Record<string, unknown>;
  is_online: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  is_oauth_user: boolean;
  first_name: string;
  last_name: string;
  profile: Profile;
  friend_request_status?: "accepted" | "pending" | "Add Friend" | "cancel";
}

interface SuggestedUser {
  user: User;
  status: "Friends" | "Pending" | "Add Friend";
}


const AddFriend: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const { 
    data: suggestedConnections, 
    isLoading: loadingSuggested, 
    error: suggestedError ,
    refetch: refetchSuggestedConnections 
  } = useGetData<SuggestedUser[]>('suggested-connections');
  const { data: users, isLoading: loadingUsers, error: usersError, refetch } = useGetData<User[]>('users');
  const navigate = useNavigate();
  const { t } = useTranslation();


  if (suggestedError) return <p>Error loading suggested connections: {suggestedError.message}</p>;
  if (usersError) return <p>Error loading users: {usersError.message}</p>;

  useEffect(() => {
    const filterUsers = () => {
      if (searchTerm) {
        const filteredUsers = users?.filter((user) => {
          const userName = user.username.toLowerCase();
          const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
          return userName.includes(searchTerm.toLowerCase()) || fullName.includes(searchTerm.toLowerCase());
        }) || [];
        setSearchResults(filteredUsers);
      } else {
        setSearchResults([]);
      }
    };
    filterUsers();
  }, [searchTerm, users]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const sendFriendRequest = async (username: string) => {
    try {
      await apiSendFriendRequest(username);
      refetch();
      refetchSuggestedConnections()
    } catch  {
      toast.error(t('errorsFriends.send'));
    }
  };

  const rejectFriendRequest = async (username: string) => {
    try {
      await apiRejectFriendRequest(username);
      refetch();
    } catch  {
      toast.error(t('errorsFriends.reject'));
    }
  };

  const acceptFriendRequest = async (username: string) => {
    try {
      await apiAcceptFriendRequest(username);
      refetch();
    } catch {
      toast.error(t('errorsFriends.request'));
    }
  };

  const handleCancel = async (username: string) => {
    try {
      await apiCancelFriendRequest(username);
      refetch();
    } catch {
      toast.error(t('errorsFriends.cancel'));
    }
  };

  return (
    <div className={css.addFriend}>
      <h1 className={css.title}>{t('addFriend.title')}</h1>
      <div className={css.searchContainer}>
        <Search className={css.searchIcon} />
        <input
          type="text"
          placeholder={t('addFriend.placeholder')}
          value={searchTerm}
          onChange={handleSearch}
          className={css.searchInput}
        />
      </div>

      {searchTerm === '' && suggestedConnections && suggestedConnections.length > 0 && (
        <div className={css.suggestedConnections}>
          <h3 className={css.suggestedConnectionsTitle}>{t('addFriend.Suggested')}</h3>
          {loadingSuggested ? (
            <FriendSkeleton/>
          ) : (
            <div className={css.results}>
              {suggestedConnections.map(({ user, status }) => (
                <div key={user.username} className={css.userCard}>
                  <img src={user.profile.avatar} alt={user.username} className={css.avatar} onClick={() => navigate(`/profile/${user.username}`)}/>
                  <div className={css.userInfo} onClick={() => navigate(`/profile/${user.username}`)}>
                    <span className={css.username}>{user.username}</span>
                  </div>
                  <div className={css.actions}>
                    {status === "Friends" ? (
                      <span
                        className={css.friendsBtn}
                        title={t('addFriend.pupFriend')}
                        >
                          <Users size={20}/>
                        </span>
                    ) : status === "Pending" ? (
                      <span
                      className={css.pendingBtn}
                      title={t('addFriend.pupPending')}
                      >
                        <Clock size={20}/>
                      </span>
                    ) : (
                      <button
                        onClick={() => sendFriendRequest(user.username)}
                        className={css.addFriendBtn}
                        title={t('addFriend.pupAddFriend')}

                        >
                          <UserPlus size={20}/>
                        </button>
                    )}
                    <button
                      className={css.viewProfileBtn} 
                      onClick={() => navigate(`/profile/${user.username}`)}
                      title={t('addFriend.pupViewProfile')}
                      >
                        <Eye size={20}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {searchTerm !== '' && (
        <div className={css.results}>
          {loadingUsers ? (
            <FriendSkeleton/>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div key={user.username} className={css.userCard}>
                <img
                  onClick={() => navigate(`/profile/${user.username}`)}
                  src={`${user.profile.avatar}`}
                  alt={user.username}
                  className={css.avatar}
                />
                <div className={css.userInfo}>
                  <span className={css.username} onClick={() => navigate(`/profile/${user.username}`)}>{user.username}</span>
                  <span className={css.fullName}>{`${user.first_name} ${user.last_name}`.trim()}</span>
                </div>
                <div className={css.actions}>
                  <button
                    className={css.viewProfileBtn}
                    onClick={() => navigate(`/profile/${user.username}`)}
                    title={t('addFriend.pupViewProfile')}
                    >
                      <Eye size={20}/>
                    </button>

                  {user.friend_request_status === "accepted" ? (
                    <span 
                    className={css.friendsStatus}
                    title={t('addFriend.pupFriend')}
                    >
                      <Users size={20}/>
                    </span>
                  ) : user.friend_request_status === "pending" ? (
                    <>
                      <button
                        onClick={() => acceptFriendRequest(user.username)}
                        className={css.acceptBtn}
                        title={t('addFriend.pupAccept')}
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(user.username)}
                        className={css.rejectBtn}
                        title={t('addFriend.pupReject')}
                      >
                        <X size={20} />
                      </button>
                    </>
                  ) : user.friend_request_status === "cancel" ? (
                    <button
                      onClick={() => handleCancel(user.username)}
                      className={css.cancelBtn}
                      title={t('addFriend.pupCancel')}
                    >
                      <X size={20}/>
                    </button>
                  ) : (
                    <button
                      onClick={() => sendFriendRequest(user.username)}
                      className={css.addFriendBtn}
                      title={t('addFriend.pupAddFriend')}
                      >
                        <UserPlus size={20}/>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={css.notFound}>
              <p className={css.notFoundText}>{t('addFriend.notFound')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddFriend;
