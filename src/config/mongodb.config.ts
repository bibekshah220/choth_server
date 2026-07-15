import mongoose from "mongoose";
import { mongodb_config } from "./config.js";

export const connect_db = async (): Promise<void> => {
  try {
    await mongoose.connect(mongodb_config.url, {
      dbName: mongodb_config.db_name,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};