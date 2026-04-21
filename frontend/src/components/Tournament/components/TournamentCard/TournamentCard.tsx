import styles from './TournamentCard.module.css';

interface TournamentCardProps {
  title: string;
  organizer: string;
  type: string;
  playersCount?: number;
  createdDate: string;
}

const TournamentCard = ({
  title,
  organizer,
  type,
  playersCount = 4,
  createdDate,
}: TournamentCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>{title}</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <i className={`${styles.icon} ${styles.organizerIcon}`}></i>
            <span>{organizer}</span>
          </div>
          <div className={styles.infoItem}>
            <i className={`${styles.icon} ${styles.trophyIcon}`}></i>
            <span>{type}</span>
          </div>
          <div className={styles.infoItem}>
            <i className={`${styles.icon} ${styles.playersIcon}`}></i>
            <span>{playersCount}</span>
          </div>
          <div className={styles.infoItem}>
            <i className={`${styles.icon} ${styles.dateIcon}`}></i>
            <span>Created {createdDate}</span>
          </div>
        </div>
        <button className={styles.viewButton}>VIEW TOURNAMENT</button>
      </div>
    </div>
  );
};

export default TournamentCard;
