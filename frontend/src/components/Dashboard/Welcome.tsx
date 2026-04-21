import { useTranslation } from 'react-i18next';
import styles from './Welcome.module.css';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();


  return (
    <div className={styles.content}>
      <div>
        <h2 className={styles.title}>{t('welcome.title')}</h2>
        <p className={styles.description}>
          {t('welcome.description')}
        </p>
      </div>
      <button className={styles.playButton} onClick={() => navigate(`/play`)}>{t('welcome.playButton')}</button>
    </div>
  );
};

export default Welcome;
