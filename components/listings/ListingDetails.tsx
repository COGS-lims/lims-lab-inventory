"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Listing } from "@/models/Listing";
import { ListingHeader } from "./ListingHeader";
import { ContactModal } from "./ContactModal";
import { CopurchaseModal } from "@/components/copurchase/CopurchaseModal";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import styles from "./listing-view.module.css";

interface ListingDetailsProps {
  contactEmail: string;
  listing: Listing;
}

function formatPrice(price: number) {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(date?: Date | string) {
  if (!date) return "No expiry date listed";

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(parsedDate.getTime())) {
    return "No expiry date listed";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function getConditionTone(condition: string) {
  const normalized = condition.toLowerCase();

  if (normalized === "new") return styles.conditionNew;
  if (normalized === "good") return styles.conditionGood;
  if (normalized === "fair") return styles.conditionFair;
  if (normalized === "poor") return styles.conditionPoor;

  return styles.conditionDefault;
}

function getHazardTone(hazard: string) {
  const normalized = hazard.toLowerCase();

  if (normalized.includes("chemical")) return styles.hazardDanger;
  if (normalized.includes("physical")) return styles.hazardNeutral;
  if (normalized.includes("biological")) return styles.hazardMuted;

  return styles.hazardWarning;
}

export function ListingDetails({ contactEmail, listing }: ListingDetailsProps) {
  const imageUrls =
    listing.imageUrls.length > 0 ? listing.imageUrls : ["", "", ""];

  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCopurchaseOpen, setIsCopurchaseOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(imageUrls[0]);
  const [quantity, setQuantity] = useState(1);
  const [deleting, setDeleting] = useState(false);

  const canDelete = (currentUser?.labs ?? []).some(
    l => l.labId === listing.labId
  );

  async function handleDelete() {
    if (!confirm(`Delete "${listing.itemName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.message ?? "Failed to delete listing.");
        setDeleting(false);
        return;
      }
      router.push("/marketplace");
    } catch {
      alert("Failed to delete listing.");
      setDeleting(false);
    }
  }

  function increaseQuantity() {
    setQuantity(quantity => Math.min(listing.quantityAvailable, quantity + 1));
  }

  function decreaseQuantity() {
    setQuantity(quantity => Math.max(1, quantity - 1));
  }

  const listingMeta = [
    {
      label: "Lab",
      value: listing.labName || "Independent lab listing",
    },
    {
      label: "Location",
      value: listing.labLocation || "Location not provided",
    },
    {
      label: "Quantity available",
      value: String(listing.quantityAvailable),
    },
    {
      label: "Condition",
      value: listing.condition,
    },
    {
      label: "Status",
      value: listing.status,
    },
    {
      label: "Listing ID",
      value: listing.itemId,
    },
  ];

  return (
    <main className={styles.pageShell}>
      <section className={styles.page}>
        <div className={styles.topBar}>
          <Link className={styles.backLink} href="/marketplace">
            <span className={styles.backIcon} aria-hidden="true">
              ←
            </span>
            <span>Back to Market Place</span>
          </Link>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={styles.deleteButton}
            >
              {deleting ? "Deleting…" : "Delete listing"}
            </button>
          )}
        </div>

        <div className={styles.contentGrid}>
          {/* LEFT-SIDE PICTURES */}
          <section className={styles.galleryColumn}>
            <div className={styles.heroImageFrame}>
              {activeImage ? (
                <img
                  alt={listing.itemName}
                  className={styles.heroImage}
                  src={activeImage}
                />
              ) : null}
            </div>

            <div className={styles.thumbnailRow}>
              {imageUrls.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  className={styles.thumbnailButton}
                  onClick={() => setActiveImage(imageUrl)}
                  type="button"
                >
                  {imageUrl ? (
                    <img
                      alt={`${listing.itemName} view ${index + 1}`}
                      className={styles.thumbnailImage}
                      src={imageUrl}
                    />
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          {/* RIGHT-SIDE INFO */}
          <section className={styles.detailsColumn}>
            <ListingHeader
              itemName={listing.itemName}
              labName={listing.labName!}
              priceLabel={formatPrice(listing.price)}
            />

            <div className={styles.copyBlock}>
              <h2 className={styles.sectionTitle}>Description</h2>
              <p className={styles.description}>
                {listing.description || "No description has been added yet."}
              </p>
            </div>

            <div className={styles.statusPills}>
              <span className={styles.statusPill}>
                Expiry: {formatDate(listing.expiryDate!)}
              </span>
              <span
                className={`${styles.statusPill} ${getConditionTone(listing.condition)}`}
              >
                Condition: {listing.condition}
              </span>
            </div>

            <div className={styles.purchaseCard}>
              <div className={styles.quantityRow}>
                <span className={styles.quantityLabel}>Quantity</span>
                <div className={styles.quantityBadge}>
                  <button
                    className={styles.quantityButton}
                    onClick={decreaseQuantity}
                    type="button"
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    className={styles.quantityButton}
                    onClick={increaseQuantity}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className={styles.actionRow}>
                <button
                  className={styles.secondaryAction}
                  type="button"
                  onClick={() => setIsCopurchaseOpen(true)}
                >
                  Co-Purchase
                </button>
                <button
                  className={styles.primaryAction}
                  type="button"
                  onClick={() => setIsContactModalOpen(true)}
                >
                  Buy Now
                </button>
              </div>

              <div className={styles.metaPanel}>
                <h2 className={styles.panelTitle}>Potential Hazards</h2>
                <div className={styles.hazardGrid}>
                  {listing.hazardTags.length > 0 ? (
                    listing.hazardTags.map(hazard => (
                      <span
                        key={hazard}
                        className={`${styles.hazardTag} ${getHazardTone(hazard)}`}
                      >
                        {hazard}
                      </span>
                    ))
                  ) : (
                    <span
                      className={`${styles.hazardTag} ${styles.hazardSafe}`}
                    >
                      No hazards listed
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.notesRow}>
                <span className={styles.notesLabel}>Notes &amp; Storage</span>
                <span className={styles.notesText}>
                  Store according to lab policy. Confirm condition and handling
                  requirements with the seller before pickup.
                </span>
              </div>
            </div>

            <div className={styles.metaGrid}>
              {listingMeta.map(item => (
                <div className={styles.metaItem} key={item.label}>
                  <span className={styles.metaLabel}>{item.label}</span>
                  <span className={styles.metaValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <ContactModal
        contactEmail={contactEmail}
        isOpen={isContactModalOpen}
        listingName={listing.itemName}
        onClose={() => setIsContactModalOpen(false)}
      />
      <CopurchaseModal
        contactEmail={contactEmail}
        isOpen={isCopurchaseOpen}
        listingName={listing.itemName}
        onClose={() => setIsCopurchaseOpen(false)}
      />
    </main>
  );
}