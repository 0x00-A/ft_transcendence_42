import css from './ArcadeLoader.module.css';

const ArcadeLoader = ({ className = '' }: { className?: string }) => {
  return <div className={`${css.loader} ${className}`}></div>;
};

export default ArcadeLoader;
