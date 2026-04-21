import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import css from './Friends.module.css';
import Sidebar from '../../components/Friends/Sidebar';
import AddFriend from '../../components/Friends/AddFriend';
import BlockedList from '../../components/Friends/blockedUsers';
import SentRequests from '../../components/Friends/sentRequests';
import FriendRequests from '../../components/Friends/FriendRequests';
import OnlineFriends from '../../components/Friends/OnlineFriends';
import AllFriends from '../../components/Friends/AllFriends';
// import { useWebSocket } from '@/contexts/WebSocketContext';

type ViewType = 'add' | 'all' | 'online' | 'requests' | 'sent' | 'blocked';

const Friends: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('add');
  // const { markRequestAsRead, hasNewRequests } = useWebSocket();


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get('view') as ViewType;
    if (view) {
      setCurrentView(view);
    }

    // if (hasNewRequests) {
    //   markRequestAsRead();
    // }
  }, [location.search, isLoggedIn]);

  if (!isLoggedIn) {
    return <Navigate to="/signup" />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'add':
        return <AddFriend />;
      case 'blocked':
        return <BlockedList />;
      case 'sent':
        return <SentRequests />;
      case 'requests':
        return <FriendRequests />;
      case 'online':
        return <OnlineFriends />;
      case 'all':
        return <AllFriends />;
      default:
        return <AddFriend />;
    }
  };

  return (
    <main className={css.CenterContainer}>
      <div className={css.container}>
        <div className={css.content}>{renderContent()}</div>
        <Sidebar setView={setCurrentView} currentView={currentView} />
      </div>
    </main>
  );
};

export default Friends;
