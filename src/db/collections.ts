import { getDb } from "./client.js";
import type { QuizSession, Score } from "../types.js";
import type { Collection } from "mongodb";

export function getQuizSessionsCollection(): Collection<QuizSession> {
  return getDb().collection<QuizSession>("quiz_sessions");
}

export function getScoresCollection(): Collection<Score> {
  return getDb().collection<Score>("scores");
}

export async function ensureIndexes(): Promise<void> {
  const sessions = getQuizSessionsCollection();
  const scores = getScoresCollection();

  // TTL index: auto-delete sessions after 24 hours to prevent unbounded growth
  await sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });

  // Index for leaderboard queries: sort by percentage desc, then completedAt desc
  await scores.createIndex({ percentage: -1, completedAt: -1 });
}
