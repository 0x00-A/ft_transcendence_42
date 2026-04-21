import { MouseEventHandler, useState } from 'react';
import css from './GameMode.module.css';

const GameMode = ({
  title,
  desc,
  className = '',
  onSelect,
}: {
  title: string;
  desc: string;
  className?: string;
  onSelect: MouseEventHandler<HTMLLIElement>;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <li
      onClick={onSelect}
      className={`${css.mode} ${className}`}
      onMouseEnter={() => setIsHovered((isHovered: boolean) => !isHovered)}
      onMouseLeave={() => setIsHovered((isHovered: boolean) => !isHovered)}
    >
      <p className={css.title}>{title}</p>
      {isHovered && <p className={css.info}>{desc}</p>}
    </li>
  );
};

export default GameMode;
