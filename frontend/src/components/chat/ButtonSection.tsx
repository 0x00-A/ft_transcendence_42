import React, { useEffect, useState } from 'react';
import css from './ButtonSection.module.css';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-toastify';
import { useSelectedConversation } from '@/contexts/SelectedConversationContext';
import { useNavigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';

// import { FaUserCircle, FaSearch, FaUserPlus } from 'react-icons/fa';

// import { Button } from '@/components/ui/button';

const CooldownButton = ({
  onClick,
  cooldownTime = 10000,
  className = '',
}: {
  onClick: () => void;
  className?: string;
  cooldownTime?: number;
}) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);


  const handleClick = () => {
    if (!isDisabled) {
      onClick?.();
      setIsDisabled(true);
      setTimeLeft(cooldownTime / 1000);
    }
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (isDisabled && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isDisabled) {
      setIsDisabled(false);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isDisabled, timeLeft]);

  return (
    <button disabled={isDisabled} className={`relative ${className}`}>
      <img
        onClick={handleClick}
        className={`${isDisabled ? css.iconDisabled : css.icon}`}
        src="/icons/chat/Invite.svg"
        alt="I"
      />
      <p className="cursor-text">Invite</p>
      {isDisabled && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-gray-500">
          {timeLeft}s
        </span>
      )}
    </button>
  );
};

const ButtonSection: React.FC = () => {
  const { user } = useUser();
  const { sendMessage } = useWebSocket();
  const { selectedConversation } = useSelectedConversation();
  const navigate = useNavigate();


  const handleSendInvite = () => {
    sendMessage({
      event: 'game_invite',
      from: user?.username,
      to: 'user2',
    });
  };
  return (
    <div className={css.buttonSection}>
      <div className={css.button} >
        <div
          onClick={() => navigate(`/profile/${selectedConversation?.name}`)}
        >
          <img className={css.icon} src="/icons/chat/Profile.svg" alt="I" />
        </div>
        <p>Profile</p>
      </div>
      {/* <div className={css.button}>
        <img className={css.icon} src="/icons/chat/Search.svg" alt="I" />
        <p>Search</p>
      </div> */}
      {/* <div className={css.button}>
        <img className={css.icon} src="/icons/chat/Invite.svg" alt="I" />
        <p>Invite</p>
      </div> */}
      <CooldownButton onClick={handleSendInvite} />
    </div>
  );
};

export default ButtonSection;
