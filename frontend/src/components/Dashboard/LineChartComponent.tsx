import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Clock } from 'lucide-react';
import css from './LineChartComponent.module.css';
import { useUser } from '@/contexts/UserContext';
import { Stats } from '@/types/apiTypes';
import { useTranslation } from 'react-i18next';

const LineChartComponent = () => {
  const {user} = useUser()
  const { t } = useTranslation();


  const get_duration = (stats: Stats | undefined, day: string) => {
    if (!stats) return 0;
    const duration = stats?.performanceData?.find((entry) => entry[day] !== undefined)?.[day] || 0;
    return duration.toFixed(2);
  }

  const totalPlayTime = user?.profile?.stats?.performanceData?.reduce((total, entry) => {
    const duration = Object.values(entry)[0]; // Get the first (and only) value in each entry
    return total + duration;
  }, 0);

  let averageDailyTime;
  if (user?.profile?.stats?.performanceData?.length && totalPlayTime)
    averageDailyTime = totalPlayTime / user?.profile?.stats?.performanceData?.length;
  else
    averageDailyTime = 0;

  const performanceData = [
    { day: t('dashboard.LineChartComponent.days.Mon'), duration: get_duration(user?.profile.stats, 'Mon') },
    { day: t('dashboard.LineChartComponent.days.Tue'), duration: get_duration(user?.profile.stats, 'Tue') },
    { day: t('dashboard.LineChartComponent.days.Wed'), duration: get_duration(user?.profile.stats, 'Wed') },
    { day: t('dashboard.LineChartComponent.days.Thu'), duration: get_duration(user?.profile.stats, 'Thu') },
    { day: t('dashboard.LineChartComponent.days.Fri'), duration: get_duration(user?.profile.stats, 'Fri') },
    { day: t('dashboard.LineChartComponent.days.Sat'), duration: get_duration(user?.profile.stats, 'Sat') },
    { day: t('dashboard.LineChartComponent.days.Sun'), duration: get_duration(user?.profile.stats, 'Sun') },
  ];
  return (
    <div className={css.container}>
      <h3 className={css.title}>{t('dashboard.LineChartComponent.title')}</h3>

      <div className={css.statsContainer}>
        {/* <div className={css.statCard}>
          <div className={css.statTitle}>
            <Trophy className={css.longestSessionIcon} size={20} />
            <span className={css.statText}>Longest Session</span>
          </div>
          <p className={css.statValue}>4 hrs</p>
        </div> */}

        <div className={css.statCard}>
          <div className={css.statTitle}>
            <Target className={css.totalPlayIcon} size={20} />
            <span className={css.statText}>{t('dashboard.LineChartComponent.totalPlayTime')}</span>
          </div>
          <p className={css.statValue}>{totalPlayTime?.toFixed(2) || 0} {t('dashboard.LineChartComponent.tooltipHours')}</p>
        </div>

        <div className={css.statCard}>
          <div className={css.statTitle}>
            <Clock className={css.avgDailyIcon} size={20} />
            <span className={css.statText}>{t('dashboard.LineChartComponent.avgDailyTime')}</span>
          </div>
          <p className={css.statValue}>{averageDailyTime.toFixed(2)} {t('dashboard.LineChartComponent.tooltipHours')}</p>
        </div>
      </div>

      <div className={css.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
              label={{
                angle: -90,
                position: "insideLeft",
                fill: "#94a3b8"
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#283245',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.75rem'
              }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value) => `${value} hrs`}
            />
            <Line
              type="monotone"
              dataKey="duration"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{ fill: '#60a5fa', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartComponent;