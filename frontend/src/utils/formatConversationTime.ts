import moment from 'moment';
import { useTranslation } from 'react-i18next';


export const formatTime = (timestamp: string | number | Date) => {
  const now = moment();
  const time = moment(timestamp);
  const { t } = useTranslation();


  const diffSeconds = now.diff(time, 'seconds');
  if (diffSeconds < 60) return t('timeDifference.justNow');

  const diffMinutes = now.diff(time, 'minutes');
  if (diffMinutes < 60) {
    return diffMinutes === 1 
      ? t('timeDifference.minute') 
      : t('timeDifference.minutes', { count: diffMinutes });
  }

  const diffHours = now.diff(time, 'hours');
  if (diffHours < 24) {
    return diffHours === 1 
      ? t('timeDifference.hour') 
      : t('timeDifference.hours', { count: diffHours });
  }

  const diffDays = now.diff(time, 'days');
  if (diffDays < 7) {
    return diffDays === 1 
      ? t('timeDifference.day') 
      : t('timeDifference.days', { count: diffDays });
  }

  const diffWeeks = now.diff(time, 'weeks');
  if (diffWeeks < 52) {
    return diffWeeks === 1 
      ? t('timeDifference.week') 
      : t('timeDifference.weeks', { count: diffWeeks });
  }

  const diffYears = now.diff(time, 'years');
  return diffYears === 1 
    ? t('timeDifference.year') 
    : t('timeDifference.years', { count: diffYears });
};
