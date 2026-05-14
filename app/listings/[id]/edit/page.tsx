import { connectToDatabase } from "@/lib/mongoose";
import { getListing } from "@/services/listings/listings";
import { ListingForm } from "@/components/listings/ListingForm";
import { notFound } from "next/navigation";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

function isDatabaseConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "MongooseServerSelectionError" ||
    error.message.includes("ECONNREFUSED") ||
    error.message.includes("Server selection timed out")
  );
}

export const metadata = {
  title: "Edit listing",
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;

  const fallbackValues = {
    itemName: "",
    itemId: id,
    labId: "",
    labName: "",
    labLocation: "",
    quantityAvailable: 1,
    expiryDate: undefined,
    description: "",
    price: 0,
    status: "ACTIVE" as const,
    condition: "Good" as const,
    hazardTags: [],
    imageUrls: [],
  };

  try {
    await connectToDatabase();
    const listing = await getListing(id);

    if (!listing) {
      return notFound();
    }

    return <ListingForm initialValues={listing} listingId={id} />;
  } catch (error) {
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev && isDatabaseConnectionError(error)) {
      return <ListingForm initialValues={fallbackValues} />;
    }

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
