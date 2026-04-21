import { useState } from 'react';
import { Users, X } from 'lucide-react';
import styles from './InviteButton.module.css';
import { useGetData } from '@/api/apiHooks';
import { API_GET_FRIENDS_URL, API_GET_TOURNAMENTS } from '@/api/apiConfig';
import { Friends, Tournament } from '@/types/apiTypes';
import { useUser } from '@/contexts/UserContext';
import RefreshButton from '@/pages/Game/RefreshButton';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function FriendsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-gray-800 rounded-lg animate-pulse"
        >
          <div className="flex items-center gap-3">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 bg-gray-700 rounded-full" />

            {/* Name and status skeleton */}
            <div className="space-y-2">
              <div className="w-24 h-4 bg-gray-700 rounded" />
              <div className="w-16 h-3 bg-gray-700 rounded" />
            </div>
          </div>

          {/* Button skeleton */}
          <div className="w-16 h-8 bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
}

export function InviteButton({sendMessage, tournamentId} : {tournamentId: number; sendMessage: (message: Record<string, any>) => void}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  const { data: friendsData, isLoading, error, refetch } = useGetData<Friends[]>(`${API_GET_FRIENDS_URL}`);
  const { data: tournament, refetch: refetchTournament } = useGetData<Tournament>(`${API_GET_TOURNAMENTS}/${tournamentId}`);

  const {user} = useUser();

  const handleInvite = (username: string) => {
    // Handle invite logic here
    sendMessage({
      event: "tournament_invite",
      from: user?.username,
      to: username,
      tournamentId: tournamentId,
    })
    toast.info(t('game.remoteTournament.InviteFriendsButton.toasts.InviteSent'), {toastId: username});
  };

  const userInTournament = (id: number) => {
    return tournament?.players.includes(id);
  }

  return (
    <>
      <button
        className={styles.inviteButton}
        onClick={() => setIsModalOpen(true)}
      >
        <Users size={20} />
        {t('game.remoteTournament.InviteFriendsButton.InviteFriends')}
      </button>

      {isModalOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsModalOpen(false)} />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modelTitle}>
                <h2 className={styles.modalTitle}>{t('game.remoteTournament.InviteFriendsButton.InviteFriends')}</h2>
                <RefreshButton onClick={() => {refetch(); refetchTournament()}} isLoading={isLoading}/>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            {!isLoading && !error ?
              <div className={styles.friendsList}>
                {friendsData?.map((friend) => (
                  !userInTournament(friend.id) && <div key={friend.id} className={styles.friend}>
                    <div className={styles.friendInfo}>
                      <img
                        src={
                          friend.profile.avatar
                        }
                        alt={friend.username}
                        className={styles.avatar}
                      />
                      <div>
                        <div>{friend.username}</div>
                        <div style={{ color: friend.profile.is_online  ? '#10B981' : '#6B7280' }}>
                          {friend.profile.is_online ? t('Profile.friends.buttons.online') : t('Profile.friends.buttons.offline')}
                        </div>
                      </div>
                    </div>
                    {friend.profile.is_online && <button
                      className={styles.inviteButton}
                      onClick={() => handleInvite(friend.username)}
                    >
                    {t('game.remoteTournament.InviteFriendsButton.InviteButton')}
                    </button>}
                  </div>
                ))}
              </div> :
              <FriendsSkeleton/>}
          </div>
        </>
      )}
    </>
  );
}