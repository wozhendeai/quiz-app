import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getUserById } from "../services/auth.js";
import { getScoresCollection } from "../db/collections.js";
import type { SafeUser, UserProfile } from "../types.js";

const router = Router();

/**
 * GET /api/user/profile
 * Get current user's profile with play history
 */
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const scoresCollection = getScoresCollection();
    const scores = await scoresCollection
      .find({ userId })
      .sort({ completedAt: -1 })
      .limit(50)
      .toArray();

    const totalGames = scores.length;
    const averagePercentage =
      totalGames > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / totalGames)
        : 0;

    const profile: UserProfile = {
      user,
      scores,
      totalGames,
      averagePercentage,
    };

    res.json(profile);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

export default router;
