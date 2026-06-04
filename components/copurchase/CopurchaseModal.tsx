"use client";
import { useEffect, useRef, useState, KeyboardEvent } from "react";
import styles from "./copurchase-modal.module.css";

interface CopurchaseModalProps {
  isOpen: boolean;
  listingName: string;
  contactEmail: string;
  onClose: () => void;
}

function getFocusableElements(container: HTMLElement) {
  const selectors = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ];
  return Array.from(
    container.querySelectorAll<HTMLElement>(selectors.join(","))
  );
}

export function CopurchaseModal({
  isOpen,
  listingName,
  contactEmail,
  onClose,
}: CopurchaseModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener(
      "keydown",
      handleKeyDown as unknown as EventListener
    );

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener(
        "keydown",
        handleKeyDown as unknown as EventListener
      );
      lastFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function addEmail() {
    const val = inputValue.trim().toLowerCase();
    if (!val || !val.includes("@") || emails.includes(val)) {
      inputRef.current?.focus();
      return;
    }
    setEmails(prev => [...prev, val]);
    setInputValue("");
    inputRef.current?.focus();
  }

  function removeEmail(index: number) {
    setEmails(prev => prev.filter((_, i) => i !== index));
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  }

  const ccParam = emails.map(encodeURIComponent).join(",");
  const subject = encodeURIComponent(`Co-purchase request: ${listingName}`);
  const body = encodeURIComponent(
    `Hi,\n\nI'd like to arrange a co-purchase for "${listingName}".\n\nCo-purchasers copied on this email:\n${emails.join("\n")}\n\nPlease let us know how to proceed.`
  );
  const mailtoHref = `mailto:${contactEmail}${ccParam ? `?cc=${ccParam}&` : "?"}subject=${subject}&body=${body}`;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        aria-modal="true"
        aria-labelledby="copurchase-modal-title"
        className={styles.dialog}
        ref={dialogRef}
        role="dialog"
        onClick={e => e.stopPropagation()}
      >
        <button
          aria-label="Close co-purchase dialog"
          className={styles.closeButton}
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          ×
        </button>

        <p className={styles.kicker}>Co-Purchase</p>
        <h2 className={styles.title} id="copurchase-modal-title">
          {listingName}
        </h2>
        <p className={styles.description}>
          Invite lab partners to split this purchase. Each person will be CCed
          on the email to the seller.
        </p>

        <label className={styles.fieldLabel} htmlFor="copurchase-email">
          Partner email
        </label>
        <div className={styles.inputRow}>
          <input
            id="copurchase-email"
            ref={inputRef}
            type="email"
            className={styles.emailInput}
            placeholder="colleague@university.edu"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <button
            className={styles.addButton}
            type="button"
            onClick={addEmail}
          >
            Add
          </button>
        </div>

        {emails.length > 0 ? (
          <ul className={styles.chipList} aria-label="Invited partners">
            {emails.map((email, i) => (
              <li key={email} className={styles.chip}>
                <span className={styles.chipEmail}>{email}</span>
                <button
                  className={styles.chipRemove}
                  type="button"
                  aria-label={`Remove ${email}`}
                  onClick={() => removeEmail(i)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyChips}>No partners added yet.</p>
        )}

        <div className={styles.footer}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          {emails.length > 0 ? (
            <a
              className={styles.primaryButton}
              href={mailtoHref}
              onClick={onClose}
            >
              Email Seller
            </a>
          ) : (
            <button
              className={styles.primaryButton}
              type="button"
              disabled
            >
              Email Seller
            </button>
          )}
        </div>
      </div>
    </div>
  );
}