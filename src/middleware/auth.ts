import type { Request, Response, NextFunction } from "express";
import { getUserById } from "../services/auth.js";

/**
 * Middleware to require authentication
 * Returns 401 if user is not logged in
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.session.userId;

  if (!userId) {
    res.status(401).json({ error: "Authentication required", code: "NOT_AUTHENTICATED" });
    return;
  }

  // Verify user still exists
  const user = await getUserById(userId);
  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "User not found", code: "USER_NOT_FOUND" });
    return;
  }

  // Attach user to request for later use
  (req as Request & { user: typeof user }).user = user;
  next();
}
