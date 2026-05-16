"use client";
import { useEffect, useRef } from "react";
import styles from "./contact-modal.module.css";

interface ContactModalProps {
  contactEmail: string;
  isOpen: boolean;
  listingName: string;
  onClose: () => void;
}

function getFocusableElements(container: HTMLElement) {
  const selectors = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ];

  return Array.from(
    container.querySelectorAll<HTMLElement>(selectors.join(","))
  );
}

/**
 * Accessible contact modal used by the buy button.
 */
export function ContactModal({
  contactEmail,
  isOpen,
  listingName,
  onClose,
}: ContactModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    lastFocusedElementRef.current =
      document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      lastFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className={styles.dialog}
        ref={dialogRef}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Close contact seller dialog"
          className={styles.closeButton}
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          ×
        </button>

        <p className={styles.kicker}>Contact Seller</p>
        <h2 className={styles.title} id="contact-modal-title">
          {listingName}
        </h2>
        <p className={styles.description}>
          Stripe is not connected yet, so the next step is to contact the seller
          directly by email.
        </p>

        <a className={styles.emailLink} href={`mailto:${contactEmail}`}>
          {contactEmail}
        </a>

        <div className={styles.footer}>
          <button
            className={styles.secondaryButton}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
          <a className={styles.primaryButton} href={`mailto:${contactEmail}`}>
            Email Seller
          </a>
        </div>
      </div>
    </div>
  );
}
