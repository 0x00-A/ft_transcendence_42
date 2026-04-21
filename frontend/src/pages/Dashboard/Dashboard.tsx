import css from './Dashboard.module.css';
import Welcome from '../../components/Dashboard/Welcome';
import CompetitiveOverview from '../../components/Dashboard/CompetitiveOverview';
// import Achievements from '../../components/Achievements';
import Leaderboard from '../../components/Dashboard/Leaderboard';
import FriendsList from '../../components/Dashboard/FriendsList';
import LastMatch from '../../components/Dashboard/LastMatch';
import LineChartComponent from '@/components/Dashboard/LineChartComponent';
import { useUser } from '@/contexts/UserContext';
import SkeletonBox from './SkeletonBox';

const Dashboard = () => {

  const  {user: currentUser, isLoading} = useUser();

  if (isLoading) return (
    <main className={css.container}>
      <div className={css.heroSection}>
        <SkeletonBox
          className={`${css.welcome} flex  flex-col`}
          title={false}
          header={false}
          rows={0}
        />
        <SkeletonBox
          className={css.competitiveOverview}
          title={false}
          rows={12}
        />
      </div>
      <div className={css.mainContent}>
        <SkeletonBox
          className={css.leaderboard}
          title={false}
          rows={12}
        />
        <SkeletonBox
          className={css.LineChart}
          title={false}
          rows={12}
        />
      </div>
      <div className={css.lastSection}>
        <SkeletonBox
          className={css.lastMatchContainer}
          title={false}
          rows={12}
        />
        <SkeletonBox
          className={css.friendsContainer}
          title={false}
          rows={12}
        />
      </div>
    </main>

  );


  return (
    <main className={css.container}>
      <div className={css.heroSection}>
        <div className={css.welcome}><Welcome /></div>
        <div className={css.competitiveOverview}><CompetitiveOverview /></div>
      </div>
      <div className={css.mainContent}>
        <div className={css.leaderboard}><Leaderboard /></div>
        <div className={css.LineChart}> <LineChartComponent /> </div>
      </div>
      <div className={css.lastSection}>
        <div className={css.lastMatchContainer}><LastMatch username={currentUser?.username}/></div>
        <div className={css.friendsContainer}><FriendsList username={currentUser?.username}/></div>
      </div>
    </main>
  );
};

export default Dashboard;