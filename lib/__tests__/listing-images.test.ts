import { getValidImageFiles } from "@/lib/listing-form-data";

describe("getValidImageFiles", () => {
  it("ignores empty file parts from the browser", () => {
    const formData = new FormData();
    formData.append("images", new File([], "", { type: "application/octet-stream" }));
    formData.append("itemName", "test");

    expect(getValidImageFiles(formData)).toHaveLength(0);
  });

  it("keeps files with content and a name", () => {
    const formData = new FormData();
    formData.append(
      "images",
      new File([new Uint8Array([1])], "photo.png", { type: "image/png" })
    );

    const files = getValidImageFiles(formData);
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe("photo.png");
  });
});
