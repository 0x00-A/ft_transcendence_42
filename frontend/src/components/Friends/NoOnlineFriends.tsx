import React from 'react';
import css from './NoOnlineFriends.module.css';
import { CircleDot } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const NoOnlineFriends: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={css.container}>
      <CircleDot size={80} color='#6b7280' />
      <h2 className={css.title}>{t('onlineFriends.noRequests')}</h2>
      <p className={css.description}>{t('onlineFriends.description')}</p>
    </div>
  );
};

export default NoOnlineFriends;