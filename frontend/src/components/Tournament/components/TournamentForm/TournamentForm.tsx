import React, { useEffect, useRef, useState } from 'react';
import styles from './TournamentForm.module.css';
import { useTranslation } from 'react-i18next';

interface FormProps {
  onSubmit: (players: string[]) => void;
  players: string[];
  setPlayers: (players: string[]) => void;
}

const TournamentForm = ({ onSubmit, players, setPlayers }: FormProps) => {
  const [playerName, setPlayerName] = useState<string>('');
  const { t } = useTranslation();
  const [error, setError] = useState<string>(''); // To store error messages
  const inputRef = useRef<null | HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [playerName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && document.activeElement === inputRef.current) {
      handleAddPlayer();
    }
  };

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      setError(t('game.localTournament.TournamentForm.ErrorMessages.EmptyPlayer'));
      return;
    }

    if (players.includes(playerName)) {
      setError(t('game.localTournament.TournamentForm.ErrorMessages.DuplicatePlayer'));
      return;
    }

    if (players.length < 4) {
      setPlayers([...players, playerName.trim()]);
      setPlayerName('');
      setError('');
    }
  };

  const handleRemovePlayer = (index: number) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
  };

  const handleStartTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (players.length === 4) onSubmit(players);
  };

  return (
    <div className={styles.container}>
      <h2 className={`${styles.heading} ${styles.label}`}>{t('game.localTournament.TournamentForm.Title')}</h2>

      <input
        disabled={players.length === 4}
        ref={inputRef}
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('game.localTournament.TournamentForm.InputPlaceholder')}
        maxLength={15}
        className={styles.input}
      />

      <button
        onClick={handleAddPlayer}
        disabled={!playerName || players.length >= 4}
        className={styles.addButton}
      >
        {t('game.localTournament.TournamentForm.AddPlayerButton')}
      </button>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <ul className={styles.playerList}>
        {players.map((player, index) => (
          <li key={index} className={styles.playerItem}>
            {player}
            <button
              onClick={() => handleRemovePlayer(index)}
              className={styles.removeButton}
            >
              &#x2716;
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={handleStartTournament}
        disabled={players.length !== 4}
        className={`${styles.startButton} ${
          players.length === 4 ? styles.enabled : styles.disabled
        }`}
      >
        {t('game.localTournament.TournamentForm.StartTournamentButton')}
      </button>
    </div>
  );
};

export default TournamentForm;
