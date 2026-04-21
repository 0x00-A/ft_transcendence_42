import css from './SideInfoChat.module.css';
import ProfileSection from './ProfileSection';
import ButtonSection from './ButtonSection';
import SettingsSection from './SettingsSection';

const SideInfoChat = () => {

  return (
    <div className={css.sideInfoChat}>
      <ProfileSection/>
      <ButtonSection />
      <SettingsSection />
    </div>
  );
};

export default SideInfoChat;
