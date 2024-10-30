import { IoMdNotificationsOutline } from 'react-icons/io';

import css from './Topbar.module.css';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {

  const navigate = useNavigate();

  return (
    <div className={css.topbar}>
      <button type={css.button} className={css.iconButton}>
        <IoMdNotificationsOutline size={32} color="#F8F3E3" />
        <span className={css.counter}>99</span>
      </button>
      <div className={css.userAccount}  onClick={() => navigate('/profile')}>
        <p className={css.userName}>Mad Max</p>
        <img className={css.userIcon} src="https://picsum.photos/200" alt="" />
      </div>
    </div>
  );
};

export default Topbar;
