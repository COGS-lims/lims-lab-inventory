import { useState } from "react";
import styles from "./CoPurchase.module.css";

interface InviteModalProps {
  onClose: () => void;
  onSend: (email: string) => void;
}

export default function CopurchaseLabInput({ onClose, onSend }: InviteModalProps) {
  
  return (
    <div className={styles.modal}>
      <button className={styles.closeBtn} aria-label="Close" onClick={onClose}>
        ×
      </button>

      <div className={styles.header}>
        <div className={styles.title}>Enter your lab</div>
        <div className={styles.subtitle}>
          Enter the name of your desired lab
        </div>
      </div>

      <input
        className={styles.input}
        placeholder="Dr. Xu"
      />

      <div className={styles.actions}>
        <button className={styles.btnPrimary}>
          Enter
        </button>
      </div>
    </div>
  );
}