import { Router } from "express";
import { fetchCategories } from "../services/trivia.js";
import {
  createQuizSession,
  submitAnswer,
  getQuizResults,
  getLeaderboard,
  SessionError,
} from "../services/session.js";
import type { SubmitAnswerRequest } from "../types.js";

function generateRandomUsername(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `Player_${suffix}`;
}

const router = Router();

router.get("/categories", async (_req, res) => {
  try {
    const categories = await fetchCategories();
    res.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/**
 * Start a new quiz session
 * Questions are stored server-side; client receives questions WITHOUT correct answers
 */
router.post("/start", async (req, res) => {
  try {
    const amount = parseInt(req.body.amount as string) || 10;
    const categoryId = req.body.categoryId
      ? parseInt(req.body.categoryId as string)
      : undefined;
    const categoryName = req.body.categoryName as string | undefined;
    const username = (req.body.username as string) || generateRandomUsername();

    if (amount < 1 || amount > 50) {
      res.status(400).json({ error: "Amount must be between 1 and 50" });
      return;
    }

    const response = await createQuizSession(amount, username, categoryId, categoryName);
    res.json(response);
  } catch (error) {
    console.error("Failed to start quiz:", error);
    const message =
      error instanceof Error ? error.message : "Failed to start quiz";
    res.status(500).json({ error: message });
  }
});

/**
 * Submit an answer for validation
 * Server validates and returns whether correct, updates score
 */
router.post("/answer", async (req, res) => {
  try {
    const { sessionId, questionIndex, selectedAnswerIndex } =
      req.body as SubmitAnswerRequest;

    if (!sessionId || questionIndex === undefined || selectedAnswerIndex === undefined) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const response = await submitAnswer(sessionId, questionIndex, selectedAnswerIndex);
    res.json(response);
  } catch (error) {
    if (error instanceof SessionError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
      });
      return;
    }
    console.error("Failed to submit answer:", error);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

/**
 * Get final results for a completed quiz
 */
router.get("/results/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const response = await getQuizResults(sessionId);
    res.json(response);
  } catch (error) {
    if (error instanceof SessionError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
      });
      return;
    }
    console.error("Failed to get results:", error);
    res.status(500).json({ error: "Failed to get results" });
  }
});

/**
 * Get leaderboard - top scores sorted by percentage
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const response = await getLeaderboard(limit);
    res.json(response);
  } catch (error) {
    console.error("Failed to get leaderboard:", error);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

export default router;
