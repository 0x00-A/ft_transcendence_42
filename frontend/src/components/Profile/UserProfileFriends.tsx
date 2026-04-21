// React
import { useState } from 'react';
// Styles
import css from './ProfileFriends.module.css';
// API
import { useGetData } from "@/api/apiHooks";
// Components
import { useNavigate } from 'react-router-dom';
// Types
import { MutualFriend, Friends } from '@/types/apiTypes';
import { API_GET_FRIENDS_URL, API_GET_MUTUAL_FRIENDS_URL } from '@/api/apiConfig';
import FriendSkeleton from '../Friends/FriendSkeleton';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';


const UserProfileFriends = ({username}:{username:string}) => {

    const [isBtnActive, setBtnActive] = useState(true);
    const { data: friendsData, isLoading, error } = useGetData<Friends[]>(`${API_GET_FRIENDS_URL}/${username}`);
    const { data: mutualFriends, isLoading : mutualIsLoading, error: mutualError} = useGetData<MutualFriend>(`${API_GET_MUTUAL_FRIENDS_URL}/${username}`);
    const navigate = useNavigate();
    const { t } = useTranslation();



  return (
    <div className={css.profileFriendsContainer}>
        <div className={css.friendsHeader}>
            <div className={css.friendsTitle}>
                <Users size={30} color="#f8c25c" />
                <h3>{t('Profile.FriendsOther.title')}</h3>
            </div>
            {/* <button className={css.viewMore} onClick={() => navigate('/friends')}>View more</button> */}
        </div>
        <div className={css.friendsList}>
            <div className={css.buttonsGrp}>
                <button onClick={() => setBtnActive(true)}
                    className={`${css.button} ${isBtnActive  ? css.buttonActive : ''}`}>
                    {t('Profile.FriendsOther.mutualFriends')} {mutualFriends?.mutual_friends_count}
                </button>
                <button onClick={() => setBtnActive(false)}
                    className={`${css.button} ${!isBtnActive ? css.buttonActive : ''}`}>
                    {t('Profile.FriendsOther.allFriends')}
                </button>
            </div>
            { isBtnActive ? (mutualIsLoading ? <FriendSkeleton /> :
                <div className={css.friendList}>
                    { mutualError && <p>{mutualError.message}</p> }
                    { mutualFriends && mutualFriends.mutual_friends_count == 0 && <span className={css.noCurrentFriend}>{t('Profile.FriendsOther.noMutualFriends')}</span> }
                    { mutualFriends && mutualFriends.mutual_friends_count > 0 && mutualFriends.mutual_friends?.map((friend: Friends) => (
                        <div className={css.friendItem} key={friend.id}>
                            <img src={friend.profile.avatar} alt={friend.username} className={css.avatar} />
                            <div className={css.friendInfo}>
                                <span className={css.name} onClick={() => navigate(`/profile/${friend.username}`)}>{friend.username}</span>
                                <span className={css.level}>{t('Profile.FriendsOther.Level')} {friend.profile.level}</span>
                            </div>
                        </div>
                    ))}
                </div> )
            : ( isLoading ? <FriendSkeleton /> :
                <div className={css.friendList}>
                    { error && <p>{error.message}</p> }
                    { friendsData && friendsData?.length == 0 && <span className={css.noCurrentFriend}>{t('Profile.FriendsOther.playerLonely')}</span> }
                    { friendsData && friendsData?.length > 0 && friendsData?.map((friend: Friends) => (
                        <div className={css.friendItem} key={friend.id}>
                            <img src={friend.profile.avatar} alt={friend.username} className={css.avatar} />
                            <div className={css.friendInfo}>
                                <span className={css.name} onClick={() => navigate(`/profile/${friend.username}`)}>{friend.username}</span>
                                <span className={css.level}>{t('Profile.FriendsOther.Level')} {friend.profile.level}</span>
                            </div>
                        </div>
                    ))}
                </div>)
            }
        </div>
    </div>
  )
}

export default UserProfileFriends




// { friendsData && friendsData?.length > 0 &&  friendsData?.map((friend, index) => (

//                     <div className={css.friendItem} key={index}>
//                         <img src={friend.profile.avatar} alt={friend.username} className={css.avatar} />
//                         <div className={css.friendInfo}>
//                             <span className={css.name}>{friend.username}</span>
//                             <span className={css.level}>Level: {friend.profile.level}</span>
//                         </div>
//                         <div className={`${css.status} ${friend.profile.is_online ? css.online : css.offline}`}>
//                             <span className={css.statusIndicator}></span>
//                                 {friend.profile.is_online ? 'Online' : 'Offline'}
//                         </div>
//                     </div>
//                 ))}


        //
        //
        //
        //
        //     { friendsData?.length > 0 && friendsData.map((friend, index) => (
        //       <div className={css.friendItem} key={index}>
        //         <img src={friend.profile.avatar} alt={friend.username} className={css.avatar} />
        //         <div className={css.friendInfo}>
        //           <span className={css.name}>{friend.username}</span>
        //         </div>
        //       <div/>
        //     )}

        // </div>