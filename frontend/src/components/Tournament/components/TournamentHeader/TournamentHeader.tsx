import { PropsWithChildren } from 'react';
import css from './TournamentHeader.module.css';
import { useTranslation } from 'react-i18next';

function Round({ children }: PropsWithChildren) {
  return (
    <div className={css.round}>
      <p className={css.roundLabel}>{children}</p>
    </div>
  );
}

const TournamentHeader = () => {
  const { t } = useTranslation();

  return (
    <div className={css.rounds}>
      <Round>{t('game.localTournament.TournamentHeader.Round1')}</Round>
      {/* <Round>Semifinals</Round> */}
      <Round>{t('game.localTournament.TournamentHeader.Finals')}</Round>
    </div>
  );
};

export default TournamentHeader;
