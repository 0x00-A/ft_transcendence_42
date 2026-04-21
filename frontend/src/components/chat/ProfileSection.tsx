import css from './ProfileSection.module.css';
import { useSelectedConversation } from '@/contexts/SelectedConversationContext';
import { useTranslation } from 'react-i18next';



const ProfileSection = () => {
  const { selectedConversation } = useSelectedConversation();
  const { t } = useTranslation();


  return (
    <div className={css.profileSection}>
      <img className={css.avatar} src={selectedConversation?.avatar} alt="avatar" />
      <h2 className={css.name}>{selectedConversation?.name}</h2>
      {
        (selectedConversation?.status
        ? <p className={css.online} >{t('chatHeader.activeNow')}</p>
        : <p className={css.offline}>{t('chatHeader.lastSeen') + selectedConversation?.last_seen}</p>)
      }
    </div>
  );
};

export default ProfileSection;
