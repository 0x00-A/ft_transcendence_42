// Styles
import css from './ProfileHeader.module.css'

import { useUser } from '@/contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { UserPen } from 'lucide-react';

const profileHeader = ({setEditProfile}: {setEditProfile:React.Dispatch<React.SetStateAction<boolean>>}) => {

  const { user: currentUser, isLoading } = useUser();
  const { t } = useTranslation();

  const translateBadgeName = (badgeName: string): string => {
    switch (badgeName) {
      case 'Bronze':
        return t('Profile.profileHeader.badge.Bronze');
      case 'Silver':
        return t('Profile.profileHeader.badge.Silver');
      case 'Gold':
        return t('Profile.profileHeader.badge.Gold');
      case 'Platinum':
        return t('Profile.profileHeader.badge.Platinum');
      case 'Diamond':
        return t('Profile.profileHeader.badge.Diamond');
      case 'Ft-Pong':
        return t('Profile.profileHeader.badge.Ft-Pong');
      default:
        return badgeName;
    }
  };

  return (
    <div className={css.profileHeaderContainer}>
      <div className={css.profileBackground}>
        <div className={css.friendState}>
          <button className={css.editProfileBtn} onClick={() => setEditProfile(true)}>
            <UserPen color='#F8C25C'/>
            <span>{t('Profile.profileHeader.EditProfileButton')}</span>
          </button>
        </div>
      </div>
      { isLoading ?
      <div className="w-[150px] h-[200px] absolute left-1/2 top-[45%] transform -translate-x-1/2 text-center rounded-lg animate-pulse flex flex-col items-center">
      <div className="w-[150px] h-[150px] relative">
        <div className="w-full h-full rounded-[25px] bg-gray-700"></div>
        {/* <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-[50px] h-[15px] bg-gray-700 rounded-md"></div> */}
      </div>
      <div className="w-[100px] h-[20px] bg-gray-700 rounded-md mt-4"></div>
    </div>:
      <div className={css.profileCard}>
        <div className={css.avatarContainer}>
          <img src={currentUser?.profile?.avatar} alt="" className={css.profileAvatar}/>
          <span className={css.profileLevel}>{currentUser?.profile?.level || 0}</span>
        </div>
        <h2>{currentUser?.username}</h2>
      </div>}
      <div className={css.profileStats}>
        <div className={css.leftStats}>
          <div className={css.totalGames}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <span className={css.statValue}>{currentUser?.profile?.stats?.games_played || 0}</span>}
            <span className={css.statLabel}>{t('Profile.profileHeader.profileStats.games')}</span>
          </div>
          <div className={css.wins}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <span className={css.statValue}>{currentUser?.profile?.stats?.wins || 0}</span>}
            <span className={css.statLabel}>{t('Profile.profileHeader.profileStats.wins')}</span>
          </div>
          <div className={css.loses}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <span className={css.statValue}>{currentUser?.profile?.stats?.losses || 0}</span>}
            <span className={css.statLabel}>{t('Profile.profileHeader.profileStats.loses')}</span>
          </div>
        </div>
        <div className={css.leftStats}>
          <div className={css.badge}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <img src={currentUser?.profile?.badge?.icon} alt="" className={css.badgeIcon}/>}
            <span className={css.statLabel}>{translateBadgeName(currentUser?.profile?.badge?.name || '')}</span>
          </div>
          <div className={css.score}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <span className={css.statValue}>{currentUser?.profile?.score || 0}</span>}
            <span className={css.statLabel}>{t('Profile.profileHeader.profileStats.score')}</span>
          </div>
          <div className={css.rank}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <span className={css.statValue}>{currentUser?.profile?.rank || 0}</span>}
            <span className={css.statLabel}>{t('Profile.profileHeader.profileStats.rank')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default profileHeader

//<Skeleton count={1} height={100} width={100} className='bg-gray-800 mb-4 animate-pulse'/>