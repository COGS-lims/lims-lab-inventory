import { useEffect, useState } from "react";
import styles from "./Copurchase.module.css";

interface InviteModalProps {
  onClose: () => void;
  onSend: (email: string) => void;
}

export default function CopurchaseInvite({
  onClose,
  onSend,
}: InviteModalProps) {
  const [email, setEmail] = useState("");

  const handleSend = () => {
    onSend(email);
    // onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.modal} onClick={event => event.stopPropagation()}>
        <button
          className={styles.closeBtn}
          aria-label="Close"
          onClick={onClose}
        >
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
          type="email"
          value={email}
          placeholder="Dr. Xu"
          onChange={e => setEmail(e.target.value)}
        />
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleSend}>
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
