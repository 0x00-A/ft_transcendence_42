// FlexContainer.jsx
import { PropsWithChildren } from 'react';
import css from './FlexContainer.module.css';

const FlexContainer = ({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <main className={`${css.flexContainer} ${className}`}>{children}</main>
  );
};

export default FlexContainer;
