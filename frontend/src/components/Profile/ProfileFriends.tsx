// React
import { useState } from 'react';
// Styles
import css from './ProfileFriends.module.css';
import { Users } from 'lucide-react';
import { HiOutlineUserAdd } from "react-icons/hi";
// API
import { useGetData } from "@/api/apiHooks";
import { API_GET_FRIENDS_URL } from '@/api/apiConfig';
// Components
import { useNavigate } from 'react-router-dom';
// Types
import { Friends } from '@/types/apiTypes';
import FriendSkeleton from '../Friends/FriendSkeleton';
import { useTranslation } from 'react-i18next';


const ProfileFriends = () => {

    const [isBtnActive, setBtnActive] = useState(true);
    const { data: friendsData, isLoading, error } = useGetData<Friends[]>(API_GET_FRIENDS_URL);
    const navigate = useNavigate();
    const onlineFriends = friendsData?.filter((friend: Friends) => friend.profile.is_online).slice(0, 5);
    const offlineFriends = friendsData?.filter((friend: Friends) => !friend.profile.is_online).slice(0, 5);
  const { t } = useTranslation();

  return (
    <div className={css.profileFriendsContainer}>
        <div className={css.friendsHeader}>
            <div className={css.friendsTitle}>
                <Users size={30} color='#f8c25c'/>
                <h3>{t('Profile.friends.title')}</h3>
            </div>
            <button className={css.viewMore} onClick={() => navigate('/friends')}>{t('Profile.friends.viewMore')}</button>
        </div>
        <div className={css.friendsList}>
            <div className={css.buttonsGrp}>
                <button onClick={() => setBtnActive(true)}
                    className={`${css.button} ${isBtnActive  ? css.buttonActive : ''}`}>
                    {t('Profile.friends.buttons.online')}
                </button>
                <button onClick={() => setBtnActive(false)}
                    className={`${css.button} ${!isBtnActive ? css.buttonActive : ''}`}>
                    {t('Profile.friends.buttons.offline')}
                </button>
            </div>
            { isLoading ? <> <FriendSkeleton /> <FriendSkeleton /> </>:
            <div className={css.friendList}>
                { error && <p>{error.message}</p> }
                { friendsData?.length == 0 && <div className={css.noFriends}>
                    <span>{t('Profile.friends.errors.noFriends')}</span>
                    <button className={css.addFriendsBtn} onClick={() => navigate('/friends')}>
                        <HiOutlineUserAdd size={"2.2rem"}/>
                        <span>{t('Profile.friends.addFriends.button')}</span>
                    </button>
                </div> }
                { isBtnActive && friendsData && friendsData?.length > 0 && onlineFriends?.length == 0 && <span className={css.noCurrentFriend}>{t('Profile.friends.errors.noOnlineFriends')}</span> }
                { !isBtnActive && friendsData && friendsData?.length > 0 && offlineFriends?.length == 0 && <span className={css.noCurrentFriend}>{t('Profile.friends.errors.noOfflineFriends')}</span> }
                { isBtnActive && onlineFriends && onlineFriends?.length > 0 && onlineFriends?.map((friend: Friends) => (
                    <div className={css.friendItem} key={friend.id}>
                         <img src={friend.profile.avatar} alt={friend.username} className={css.avatar} />
                         <div className={css.friendInfo}>
                             <span className={css.name} onClick={() => navigate(`/profile/${friend.username}`)}>{friend.username}</span>
                             <span className={css.level}>{t('Profile.friends.profile.level')} {friend.profile.level}</span>
                         </div>
                         <div className={`${css.status} ${css.online}`}>
                            <span className={css.statusIndicator}></span>
                            {t('Profile.friends.profile.status.online')}
                         </div>
                     </div>
                ))}
                { !isBtnActive &&  offlineFriends && offlineFriends?.length > 0 && offlineFriends?.map((friend:Friends) => (
                    <div className={css.friendItem} key={friend.id}>
                         <img src={friend.profile.avatar} alt={friend.username} className={css.avatar} />
                         <div className={css.friendInfo}>
                             <span className={css.name} onClick={() => navigate(`/profile/${friend.username}`)}>{friend.username}</span>
                             <span className={css.level}>{t('Profile.friends.profile.status.offline')} {friend.profile.level}</span>
                         </div>
                         <div className={`${css.status} ${css.offline}`}>
                            <span className={css.statusIndicator}></span>
                            {t('Profile.friends.profile.level')}
                         </div>
                     </div>
                ))}
            </div>}
        </div>
    </div>
  )
}

export default ProfileFriends