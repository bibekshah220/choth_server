import { v2 as cloudinary } from "cloudinary";
import { cloudinary_config } from "../config/config.js";

cloudinary.config({
  cloud_name: cloudinary_config.cloud_name,
  api_key: cloudinary_config.api_key,
  api_secret: cloudinary_config.api_secret,
});

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