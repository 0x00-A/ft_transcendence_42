import { PropsWithChildren } from 'react';
import css from './FlexHeader.module.css';

const FlexHeader = ({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) => {
  return <header className={`${css.header} ${className}`}>{children}</header>;
};

export default FlexHeader;
