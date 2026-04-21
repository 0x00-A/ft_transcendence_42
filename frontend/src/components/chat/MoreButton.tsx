import { forwardRef } from 'react';
import css from './MoreButton.module.css';

interface MoreButtonProps {
  onClick: () => void;
}

const MoreButton = forwardRef<HTMLDivElement, MoreButtonProps>(
  ({ onClick }, ref) => {
    return (
      <div className={css.moreButton} onClick={onClick} ref={ref}>
        <img src="/icons/chat/more.svg" alt="Options" />
      </div>
    );
  }
);

export default MoreButton;
