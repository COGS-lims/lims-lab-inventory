import { Storage } from "@google-cloud/storage";

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n");
const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;

if (!projectId || !clientEmail || !privateKey || !bucketName) {
  console.warn(
    "Google Cloud Storage env vars are not fully configured — image uploads will fail."
  );
}

const storage = new Storage({
  projectId,
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
});

const bucket = storage.bucket(bucketName!);

function inferContentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

/**
 * Upload an image file to GCS.
 * Public access is expected via bucket-level IAM (uniform bucket-level access).
 */
export async function uploadImage(
  file: Buffer,
  originalFilename: string
): Promise<string> {
  if (file.length === 0) {
    throw new Error("Cannot upload an empty file.");
  }

  const timestamp = Date.now();
  const safeFilename =
    originalFilename.replace(/\s/g, "_").trim() || "image";
  const uniqueFilename = `listings/${timestamp}-${safeFilename}`;

  const blob = bucket.file(uniqueFilename);

  await blob.save(file, {
    metadata: {
      contentType: inferContentType(safeFilename),
    },
  });

  return `https://storage.googleapis.com/${bucketName}/${uniqueFilename}`;
}
