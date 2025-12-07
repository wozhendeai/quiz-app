import bcrypt from "bcrypt";
import { getUsersCollection } from "../db/collections.js";
import type { User, SafeUser } from "../types.js";

const SALT_ROUNDS = 10;

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user._id!.toString(),
    username: user.username,
  };
}

export async function createUser(
  username: string,
  password: string
): Promise<SafeUser> {
  const users = getUsersCollection();

  // Check if username already exists
  const existing = await users.findOne({ username: username.toLowerCase() });
  if (existing) {
    throw new AuthError("Username already taken", "USERNAME_EXISTS", 409);
  }

  // Validate inputs
  if (!username || username.length < 2) {
    throw new AuthError(
      "Username must be at least 2 characters",
      "INVALID_USERNAME",
      400
    );
  }
  if (!password || password.length < 6) {
    throw new AuthError(
      "Password must be at least 6 characters",
      "INVALID_PASSWORD",
      400
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user: User = {
    username: username.toLowerCase(),
    passwordHash,
    createdAt: new Date(),
  };

  const result = await users.insertOne(user);
  user._id = result.insertedId;

  return toSafeUser(user);
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<SafeUser> {
  const users = getUsersCollection();

  const user = await users.findOne({ username: username.toLowerCase() });
  if (!user) {
    throw new AuthError("Invalid username or password", "INVALID_CREDENTIALS", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid username or password", "INVALID_CREDENTIALS", 401);
  }

  return toSafeUser(user);
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const users = getUsersCollection();
  const { ObjectId } = await import("mongodb");

  try {
    const user = await users.findOne({ _id: new ObjectId(id) });
    if (!user) return null;
    return toSafeUser(user);
  } catch {
    return null;
  }
}
