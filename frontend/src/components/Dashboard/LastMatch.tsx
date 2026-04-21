// LastMatch.tsx
import { useGetData } from '@/api/apiHooks';
import css from './LastMatch.module.css';
import { API_GET_LAST_GAMES_URL } from '@/api/apiConfig';
import { LastGames } from '@/types/apiTypes';
import LastGamesSkeleton from '@/skeltons/profile/LastGamesSkeleton';
import { Gamepad, Trophy, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/helpers';

const LastMatch = ({username}:{username:string | undefined}) => {
    const {data: matchesData, isLoading, error} = useGetData<LastGames[]>(`${API_GET_LAST_GAMES_URL}/${username}`);
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className={css.container}>
            <h3 className={css.title}>{t('dashboard.LastMatch.headerTitle')}</h3>
            
            {error && <div className={css.error}>{error.message}</div>}
            
            {isLoading ? (
                <LastGamesSkeleton />
            ) : (
                <div className={css.gamesList}>
                    { matchesData?.length == 0 && <div className={css.noGames}>
                            <span className={css.noHistoryTitle}>{t('dashboard.LastMatch.noGames.message')}</span>
                            <button className={css.playBtn} onClick={() => navigate('/play')}>
                                <Gamepad color='#F8C25C'/>
                                <span>{t('dashboard.LastMatch.noGames.playNow')}</span>
                            </button>
                    </div>}
                    {matchesData?.map((match: LastGames) => (
                        <div 
                            key={match.id} 
                            className={`${css.gameItem} ${match.result === 'Win' ? css.win : css.lose}`}
                            onClick={() => navigate(`/profile/${match.opponent_username}`)}
                        >
                            <div className={css.userInfo}>
                                <img 
                                    src={match.opponent_avatar} 
                                    alt={match.opponent_username} 
                                    className={css.avatar}
                                />
                                <div className={css.userDetails}>
                                    <span className={css.username}>{match.opponent_username}</span>
                                    <span className={css.timestamp}>
                                        {formatDate(new Date(match.start_time), t('lang'))}
                                    </span>
                                </div>
                            </div>

                            <div className={css.gameStats}>
                                <div className={css.score}>
                                    <span className={match.result === 'Win' ? css.winScore : css.loseScore}>
                                        {match.my_score}:{match.opponent_score}
                                    </span>
                                    {match.result === 'Win' ? (
                                        <Trophy className={css.trophyIcon} size={20} />
                                    ) : (
                                        <X className={css.loseIcon} size={20} />
                                    )}
                                </div>
                                <div className={css.points}>
                                    <span>+{match.xp_gained}</span> {t('dashboard.LastMatch.pts')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LastMatch;