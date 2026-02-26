import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../src/constants/theme';
import { useQuizStore } from '../src/stores/quizStore';
import { Question } from '../src/types/quiz';
import { playSound } from '../src/utils/sounds';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuizScreen() {
  const router = useRouter();
  const {
    questions,
    currentIndex,
    answers,
    answerQuestion,
    nextQuestion,
    finishQuiz,
  } = useQuizStore();

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isMultiple = question?.type === 'multiple';

  const isCorrectAnswer = useCallback((q: Question, selected: number[]) => {
    if (selected.length !== q.correctAnswers.length) return false;
    const sortedSelected = [...selected].sort();
    const sortedCorrect = [...q.correctAnswers].sort();
    return sortedSelected.every((val, i) => val === sortedCorrect[i]);
  }, []);

  const handleOptionPress = (index: number) => {
    if (confirmed) return;

    if (isMultiple) {
      setSelectedIndexes((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedIndexes([index]);
      setConfirmed(true);
      answerQuestion(question.id, [index]);
      const correct = question.correctAnswers.includes(index);
      playSound(correct ? 'correct' : 'incorrect');
    }
  };

  const handleConfirmMultiple = () => {
    if (selectedIndexes.length === 0) return;
    setConfirmed(true);
    answerQuestion(question.id, selectedIndexes);
    const correct = isCorrectAnswer(question, selectedIndexes);
    playSound(correct ? 'correct' : 'incorrect');
  };

  const handleNext = () => {
    setSelectedIndexes([]);
    setConfirmed(false);

    if (isLastQuestion) {
      finishQuiz();
      router.replace('/result');
    } else {
      nextQuestion();
    }
  };

  // No questions loaded
  if (!question) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Brak pytań</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
            <Text style={styles.backButtonText}>Wróć</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Current score
  const currentScore = questions.slice(0, currentIndex + (confirmed ? 1 : 0)).reduce((sum, q) => {
    const ans = answers[q.id];
    if (!ans) return sum;
    return sum + (isCorrectAnswer(q, ans) ? q.points : 0);
  }, 0);

  const isCurrentCorrect = confirmed && isCorrectAnswer(question, selectedIndexes);

  // Question type labels
  const typeLabels: Record<string, string> = {
    single: 'WYBIERZ ODPOWIEDŹ',
    multiple: 'ZAZNACZ WSZYSTKIE POPRAWNE',
    true_false: 'PRAWDA CZY FAŁSZ?',
    quote_author: 'KTO TO POWIEDZIAŁ?',
    quote_complete: 'DOKOŃCZ CYTAT',
    image: 'WYBIERZ ODPOWIEDŹ',
  };

  // Points label
  const pointsLabel = question.points === 1 ? '1 punkt' : question.points === 2 ? '2 punkty' : '3 punkty';

  // Progress
  const progressPercent = ((currentIndex + (confirmed ? 1 : 0)) / questions.length) * 100;

  // Option indicator style helpers
  const getIndicatorStyle = (index: number) => {
    if (!confirmed) {
      if (isMultiple) {
        // Checkbox style
        if (selectedIndexes.includes(index)) return styles.checkboxSelected;
        return styles.checkboxDefault;
      }
      // Letter style
      if (selectedIndexes.includes(index)) return styles.letterSelected;
      return styles.letterDefault;
    }

    const isCorrect = question.correctAnswers.includes(index);
    const isSelected = selectedIndexes.includes(index);

    if (isCorrect) return styles.indicatorCorrect;
    if (isSelected && !isCorrect) return styles.indicatorIncorrect;
    return styles.letterDimmed;
  };

  const getIndicatorTextStyle = (index: number) => {
    if (!confirmed) {
      if (selectedIndexes.includes(index)) return styles.indicatorTextActive;
      return styles.indicatorTextDefault;
    }

    const isCorrect = question.correctAnswers.includes(index);
    const isSelected = selectedIndexes.includes(index);

    if (isCorrect || isSelected) return styles.indicatorTextWhite;
    return styles.indicatorTextDefault;
  };

  const getIndicatorText = (index: number) => {
    if (!confirmed) {
      if (isMultiple && selectedIndexes.includes(index)) return '✓';
      if (isMultiple) return '';
      return OPTION_LETTERS[index];
    }

    const isCorrect = question.correctAnswers.includes(index);
    const isSelected = selectedIndexes.includes(index);

    if (isCorrect) return '✓';
    if (isSelected && !isCorrect) return '✗';
    return OPTION_LETTERS[index];
  };

  const getOptionStyle = (index: number) => {
    if (!confirmed) {
      if (selectedIndexes.includes(index)) return [styles.option, styles.optionSelected];
      return [styles.option];
    }

    const isCorrect = question.correctAnswers.includes(index);
    const isSelected = selectedIndexes.includes(index);

    if (isCorrect) return [styles.option, styles.optionCorrect];
    if (isSelected && !isCorrect) return [styles.option, styles.optionIncorrect];
    return [styles.option, styles.optionDimmed];
  };

  const getOptionTextStyle = (index: number) => {
    if (!confirmed) {
      if (selectedIndexes.includes(index)) return [styles.optionText, styles.optionTextSelected];
      return [styles.optionText];
    }

    const isCorrect = question.correctAnswers.includes(index);
    const isSelected = selectedIndexes.includes(index);

    if (isCorrect) return [styles.optionText, styles.optionTextCorrect];
    if (isSelected && !isCorrect) return [styles.optionText, styles.optionTextIncorrect];
    return [styles.optionText, styles.optionTextDimmed];
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>{currentScore} pkt</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Type + points row */}
        <View style={styles.metaRow}>
          <Text style={styles.typeLabel}>{typeLabels[question.type] ?? ''}</Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>{pointsLabel}</Text>
          </View>
        </View>

        {/* Question */}
        <Text style={styles.questionText}>{question.question}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(index)}
              activeOpacity={confirmed ? 1 : 0.7}
              onPress={() => handleOptionPress(index)}
            >
              <View style={styles.optionContent}>
                <View style={getIndicatorStyle(index)}>
                  <Text style={getIndicatorTextStyle(index)}>
                    {getIndicatorText(index)}
                  </Text>
                </View>
                <Text style={getOptionTextStyle(index)}>{option}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm button for multiple choice */}
        {isMultiple && !confirmed && (
          <TouchableOpacity
            style={[
              styles.confirmButton,
              selectedIndexes.length === 0 && styles.confirmButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleConfirmMultiple}
            disabled={selectedIndexes.length === 0}
          >
            <Text style={styles.confirmButtonText}>Zatwierdź</Text>
          </TouchableOpacity>
        )}

        {/* Explanation */}
        {confirmed && (
          <View style={[
            styles.explanationCard,
            isCurrentCorrect ? styles.explanationCorrect : styles.explanationIncorrect,
          ]}>
            <Text style={[
              styles.explanationLabel,
              { color: isCurrentCorrect ? COLORS.correct : COLORS.incorrect },
            ]}>
              {isCurrentCorrect ? '✓ Dobrze!' : '✗ Niestety...'}
            </Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Next button */}
      {confirmed && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.nextButton} activeOpacity={0.85} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? 'Zobacz wynik' : 'Następne pytanie →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  scoreBadge: {
    backgroundColor: '#E8F0E8',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    color: COLORS.primary,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    minWidth: 36,
    textAlign: 'right',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },

  // Meta row (type + points)
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  typeLabel: {
    fontSize: FONT_SIZES.label,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
  },
  pointsBadge: {
    backgroundColor: '#F5F2EC',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  pointsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B0A594',
  },

  // Question
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 30,
    marginBottom: 28,
    fontFamily: 'PlayfairDisplay_700Bold',
  },

  // Options
  optionsContainer: {
    gap: 10,
  },
  option: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F5F0',
  },
  optionCorrect: {
    borderColor: COLORS.correct,
    backgroundColor: '#E8F5E8',
  },
  optionIncorrect: {
    borderColor: COLORS.incorrect,
    backgroundColor: '#FDE8E8',
  },
  optionDimmed: {
    opacity: 0.45,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: COLORS.correct,
    fontWeight: '600',
  },
  optionTextIncorrect: {
    color: COLORS.incorrect,
    fontWeight: '600',
  },
  optionTextDimmed: {
    color: COLORS.textSecondary,
  },

  // Letter indicators (A, B, C, D)
  letterDefault: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F5F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterSelected: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterDimmed: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },

  // Checkbox indicators (multiple choice)
  checkboxDefault: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D4CFC5',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 0,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Correct/incorrect indicators
  indicatorCorrect: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.correct,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorIncorrect: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.incorrect,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Indicator text
  indicatorTextDefault: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  indicatorTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  indicatorTextWhite: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Confirm button (multiple choice)
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Explanation
  explanationCard: {
    marginTop: 20,
    borderRadius: 14,
    padding: 18,
    borderLeftWidth: 4,
  },
  explanationCorrect: {
    backgroundColor: '#F0F5F0',
    borderLeftColor: COLORS.correct,
  },
  explanationIncorrect: {
    backgroundColor: '#FDF0F0',
    borderLeftColor: COLORS.incorrect,
  },
  explanationLabel: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    fontWeight: '700',
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 14,
    color: '#5F5F5F',
    lineHeight: 21,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  nextButton: {
    backgroundColor: '#2E5A2E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});