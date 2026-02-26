import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuizStore } from '../src/stores/quizStore';
import { Category } from '../src/types/quiz';
import { getRandomQuestions, getCategoryQuestionCount } from '../src/data/questionLoader';
import { ScaledText } from '../src/components/ScaledText';



const CATEGORY_LABELS: Record<Category, string> = {
  characters: 'Postacie',
  quotes: 'Cytaty',
  relationships: 'Relacje',
  actors: 'Kto zagrał...',
  plot: 'Fabuła',
  details: 'Detale',
};

const CATEGORY_ICONS: Record<Category, string> = {
  characters: '👤',
  quotes: '💬',
  relationships: '❤️',
  actors: '🎭',
  plot: '📖',
  details: '🔍',
};

export default function CategoryScreen() {
  const router = useRouter();
  const { key } = useLocalSearchParams<{ key: string }>();
  const category = key as Category;

  const startQuiz = useQuizStore((s) => s.startQuiz);
  const difficultyFilter = useQuizStore((s) => s.difficultyFilter);
  const setDifficultyFilter = useQuizStore((s) => s.setDifficultyFilter);
  const bestScores = useQuizStore((s) => s.bestScores);
  const questionsPerQuiz = 10;

  const totalQuestions = getCategoryQuestionCount(category);
  
  const best = bestScores[category];
  const label = CATEGORY_LABELS[category] ?? category;
  const icon = CATEGORY_ICONS[category] ?? '❓';

  const handleStart = () => {
    const questions = getRandomQuestions(questionsPerQuiz, {
      category,
      fansOnly: difficultyFilter === 'fans_only',
    });
    startQuiz(questions);
    router.push('/quiz');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Back button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ScaledText style={styles.backButtonText}>← Wróć</ScaledText>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Category info */}
        <View style={styles.iconContainer}>
          <ScaledText style={styles.icon}>{icon}</ScaledText>
        </View>
        <ScaledText style={styles.title}>{label}</ScaledText>
        <ScaledText style={styles.subtitle}>{totalQuestions} pytań w puli</ScaledText>

        {best !== undefined && (
          <View style={styles.bestScoreBadge}>
            <ScaledText style={styles.bestScoreText}>Najlepszy wynik: {best}</ScaledText>
          </View>
        )}

        {/* Difficulty selection */}
        <ScaledText style={styles.difficultyLabel}>POZIOM</ScaledText>
        <View style={styles.difficultyRow}>
          <TouchableOpacity
            style={[
              styles.difficultyOption,
              difficultyFilter === 'mixed' && styles.difficultyOptionActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setDifficultyFilter('mixed')}
          >
            <ScaledText style={[
              styles.difficultyTitle,
              difficultyFilter === 'mixed' && styles.difficultyTitleActive,
            ]}>
              Mieszany
            </ScaledText>
            <ScaledText style={[
              styles.difficultyDesc,
              difficultyFilter === 'mixed' && styles.difficultyDescActive,
            ]}>
              dla wszystkich
            </ScaledText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.difficultyOption,
              difficultyFilter === 'fans_only' && styles.difficultyOptionActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setDifficultyFilter('fans_only')}
          >
            <ScaledText style={[
              styles.difficultyTitle,
              difficultyFilter === 'fans_only' && styles.difficultyTitleActive,
            ]}>
              Tylko dla fanów
            </ScaledText>
            <ScaledText style={[
              styles.difficultyDesc,
              difficultyFilter === 'fans_only' && styles.difficultyDescActive,
            ]}>
              trudne pytania
            </ScaledText>
          </TouchableOpacity>
        </View>

        {/* Start button */}
        <TouchableOpacity style={styles.startButton} activeOpacity={0.85} onPress={handleStart}>
          <ScaledText style={styles.startButtonText}>GRAJ</ScaledText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E5A2E',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  // Category info
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#F5F2EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 34,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2C2418',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#9A8E7F',
    marginBottom: 16,
  },
  bestScoreBadge: {
    backgroundColor: '#E8F0E8',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 32,
  },
  bestScoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E5A2E',
  },

  // Difficulty
  difficultyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9A8E7F',
    letterSpacing: 3,
    marginBottom: 12,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
    width: '100%',
  },
  difficultyOption: {
    flex: 1,
    backgroundColor: '#FEFDFB',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E2D8',
  },
  difficultyOptionActive: {
    borderColor: '#2E5A2E',
    backgroundColor: '#F0F5F0',
  },
  difficultyTitle: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    color: '#2C2418',
    marginBottom: 3,
  },
  difficultyTitleActive: {
    color: '#2E5A2E',
  },
  difficultyDesc: {
    fontSize: 12,
    color: '#9A8E7F',
  },
  difficultyDescActive: {
    color: '#2E5A2E',
  },

  // Start button
  startButton: {
    backgroundColor: '#2E5A2E',
    borderRadius: 14,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 17,
    fontFamily: 'DMSans_700Bold',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});