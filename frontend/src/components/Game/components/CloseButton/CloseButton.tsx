import React from 'react';
import styles from './CloseButton.module.css'; // Assuming you're using CSS modules

interface CloseButtonProps {
  onClose: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClose }) => {
  return (
    <button className={styles.closeButton} onClick={onClose}>
      &times; {/* This is the "×" symbol for a close button */}
    </button>
  );
};

export default CloseButton;
