import React from 'react';
import css from './WinnerOverlay.module.css';

const WinnerCard = ({ winner }: { winner: string }) => {
  return (
    <div className={css.winnerCard}>
      <div className={`${css.gradientLine} ${css.Gold}`}></div>
      <div className={css.body}>
        <div className={css.rank}>
          <img
            className={css.icon}
            src="/icon-medal-first.svg"
            alt="Icon medal first"
          />
          <p>{winner} 🎉🎉🎉</p>
        </div>
      </div>
    </div>
  );
};

const WinnerOverlay = ({
  winner,
  setShowWinner,
}: {
  winner: string;
  setShowWinner: (value: React.SetStateAction<boolean>) => void;
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains(css.overlay)) {
      setShowWinner(false);
    }
  };

  return (
    <div className={css.overlay} onClick={handleOverlayClick}>
      <div className={css.overlayContent}>
        <WinnerCard winner={winner} />
      </div>
    </div>
  );
};

export default WinnerOverlay;
