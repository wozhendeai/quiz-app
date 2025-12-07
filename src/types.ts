import type { ObjectId } from "mongodb";

// Trivia API types

export interface Category {
  id: number;
  name: string;
}

// User & Auth types

/** User stored in MongoDB */
export interface User {
  _id?: ObjectId;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

/** Safe user data to send to client (no password) */
export interface SafeUser {
  id: string;
  username: string;
}

/** User profile with play history */
export interface UserProfile {
  user: SafeUser;
  scores: Score[];
  totalGames: number;
  averagePercentage: number;
}

/** Raw question format from Open Trivia DB API */
export interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

/** Formatted question for frontend consumption (deprecated - includes answer) */
export interface FormattedQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
  category: string;
  difficulty: string;
}

/** Question format sent to client - NO correct answer exposed */
export interface ClientQuestion {
  questionIndex: number;
  question: string;
  answers: string[];
  category: string;
  difficulty: string;
}

/** Internal question format stored server-side */
export interface StoredQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
  category: string;
  difficulty: string;
}

/** Record of each answer submission */
export interface AnswerRecord {
  questionIndex: number;
  selectedAnswerIndex: number;
  correct: boolean;
  timestamp: Date;
}

/** Quiz session stored in MongoDB */
export interface QuizSession {
  _id: string;
  userId: string;
  username: string;
  questions: StoredQuestion[];
  currentQuestionIndex: number;
  score: number;
  answers: AnswerRecord[];
  status: "active" | "completed";
  categoryId?: number;
  categoryName?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Permanent score record for leaderboard */
export interface Score {
  userId: string;
  username: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  categoryId?: number;
  categoryName?: string;
  completedAt: Date;
}

/** Single entry in leaderboard response */
export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
}

/** Response for leaderboard endpoint */
export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

/** Response when starting a quiz */
export interface StartQuizResponse {
  sessionId: string;
  questions: ClientQuestion[];
  totalQuestions: number;
}

/** Request body for submitting an answer */
export interface SubmitAnswerRequest {
  sessionId: string;
  questionIndex: number;
  selectedAnswerIndex: number;
}

/** Response after submitting an answer */
export interface SubmitAnswerResponse {
  correct: boolean;
  correctAnswerIndex: number;
  currentScore: number;
  questionIndex: number;
  isComplete: boolean;
}

/** Response for getting quiz results */
export interface QuizResultsResponse {
  sessionId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: AnswerResultDetail[];
  completedAt: Date;
}

/** Detailed result for each question in final results */
export interface AnswerResultDetail {
  questionIndex: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

/** Open Trivia DB categories response */
export interface CategoriesResponse {
  trivia_categories: Category[];
}

/** Open Trivia DB questions response */
export interface QuestionsResponse {
  response_code: number;
  results: TriviaQuestion[];
}
