"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Listing } from "@/models/Listing";
import styles from "./listing-form.module.css";

interface ListingFormProps {
  initialValues?: Partial<Listing>;
  listingId?: string;
}

const CONDITION_OPTIONS = ["New", "Good", "Fair", "Poor"] as const;
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"] as const;
const HAZARD_OPTIONS = ["Physical", "Chemical", "Biological", "Other"] as const;

export function ListingForm({ initialValues, listingId }: ListingFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(listingId);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hazards, setHazards] = useState<string[]>(initialValues?.hazardTags ?? []);

  const expiryDefault = useMemo(() => {
    if (!initialValues?.expiryDate) return "";
    const parsed = new Date(initialValues.expiryDate);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  }, [initialValues?.expiryDate]);

  function toggleHazard(tag: string) {
    setHazards((previous) =>
      previous.includes(tag)
        ? previous.filter((value) => value !== tag)
        : [...previous, tag]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    formData.delete("hazardTags");
    hazards.forEach((tag) => formData.append("hazardTags", tag));

    const endpoint = isEditMode ? `/api/listings/${listingId}` : "/api/listings";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        setErrorMessage(payload.message ?? "Unable to save listing.");
        setSubmitting(false);
        return;
      }

      router.push(`/listings/${payload.data.id}`);
    } catch {
      setErrorMessage("Unable to save listing. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.formPage}>
      <section className={styles.topBanner}>
        <div className={styles.topBannerInner}>
          <button
            type="button"
            className={styles.bannerArrowButton}
            onClick={() => router.push("/marketplace")}
            aria-label="Back to marketplace"
          >
            <svg
              aria-hidden="true"
              className={styles.bannerArrow}
              viewBox="0 0 36 36"
            >
              <path
                className={styles.bannerArrowVector}
                d="M23.5 7.5L11.5 18L23.5 28.5"
              />
            </svg>
          </button>
          <div className={styles.bannerCopy}>
            <h1 className={styles.bannerTitle}>Item details:</h1>
            <p className={styles.bannerSubtitle}>
              Share resources with other researchers. Fill the details in below:
            </p>
          </div>
        </div>
      </section>

      <section className={styles.formCard}>
        <header className={styles.headingRow}>
          <h2 className={styles.headingText}>
            {isEditMode ? "Update Listing" : "Add New Listing"}
          </h2>
        </header>

        <form className={styles.formLayout} onSubmit={handleSubmit} encType="multipart/form-data">
          <section className={styles.photoBlock}>
            <div className={styles.photoUploader}>
              <label className={styles.photoTitle}>Item Photo</label>
              <div className={styles.photoDropzone}>
                <span className={styles.uploadText}>Upload Photo</span>
              </div>
              <input className={styles.fileInput} name="images" type="file" accept="image/*" multiple />
            </div>
            <div className={styles.photoHelp}>
              <p>Upload a clear photo of the item.</p>
              <p>Supported formats: JPG, PNG. Max size: 5MB.</p>
            </div>
          </section>

          <section className={styles.fieldsPanel}>
            <label className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Item name:</span>
              <input className={styles.textInput} name="itemName" defaultValue={initialValues?.itemName ?? ""} required />
            </label>

            <div className={styles.twoColumnGrid}>
              <label className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Item ID:</span>
                <input className={styles.textInput} name="itemId" defaultValue={initialValues?.itemId ?? ""} required />
              </label>

              <label className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Lab ID:</span>
                <input className={styles.textInput} name="labId" defaultValue={initialValues?.labId ?? ""} required />
              </label>
            </div>

            <div className={styles.twoColumnGrid}>
              <label className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Lab name:</span>
                <input className={styles.textInput} name="labName" defaultValue={initialValues?.labName ?? ""} />
              </label>

              <label className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Lab location:</span>
                <input className={styles.textInput} name="labLocation" defaultValue={initialValues?.labLocation ?? ""} />
              </label>
            </div>

            <div className={styles.twoColumnGrid}>
              <label className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Expiry date:</span>
                <input className={styles.textInput} name="expiryDate" type="date" defaultValue={expiryDefault} />
              </label>

              <label className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Quantity available:</span>
                <input className={styles.textInput} name="quantityAvailable" type="number" min={1} defaultValue={initialValues?.quantityAvailable ?? 1} required />
              </label>
            </div>

            <div className={styles.twoColumnGrid}>
              <label className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Condition:</span>
                <select className={styles.textInput} name="condition" defaultValue={initialValues?.condition ?? "Good"} required>
                  {CONDITION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Status:</span>
                <select className={styles.textInput} name="status" defaultValue={initialValues?.status ?? "ACTIVE"} required>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Description:</span>
              <textarea className={styles.textInput} name="description" rows={4} defaultValue={initialValues?.description ?? ""} />
            </label>

            <label className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Price:</span>
              <input className={styles.textInput} name="price" type="number" min={0} step="0.01" defaultValue={initialValues?.price ?? 0} />
            </label>
          </section>

          <section className={styles.hazardPanel}>
            <h2 className={styles.hazardHeading}>Hazard Tags</h2>
            <p className={styles.hazardDescription}>
              Select all applicable hazard warnings for this item.
            </p>
            <div className={styles.hazardGrid}>
              {HAZARD_OPTIONS.map((tag) => (
                <label key={tag} className={styles.hazardChip}>
                  <input
                    type="checkbox"
                    checked={hazards.includes(tag)}
                    onChange={() => toggleHazard(tag)}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </section>

          {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}

          <footer className={styles.buttonRow}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update listing"
                  : "List item on marketplace"}
            </button>
          </footer>
        </form>
      </section>
    </main>
  );
}
