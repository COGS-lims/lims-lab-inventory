import styles from "./listing-view.module.css";

interface ListingHeaderProps {
  itemName: string;
  labName?: string;
  priceLabel: string;
}

/**
 * Compact heading block for the listing title and price.
 */
export function ListingHeader({
  itemName,
  labName,
  priceLabel,
}: ListingHeaderProps) {
  return (
    <header className={styles.headerBlock}>
      {labName ? <p className={styles.eyebrow}>{labName}</p> : null}
      <h1 className={styles.title}>{itemName}</h1>
      <p className={styles.price}>{priceLabel}</p>
    </header>
  );
}
