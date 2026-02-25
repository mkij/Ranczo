export type QuestionType =
  | 'single'        // classic ABCD
  | 'multiple'      // multiple choice
  | 'quote_complete' // complete the quote (pick from options)
  | 'true_false'    // true or false
  | 'quote_author'  // who said this quote
  | 'image';        // image + ABCD

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Category =
  | 'characters'
  | 'quotes'
  | 'relationships'
  | 'actors'
  | 'plot'
  | 'details';

export interface Question {
  id: string;
  type: QuestionType;
  category: Category;
  difficulty: Difficulty;
  season?: number;
  question: string;
  image?: string;
  options: string[];
  correctAnswers: number[];  // indexes of correct options (single element for ABCD, multiple for multi-choice)
  explanation: string;
  points: 1 | 2 | 3;
}

export interface QuizResult {
  date: string;
  category: Category | 'daily' | 'mixed';
  score: number;
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
}