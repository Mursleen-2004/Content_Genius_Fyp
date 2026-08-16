import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import trendRoutes from "./routes/trendRoutes.js";
import generatePostRoute from "./routes/generatePostRoute.js";
import dashboardRoutes from "./routes/dashboardRoute.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import groqRoutes from "./routes/groqRoutes.js";

dotenv.config();

const app = express();

// Comma-separated list of allowed frontends, e.g.
// CLIENT_URL="https://content-genius.vercel.app,http://localhost:5173"
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Middlewares
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser callers (curl, health checks) which send no Origin.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Any preview/production deployment of the frontend on Vercel.
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check, deliberately ahead of the database gate so it still answers
// when Atlas is unreachable.
app.get("/", (req, res) => {
  res.send("Welcome to Content Genius API");
});

// Every /api request has to wait on the (cached) Atlas connection, because on
// serverless there is no startup hook to connect in.
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB Connection Failed", error);
    res.status(503).json({ message: "Database unavailable" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trends", trendRoutes);
app.use("/api/ai", generatePostRoute);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", groqRoutes);

// Vercel imports this module and drives it as a serverless handler, so only
// bind a port when running the server directly (local dev).
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB Connection Failed", error);
      process.exit(1);
    });
}

export default app;
