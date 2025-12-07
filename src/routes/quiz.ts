import { Router } from "express";
import { fetchCategories, fetchQuestions } from "../services/trivia.js";

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

router.get("/questions", async (req, res) => {
  try {
    const amount = parseInt(req.query.amount as string) || 10;
    const categoryId = req.query.category
      ? parseInt(req.query.category as string)
      : undefined;

    if (amount < 1 || amount > 50) {
      res.status(400).json({ error: "Amount must be between 1 and 50" });
      return;
    }

    const questions = await fetchQuestions(amount, categoryId);
    res.json(questions);
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch questions";
    res.status(500).json({ error: message });
  }
});

export default router;
