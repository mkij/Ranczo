import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ScaledText } from '../src/components/ScaledText';
import { useQuizStore, HistoryEntry } from '../src/stores/quizStore';

const FILTERS = ['Wszystkie', 'Quiz dnia', 'Kategorie', 'Losowe'] as const;
type Filter = typeof FILTERS[number];

const CATEGORY_LABELS: Record<string, string> = {
  characters: 'Postacie',
  quotes: 'Cytaty',
  relationships: 'Relacje',
  actors: 'Kto zagrał...',
  plot: 'Fabuła',
  details: 'Detale',
};

function getQuizName(entry: HistoryEntry): string {
  if (entry.quizType === 'daily') return 'Quiz Dnia';
  if (entry.quizType === 'random') return 'Losowy Quiz';
  return CATEGORY_LABELS[entry.category ?? ''] ?? entry.category ?? 'Quiz';
}

function getTypeLabel(entry: HistoryEntry): string {
  if (entry.quizType === 'daily') return 'DZIENNY';
  if (entry.quizType === 'random') return 'LOSOWY';
  return 'KATEGORIA';
}

const CATEGORY_ICONS: Record<string, string> = {
  characters: '👤',
  quotes: '💬',
  relationships: '❤️',
  actors: '🎭',
  plot: '📖',
  details: '🔍',
};

function getTypeEmoji(entry: HistoryEntry): string {
  if (entry.quizType === 'daily') return '📅';
  if (entry.quizType === 'random') return '🎲';
  return CATEGORY_ICONS[entry.category ?? ''] ?? '❓';
}

function getPercentColor(percent: number): string {
  if (percent >= 80) return '#2E5A2E';
  if (percent >= 50) return '#B08A00';
  return '#C62828';
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
}

function filterHistory(history: HistoryEntry[], filter: Filter): HistoryEntry[] {
  if (filter === 'Wszystkie') return history;
  if (filter === 'Quiz dnia') return history.filter((e) => e.quizType === 'daily');
  if (filter === 'Kategorie') return history.filter((e) => e.quizType === 'category');
  if (filter === 'Losowe') return history.filter((e) => e.quizType === 'random');
  return history;
}

export default function HistoryScreen() {
  const router = useRouter();
  const history = useQuizStore((s) => s.history) ?? [];
  const [activeFilter, setActiveFilter] = useState<Filter>('Wszystkie');

  const filtered = filterHistory(history, activeFilter);

  // Stats
  const totalGames = history.length;
  const bestPercent = totalGames > 0 ? Math.max(...history.map((h) => h.percent)) : 0;
  const avgPercent = totalGames > 0
    ? Math.round(history.reduce((s, h) => s + h.percent, 0) / totalGames)
    : 0;

  const handleEntryPress = (entry: HistoryEntry) => {
    // TODO: navigate to detail view
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ScaledText style={styles.backButtonText}>← Wróć</ScaledText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <ScaledText style={styles.title}>Moje wyniki</ScaledText>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ScaledText style={styles.statValue}>{bestPercent}%</ScaledText>
            <ScaledText style={styles.statLabel}>NAJLEPSZY</ScaledText>
          </View>
          <View style={styles.statCard}>
            <ScaledText style={styles.statValue}>{avgPercent}%</ScaledText>
            <ScaledText style={styles.statLabel}>ŚREDNIA</ScaledText>
          </View>
          <View style={styles.statCard}>
            <ScaledText style={styles.statValue}>{totalGames}</ScaledText>
            <ScaledText style={styles.statLabel}>ROZEGRANYCH</ScaledText>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              activeOpacity={0.85}
              onPress={() => setActiveFilter(f)}
            >
              <ScaledText style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </ScaledText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* History list */}
        {filtered.length > 0 ? (
          filtered.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.historyCard}
              activeOpacity={0.7}
              onPress={() => handleEntryPress(entry)}
            >
              {/* Emoji */}
                <ScaledText style={styles.historyEmoji}>{getTypeEmoji(entry)}</ScaledText>

              {/* Text */}
              <View style={styles.historyContent}>
                <ScaledText style={styles.historyName}>{getQuizName(entry)}</ScaledText>
                <ScaledText style={styles.historyMeta}>
                  {getTypeLabel(entry)} · {formatDate(entry.date)}
                </ScaledText>
                <ScaledText style={styles.historyPoints}>
                  {entry.earnedPoints}/{entry.totalPoints} punktów
                </ScaledText>
              </View>

              {/* Percent */}
              <ScaledText style={[styles.historyPercent, { color: getPercentColor(entry.percent) }]}>
                {entry.percent}%
              </ScaledText>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <ScaledText style={styles.emptyEmoji}>🏡</ScaledText>
            <ScaledText style={styles.emptyTitle}>Jeszcze tu pusto!</ScaledText>
            <ScaledText style={styles.emptyDesc}>Zagraj quiz żeby zobaczyć swoje wyniki</ScaledText>
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Title
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2418',
    marginBottom: 20,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FEFDFB',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E2D8',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    color: '#2E5A2E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: '#9A8E7F',
    letterSpacing: 1,
  },

  // Filters
  filtersScroll: {
    marginBottom: 20,
  },
  filtersContent: {
    gap: 8,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F2EC',
  },
  filterPillActive: {
    backgroundColor: '#2E5A2E',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: '#9A8E7F',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // History card
  historyCard: {
    backgroundColor: '#FEFDFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 80,
  },
  historyEmoji: {
    fontSize: 28,
    width: 36,
    textAlign: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    color: '#2C2418',
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 12,
    color: '#9A8E7F',
    marginBottom: 2,
  },
  historyPoints: {
    fontSize: 11,
    color: '#B0A594',
  },
  historyPercent: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'DMSans_700Bold',
    minWidth: 56,
    textAlign: 'right',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2418',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#9A8E7F',
  },
});