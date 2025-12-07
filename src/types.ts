// Trivia API types

export interface Category {
  id: number;
  name: string;
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

/** Formatted question for frontend consumption */
export interface FormattedQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
  category: string;
  difficulty: string;
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
