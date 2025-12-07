import path from "path";
import { fileURLToPath } from "url";
import express, { type Express } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import quizRoutes from "./routes/quiz.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

// Extend express-session types to include userId
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with MongoDB store
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "quiz-app-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 24 hours
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

/**
 * Used to check if server is running/healthy
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * Auth endpoints
 */
app.use("/api/auth", authRoutes);

/**
 * User endpoints
 */
app.use("/api/user", userRoutes);

/**
 * Quiz endpoints
 */
app.use("/api/quiz", quizRoutes);

/**
 * Catch-all route for client-side routing
 * Serves index.html for /login, /signup, /profile, etc.
 * Express 5 requires named parameter for wildcards
 */
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

export default app;
