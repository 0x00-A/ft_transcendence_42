import React from 'react';
import css from './NoFound.module.css';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const NoFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={css.container}>
      <Users size={80} color='#6b7280'/>
      <h2 className={css.title}>{t('allFriends.noRequests')}</h2>
      <p className={css.description}>{t('allFriends.description')}</p>
    </div>
  );
};

export default NoFound;