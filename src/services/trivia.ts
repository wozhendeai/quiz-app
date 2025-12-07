import type {
  Category,
  FormattedQuestion,
  CategoriesResponse,
  QuestionsResponse,
} from "../types.js";

const TRIVIA_BASE_URL = "https://opentdb.com";

function decodeText(text: string): string {
  return decodeURIComponent(text);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${TRIVIA_BASE_URL}/api_category.php`);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const data = (await response.json()) as CategoriesResponse;
  return data.trivia_categories;
}

export async function fetchQuestions(
  amount: number,
  categoryId?: number
): Promise<FormattedQuestion[]> {
  const params = new URLSearchParams({
    amount: String(Math.min(Math.max(amount, 1), 50)),
    type: "multiple",
    encode: "url3986",
  });

  if (categoryId !== undefined) {
    params.set("category", String(categoryId));
  }

  const response = await fetch(`${TRIVIA_BASE_URL}/api.php?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.status}`);
  }

  const data = (await response.json()) as QuestionsResponse;

  if (data.response_code !== 0) {
    const errorMessages: Record<number, string> = {
      1: "Not enough questions available for this category",
      2: "Invalid parameter",
      3: "Token not found",
      4: "Token exhausted",
    };
    throw new Error(errorMessages[data.response_code] || "Unknown API error");
  }

  return data.results.map((q) => {
    const correctAnswer = decodeText(q.correct_answer);
    const allAnswers = shuffleArray([
      correctAnswer,
      ...q.incorrect_answers.map(decodeText),
    ]);

    return {
      question: decodeText(q.question),
      answers: allAnswers,
      correctIndex: allAnswers.indexOf(correctAnswer),
      category: decodeText(q.category),
      difficulty: q.difficulty,
    };
  });
}
