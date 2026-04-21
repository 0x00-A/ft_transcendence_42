import { PropsWithChildren } from 'react';
import css from './BodyContainer.module.css';

const BodyContainer = ({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) => {
  return <main className={`${className} ${css.container}`}>{children}</main>;
};

export default BodyContainer;
