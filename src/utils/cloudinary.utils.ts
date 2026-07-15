import cloudinary from "../config/cloudinary.config.js";

interface UploadResult {
  path: string;
  public_id: string;
}

export const upload_file = async (
  filePath: string,
  folder = "uploads"
): Promise<UploadResult> => {
  const result = await cloudinary.uploader.upload(filePath, { folder });
  return { path: result.secure_url, public_id: result.public_id };
};

export const delete_file = async (public_id: string): Promise<void> => {
  await cloudinary.uploader.destroy(public_id);
};