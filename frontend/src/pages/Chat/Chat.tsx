import css from './Chat.module.css';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useRef } from 'react';
import ChatHeader from '../../components/chat/ChatHeader';
import MessageList from '../../components/chat/MessageList';
import OptionsButton from '../../components/chat/OptionsButton';
import NoChatSelected from '../../components/chat/NoChatSelected';
import SideInfoChat from '../../components/chat/SideInfoChat';
import messages from './messages';
import ChatContent from '@/components/chat/ChatContent';

interface conversationProps {
  user1_id: number;
  id: number;
  avatar: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  status: boolean;
  blocked: boolean;
}


const Chat = () => {
  const { isLoggedIn } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedConversation, setSelectedConversation] =
    useState<conversationProps | null>(null);
  const sidebarLeftRef = useRef<HTMLDivElement | null>(null);
  const [customSticker, setCustomSticker] = useState(
    '<img src="/icons/chat/like.svg" alt="love" />'
  );

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };


  if (!isLoggedIn) {
    return <Navigate to="/signup" />;
  }


  console.log("rander chat >>>>>>>>>>>>>>>>>>>>>>>>>")

  const handleStickerChange = (newSticker: string) => {
    setCustomSticker(newSticker);
  };

  const handleBlockUser = (userName: string) => {
    console.log('nameblock: ', userName);
    const updatedMessages = messages.map((msg) =>
      msg.name === userName ? { ...msg, blocked: !msg.blocked } : msg
    );
    console.log(updatedMessages);
  };

  return (
    <main className={css.CenterContainer}>
      <div className={`${css.container} ${isExpanded ? css.expanded : ''}`}>
        <div className={css.sidebarLeft} ref={sidebarLeftRef}>
          <OptionsButton />
          <MessageList
            onSelectMessage={setSelectedConversation}
            onBlockUser={handleBlockUser}
          />
        </div>
        <div className={css.chatBody}>
          {selectedConversation ? (
            <>
              <ChatHeader
                toggleSidebar={toggleSidebar}
                onSelectedConversation={selectedConversation}
                />
              <ChatContent
                onSelectedConversation={selectedConversation}
                customSticker={customSticker}
                isBlocked={selectedConversation.blocked}
                onUnblock={() => handleBlockUser(selectedConversation.name)}
              />
            </>
          ) : (
            <NoChatSelected />
          )}
        </div>
        {selectedConversation && !isExpanded && (
          <div className={css.sidebarRight}>
            <SideInfoChat
              onSelectedConversation={selectedConversation}
              onEmojiChange={handleStickerChange}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default Chat;
