import styles from './Loading.module.css';

const Loading = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.bouncingBall}></div>
      <p className={styles.loadingText}>Loading data...</p>
    </div>
  );
};

export default Loading;
