import path from "path";
import { fileURLToPath } from "url";
import express, { type Express } from "express";
import quizRoutes from "./routes/quiz.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

/**
 * Used to check if server is running/healthy
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * endpoints related to quiz data
 */
app.use("/api/quiz", quizRoutes);

export default app;
