import { useGetData } from '@/api/apiHooks';
import { API_GET_DASHBOARD_LEADERBOARD_URL } from '@/api/apiConfig';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Trophy, Medal, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './Leaderboard.module.css';
import { LeaderBoard } from '@/types/apiTypes';

const Leaderboard = () => {
  const {
    data: leaderboardData,
    isLoading,
    error,
  } = useGetData<LeaderBoard[]>(API_GET_DASHBOARD_LEADERBOARD_URL);
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const renderSkeletonRows = () => {
    return Array(5).fill(0).map((_, i) => (
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
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {t('dashboard.Leaderboard.headerTitle')}
        </h3>
        <button
          onClick={() => navigate('/leaderboard')}
          className={styles.viewAllButton}
        >
          {t('dashboard.Leaderboard.viewAll')}
          <ArrowRight size={16} />
        </button>
      </div>

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
        ) : leaderboardData  && leaderboardData.length === 0 ? (
          <div className={styles.noData}>
            {t('dashboard.Leaderboard.noDataFound')}
          </div>
        ) : (
            leaderboardData &&
            leaderboardData.length > 0 &&
            leaderboardData.map((player: LeaderBoard, index: number) => (
            <div
              key={index}
              onClick={() => navigate(`/profile/${player.username}`)}
              className={styles.tableRow}
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
              {player.score.toLocaleString() == '0'
                  ? <div className={styles.scoreDown}>
                      {player.score.toLocaleString()}
                      <TrendingDown className={styles.scoreIconDown} />
                    </div>
                  : <div className={styles.scoreUp}>
                      {player.score.toLocaleString()}
                      <TrendingUp className={styles.scoreIcon} />
                    </div>
              }
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;