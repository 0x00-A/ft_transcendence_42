import React, { useState, useEffect } from 'react';
import { Check, X, GamepadIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import styles from './GameInviteCard.module.css';
import { useTranslation } from 'react-i18next';

interface GameInviteCardProps {
  from?: string;
  //   gameName?: string;
  //   gameMode?: string;
  duration?: number;
  onAccept: () => void;
  onReject: () => void;
  isTournamentInvite?: boolean;
}

const GameInviteCard: React.FC<GameInviteCardProps> = ({
  from = 'Player123',
  //   gameName = 'Rocket League',
  //   gameMode = 'Competitive 2v2',
  duration = 10,
  onAccept,
  onReject,
  isTournamentInvite = false,
}) => {
  const [seconds, setSeconds] = useState(duration);
  const { t } = useTranslation();

  // const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            // setVisible(false);
            onReject();
          }, 1000);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReject]);

  const handleAccept = () => {
    // setVisible(false);
    onAccept();
  };

  const handleReject = () => {
    // setVisible(false);
    onReject();
  };

  // if (!visible) {
  //   return null;
  // }

  return (
    <div className={`${styles.cardContainer}`}>
      <Card className="bg-transparent border-none p-0 m-0 flex flex-row items-center gap-2">
        <CardHeader
          className={`${styles.cardHeader} 'flex-shrink-0  px-5 m-0 '`}
        >
          <div className={styles.iconContainer}>
            <GamepadIcon className="w-12 h-12 text-white" />
          </div>
        </CardHeader>

        <CardContent
          className={`${styles.cardContent} 'flex flex-col items-center p-0 m-0 px-5'`}
        >
          {/* <CardTitle className={styles.cardTitle}>Game Invitation</CardTitle> */}
          <div className="">
            {!isTournamentInvite ?
            <p className={styles.playerName}>{t('toast.gameInvite')} {from}</p>
            :
            <p className={styles.playerName}>{t('toast.TournamentInvite')} {from}</p>
            }
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

export default GameInviteCard;
