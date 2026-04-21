import React from 'react';
import css from './NoSentRequests.module.css';
import { UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NoSentRequests: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={css.container}>
      <UserX size={80} color='#6b7280' />
      <h2 className={css.title}>{t('sentRequests.noRequests')}</h2>
      <p className={css.description}>{t('sentRequests.description')}</p>
    </div>
  );
};

export default NoSentRequests;