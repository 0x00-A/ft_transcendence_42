import { useGetData } from '@/api/apiHooks';
import { API_GET_LEADER_BOARD_URL } from '@/api/apiConfig';
import { Trophy, Medal, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LeaderBoard } from '@/types/apiTypes';
import styles from './Leaderboard.module.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

const Leaderboard = () => {
  const {
    data: leaderboardData,
    isLoading,
    error,
  } = useGetData<LeaderBoard[]>(API_GET_LEADER_BOARD_URL);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className={styles.trophy} />;
      case 2:
        return <Medal className={styles.silverMedal} />;
      case 3:
        return <Medal className={styles.bronzeMedal} />;
      default:
        return <span className={styles.rank}>{rank}</span>;
    }
  };

  const renderTopRanks = () => {
    if (!leaderboardData || leaderboardData.length === 0) return null;

    if (leaderboardData.length === 1) {
      const first = leaderboardData[0];
      return (
        <div className={styles.podium}>
          <div className={styles.podiumPlace} style={{ gridColumn: '2' }}>
            <div className={`${styles.podiumAvatar} ${styles.firstPlaceAvatar}`} 
                 onClick={() => navigate(`/profile/${first.username}`)}>
              <img src={first.avatar} alt={first.username} />
            </div>
            <Trophy className={styles.trophy} />
            <span className={styles.podiumUsername} 
                  onClick={() => navigate(`/profile/${first.username}`)}>
              {first.username}
            </span>
            <span className={styles.podiumScore}>{first.score.toLocaleString()} pts</span>
            <div className={styles.soloMessage}>{t('onlyPlayers')}</div>
          </div>
        </div>
      );
    }

    if (leaderboardData.length === 2) {
      const [first, second] = leaderboardData;
      return (
        <div className={styles.podium}>
          <div className={styles.podiumPlace}>
            <div className={`${styles.podiumAvatar} ${styles.secondPlace}`} 
                 onClick={() => navigate(`/profile/${second.username}`)}>
              <img src={second.avatar} alt={second.username} />
            </div>
            <Medal className={styles.silverMedal} />
            <span className={styles.podiumUsername} 
                  onClick={() => navigate(`/profile/${second.username}`)}>
              {second.username}
            </span>
            <span className={styles.podiumScore}>{second.score.toLocaleString()} pts</span>
          </div>

          <div className={`${styles.podiumPlace} ${styles.firstPlace}`}>
            <div className={`${styles.podiumAvatar} ${styles.firstPlaceAvatar}`} 
                 onClick={() => navigate(`/profile/${first.username}`)}>
              <img src={first.avatar} alt={first.username} />
            </div>
            <Trophy className={styles.trophy} />
            <span className={styles.podiumUsername} 
                  onClick={() => navigate(`/profile/${first.username}`)}>
              {first.username}
            </span>
            <span className={styles.podiumScore}>{first.score.toLocaleString()} pts</span>
          </div>

          <div className={styles.emptyPodium}>
            <div className={styles.waitingMessage}>{t('WaitingPlayers')}</div>
          </div>
        </div>
      );
    }

    const [first, second, third] = leaderboardData;
    return (
      <div className={styles.podium}>
        <div className={styles.podiumPlace}>
          <div className={`${styles.podiumAvatar} ${styles.secondPlace}`} 
               onClick={() => navigate(`/profile/${second.username}`)}>
            <img src={second.avatar} alt={second.username} />
          </div>
          <Medal className={styles.silverMedal} />
          <span className={styles.podiumUsername} 
                onClick={() => navigate(`/profile/${second.username}`)}>
            {second.username}
          </span>
          <span className={styles.podiumScore}>{second.score.toLocaleString()} pts</span>
        </div>

        <div className={`${styles.podiumPlace} ${styles.firstPlace}`}>
          <div className={`${styles.podiumAvatar} ${styles.firstPlaceAvatar}`} 
               onClick={() => navigate(`/profile/${first.username}`)}>
            <img src={first.avatar} alt={first.username} />
          </div>
          <Trophy className={styles.trophy} />
          <span className={styles.podiumUsername} 
                onClick={() => navigate(`/profile/${first.username}`)}>
            {first.username}
          </span>
          <span className={styles.podiumScore}>{first.score.toLocaleString()} pts</span>
        </div>

        <div className={styles.podiumPlace}>
          <div className={`${styles.podiumAvatar} ${styles.thirdPlace}`} 
               onClick={() => navigate(`/profile/${third.username}`)}>
            <img src={third.avatar} alt={third.username} />
          </div>
          <Medal className={styles.bronzeMedal} />
          <span className={styles.podiumUsername} 
                onClick={() => navigate(`/profile/${third.username}`)}>
            {third.username}
          </span>
          <span className={styles.podiumScore}>{third.score.toLocaleString()} pts</span>
        </div>
      </div>
    );
  };

  const renderSkeletonRows = () => {
    return Array(8).fill(0).map((_, i) => (
      <div key={i} className={styles.skeleton}>
        <div className={styles.skeletonItem} />
        <div className={styles.playerCell}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonItem} style={{ flex: 1 }} />
        </div>
        <div className={styles.skeletonItem} />
        <div className={styles.skeletonItem} />
        <div className={styles.skeletonItem} />
      </div>
    ));
  };

  return (
    <div className={styles.container}>
      {renderTopRanks()}

      {/* Only show table if there are 3 or more users */}
      {leaderboardData && leaderboardData.length > 3 && (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={styles.tableHeaderCell}>
              {t('dashboard.Leaderboard.tableHeaders.rank')}
            </div>
            <div className={styles.tableHeaderCell}>
              {t('dashboard.Leaderboard.tableHeaders.name')}
            </div>
            <div className={`${styles.tableHeaderCell} ${styles.centered}`}>
              {t('dashboard.Leaderboard.tableHeaders.games')}
            </div>
            <div className={`${styles.tableHeaderCell} ${styles.centered}`}>
              {t('dashboard.Leaderboard.tableHeaders.winRate')}
            </div>
            <div className={`${styles.tableHeaderCell} ${styles.centered}`}>
              {t('dashboard.Leaderboard.tableHeaders.score')}
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              {error.message}
            </div>
          )}

          {isLoading ? (
            renderSkeletonRows()
          ) : (
            <div className={styles.tablesRows}>
              {leaderboardData.slice(3).map((player: LeaderBoard) => (
                <div
                  key={player.rank}
                  onClick={() => navigate(`/profile/${player.username}`)}
                  className={`${styles.tableRow} ${player.username === user?.username ? styles.myRank : ''}`}
                >
                  <div className={styles.rankCell}>
                    {getRankBadge(player.rank)}
                  </div>
                  <div className={styles.playerCell}>
                    <img
                      src={player.avatar}
                      alt={player.username}
                      className={styles.avatar}
                    />
                    <span className={styles.username}>
                      {player.username}
                    </span>
                  </div>
                  <div className={styles.centered}>
                    {player.played_games}
                  </div>
                  <div className={styles.centered}>
                    {Number.isInteger(player.win_rate)
                      ? player.win_rate
                      : player.win_rate.toFixed(1)}%
                  </div>
                  {player.score.toLocaleString() === '0' ? (
                    <div className={styles.scoreDown}>
                      {player.score.toLocaleString()}
                      <TrendingDown className={styles.scoreIconDown} />
                    </div>
                  ) : (
                    <div className={styles.scoreUp}>
                      {player.score.toLocaleString()}
                      <TrendingUp className={styles.scoreIcon} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;