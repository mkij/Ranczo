import { Question, Category, Difficulty } from '../types/quiz';
import { questions as allQuestions } from './questions';

export function getRandomQuestions(count: number, filter?: {
  category?: Category;
  fansOnly?: boolean;
}): Question[] {
  let pool = [...allQuestions];

  if (filter?.category) {
    pool = pool.filter((q) => q.category === filter.category);
  }

  if (filter?.fansOnly) {
    // Fans only: 40% hard, 40% medium, 20% easy
    const hard = pool.filter((q) => q.difficulty === 'hard');
    const medium = pool.filter((q) => q.difficulty === 'medium');
    const easy = pool.filter((q) => q.difficulty === 'easy');
    pool = [...hard, ...hard, ...medium, ...medium, ...easy];
  }

  // Shuffle
  pool.sort(() => Math.random() - 0.5);

  return pool.slice(0, count);
}

export function getDailyQuestions(count: number): Question[] {
  // Seed based on today's date - same questions for everyone each day
  const today = new Date().toISOString().split('T')[0];
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed += today.charCodeAt(i);
  }

  const pool = [...allQuestions];

  // Seeded shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count);
}

export function getCategoryQuestionCount(category: Category): number {
  return allQuestions.filter((q) => q.category === category).length;
}