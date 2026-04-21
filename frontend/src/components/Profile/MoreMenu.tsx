import { useEffect, useRef, useState } from 'react';
import css from './MoreMenu.module.css';
import { EllipsisVertical, MessageSquareMore, ShieldMinus, Swords } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OtherUser } from '@/types/apiTypes';
import { useNavigate } from 'react-router-dom';
import { apiBlockRequest } from '@/api/friendApi';
import { toast } from 'react-toastify';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface GetUserData {
  user: OtherUser;
  refetch: () => void;
}

interface UsersProfileHeaderProps {
  userData: GetUserData;
}

const MoreMenu: React.FC<UsersProfileHeaderProps> = ({ userData }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, refetch } = userData;
  const [isInviteDisabled, setIsInviteDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { sendMessage } = useWebSocket();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleMessageClick = (username: string) => {
    navigate('/chat', { state: { selectedFriend: username } });
    setIsMenuOpen(false);
  };

  const blockRequest = async (username: string) => {
    try {
      await apiBlockRequest(username);
      setIsMenuOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || t('errorsFriends.block'));
    }
  };

  const handleSendInvite = (username: string) => {
    if (isInviteDisabled) return;
    sendMessage({
      event: 'game_invite',
      from: user?.username,
      to: username,
    });

    setIsMenuOpen(false);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className={css.moreMenu}>
      <div ref={buttonRef} onClick={toggleMenu} className={css.moreButton}>
        <EllipsisVertical color="#f8c35c" />
      </div>

      {isMenuOpen && (
        <div ref={menuRef} className={css.menu}>
          <div className={css.menuItem} onClick={() => handleMessageClick(user.username)}>
            <MessageSquareMore color="#f8c35c" className={css.menuIcon} />
            <span>{t('Profile.profileHeader.buttons.messageBtn')}</span>
          </div>
          <div className={css.menuItem} onClick={() => blockRequest(user.username)}>
            <ShieldMinus color="#f8c35c" className={css.menuIcon} />
            <span>{t('Profile.profileHeader.buttons.blockBtn')}</span>
          </div>
          <div
            className={`${css.menuItem} ${isInviteDisabled ? css.disabled : ''}`}
            onClick={() => handleSendInvite(user.username)}
          >
            <Swords color="#f8c35c" className={`${css.menuIcon}`} />
            {isInviteDisabled ? (
              <span className={css.cooldownTimer}>{timeLeft}s</span>
            ) : (
              <span>{t('Profile.profileHeader.buttons.challengeBtn')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreMenu;
