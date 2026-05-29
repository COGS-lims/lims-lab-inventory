import { Storage } from "@google-cloud/storage";

/**
 * create the authenticated client for interacting with GCS
 */
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME!;
const bucket = storage.bucket(bucketName);

/**
 * Infers a MIME type from filename extension for object metadata.
 * Defaults to JPEG when extension is missing or unknown.
 */
function inferContentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

/**
 * Upload an image file to GCS.
 * Public access is expected via bucket-level IAM (uniform bucket-level access);
 * do not call per-object ACL APIs such as makePublic().
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
