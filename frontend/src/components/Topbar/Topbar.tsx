import css from './Topbar.module.css';
import { useNavigate } from 'react-router-dom';
import NotificationsDropdown from './NotificationsDropdown';
import { useUser } from '@/contexts/UserContext';
import SearchUsers from './SearchUsers';


const Topbar = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className={css.topbar}>
      <div className={css.topbarInfo}>
        <SearchUsers />
        <NotificationsDropdown />
        <div 
          className={css.userAccount}
          onClick={() => navigate('/profile')}
        >
          <p className={css.userName}>{user?.username}</p>
          <img
            className={css.userIcon}
            src={user?.profile.avatar} 
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
