import { create } from 'zustand';
import { getItem, setItem, removeItem } from '../utils/storage';
import { Question, Category } from '../types/quiz';

const SCORES_KEY = 'ranczo_best_scores';
const DAILY_KEY = 'ranczo_daily';
const HISTORY_KEY = 'ranczo_history';
const FAN_POINTS_KEY = 'ranczo_fan_points';

type DifficultyFilter = 'mixed' | 'fans_only';

interface QuizState {
  // Current quiz session
  questions: Question[];
  currentIndex: number;
  answers: Record<string, number[]>;
  isFinished: boolean;

  // Quiz config
  difficultyFilter: DifficultyFilter;

  // Results history
  bestScores: Record<string, number>;

  // Daily tracking
  dailyCompleted: string | null;
  quizType: 'daily' | 'random' | 'category';

  // Fan progress
  totalFanPoints: number;

  // Actions
  startQuiz: (questions: Question[], type?: 'daily' | 'random' | 'category') => void;
  answerQuestion: (questionId: string, selectedIndexes: number[]) => void;
  nextQuestion: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  setDifficultyFilter: (filter: DifficultyFilter) => void;
  updateBestScore: (category: string, score: number) => void;
  completeDailyQuiz: () => void;
  isDailyCompleted: () => boolean;
  addFanPoints: (points: number) => void;
  loadScores: () => Promise<void>;
  clearAllProgress: () => Promise<void>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: {},
  isFinished: false,
  difficultyFilter: 'mixed',
  bestScores: {},
  dailyCompleted: null,
  quizType: 'daily',
  totalFanPoints: 0,

  startQuiz: (questions, type: 'daily' | 'random' | 'category' = 'daily') => set({
    questions,
    currentIndex: 0,
    answers: {},
    isFinished: false,
    quizType: type,
  }),

  answerQuestion: (questionId, selectedIndexes) => set((state) => ({
    answers: { ...state.answers, [questionId]: selectedIndexes },
  })),

  nextQuestion: () => set((state) => ({
    currentIndex: state.currentIndex + 1,
  })),

  finishQuiz: () => set({ isFinished: true }),

  resetQuiz: () => set({
    questions: [],
    currentIndex: 0,
    answers: {},
    isFinished: false,
  }),

  setDifficultyFilter: (filter) => set({ difficultyFilter: filter }),

  updateBestScore: (category, score) => {
    const current = get().bestScores[category] ?? 0;
    if (score > current) {
      const newScores = { ...get().bestScores, [category]: score };
      set({ bestScores: newScores });
      setItem(SCORES_KEY, JSON.stringify(newScores));
    }
  },

  completeDailyQuiz: () => {
    const today = new Date().toISOString().split('T')[0];
    set({ dailyCompleted: today });
    setItem(DAILY_KEY, today);
  },

  isDailyCompleted: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().dailyCompleted === today;
  },

  addFanPoints: (points) => {
    const updated = get().totalFanPoints + points;
    set({ totalFanPoints: updated });
    setItem(FAN_POINTS_KEY, String(updated));
  },

  loadScores: async () => {
    try {
      const [scoresRaw, dailyRaw, historyRaw, fanPointsRaw] = await Promise.all([
        getItem(SCORES_KEY),
        getItem(DAILY_KEY),
        getItem(HISTORY_KEY),
        getItem(FAN_POINTS_KEY),
      ]);
      set({
        bestScores: scoresRaw ? JSON.parse(scoresRaw) : {},
        dailyCompleted: dailyRaw ?? null,
        totalFanPoints: fanPointsRaw ? parseInt(fanPointsRaw, 10) : 0,
      });
    } catch {
      // Ignore errors on load
    }
  },

  clearAllProgress: async () => {
    await Promise.all([
      removeItem(SCORES_KEY),
      removeItem(DAILY_KEY),
      removeItem(HISTORY_KEY),
      removeItem(FAN_POINTS_KEY),
    ]);
    set({
      bestScores: {},
      dailyCompleted: null,
      totalFanPoints: 0,
    });
  },
}));