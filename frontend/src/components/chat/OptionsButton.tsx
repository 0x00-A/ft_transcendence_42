import css from './OptionsButton.module.css';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const OptionsButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();



  return (
    <div className={css.optionsButtonContainer}>
      <h2 className={css.title}>{t('optionsButton')}</h2>
      <div className={css.sideButtons}>
        <div className={css.newMessage} onClick={() => navigate(`/profile`)}>
          <div className={css.btnLabel}>{t('showMyProfile')}</div>
          <User size={30}/>
        </div>
      </div>
    </div>
  );
};

export default OptionsButton;
