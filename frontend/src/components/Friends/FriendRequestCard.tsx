import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import styles from './FriendRequestCard.module.css';
import { useTranslation } from 'react-i18next';

interface FriendRequestCardProps {
  from?: string;
  onAccept: () => void;
  onReject: () => void;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  from,
  onAccept,
  onReject,
}) => {
  const [seconds, setSeconds] = useState(10);
  const { t } = useTranslation();


  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReject]);

  const handleAccept = () => {
    onAccept();
  };

  const handleReject = () => {
    onReject();
  };

  return (
    <div className={`${styles.cardContainer}`}>
      <Card className="bg-transparent border-none p-0 m-0 flex flex-row items-center gap-2">
        <CardHeader className={`${styles.cardHeader} 'flex-shrink-0 px-5 m-0'`}>
          <div className={styles.iconContainer}>
            {/* Use an appropriate icon here */}
            <Check className="w-12 h-12 text-white" />
          </div>
        </CardHeader>

        <CardContent className={`${styles.cardContent} 'flex flex-col items-center p-0 m-0 px-5'`}>
          <div className="">
            <p className={styles.playerName}>{t('toast.fromRequest')} {from}</p>
          </div>
        </CardContent>

        <CardFooter className={`${styles.cardFooter}`}>
          <span
            className={`${styles.timerContainer} ${seconds <= 5 ? styles.timerRed : styles.timerGray}`}
          >
            {seconds}
          </span>
          <div className={styles.buttonsWrapper}>
            <button className={styles.acceptButton} onClick={handleAccept}>
              <Check className="w-5 h-5" />
            </button>
            <button className={styles.declineButton} onClick={handleReject}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FriendRequestCard;
