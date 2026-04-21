import { useTranslation } from 'react-i18next';
import css from './CreateTournamentModal.module.css';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const CreateTournamentModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) => {
  const [tournamentName, setTournamentName] = useState('');
  const { t } = useTranslation();
  const inputRef = useRef<null | HTMLInputElement>(null);
  const modalRef = useRef<null | HTMLDivElement>(null);


  useEffect(() => {
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && event.target instanceof Node && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTournamentName(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && document.activeElement === inputRef.current) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (tournamentName.trim()) {
      onSubmit(tournamentName);
      setTournamentName('');
      onClose();
    } else {
      toast.warn(t('game.remoteTournament.CreateTournamentModal.AlertMessage'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={css.modalOverlay}>
      <div ref={modalRef}  className={css.modalContent}>
        <label className={css.label}>{t('game.remoteTournament.CreateTournamentModal.Label')}</label>
        <input
          ref={inputRef}
          type="text"
          placeholder={t('game.remoteTournament.CreateTournamentModal.InputPlaceholder')}
          value={tournamentName}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={15}
        />
        <div className={css.buttonWrapper}>
          <button className={css.submitButton} onClick={handleSubmit}>{t('game.remoteTournament.CreateTournamentModal.SubmitButton')}</button>
          <button onClick={onClose}>{t('game.remoteTournament.CreateTournamentModal.CancelButton')}</button>
        </div>
      </div>
    </div>
  );
};

export default CreateTournamentModal;
