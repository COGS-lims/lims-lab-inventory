/**
 * Returns only real uploaded image files from a multipart form payload.
 * Browsers may include an empty `images` part (filename="", size=0) even when
 * the user did not pick a file, so those entries are filtered out.
 * @param formData the data payload
 */
export function getValidImageFiles(formData: FormData): File[] {
  return (formData.getAll("images") as File[]).filter(
    file => file.size > 0 && file.name.trim() !== ""
  );
}
