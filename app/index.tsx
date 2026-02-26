import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../src/constants/theme';
import { useQuizStore } from '../src/stores/quizStore';
import { Category } from '../src/types/quiz';
import { getCategoryQuestionCount } from '../src/data/questionLoader';
import { useRouter } from 'expo-router';
import { getRandomQuestions, getDailyQuestions } from '../src/data/questionLoader';

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'characters', label: 'Postacie', icon: '👤' },
  { key: 'quotes', label: 'Cytaty', icon: '💬' },
  { key: 'relationships', label: 'Relacje', icon: '❤️' },
  { key: 'actors', label: 'Kto zagrał...', icon: '🎭' },
  { key: 'plot', label: 'Fabuła', icon: '📖' },
  { key: 'details', label: 'Detale', icon: '🔍' },
];

export default function HomeScreen() {
  const bestScores = useQuizStore((s) => s.bestScores);

  const router = useRouter();
  const startQuiz = useQuizStore((s) => s.startQuiz);
  const isDailyCompleted = useQuizStore((s) => s.isDailyCompleted);

  const handleDailyQuiz = () => {
    if (isDailyCompleted()) {
      return;
    }
    const questions = getDailyQuestions(10);
    startQuiz(questions, 'daily');
    router.push('/quiz');
  };

  const handleRandomQuiz = () => {
    const questions = getRandomQuestions(10);
    startQuiz(questions, 'random');
    router.push('/quiz');
  };

  const handleCategoryQuiz = (category: Category) => {
    router.push({ pathname: '/category', params: { key: category } });
  };

  const todayFormatted = new Date().toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>WITAJ W</Text>
          <Text style={styles.title}>Ranczo Quiz</Text>
        </View>

        {/* Daily Challenge */}
        <TouchableOpacity
          style={[styles.dailyCard, isDailyCompleted() && styles.dailyCardCompleted]}
          activeOpacity={isDailyCompleted() ? 1 : 0.85}
          onPress={handleDailyQuiz}
        >
          {/* Decorative circles */}
          <View style={styles.dailyCircleTop} />
          <View style={styles.dailyCircleBottom} />

          <View style={styles.dailyContent}>
            <View style={styles.dailyTop}>
              <View>
                <Text style={styles.dailyLabel}>QUIZ DNIA</Text>
                <Text style={styles.dailyDate}>{todayFormatted}</Text>
                <Text style={styles.dailySubtext}>10 pytań · jedna szansa dziennie</Text>
              </View>
              <View style={styles.dailyIcon}>
                <Text style={styles.dailyIconText}>📅</Text>
              </View>
            </View>

            <View style={styles.dailyButton}>
              <Text style={styles.dailyButtonText}>
                {isDailyCompleted() ? 'Wróć jutro po nowe pytania!' : 'Zagraj teraz →'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Play */}
        <TouchableOpacity style={styles.quickPlayCard} activeOpacity={0.85} onPress={handleRandomQuiz}>
          <View style={styles.quickPlayLeft}>
            <View style={styles.quickPlayIcon}>
              <Text style={styles.quickPlayIconText}>🎲</Text>
            </View>
            <View>
              <Text style={styles.quickPlayTitle}>Losowy Quiz</Text>
              <Text style={styles.quickPlaySubtext}>Mieszanka ze wszystkiego</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Categories */}
        <Text style={styles.sectionLabel}>KATEGORIE</Text>

        {CATEGORIES.map((cat) => {
          const best = bestScores[cat.key];
          const count = getCategoryQuestionCount(cat.key);

          return (
            <Pressable
                key={cat.key}
                onPress={() => handleCategoryQuiz(cat.key)}
                style={({ pressed }) => [
                  styles.categoryCard,
                  pressed && styles.categoryCardPressed,
                ]}
              >
              <View style={styles.categoryLeft}>
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryIconText}>{cat.icon}</Text>
                </View>
                <View>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                  <Text style={styles.categoryCount}>{count} pytań</Text>
                </View>
              </View>
              <View style={styles.categoryRight}>
                {best !== undefined && (
                  <View style={styles.bestScoreBadge}>
                    <Text style={styles.bestScoreText}>{best}</Text>
                  </View>
                )}
                <Text style={styles.chevronSmall}>›</Text>
              </View>
            </Pressable>
          );
        })}

        {/* Settings */}
        <TouchableOpacity
          style={styles.settingsButton}
          activeOpacity={0.85}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
          <Text style={styles.settingsText}>Ustawienia</Text>
        </TouchableOpacity>

        {/* Fan Level */}
        <View style={styles.levelCard}>
          <Text style={styles.levelLabel}>TWÓJ POZIOM</Text>
          <Text style={styles.levelTitle}>Stały bywalec ławeczki</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerLabel: {
    fontSize: FONT_SIZES.label,
    fontFamily: 'DMSans_500Medium',
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: 3,
    marginBottom: 4,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontWeight: '700',
    color: COLORS.text,
  },

  // Daily Challenge
  dailyCard: {
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
  },
  dailyCircleTop: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dailyCircleBottom: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dailyContent: {
    zIndex: 1,
  },
  dailyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dailyLabel: {
    fontSize: FONT_SIZES.label,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 3,
    marginBottom: 6,
  },
  dailyDate: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  dailySubtext: {
    fontSize: FONT_SIZES.caption,
    color: 'rgba(255,255,255,0.75)',
  },
  dailyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyIconText: {
    fontSize: 22,
  },
  dailyButton: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dailyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: 'DMSans_600SemiBold',
  },

  // Quick Play
  quickPlayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPlayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickPlayIcon: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
  },
  quickPlayIconText: {
    fontSize: 22,
  },
  quickPlayTitle: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    color: COLORS.text,
  },
  quickPlaySubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textMuted,
    fontWeight: '300',
  },

  // Categories
  sectionLabel: {
    fontSize: FONT_SIZES.label,
    fontFamily: 'DMSans_600SemiBold', 
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 3,
    marginBottom: SPACING.md,
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    //shadowColor: COLORS.shadow,
    //shadowOffset: { width: 0, height: 1 },
    //shadowOpacity: 0.02,
    //shadowRadius: 3,
    //elevation: 1,
  },
  categoryCardPressed: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    fontSize: 21,
  },
  categoryLabel: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryCount: {
    fontSize: FONT_SIZES.label,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bestScoreBadge: {
    backgroundColor: COLORS.bestScoreBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  bestScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.bestScoreText,
  },
  chevronSmall: {
    fontSize: 18,
    color: COLORS.textMuted,
    fontWeight: '300',
  },

  // Level card
  levelCard: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  levelLabel: {
    fontSize: FONT_SIZES.label,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  levelTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontWeight: '700',
    color: COLORS.text,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  settingsIcon: {
    fontSize: 18,
  },
  settingsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9A8E7F',
  },
  dailyCardCompleted: {
    opacity: 0.6,
  },
});