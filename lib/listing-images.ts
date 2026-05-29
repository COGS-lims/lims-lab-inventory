import { uploadImage } from "@/lib/googleCloud";

export { getValidImageFiles } from "@/lib/listing-form-data";

/**
 * Uploads a list of validated browser `File` objects and returns their public
 * URLs in the same order they were provided.
 * @param files the files to upload
 */
export async function uploadListingImages(files: File[]): Promise<string[]> {
  const imageUrls: string[] = [];
  for (const imageFile of files) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    imageUrls.push(await uploadImage(buffer, imageFile.name));
  }
  return imageUrls;
}
