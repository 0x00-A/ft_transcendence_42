import { useTranslation } from 'react-i18next';

export const getTranslatedStatus = (status: string) => {
  const { t } = useTranslation();

  switch (status) {
    case 'waiting':
      return t('game.joinedTournaments.statusGame.waiting');
    case 'started':
      return t('game.joinedTournaments.statusGame.started');
    case 'ended':
      return t('game.joinedTournaments.statusGame.ended');
    case 'aborted':
      return t('game.joinedTournaments.statusGame.aborted');
    default:
      return t('game.joinedTournaments.statusGame.unknown');
  }
};
