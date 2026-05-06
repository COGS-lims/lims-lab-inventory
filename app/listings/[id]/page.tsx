import { connectToDatabase } from "@/lib/mongoose";
import type { Listing } from "@/models/Listing";
import { getListing } from "@/services/listings/listings";
import { ListingDetails } from "@/components/listings/ListingDetails";
import { notFound } from "next/navigation";

const mockListing: Listing = {
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

interface ListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Resolve a contact email for the listing until proper transaction
 * functionality exists
 */
function getListingContactEmail() {
  return (
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTACT_EMAIL ??
    process.env.MARKETPLACE_CONTACT_EMAIL ??
    "marketplace@lab.example"
  );
}

/**
 * Listing page for a single listing
 * @param params receives props including listing id
 * @returns listing page as entry point
 */
export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;

  const fallbackListing: Listing = {
    id,
    itemName: "Listing Preview",
    itemId: id,
    labName: "Marketplace",
    labLocation: "Unavailable in offline dev mode",
    labId: "lab-dev-fallback",
    imageUrls: [],
    quantityAvailable: 1,
    createdAt: new Date(),
    expiryDate: undefined,
    description:
      "Database is currently unavailable. This fallback is only shown in development.",
    price: 0,
    status: "ACTIVE",
    condition: "Good",
    hazardTags: [],
  };

  try {
    await connectToDatabase();
    const listing = await getListing(id);

    if (!listing) {
      notFound();
    }

    return (
      <ListingDetails
        contactEmail={getListingContactEmail()}
        listing={listing}
      />
    );
  } catch (error) {
    console.error("Error loading listing page: ", error);

    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#f8f6f0",
        }}
      >
        <section
          style={{
            width: "min(100%, 600px)",
            padding: "2rem",
            borderRadius: "1.5rem",
            border: "1px solid black",
            backgroundColor: "white",
          }}
        >
          <h1
            style={{
              margin: "0 0 0.75rem 0",
              fontSize: "2rem",
              lineHeight: 1.1,
            }}
          >
            Listing unavailable
          </h1>
          <p style={{ margin: 0, color: "#534a3d", lineHeight: 1.4 }}>
            The listing could not be loaded right now. Please try refreshing the
            page in a moment.
          </p>
        </section>
      </main>
    );
  }
}
