import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import css from './MessageList.module.css';
import MessageItem from './MessageItem';
import SearchResultItem from './SearchResultItem';
import { useLocation } from 'react-router-dom';
import { useGetData } from '@/api/apiHooks';
import { useUser } from '@/contexts/UserContext';
import { apiCreateConversation, apiGetConversations, apiGetUser } from '@/api/chatApi';
import { conversationProps } from '@/types/apiTypes';
import { useWebSocketChat } from '@/contexts/WebSocketChatProvider';
import { useNavigate } from 'react-router-dom';
import { useSelectedConversation } from '@/contexts/SelectedConversationContext';
import { CircleX, CheckCheck, User, Ban, Search, ChevronLeft } from 'lucide-react';
import ConversationSkeleton from './ConversationSkeleton';
import SearchFriendsSkeleton from './SearchFriendsSkeleton';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

interface FriendProfile {
  avatar: string;
}

interface Friend {
  id: string;
  username: string;
  profile: FriendProfile;
}

const MessageList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [menuState, setMenuState] = useState<{
    isOpen: boolean;
    position: { top: number; left: number } | null;
    activeIndex: number | null;
  }>({
    isOpen: false,
    position: { top: 0, left: 0 },
    activeIndex: null,
  });

  const {user} = useUser()
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLDivElement | null)[]>([]);
  const messageListRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { setSelectedConversation, selectedConversation } = useSelectedConversation();
  const { lastMessage, updateActiveConversation, markAsReadData, markAsRead, toggleBlockStatus, sendTypingStatus, blockStatusUpdate } = useWebSocketChat();
  const { t } = useTranslation();

  const {
    data: friendsData,
    isLoading: friendsLoading,
    error: friendsError
  } = useGetData<Friend[]>('friends');

  const {
    data: ConversationList,
    refetch,
    isLoading: conversationsLoading,
    error: conversationsError
  } = useGetData<conversationProps[]>('chat/conversations');


  useEffect(() => {
    const update = async () => {
      try {
          const response = await apiGetConversations();
          if (selectedConversation) {
            const foundConversation = response?.find(
              (convo: conversationProps) => convo.id === selectedConversation.id
            );
            setSelectedConversation(foundConversation!);
            refetch();
          }
      } catch (error: any) {
          toast.error(error.response.data.error)
      }
    };
    update();
  }, []);

  useEffect(() => {
    const handleBlockStatusUpdate = async () => {
      if (blockStatusUpdate) {
        const selectedConversationId = blockStatusUpdate.conversationId;

      try {
          const response = await apiGetConversations();
          if (selectedConversation) {
            const foundConversation = response?.find(
              (convo: conversationProps) => convo.id === selectedConversationId
            );
            sendTypingStatus(selectedConversation!.user_id, false);
            setSelectedConversation(foundConversation!);
            refetch();
          }
      } catch (error: any) {
          toast.error(error.response.data.error)
        }
      }
    };
    handleBlockStatusUpdate();
  }, [blockStatusUpdate]);

  useEffect(() => {
    if (markAsReadData?.status) {
      refetch();
    }
  }, [markAsReadData]);

  useEffect(() => {
    if (lastMessage) {
      refetch();
    }
  }, [lastMessage]);


  const filteredFriends = useMemo(() => {
    return friendsData?.filter((friend) =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [friendsData, searchQuery]);

  useEffect(() => {
    const username = location.state?.selectedFriend;

    if (username) {
      const matchedConversation = ConversationList?.find(
        conversation => conversation.name === username
      );

      if (matchedConversation) {
        setSelectedConversation(matchedConversation);

        setIsSearchActive(false);
        setSearchQuery('');
        setMenuState((prevState) => ({
          ...prevState,
          isOpen: false,
          activeIndex: null,
        }));
      } else {
        const fetchUser = async () => {
          try {
            const user = await apiGetUser(username);

            if (user) {
              handleSearchItemClick(user);
            }
          } catch (error) {
            console.error("Error fetching user: ", error);
          }
        };

        fetchUser();
      }
    }
  }, [location.state]);


  const handleMoreClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const messageListRect = messageListRef.current?.getBoundingClientRect();
    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    if (messageListRect) {
      const spaceBelow = messageListRect.bottom - buttonRect.bottom;
      const spaceAbove = buttonRect.top - messageListRect.top;
      const menuHeight = 400;

      let top, left;

      if (spaceBelow >= menuHeight || spaceBelow > spaceAbove) {
        top = buttonRect.bottom - messageListRect.top + 110;
        left = buttonRect.left - messageListRect.left;
      } else {
        top = buttonRect.top - messageListRect.top - 90;
        left = buttonRect.left - messageListRect.left;
      }

      setMenuState((prevState) => ({
        isOpen: prevState.activeIndex !== index || !prevState.isOpen,
        position: { top, left },
        activeIndex:
          prevState.activeIndex !== index || !prevState.isOpen ? index : null,
      }));
    }
  };

  const handleBlock = async (activeConversation: conversationProps) => {
    if (user?.id !== undefined) {
      if (activeConversation.block_status == "blocker")
        toggleBlockStatus(activeConversation.id, user.id, activeConversation.user_id, false);
      else if (activeConversation.block_status == "blocked")
        toggleBlockStatus(activeConversation.id, user.id, activeConversation.user_id, true);
      else
        toggleBlockStatus(activeConversation.id, user.id, activeConversation.user_id, true);
    }
    setMenuState((prevState) => ({
      ...prevState,
      isOpen: false,
      activeIndex: null,
    }));
  };

  const handleClose = () => {
    if (selectedConversation !== null) {
      updateActiveConversation(-1);
      setSelectedConversation(null);
    }
    setMenuState((prevState) => ({
      ...prevState,
      isOpen: false,
      activeIndex: null,
    }));
  };


  const handleMarkAsRead = (id: number) => {
    if (ConversationList && menuState.activeIndex !== null) {
      markAsRead(id);
      setMenuState((prevState) => ({
        ...prevState,
        isOpen: false,
        activeIndex: null,
      }));
    }
  };

  const handleViewProfile = (name: string) => {
    if (ConversationList && menuState.activeIndex !== null) {
      navigate(`/profile/${name}`)
      setMenuState((prevState) => ({
        ...prevState,
        isOpen: false,
        activeIndex: null,
      }));
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearchActive(true);
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchQuery('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideMenu = menuRef.current && !menuRef.current.contains(target);
      const isOutsideButtons = !buttonRefs.current.some(
        (ref) => ref && ref.contains(target)
      );

      if (isOutsideMenu && isOutsideButtons) {
        setMenuState((prevState) => ({
          ...prevState,
          isOpen: false,
          activeIndex: null,
        }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      const isOutsideSearch = searchContainerRef.current && !searchContainerRef.current.contains(target);
      const isOutsideMainContainer = messageListRef.current && !messageListRef.current.contains(target);

      if (isOutsideSearch && isOutsideMainContainer) {
        setIsSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleConversationClick = useCallback((conversation: conversationProps | null) => {

    setSelectedConversation(conversation);
    setIsSearchActive(false);
    setSearchQuery('');
    setMenuState(prev => ({
      ...prev,
      isOpen: false,
      activeIndex: null,
    }));
  }, [ConversationList, selectedConversation]);

  const handleSearchItemClick = useCallback(async (friend: Friend) => {
    try {
      const newConversation = await apiCreateConversation(friend.id);

      if (newConversation && newConversation.id) {
        await refetch();
        setSelectedConversation(newConversation);
        setIsSearchActive(false);
        setSearchQuery('');
        setMenuState(prev => ({
          ...prev,
          isOpen: false,
          activeIndex: null,
        }));
      } else {
        console.error('Invalid conversation created');
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
 }, [user, refetch]);

  return (
    <div className={css.container}>
      <div ref={searchContainerRef} className={css.searchContainer}>
        <div className={`${css.searchBar} ${isSearchActive ? css.showIcon : ''}`}>
          {isSearchActive && (
            <ChevronLeft className={css.arrowIcon} onClick={handleSearchClose} />
          )}
          <Search
            className={`${css.searchIcon} ${isSearchActive ? css.searchInSide : ''}`}
          />
          <input
            type="text"
            placeholder={t('MessageList.placeholder')}
            value={searchQuery}
            onChange={handleSearchInput}
            onClick={() => setIsSearchActive(true)}
            className={`${css.searchInput} ${isSearchActive ? css.shrinkWidth : ''}`}
          />
        </div>
      </div>

      <div ref={messageListRef} className={css.messageList}>
        {isSearchActive ? (
          friendsLoading ? (
            friendsError ? (
              <div className={css.statusMessage}>
                <span className={css.error}>Failed to load friends.</span>
              </div>
            ) : (
              <div className={css.statusMessage}>
                <SearchFriendsSkeleton />
                <SearchFriendsSkeleton />
                <SearchFriendsSkeleton />
                <SearchFriendsSkeleton />
                <SearchFriendsSkeleton />
                <SearchFriendsSkeleton />
              </div>
            )
          ) : (
            <>
              {searchQuery && filteredFriends.length === 0 ? (
                <div className={css.statusMessage}>
                  <span className={css.notFoundUser} >{t('MessageList.noUserFound')} {searchQuery}</span>
                </div>
              ) : (
                filteredFriends.map((friend, index) => (
                  <SearchResultItem
                    key={index}
                    avatar={friend.profile.avatar}
                    name={friend.username}
                    onClick={() => handleSearchItemClick(friend)}
                  />
                ))
              )}
            </>
          )
        ) : (
          conversationsLoading ? (
            conversationsError ? (
              <div className={css.statusMessage}>
                <span className={css.error}>Failed to load conversations.</span>
              </div>
            ) : (
              <div className={css.statusMessage}>
                <ConversationSkeleton />
                <ConversationSkeleton />
                <ConversationSkeleton />
                <ConversationSkeleton />
                <ConversationSkeleton />
                <ConversationSkeleton />
              </div>
            )
          ) : (
              <>
                  {ConversationList?.length === 0
                    ? (
                    <div className={css.statusMessage}>
                      <span className={css.notFoundConversation}>{t('MessageList.noConversationFound')}</span>
                    </div>
                  ) : (
                    ConversationList?.map((conversation, index) => (
                      <MessageItem
                        key={index}
                        conversation={conversation}
                        isSelected={selectedConversation?.id === conversation.id}
                        onClick={() => handleConversationClick(conversation)}
                        onMoreClick={(e) => handleMoreClick(e, index)}
                        showMoreIcon={true}
                        isActive={menuState.activeIndex === index}
                        ref={(el) => (buttonRefs.current[index] = el)}
                      />
                    ))
                  )}
              </>
          )
        )}
      </div>


        {menuState.isOpen && menuState.position  && ConversationList && menuState.activeIndex !== null && (
          <div
            ref={menuRef}
            className={css.menu}
            style={{
              top: `${menuState.position.top}px`,
              left: `${menuState.position.left}px`,
            }}
          >
            <div
              className={css.menuItem}
              onClick={() => handleMarkAsRead(ConversationList[menuState.activeIndex!].id)}>
              <CheckCheck /> <span>{t('MessageList.menu.markAsRead')}</span>
            </div>
            <div className={css.menuItem} onClick={handleClose}>
              <CircleX /> <span>{t('MessageList.menu.closeChat')}</span>
            </div>
            <hr />
            <div
              className={css.menuItem}
              onClick={() => handleViewProfile(ConversationList[menuState.activeIndex!].name)}
            >
              <User /> <span>{t('MessageList.menu.viewProfile')}</span>
            </div>
            <div
              className={css.menuItem}
              onClick={() => handleBlock(ConversationList[menuState.activeIndex!])}
            >
              <Ban />
              <span>
                {t(ConversationList[menuState.activeIndex!].block_status === "blocker"
                  ? 'MessageList.menu.unblock'
                  : 'MessageList.menu.block')}
              </span>
            </div>
          </div>
        )}
      </div>
  );
};

export default MessageList;