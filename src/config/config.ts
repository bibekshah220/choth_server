export const mongodb_config = {
  url: process.env.DB_URI as string,
  db_name: process.env.DB_NAME as string,
};

export const cloudinary_config = {
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
};

export const jwt_config = {
  jwt_secret: process.env.JWT_SECRET as string,
  expires_in: process.env.JWT_EXPIRES_IN as string,
};

export const smtp_config = {
  host: process.env.SMTP_HOST as string,
  port: Number(process.env.SMTP_PORT),
  service: process.env.SMTP_SERVICE as string,
  user: process.env.SMTP_USER as string,
  pass: process.env.SMTP_PASS as string,
  from: process.env.SMTP_FROM as string,
};