import { PropsWithChildren } from 'react';
import css from './BracketComponents.module.css';

function IconLabelButtons({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className={`${css.playButton}`}>
      Go
    </button>
  );
}

const Match = ({
  matchNumber,
  player1,
  player2,
  winner,
  activeMatch,
  onClick,
}: {
  matchNumber: Number;
  player1: string;
  player2: string;
  winner: Number;
  activeMatch: Number;
  onClick: () => void;
}) => {
  return (
    <div className={css.matchup}>
      <div className={css.participants}>
        <div className={`${css.participant} ${winner === 1 ? css.winner : ''}`}>
          <span>{player1}</span>
        </div>
        <div className={`${css.participant} ${winner === 2 ? css.winner : ''}`}>
          <span>{player2}</span>
        </div>
      </div>
      {matchNumber === activeMatch && <IconLabelButtons onClick={onClick} />}
      <div></div>
    </div>
  );
};

function Round({ children }: PropsWithChildren) {
  return (
    <div className={css.round}>
      <p className={css.roundLabel}>{children}</p>
    </div>
  );
}

const Connector = () => {
  return (
    <div className={css.connector}>
      <div className={css.merger}></div>
      <div className={css.line}></div>
    </div>
  );
};

export { Match, Round, Connector };
