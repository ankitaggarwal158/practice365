import mongoose from "mongoose";
import { config } from "../config/index.js";

export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  const maskedUri = config.mongoUri ? config.mongoUri.replace(/:([^@]+)@/, ":****@") : "undefined";
  console.log("Connecting to MongoDB at:", maskedUri);

  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    await mongoose.connect(config.mongoUri);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
