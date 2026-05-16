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
    const subject = encodeURIComponent("Co-purchase Invitation");

    window.location.href = `mailto:${email}?subject=${subject}`;

    onSend(email);
    onClose();
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
          <div className={styles.title}>Invite to Co-purchase</div>
          <div className={styles.subtitle}>
            Invite other labs or colleagues to split the cost of this item.
          </div>
        </div>

        <input
          className={styles.input}
          type="email"
          value={email}
          placeholder="colleague@ucsd.edu"
          onChange={e => setEmail(e.target.value)}
        />

        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.btnPrimary} onClick={handleSend}>
            Send Invites
          </button>
        </div>
      </div>
    </div>
  );
}
