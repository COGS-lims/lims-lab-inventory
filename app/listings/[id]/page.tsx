import { connectToDatabase } from "@/lib/mongoose";
import type { Listing } from "@/models/Listing";
import { getListing } from "@/services/listings/listings";
import { ListingDetails } from "@/components/listings/ListingDetails";
import { notFound } from "next/navigation";

interface ListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

function isUsableEmail(email: string) {
  return email.includes("@") && email.includes(".");
}

function getContactEmailForListing(listing: Listing) {
  const seller = listing.sellerEmail?.trim() ?? "";
  if (seller && isUsableEmail(seller)) {
    return seller;
  }
  const fallback =
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTACT_EMAIL ??
    process.env.MARKETPLACE_CONTACT_EMAIL ??
    "";
  return fallback.trim();
}

/**
 * Listing page for a single listing.
 */
export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;

  const fallbackListing: Listing = {
    id: "demo-listing-id",
    itemName: "Digital Microscope",
    itemId: "MISC-0123",
    labName: "Bioimaging Core Lab",
    labLocation: "Torrey Pines",
    labId: "lab-1",
    imageUrls: [],
    quantityAvailable: 3,
    createdAt: new Date(),
    expiryDate: new Date("2026-05-15"),
    description:
      "High-resolution digital microscope available from the lab inventory marketplace.",
    price: 1200,
    status: "ACTIVE",
    condition: "Good",
    hazardTags: ["Physical", "Chemical", "Biological"],
  };

  try {
    await connectToDatabase();
    const listing = await getListing(id);

    if (!listing) {
      notFound();
    }

    return (
      <ListingDetails
        contactEmail={getContactEmailForListing(listing)}
        listing={listing}
      />
    );
  } catch (error) {
    console.error("Error loading listing page:", error);

    return (
      <ListingDetails
        contactEmail={getContactEmailForListing(fallbackListing)}
        listing={fallbackListing}
      />
    );
  }
}
