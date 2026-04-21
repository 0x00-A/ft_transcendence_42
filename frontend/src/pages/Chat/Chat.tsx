import css from './Chat.module.css';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useRef } from 'react';
import ChatHeader from '../../components/chat/ChatHeader';
import MessageList from '../../components/chat/MessageList';
import OptionsButton from '../../components/chat/OptionsButton';
import NoChatSelected from '../../components/chat/NoChatSelected';
import SideInfoChat from '../../components/chat/SideInfoChat';
import ChatContent from '@/components/chat/ChatContent';
import { TypingProvider } from '@/contexts/TypingContext';
import { useUser } from '@/contexts/UserContext';
import { WebSocketChatProvider } from '@/contexts/WebSocketChatProvider';
import { useSelectedConversation } from '@/contexts/SelectedConversationContext';


const Chat = () => {
  const { isLoggedIn } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const sidebarLeftRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const { selectedConversation } = useSelectedConversation();



  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };


  if (!isLoggedIn) {
    return <Navigate to="/signup" />;
  }

  return (
    <TypingProvider>
    <WebSocketChatProvider userId={user?.id || 0}>
      <main className={css.CenterContainer}>
        <div className={`${css.container} ${isExpanded ? css.expanded : ''}`}>
          <div className={css.sidebarLeft} ref={sidebarLeftRef}>
            <OptionsButton />
            <MessageList />
          </div>
          <div className={css.chatBody}>
            {selectedConversation ? (
              <>
                <ChatHeader
                  toggleSidebar={toggleSidebar}
                  />
                <ChatContent
                  key={selectedConversation.id}
                />
              </>
            ) : (
              <NoChatSelected />
            )}
          </div>
          {selectedConversation && !isExpanded && (
            <div className={css.sidebarRight}>
              <SideInfoChat
              />
            </div>
          )}
        </div>
      </main>
    </WebSocketChatProvider>
    </TypingProvider>
  );
};

export default Chat;
