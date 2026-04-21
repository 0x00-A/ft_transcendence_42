import css from './NoChatSelected.module.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NoChatSelected = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleAddFriendsClick = () => {
    navigate('/friends?view=add');
  };

  return (
    <div className={css.noChatSelected}>
      <img
        src="/icons/chat/Selected.svg"
        alt="selected"
        className={css.noChatIcon}
      />
      <h2>{t('noChatSelected.title')}</h2>
      <p>{t('noChatSelected.description1')}</p>
      <p>{t('noChatSelected.description2')}</p>
      <button onClick={handleAddFriendsClick} className={css.addFriendsButton}>
        {t('noChatSelected.addFriendButton')}
      </button>
    </div>
  );
};

export default NoChatSelected;
