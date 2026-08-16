import mongoose from 'mongoose';

// On Vercel each serverless invocation may reuse a warm container, so the
// connection is cached on the module scope instead of dialing Atlas per request.
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        // Fail fast instead of hanging until the function times out.
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        console.log('MongoDB Connected');
        return m;
      })
      .catch((error) => {
        cached.promise = null; // allow a retry on the next invocation
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
