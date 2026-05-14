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
 * Upload a publicly accessible image file to GCS
 * @param file image as raw bytes of data
 * @param originalFilename original name of the image file
 * @returns a promise that resolves to the public URL of the uploaded image
 */
export async function uploadImage(
  file: Buffer,
  originalFilename: string
): Promise<string> {
  const timestamp = Date.now();
  const safeFilename = originalFilename.replace(/\s/g, "_"); // replace spaces
  const uniqueFilename = `listings/${timestamp}-${safeFilename}`; // unique by timestamp

  const blob = bucket.file(uniqueFilename);

  await blob.save(file, {
    metadata: {
      contentType: "image/jpeg",
    },
  });

  // Make the file publicly accessible
  await blob.makePublic();

  return `https://storage.googleapis.com/${bucketName}/${uniqueFilename}`;
}
