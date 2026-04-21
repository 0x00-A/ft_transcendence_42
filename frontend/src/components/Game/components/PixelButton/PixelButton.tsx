import { PropsWithChildren } from 'react';
import css from './PixelButton.module.css';

const PixelButton = ({
  onClick,
  children,
}: PropsWithChildren<{ onClick: any }>) => {
  return (
    <div className={css.pixel} onClick={onClick}>
      <p>{children}</p>
    </div>
  );
};

export default PixelButton;
