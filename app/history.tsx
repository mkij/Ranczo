import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ScaledText } from '../src/components/ScaledText';
import { useQuizStore } from '../src/stores/quizStore';
import { getItem } from '../src/utils/storage';
import { Question } from '../src/types/quiz';

interface HistoryEntry {
    id: string;
    quizType: 'daily' | 'random' | 'category';
    category: string | null;
    percent: number;
    earnedPoints: number;
    totalPoints: number;
    correctCount: number;
    totalQuestions: number;
    date: string;
    questions: Question[];
    answers: Record<string, number[]>;
}

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

const CATEGORY_ICONS: Record<string, string> = {
    characters: '👤',
    quotes: '💬',
    relationships: '❤️',
    actors: '🎭',
    plot: '📖',
    details: '🔍',
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
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [activeFilter, setActiveFilter] = useState<Filter>('Wszystkie');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getItem('ranczo_history').then((raw) => {
            if (raw) {
                setHistory(JSON.parse(raw));
            }
            setLoaded(true);
        });
    }, []);

    const filtered = filterHistory(history, activeFilter);

    // Stats
    const totalGames = history.length;
    const bestPercent = totalGames > 0 ? Math.max(...history.map((h: HistoryEntry) => h.percent)) : 0;
    const avgPercent = totalGames > 0
        ? Math.round(history.reduce((sum: number, h: HistoryEntry) => sum + h.percent, 0) / totalGames)
        : 0;

    const handleEntryPress = (entry: HistoryEntry) => {
        useQuizStore.setState({
            questions: entry.questions,
            answers: entry.answers,
            quizType: entry.quizType,
            isFinished: true,
        });
        router.push('/result?review=true');
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
                {loaded && filtered.length > 0 ? (
                    filtered.map((entry) => (
                        <TouchableOpacity
                            key={entry.id}
                            style={styles.historyCard}
                            activeOpacity={0.7}
                            onPress={() => handleEntryPress(entry)}
                        >
                            <ScaledText style={styles.historyEmoji}>{getTypeEmoji(entry)}</ScaledText>

                            <View style={styles.historyContent}>
                                <View style={styles.historyNameRow}>
                                    <ScaledText style={styles.historyName}>{getQuizName(entry)}</ScaledText>
                                    <View style={[
                                        styles.historyBadge,
                                        entry.quizType === 'daily' && styles.historyBadgeDaily,
                                        entry.quizType === 'random' && styles.historyBadgeRandom,
                                        entry.quizType === 'category' && styles.historyBadgeCategory,
                                    ]}>
                                        <ScaledText style={[
                                            styles.historyBadgeText,
                                            entry.quizType === 'daily' && styles.historyBadgeTextDaily,
                                            entry.quizType === 'random' && styles.historyBadgeTextRandom,
                                            entry.quizType === 'category' && styles.historyBadgeTextCategory,
                                        ]}>
                                            {getTypeLabel(entry)}
                                        </ScaledText>
                                    </View>
                                </View>
                                <ScaledText style={styles.historyDate}>{formatDate(entry.date)}</ScaledText>
                                <ScaledText style={styles.historyStats}>
                                    {entry.correctCount}/{entry.totalQuestions} poprawnych | {entry.earnedPoints}/{entry.totalPoints} punktów
                                </ScaledText>
                            </View>

                            <View style={styles.historyPercentCol}>
                                <ScaledText style={[styles.historyPercent, { color: getPercentColor(entry.percent) }]}>
                                    {entry.percent}%
                                </ScaledText>
                                <View style={styles.progressTrack}>
                                    <View style={[
                                        styles.progressFill,
                                        { width: `${entry.percent}%`, backgroundColor: getPercentColor(entry.percent) },
                                    ]} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : loaded ? (
                    <View style={styles.emptyState}>
                        <ScaledText style={styles.emptyEmoji}>🏡</ScaledText>
                        <ScaledText style={styles.emptyTitle}>Jeszcze tu pusto!</ScaledText>
                        <ScaledText style={styles.emptyDesc}>Zagraj quiz żeby zobaczyć swoje wyniki</ScaledText>
                    </View>
                ) : null}
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
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 28,
        fontWeight: '700',
        color: '#2C2418',
        marginBottom: 20,
    },
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
    historyCard: {
    backgroundColor: '#FEFDFB',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 84,
  },
  historyEmoji: {
    fontSize: 26,
    width: 36,
    textAlign: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  historyName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    color: '#2C2418',
  },
  historyBadge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
  historyBadgeDaily: {
    backgroundColor: '#E8F0E8',
  },
  historyBadgeRandom: {
    backgroundColor: '#FFF8E0',
  },
  historyBadgeCategory: {
    backgroundColor: '#F5F2EC',
  },
  historyBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  historyBadgeTextDaily: {
    color: '#2E5A2E',
  },
  historyBadgeTextRandom: {
    color: '#B08A00',
  },
  historyBadgeTextCategory: {
    color: '#6B5B3E',
  },
  historyDate: {
    fontSize: 12,
    color: '#9A8E7F',
    marginBottom: 2,
  },
  historyStats: {
    fontSize: 11,
    color: '#B0A594',
  },
  historyPercentCol: {
    alignItems: 'flex-end',
    minWidth: 56,
  },
  historyPercent: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'DMSans_700Bold',
    textAlign: 'right',
    marginBottom: 6,
  },
  progressTrack: {
    width: 48,
    height: 5,
    backgroundColor: '#E8E2D8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
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