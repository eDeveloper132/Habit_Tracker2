import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGO_URI environment variable inside .env.local");
}

let cached = global as typeof global & {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

const connectDB = async (): Promise<typeof mongoose> => {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connected");
      return mongoose;
    });
  }

  try {
    cached.mongoose.conn = await cached.mongoose.promise;
  } catch (error) {
    cached.mongoose.promise = null;
    console.error("MongoDB connection error:", error);
    throw error;
  }

  return cached.mongoose.conn;
};

export default connectDB;