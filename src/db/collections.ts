import { getDb } from "./client.js";
import type { QuizSession, Score, User } from "../types.js";
import type { Collection } from "mongodb";

export function getQuizSessionsCollection(): Collection<QuizSession> {
  return getDb().collection<QuizSession>("quiz_sessions");
}

export function getScoresCollection(): Collection<Score> {
  return getDb().collection<Score>("scores");
}

export function getUsersCollection(): Collection<User> {
  return getDb().collection<User>("users");
}

export async function ensureIndexes(): Promise<void> {
  const sessions = getQuizSessionsCollection();
  const scores = getScoresCollection();
  const users = getUsersCollection();

  // TTL index: auto-delete sessions after 24 hours to prevent unbounded growth
  await sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });

  // Index for leaderboard queries: sort by percentage desc, then completedAt desc
  await scores.createIndex({ percentage: -1, completedAt: -1 });

  // Index for user scores by userId for profile queries
  await scores.createIndex({ userId: 1, completedAt: -1 });

  // Unique index on username for users
  await users.createIndex({ username: 1 }, { unique: true });
}
