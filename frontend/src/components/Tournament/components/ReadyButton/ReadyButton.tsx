import React, { useState, useCallback } from 'react';
import styles from './ReadyButton.module.css';
import { useTranslation } from 'react-i18next';

interface Props {
    isReady:boolean;
    setIsReady:React.Dispatch<React.SetStateAction<boolean>>
    handleReady: () => void;
    handleCancel: () => void;
}
const ReadyButton = ({isReady, setIsReady,   handleReady, handleCancel,}: Props) => {
//   const [isReady, setIsReady] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleReadyToggle = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    if (!isReady) handleReady();
    if (isReady) handleCancel();

    setTimeout(() => {
      setIsReady(prev => !prev);
      setIsLoading(false);
    }, 1500);
  }, [isLoading]);

  return (
    <div className={styles.container}>
      <button
        onClick={handleReadyToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isLoading}
        className={`
          ${styles.button}
          ${isReady ? styles.ready : styles.notReady}
          ${isHovered && !isLoading ? styles.hovered : ''}
          ${isLoading ? styles.loading : ''}
        `}
      >
        {isReady && (
          <div className={`${styles.pulseEffect} ${styles.pulseEffectReady}`} />
        )}

        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
          </div>
        )}

        {isHovered && !isLoading && <div className={styles.sparkleEffect} />}

        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ?
            (isReady ? t('game.remoteTournament.sparkleEffect.cancel') : t('game.remoteTournament.sparkleEffect.loading')) :
            (isReady ? t('game.remoteTournament.sparkleEffect.ready') : t('game.remoteTournament.sparkleEffect.readyUp'))
          }

          {isReady && !isLoading && (
            <svg
              className={styles.checkIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
};

export default ReadyButton;
