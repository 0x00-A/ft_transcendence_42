import { useTranslation } from 'react-i18next';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal = ({ message, onConfirm, onCancel, show } :
  { message: string, onConfirm: ()=>void, onCancel: ()=>void, show: boolean }
) => {
  if (!show) return null;
  const { t } = useTranslation();

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalContent}>
          {/* <div className={styles.iconContainer}>
            <i className="bx bx-error text-3xl">&#9888;</i>
          </div> */}
          <div className={styles.textContainer}>
            {/* <p className={styles.title}>Warning!</p> */}
            <p className={styles.title}>{message}</p>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.confirmButton} onClick={onConfirm}>
              {t('ConfirmationModal.Confirm')}
            </button>
            <button className={styles.cancelButton} onClick={onCancel}>
              {t('ConfirmationModal.Cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
