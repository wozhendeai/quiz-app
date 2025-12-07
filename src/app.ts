import express, { type Express } from "express";
import quizRoutes from "./routes/quiz.js";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
