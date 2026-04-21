import React from 'react';
import css from './NoFriendRequests.module.css';
import { UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const NoFriendRequests: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={css.container}>
      <UserCog size={80} color='#6b7280' />
      <h2 className={css.title}>{t('friendRequests.noRequests')}</h2>
      <p className={css.description}>
        {t('friendRequests.description')}
      </p>
    </div>
  );
};

export default NoFriendRequests;