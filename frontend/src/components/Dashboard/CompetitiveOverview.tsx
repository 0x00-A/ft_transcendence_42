import { useEffect } from 'react';
import { TrendingUp, Crown, Award } from 'lucide-react';
import styles from './CompetitiveOverview.module.css';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from 'react-i18next';

const CompetitiveOverview = () => {
  // const [activeGameMode, setActiveGameMode] = useState('single');
  const { user, isLoading, refetch } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    refetch();
  }, []);

  const calculateWinRateOffset = (percentage: any) => {
    const circumference = 2 * Math.PI * 40;
    return circumference - (percentage / 100) * circumference;
  };

  return (
    <>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('dashboard.overview.title')}</h3>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          {isLoading ? (
            <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>
          ) : (
            <span className={styles.statValue}>
              {user?.profile.played_games}
            </span>
          )}
          <span className={styles.statLabel}>
            {t('dashboard.overview.fields.games')}
          </span>
        </div>
        <div className={styles.statCard}>
          {isLoading ? (
            <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>
          ) : (
            <span className={styles.statValue}>{user?.profile.score}</span>
          )}
          <span className={styles.statLabel}>
            {t('dashboard.overview.fields.score')}
          </span>
        </div>
      </div>
      <div className={styles.personalBests}>
        <div className={styles.bestCard}>
          <div className={styles.bestContent}>
            <div className={styles.bestInfo}>
              <Crown className={styles.bestIcon} />
              <span className={styles.bestLabel}>
                {t('dashboard.overview.fields.highestScore')}
              </span>
            </div>
            {isLoading ? (
              <span className="statValueSkeleton block w-[30px] h-[20px] bg-gray-500 rounded-md animate-pulse"></span>
            ) : (
              <span className={styles.bestValue}>
                {user?.profile.stats.highest_score || 0}
              </span>
            )}
          </div>
        </div>
        <div className={styles.bestCard}>
          <div className={styles.bestContent}>
            <div className={styles.bestInfo}>
              <TrendingUp className={styles.bestIcon} />
              <span className={styles.bestLabel}>
                {t('dashboard.overview.fields.longestStreak')}
              </span>
            </div>
            {isLoading ? (
              <span className="statValueSkeleton block w-[30px] h-[20px] bg-gray-500 rounded-md animate-pulse"></span>
            ) : (
              <span className={styles.bestValue}>
                {user?.profile.stats.win_streak}
              </span>
            )}
          </div>
        </div>
        <div className={styles.bestCard}>
          <div className={styles.bestContent}>
            <div className={styles.bestInfo}>
              <Award className={styles.bestIcon} />
              <span className={styles.bestLabel}>
                {t('dashboard.overview.fields.bestRank')}
              </span>
            </div>
            {isLoading ? (
              <span className="statValueSkeleton block w-[30px] h-[20px] bg-gray-500 rounded-md animate-pulse"></span>
            ) : (
              <span className={styles.bestValue}>
                #{user?.profile.stats.best_rank || user?.profile.rank}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Personal Bests Section */}
      {/* <div className={styles.personalBests}>
        {personalBests.map(({ label, value, Icon }, index) => (
          <div key={index} className={styles.bestCard}>
            <div className={styles.bestContent}>
              <div className={styles.bestInfo}>
                <Icon className={styles.bestIcon} />
                <span className={styles.bestLabel}>{label}</span>
              </div>
                <span className={styles.bestValue}>{value}</span>
            </div>
          </div>
        ))}
      </div> */}
      <div className={styles.bottomGrid}>
        <div className={styles.winRateContainer}>
          <svg className={styles.circleChart} viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className={styles.circleBackground}
            />
            {isLoading ? (
              <circle
                cx="50"
                cy="50"
                r="40"
                className="fill-none stroke-gray-500 stroke-[5px] animate-pulse"
                strokeDasharray={2 * Math.PI * 40}
              />
            ) : (
              <circle
                cx="50"
                cy="50"
                r="40"
                className={styles.circleProgress}
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={calculateWinRateOffset(
                  user?.profile.win_rate.toFixed(2)
                )}
              />
            )}
          </svg>
          <div className={styles.winRateContent}>
            <span className={styles.winRateLabel}>
              {t('dashboard.overview.fields.winRate')}
            </span>
            {isLoading ? (
              <span className="statValueSkeleton block w-[40px] h-[40px] bg-gray-500 rounded-md animate-pulse"></span>
            ) : (
              <span className={styles.winRateValue}>
                {Number.isInteger(user?.profile.win_rate)
                  ? user?.profile.win_rate
                  : user?.profile.win_rate.toFixed(2)}
                %
              </span>
            )}
          </div>
        </div>

        <div className={styles.winLoseContainer}>
          {isLoading ? (
            <span className="statValueSkeleton block w-[40px] h-[30px] bg-gray-500 rounded-md animate-pulse"></span>
          ) : (
            <div className={styles.winCard}>
              <span className={styles.resultNumber}>{user?.profile.wins} </span>
              <span className={styles.resultText}>
                {t('dashboard.overview.fields.wins')}
              </span>
            </div>
          )}
          {isLoading ? (
            <span className="statValueSkeleton block w-[40px] h-[30px] bg-gray-500 rounded-md animate-pulse"></span>
          ) : (
            <div className={styles.loseCard}>
              <span className={styles.resultNumber}>
                {user?.profile.losses}
              </span>
              <span className={styles.resultText}>
                {t('dashboard.overview.fields.loses')}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CompetitiveOverview;
