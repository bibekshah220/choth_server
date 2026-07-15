import multer from "multer";

export const uploader = () =>
  multer({
    dest: "uploads/",
    limits: { fileSize: 10 * 1024 * 1024 },
  });