// React
// API
import { apiAcceptFriendRequest, apiCancelFriendRequest, apiSendFriendRequest } from '@/api/friendApi';
// Styles
import css from './ProfileHeader.module.css'
import { UserCheck, UserPlus, UserX, Users } from 'lucide-react';

import { toast } from 'react-toastify';
import { OtherUser } from '@/types/apiTypes';
import { useTranslation } from 'react-i18next';
import MoreMenu from './MoreMenu';

interface GetUserData {
  user: OtherUser;
  isLoading: boolean;
  refetch: () => void;
}

// interface UsersProfileHeaderProps {
//   getUserData: GetUserData;
// }

const UsersProfileHeader = ({getUserData}:{getUserData:GetUserData}) => {

    const {user, isLoading, refetch} = getUserData;
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

    const handleCancel = async () => {
      try {
        const message = await apiCancelFriendRequest(user.username);
        toast.success(message);
        refetch();
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    const sendFriendRequest = async () => {
    try {
      const message = await apiSendFriendRequest(user.username);
      toast.success(message);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const acceptFriendRequest = async () => {
    try {
      const message = await apiAcceptFriendRequest(user.username);
      toast.success(message);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };


  return (
    <div className={css.profileHeaderContainer}>
      <div className={css.profileBackground}>
          {isLoading ? <div className='h-10 w-44 bg-gray-700 animate-pulse flex-center'></div> :
            <div className={css.friendState}>
                {user?.friend_status === 'Friends' &&
                  <div className={css.friendStatBtn}>
                    <div className={css.btnLabel}>{t('Profile.profileHeader.buttons.friendsBtn')}</div>
                    <Users color='#f8c35c'/>
                  </div>
                }
                {user?.friend_status === 'Cancel' &&
                  <div className={css.friendStatBtn} onClick={handleCancel}>
                    <div className={css.btnLabel}>{t('Profile.profileHeader.buttons.cancelBtn')}</div>
                    <UserX color='#f8c35c'/>
                  </div>
                }
                {user?.friend_status === 'Accept' &&
                  <div className={css.friendStatBtn} onClick={acceptFriendRequest}>
                    <div className={css.btnLabel}>{t('Profile.profileHeader.buttons.acceptBtn')}</div>
                    <UserCheck color='#f8c35c'/>
                  </div>
                }
                {user?.friend_status === 'Add' &&
                  <div className={css.friendStatBtn} onClick={sendFriendRequest}>
                    <div className={css.btnLabel}>{t('Profile.profileHeader.buttons.addBtn')}</div>
                    <UserPlus color='#f8c35c'/>
                  </div>
                }
                <div className={css.moreBtn}>
                  <div className={css.btnLabelMore}>{t('Profile.profileHeader.buttons.moreBtn')}</div>
                    <MoreMenu userData={{user, refetch}}/>
                </div>
            </div>
          }
        </div>
      { isLoading ?
        <div className="w-[150px] h-[200px] absolute left-1/2 top-[45%] transform -translate-x-1/2 text-center rounded-lg animate-pulse flex flex-col items-center">
          <div className="w-[150px] h-[150px] relative">
            <div className="w-full h-full rounded-[25px] bg-gray-700"></div>
          </div>
          <div className="w-[100px] h-[20px] bg-gray-700 rounded-md mt-4"></div>
        </div>:
        <div className={css.profileCard}>
          <div className={css.avatarContainer}>
            <img src={user?.profile?.avatar} alt="" className={css.profileAvatar}/>
            <span className={css.profileLevel}>{user?.profile?.level || 0}</span>
          </div>
          <h2>{user?.username}</h2>
        </div> }
      <div className={css.profileStats}>
        <div className={css.leftStats}>
          <div className={css.totalGames}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <span className={css.statValue}>{user?.profile?.played_games || 0}</span>}
            <span className={css.statLabel}>{t('Profile.profileHeader.profileStats.games')}</span>
          </div>
          <div className={css.wins}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <span className={css.statValue}>{user?.profile?.wins || 0}</span>}
            <span className={css.statLabel}>{t('Profile.profileHeader.profileStats.wins')}</span>
          </div>
          <div className={css.loses}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <span className={css.statValue}>{user?.profile?.loses || 0}</span>}
            <span className={css.statLabel}>{t('Profile.profileHeader.profileStats.loses')}</span>
          </div>
        </div>
        <div className={css.leftStats}>
          <div className={css.badge}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <img src={user?.profile?.badge?.icon} alt="" className={css.badgeIcon}/>}
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[10px] bg-gray-500 rounded-md animate-pulse"></span>:
            <span className={css.statLabel}>{translateBadgeName(user?.profile?.badge?.name || '')}</span>}
          </div>
          <div className={css.score}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <span className={css.statValue}>{user?.profile?.score || 0}</span>}
            <span className={css.statLabel}>{t('Profile.profileHeader.profileStats.score')}</span>
          </div>
          <div className={css.rank}>
            { isLoading ? <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>:
            <span className={css.statValue}>{user?.profile?.rank || '?'}</span>}
            <span className={css.statLabel}>{t('Profile.profileHeader.profileStats.rank')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsersProfileHeader
