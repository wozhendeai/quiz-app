import { randomUUID } from "crypto";
import {
  getQuizSessionsCollection,
  getScoresCollection,
} from "../db/collections.js";
import { fetchQuestions } from "./trivia.js";
import type {
  QuizSession,
  ClientQuestion,
  StartQuizResponse,
  SubmitAnswerResponse,
  QuizResultsResponse,
  StoredQuestion,
  LeaderboardEntry,
  LeaderboardResponse,
} from "../types.js";

export class SessionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "SessionError";
  }
}

export async function createQuizSession(
  amount: number,
  username: string,
  categoryId?: number,
  categoryName?: string
): Promise<StartQuizResponse> {
  const questions = await fetchQuestions(amount, categoryId);

  const storedQuestions: StoredQuestion[] = questions.map((q) => ({
    question: q.question,
    answers: q.answers,
    correctIndex: q.correctIndex,
    category: q.category,
    difficulty: q.difficulty,
  }));

  const sessionId = randomUUID();
  const now = new Date();

  const session: QuizSession = {
    _id: sessionId,
    username,
    questions: storedQuestions,
    currentQuestionIndex: 0,
    score: 0,
    answers: [],
    status: "active",
    createdAt: now,
    updatedAt: now,
    ...(categoryId !== undefined && { categoryId }),
    ...(categoryName !== undefined && { categoryName }),
  };

  const collection = getQuizSessionsCollection();
  await collection.insertOne(session);

  // Strip correctIndex for client response
  const clientQuestions: ClientQuestion[] = storedQuestions.map((q, index) => ({
    questionIndex: index,
    question: q.question,
    answers: q.answers,
    category: q.category,
    difficulty: q.difficulty,
  }));

  return {
    sessionId,
    questions: clientQuestions,
    totalQuestions: clientQuestions.length,
  };
}

export async function submitAnswer(
  sessionId: string,
  questionIndex: number,
  selectedAnswerIndex: number
): Promise<SubmitAnswerResponse> {
  const collection = getQuizSessionsCollection();
  const session = await collection.findOne({ _id: sessionId });

  if (!session) {
    throw new SessionError("Quiz session not found", "SESSION_NOT_FOUND", 404);
  }

  if (session.status === "completed") {
    throw new SessionError(
      "This quiz has already been completed",
      "QUIZ_COMPLETED",
      410
    );
  }

  if (questionIndex !== session.currentQuestionIndex) {
    throw new SessionError(
      "Question index does not match expected",
      "INVALID_QUESTION_INDEX",
      400
    );
  }

  // Check if already answered (prevents double submission)
  const alreadyAnswered = session.answers.some(
    (a) => a.questionIndex === questionIndex
  );
  if (alreadyAnswered) {
    throw new SessionError(
      "This question has already been answered",
      "ALREADY_ANSWERED",
      409
    );
  }

  const question = session.questions[questionIndex];
  if (!question) {
    throw new SessionError(
      "Question not found in session",
      "QUESTION_NOT_FOUND",
      400
    );
  }

  if (selectedAnswerIndex < 0 || selectedAnswerIndex >= question.answers.length) {
    throw new SessionError(
      "Answer index must be valid",
      "INVALID_ANSWER_INDEX",
      400
    );
  }

  const correct = selectedAnswerIndex === question.correctIndex;
  const newScore = correct ? session.score + 1 : session.score;
  const isLastQuestion = questionIndex === session.questions.length - 1;
  const newStatus = isLastQuestion ? "completed" : "active";
  const now = new Date();

  await collection.updateOne(
    { _id: sessionId },
    {
      $set: {
        currentQuestionIndex: questionIndex + 1,
        score: newScore,
        status: newStatus,
        updatedAt: now,
      },
      $push: {
        answers: {
          questionIndex,
          selectedAnswerIndex,
          correct,
          timestamp: now,
        },
      },
    }
  );

  // Save score to leaderboard when quiz is completed
  if (isLastQuestion) {
    const scoresCollection = getScoresCollection();
    const totalQuestions = session.questions.length;
    const percentage = Math.round((newScore / totalQuestions) * 100);

    await scoresCollection.insertOne({
      username: session.username,
      score: newScore,
      totalQuestions,
      percentage,
      completedAt: now,
      ...(session.categoryId !== undefined && { categoryId: session.categoryId }),
      ...(session.categoryName !== undefined && { categoryName: session.categoryName }),
    });
  }

  return {
    correct,
    correctAnswerIndex: question.correctIndex,
    currentScore: newScore,
    questionIndex,
    isComplete: isLastQuestion,
  };
}

export async function getQuizResults(
  sessionId: string
): Promise<QuizResultsResponse> {
  const collection = getQuizSessionsCollection();
  const session = await collection.findOne({ _id: sessionId });

  if (!session) {
    throw new SessionError("Quiz session not found", "SESSION_NOT_FOUND", 404);
  }

  if (session.status !== "completed") {
    throw new SessionError(
      "Quiz is not yet completed",
      "QUIZ_NOT_COMPLETED",
      400
    );
  }

  const answers = session.answers.map((answer) => {
    const question = session.questions[answer.questionIndex];
    return {
      questionIndex: answer.questionIndex,
      question: question?.question ?? "",
      selectedAnswer: question?.answers[answer.selectedAnswerIndex] ?? "",
      correctAnswer: question?.answers[question.correctIndex] ?? "",
      correct: answer.correct,
    };
  });

  return {
    sessionId,
    score: session.score,
    totalQuestions: session.questions.length,
    percentage: Math.round((session.score / session.questions.length) * 100),
    answers,
    completedAt: session.updatedAt,
  };
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardResponse> {
  const scoresCollection = getScoresCollection();

  const scores = await scoresCollection
    .find({})
    .sort({ percentage: -1, completedAt: -1 })
    .limit(limit)
    .toArray();

  const leaderboard: LeaderboardEntry[] = scores.map((score, index) => ({
    rank: index + 1,
    username: score.username,
    score: score.score,
    totalQuestions: score.totalQuestions,
    percentage: score.percentage,
    completedAt: score.completedAt,
  }));

  return { leaderboard };
}
