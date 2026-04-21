import { PropsWithChildren } from 'react';
import css from './GameButton.module.css';

const GameButton = ({
  onClick,
  children,
  className = '',
}: PropsWithChildren<{ onClick: any; className?: string }>) => {
  return (
    <button
      className={`${!className ? css.button : className}`}
      onClick={onClick}
    >
      {/* <span className={css.buttonKey}>(r)&nbsp;</span> */}
      {children}
    </button>
  );
};

export default GameButton;
