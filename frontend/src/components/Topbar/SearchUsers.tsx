import React, { useState, useEffect, useRef } from 'react';
import css from './SearchUsers.module.css';
import { useGetData } from '../../api/apiHooks';
import { useNavigate } from 'react-router-dom';
import { ScanSearch, Eye, UserPlus, Check, X, MessageSquareText, AlertTriangle } from 'lucide-react';
import FriendSkeleton from '../Friends/FriendSkeleton';
import {
  apiSendFriendRequest,
  apiCancelFriendRequest,
  apiAcceptFriendRequest,
  apiRejectFriendRequest,
} from '../../api/friendApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface Profile {
  avatar: string;
}

interface User {
  username: string;
  first_name: string;
  last_name: string;
  profile: Profile;
  friend_request_status?: 'accepted' | 'pending' | 'Add Friend' | 'cancel';
}

const SearchUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();


  const { data: users, isLoading: loadingUsers, error: usersError, refetch } = useGetData<User[]>('users');
  const navigate = useNavigate();

  const handleMessageClick = (username: string) => {
    navigate('/chat', { state: { selectedFriend: username } });
    setShowResults(false);
    setSearchTerm('');
  };

  const handleSearchIconClick = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchTerm('');
      setShowResults(false);
      refetch();
    }
  };
  
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setIsExpanded(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filteredUsers =
        users?.filter((user) => {
          const userName = user.username.toLowerCase();
          const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
          return (
            userName.includes(searchTerm.toLowerCase()) ||
            fullName.includes(searchTerm.toLowerCase())
          );
        }) || [];
      setSearchResults(filteredUsers);
      setShowResults(true);
      setSelectedIndex(-1);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showResults) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex < searchResults.length - 1 ? prevIndex + 1 : prevIndex
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : prevIndex
          );
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            const selectedUser = searchResults[selectedIndex];
            navigate(`/profile/${selectedUser.username}`);
            setShowResults(false);
          }
          break;
        case 'Escape':
          setShowResults(false);
          setSelectedIndex(-1);
          searchInputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showResults, searchResults, selectedIndex, navigate]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const performUserAction = async (action: () => Promise<void>) => {
    try {
      await action();
      refetch();
      setShowResults(false);
      setSearchTerm('');
    }  catch (error: any) {
      toast.error(error.message || t('errorsFriends.action'));
    }
  };

  const sendFriendRequest = (username: string) => 
    performUserAction(() => apiSendFriendRequest(username));

  const handleCancel = (username: string) => 
    performUserAction(() => apiCancelFriendRequest(username));

  const acceptFriendRequest = (username: string) => 
    performUserAction(() => apiAcceptFriendRequest(username));

  const rejectFriendRequest = (username: string) => 
    performUserAction(() => apiRejectFriendRequest(username));

  if (usersError) {
    return <p>Error loading users: {usersError.message}</p>;
  }

  return (
    <div className={css.searchUsers} ref={searchContainerRef}>
      <div className={`${css.searchContainer} ${isExpanded ? css.expanded : ''}`}>
        <ScanSearch
          className={css.searchIcon}
          onClick={handleSearchIconClick}
        />
        {isExpanded && (
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t('SearchUsers.placeholder')}
            value={searchTerm}
            onChange={handleSearch}
            className={css.searchInput}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
          />
        )}
      </div>
      {showResults && isExpanded && (
        <div className={css.results}>
            {usersError ?
                <div className={css.errorContainer}>
                  <AlertTriangle size={48} color="red" strokeWidth={1.5} />
                  <p className={css.errorMessage}>{t('SearchUsers.loadingUsers')}</p>
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className={css.retryButton}
                  >
                    {t('SearchUsers.retry')}
                  </button>
              </div>
            : (
              loadingUsers ? (
                <FriendSkeleton />
              ) : searchResults.length > 0 ? (
                searchResults.map((user, index) => (
                  <div 
                    key={user.username} 
                    className={`${css.userCard} ${index === selectedIndex ? css.selected : ''}`}
                    >
                    <img
                      onClick={() => {
                        navigate(`/profile/${user.username}`);
                        setShowResults(false);
                      }}
                      src={user.profile.avatar}
                      alt={user.username}
                      className={css.avatar}
                      />
                    <div
                      onClick={() => {
                        navigate(`/profile/${user.username}`);
                        setShowResults(false);
                      }}
                      className={css.userInfo}
                    >
                      <span className={css.username}>{user.username}</span>
                      <span className={css.fullName}>{`${user.first_name} ${user.last_name}`.trim()}</span>
                    </div>
                    <div className={css.actions}>
                      <button
                        className={css.viewProfileBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${user.username}`);
                          setShowResults(false);
                        }}
                        title={t('SearchUsers.pupViewProfile')}
                      >
                        <Eye size={20}/>
                      </button>
    
                      {user.friend_request_status === "accepted" ? (
                        <span
                          onClick={() => handleMessageClick(user.username)}
                          className={css.messageButton}
                          title={t('SearchUsers.pupMessage')}
                        >
                          <MessageSquareText size={20}/>
                        </span>
                      ) : user.friend_request_status === "pending" ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptFriendRequest(user.username);
                            }}
                            className={css.acceptBtn}
                            title={t('SearchUsers.pupAccept')}
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rejectFriendRequest(user.username);
                            }}
                            className={css.rejectBtn}
                            title={t('SearchUsers.pupReject')}
                          >
                            <X size={20} />
                          </button>
                        </>
                      ) : user.friend_request_status === "cancel" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(user.username);
                          }}
                          className={css.cancelBtn}
                          title={t('SearchUsers.pupCancel')}
                        >
                          <X size={20}/>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendFriendRequest(user.username);
                          }}
                          className={css.addFriendBtn}
                          title={t('SearchUsers.pupAddFriend')}
                        >
                          <UserPlus size={20}/>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className={css.noResults}>{t('SearchUsers.notFound')}</p>
              )
            )
            }
        </div>
      )}
    </div>
  );
};

export default SearchUsers;