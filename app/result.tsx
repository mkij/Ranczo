import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuizStore } from '../src/stores/quizStore';
import { Question } from '../src/types/quiz';
import { useEffect, useRef, useState } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { playSound } from '../src/utils/sounds';
import { ScaledText } from '../src/components/ScaledText';
import { getCurrentRank, getNextRank, getPointsToNext, getProgressPercent, DAILY_BONUS } from '../src/utils/fanLevel';
import { useLocalSearchParams } from 'expo-router';
import { getItem, setItem } from '../src/utils/storage';





// Fan levels based on percentage
function getFanLevel(percent: number): { title: string; emoji: string } {
    if (percent >= 95) return { title: 'Wójt Wilkowyj', emoji: '👑' };
    if (percent >= 80) return { title: 'Radny gminy', emoji: '🏛️' };
    if (percent >= 65) return { title: 'Stały bywalec ławeczki', emoji: '🪑' };
    if (percent >= 45) return { title: 'Mieszkaniec Wilkowyj', emoji: '🏡' };
    if (percent >= 25) return { title: 'Nowy w gminie', emoji: '🚗' };
    return { title: 'Turysta', emoji: '🗺️' };
}

function isCorrectAnswer(q: Question, selected: number[]): boolean {
    if (selected.length !== q.correctAnswers.length) return false;
    const sortedSelected = [...selected].sort();
    const sortedCorrect = [...q.correctAnswers].sort();
    return sortedSelected.every((val, i) => val === sortedCorrect[i]);
}

export default function ResultScreen() {
    const router = useRouter();
    const { questions, answers, resetQuiz, updateBestScore, completeDailyQuiz, quizType } = useQuizStore();
    const { review } = useLocalSearchParams<{ review?: string }>();
    const isReview = review === 'true';
    const [newRank, setNewRank] = useState<{ title: string; emoji: string } | null>(null);

    // Calculate results
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = questions.reduce((sum, q) => {
        const ans = answers[q.id];
        if (!ans) return sum;
        return sum + (isCorrectAnswer(q, ans) ? q.points : 0);
    }, 0);

    const correctCount = questions.filter((q) => {
        const ans = answers[q.id];
        return ans && isCorrectAnswer(q, ans);
    }).length;

    const percent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const fanLevel = getFanLevel(percent);
    const totalFanPoints = useQuizStore((s) => s.totalFanPoints);
    const currentRank = getCurrentRank(totalFanPoints);
    const nextRank = getNextRank(totalFanPoints);
    const pointsToNext = getPointsToNext(totalFanPoints);
    const rankProgress = getProgressPercent(totalFanPoints);
    const isDaily = quizType === 'daily';


    const shareCardRef = useRef<View>(null);


    const handleShare = async () => {
        try {
            const uri = await captureRef(shareCardRef, {
                format: 'png',
                quality: 1,
            });
            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Udostępnij wynik',
            });
        } catch {
            // Ignore share errors
        }
    };

    // Save best score on first render
    useEffect(() => {
        if (questions.length > 0 && !isReview) {
            const category = questions[0].category;
            updateBestScore(category, earnedPoints);
            if (quizType === 'daily') {
                completeDailyQuiz();
            }
            playSound('complete');

            // Save to history
            const entry = {
                id: Date.now().toString(),
                quizType,
                category: quizType === 'category' ? category : null,
                percent,
                earnedPoints,
                totalPoints,
                correctCount,
                totalQuestions: questions.length,
                date: new Date().toISOString(),
                questions,
                answers,
            };
            getItem('ranczo_history').then((raw) => {
                const existing = raw ? JSON.parse(raw) : [];
                const updated = [entry, ...existing].slice(0, 100);
                setItem('ranczo_history', JSON.stringify(updated));
            });

            // Add fan points
            const fanPoints = earnedPoints + (quizType === 'daily' ? DAILY_BONUS : 0);
            const beforePoints = useQuizStore.getState().totalFanPoints;
            const rankBefore = getCurrentRank(beforePoints);
            useQuizStore.getState().addFanPoints(fanPoints);
            const afterPoints = beforePoints + fanPoints;
            const rankAfter = getCurrentRank(afterPoints);
            if (rankAfter.points > rankBefore.points) {
                setNewRank(rankAfter);
            }
        }
    }, []);

    const handlePlayAgain = () => {
        resetQuiz();
        router.replace('/');
    };

    const handleReviewAnswers = () => {
        // Scroll down to answers - already visible below
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Fan level */}
                <View style={styles.levelSection}>
                    <ScaledText style={styles.levelEmoji}>{fanLevel.emoji}</ScaledText>
                    <ScaledText style={styles.levelLabel}>OCENA</ScaledText>
                    <ScaledText style={styles.levelTitle}>{fanLevel.title}</ScaledText>
                </View>

                {/* Score card */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreRow}>
                        <View style={styles.scoreItem}>
                            <ScaledText style={styles.scoreValue}>{earnedPoints}</ScaledText>
                            <ScaledText style={styles.scoreLabel}>punktów</ScaledText>
                        </View>
                        <View style={styles.scoreDivider} />
                        <View style={styles.scoreItem}>
                            <ScaledText style={styles.scoreValue}>{correctCount}/{questions.length}</ScaledText>
                            <ScaledText style={styles.scoreLabel}>poprawnych</ScaledText>
                        </View>
                        <View style={styles.scoreDivider} />
                        <View style={styles.scoreItem}>
                            <ScaledText style={styles.scoreValue}>{percent}%</ScaledText>
                            <ScaledText style={styles.scoreLabel}>wyniku</ScaledText>
                        </View>
                    </View>
                </View>

                {/* Action buttons */}
                <TouchableOpacity style={styles.shareButton} activeOpacity={0.85} onPress={handleShare}>
                    <ScaledText style={styles.shareButtonText}>📤 Udostępnij wynik</ScaledText>
                </TouchableOpacity>

                {quizType !== 'daily' && (
                    <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={handlePlayAgain}>
                        <ScaledText style={styles.primaryButtonText}>Zagraj ponownie</ScaledText>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={handlePlayAgain}>
                    <ScaledText style={styles.secondaryButtonText}>Wróć do menu</ScaledText>
                </TouchableOpacity>

                {/* Hidden share card */}
                <View style={styles.shareCardWrapper}>
                    <View ref={shareCardRef} style={styles.shareCard} collapsable={false}>
                        <ScaledText style={styles.shareCardApp}>Ranczo Quiz</ScaledText>
                        <ScaledText style={styles.shareCardEmoji}>{fanLevel.emoji}</ScaledText>
                        <ScaledText style={styles.shareCardLevel}>{fanLevel.title}</ScaledText>
                        <View style={styles.shareCardScoreRow}>
                            <View style={styles.shareCardScoreItem}>
                                <ScaledText style={styles.shareCardScoreValue}>{earnedPoints}/{totalPoints}</ScaledText>
                                <ScaledText style={styles.shareCardScoreLabel}>punktów</ScaledText>
                            </View>
                            <View style={styles.shareCardScoreDivider} />
                            <View style={styles.shareCardScoreItem}>
                                <ScaledText style={styles.shareCardScoreValue}>{percent}%</ScaledText>
                                <ScaledText style={styles.shareCardScoreLabel}>wyniku</ScaledText>
                            </View>
                        </View>
                        <ScaledText style={styles.shareCardFooter}>A Ty ile wiesz o Ranczu? 🏡</ScaledText>
                    </View>
                </View>

                {/* Fan points breakdown */}
                {!isReview && (
                    <View style={styles.fanPointsCard}>
                        <View style={styles.fanPointsRow}>
                            <ScaledText style={styles.fanPointsLabel}>+{earnedPoints} pkt do poziomu fana</ScaledText>
                        </View>
                        {isDaily && (
                            <View style={styles.fanPointsRow}>
                                <ScaledText style={styles.fanPointsBonus}>+{DAILY_BONUS} bonus za Quiz Dnia 🎁</ScaledText>
                            </View>
                        )}
                        <View style={styles.fanPointsDivider} />
                        <View style={styles.fanPointsRow}>
                            <ScaledText style={styles.fanPointsTotal}>
                                {earnedPoints + (isDaily ? DAILY_BONUS : 0)} punktów do poziomu fana
                            </ScaledText>
                        </View>

                        {nextRank && (
                            <View style={styles.fanProgressSection}>
                                <View style={styles.fanProgressBar}>
                                    <View style={[styles.fanProgressFill, { width: `${rankProgress}%` }]} />
                                </View>
                                <ScaledText style={styles.fanProgressText}>
                                    Do poziomu „{nextRank.title}" brakuje {pointsToNext} punktów
                                </ScaledText>
                            </View>
                        )}

                        {!nextRank && (
                            <ScaledText style={styles.fanMaxLevel}>
                                👑 Osiągnięto najwyższy poziom!
                            </ScaledText>
                        )}

                        {isDaily && (
                            <ScaledText style={styles.dailyTomorrow}>Jutro nowy Quiz Dnia!</ScaledText>
                        )}
                    </View>
                )}

                {/* Answers review */}
                <ScaledText style={styles.reviewTitle}>PRZEGLĄD ODPOWIEDZI</ScaledText>

                {questions.map((q, index) => {
                    const ans = answers[q.id];
                    const correct = ans ? isCorrectAnswer(q, ans) : false;
                    const selectedOptions = ans
                        ? ans.map((i) => q.options[i]).join(', ')
                        : 'Brak odpowiedzi';
                    const correctOptions = q.correctAnswers.map((i) => q.options[i]).join(', ');

                    return (
                        <View key={q.id} style={styles.reviewCard}>
                            {/* Question header */}
                            <View style={styles.reviewHeader}>
                                <View style={[
                                    styles.reviewIndicator,
                                    { backgroundColor: correct ? '#E8F5E8' : '#FDE8E8' },
                                ]}>
                                    <ScaledText style={[
                                        styles.reviewIndicatorText,
                                        { color: correct ? '#2E5A2E' : '#C62828' },
                                    ]}>
                                        {correct ? '✓' : '✗'}
                                    </ScaledText>
                                </View>
                                <ScaledText style={styles.reviewNumber}>Pytanie {index + 1}</ScaledText>
                                <View style={styles.reviewPointsBadge}>
                                    <ScaledText style={styles.reviewPointsText}>
                                        {correct ? `+${q.points}` : '+0'} pkt
                                    </ScaledText>
                                </View>
                            </View>

                            {/* Question text */}
                            <ScaledText style={styles.reviewQuestion}>{q.question}</ScaledText>

                            {/* Answers */}
                            {!correct && (
                                <View style={styles.reviewAnswerRow}>
                                    <ScaledText style={styles.reviewAnswerLabel}>Twoja odpowiedź:</ScaledText>
                                    <ScaledText style={styles.reviewAnswerWrong}>{selectedOptions}</ScaledText>
                                </View>
                            )}
                            <View style={styles.reviewAnswerRow}>
                                <ScaledText style={styles.reviewAnswerLabel}>Poprawna:</ScaledText>
                                <ScaledText style={styles.reviewAnswerCorrect}>{correctOptions}</ScaledText>
                            </View>

                            {/* Explanation */}
                            <View style={styles.reviewExplanation}>
                                <ScaledText style={styles.reviewExplanationText}>{q.explanation}</ScaledText>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
            {/* Rank up modal */}
            {newRank && (
                <View style={styles.rankUpOverlay}>
                    <View style={styles.rankUpCard}>
                        <ScaledText style={styles.rankUpEmoji}>{newRank.emoji}</ScaledText>
                        <ScaledText style={styles.rankUpLabel}>AWANS!</ScaledText>
                        <ScaledText style={styles.rankUpSubtitle}>Nowy poziom fana:</ScaledText>
                        <ScaledText style={styles.rankUpTitle}>{newRank.title}</ScaledText>
                        <TouchableOpacity
                            style={styles.rankUpButton}
                            activeOpacity={0.85}
                            onPress={() => setNewRank(null)}
                        >
                            <ScaledText style={styles.rankUpButtonText}>Świetnie!</ScaledText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FAF8F3',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 60,
    },

    // Fan level
    levelSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    levelEmoji: {
        fontSize: 56,
        marginBottom: 12,
    },
    levelLabel: {
        fontSize: 11,
        fontWeight: '600',
        fontFamily: 'DMSans_600SemiBold',
        color: '#9A8E7F',
        letterSpacing: 3,
        marginBottom: 6,
    },
    levelTitle: {
        fontSize: 26,
        fontFamily: 'PlayfairDisplay_700Bold',
        fontWeight: '700',
        color: '#2C2418',
        textAlign: 'center',
    },

    // Score card
    scoreCard: {
        backgroundColor: '#FEFDFB',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E8E2D8',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    scoreItem: {
        alignItems: 'center',
        flex: 1,
    },
    scoreValue: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        fontWeight: '700',
        color: '#2E5A2E',
        marginBottom: 4,
    },
    scoreLabel: {
        fontSize: 12,
        color: '#9A8E7F',
        fontWeight: '500',
    },
    scoreDivider: {
        width: 1,
        height: 36,
        backgroundColor: '#E8E2D8',
    },

    // Buttons
    primaryButton: {
        backgroundColor: '#2E5A2E',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    primaryButtonText: {
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    secondaryButton: {
        backgroundColor: '#FEFDFB',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 28,
        borderWidth: 1,
        borderColor: '#E8E2D8',
    },
    secondaryButtonText: {
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        fontWeight: '600',
        color: '#2C2418',
        letterSpacing: 0.3,
    },

    // Review
    reviewTitle: {
        fontSize: 11,
        fontFamily: 'DMSans_600SemiBold',
        fontWeight: '600',
        color: '#9A8E7F',
        letterSpacing: 3,
        marginBottom: 16,
    },
    reviewCard: {
        backgroundColor: '#FEFDFB',
        borderRadius: 14,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8E2D8',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    reviewIndicator: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewIndicatorText: {
        fontSize: 14,
        fontWeight: '700',
    },
    reviewNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C2418',
        flex: 1,
    },
    reviewPointsBadge: {
        backgroundColor: '#F5F2EC',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    reviewPointsText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#B0A594',
    },
    reviewQuestion: {
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        fontWeight: '600',
        color: '#2C2418',
        lineHeight: 21,
        marginBottom: 12,
    },
    reviewAnswerRow: {
        flexDirection: 'row',
        marginBottom: 4,
        gap: 6,
    },
    reviewAnswerLabel: {
        fontSize: 13,
        color: '#9A8E7F',
    },
    reviewAnswerWrong: {
        fontSize: 13,
        fontWeight: '600',
        color: '#C62828',
        flex: 1,
    },
    reviewAnswerCorrect: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2E5A2E',
        flex: 1,
    },
    reviewExplanation: {
        marginTop: 10,
        backgroundColor: '#F5F2EC',
        borderRadius: 10,
        padding: 12,
    },
    reviewExplanationText: {
        fontSize: 13,
        color: '#5F5F5F',
        lineHeight: 19,
    },
    // Share button
    shareButton: {
        backgroundColor: '#2E5A2E',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    shareButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },

    // Hidden share card
    shareCardWrapper: {
        position: 'absolute',
        left: -9999,
        top: 0,
    },
    shareCard: {
        width: 360,
        backgroundColor: '#FAF8F3',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E8E2D8',
    },
    shareCardApp: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9A8E7F',
        letterSpacing: 2,
        marginBottom: 16,
    },
    shareCardEmoji: {
        fontSize: 64,
        marginBottom: 12,
    },
    shareCardLevel: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2C2418',
        textAlign: 'center',
        marginBottom: 20,
    },
    shareCardScoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEFDFB',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#E8E2D8',
        marginBottom: 20,
        gap: 20,
    },
    shareCardScoreItem: {
        alignItems: 'center',
    },
    shareCardScoreValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2E5A2E',
        marginBottom: 2,
    },
    shareCardScoreLabel: {
        fontSize: 12,
        color: '#9A8E7F',
    },
    shareCardScoreDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#E8E2D8',
    },
    shareCardFooter: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2C2418',
        textAlign: 'center',
    },
    // Fan points
    fanPointsCard: {
        backgroundColor: '#FEFDFB',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E8E2D8',
    },
    fanPointsRow: {
        marginBottom: 6,
    },
    fanPointsLabel: {
        fontSize: 14,
        color: '#2C2418',
        fontWeight: '500',
    },
    fanPointsBonus: {
        fontSize: 14,
        color: '#2E5A2E',
        fontWeight: '600',
    },
    fanPointsDivider: {
        height: 1,
        backgroundColor: '#E8E2D8',
        marginVertical: 10,
    },
    fanPointsTotal: {
        fontSize: 15,
        color: '#2C2418',
        fontWeight: '700',
        fontFamily: 'DMSans_700Bold',
    },
    fanProgressSection: {
        marginTop: 16,
    },
    fanProgressBar: {
        height: 8,
        backgroundColor: '#E8E2D8',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 10,
    },
    fanProgressFill: {
        height: '100%',
        backgroundColor: '#2E5A2E',
        borderRadius: 4,
    },
    fanProgressText: {
        fontSize: 13,
        color: '#9A8E7F',
        textAlign: 'center',
    },
    fanMaxLevel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E5A2E',
        textAlign: 'center',
        marginTop: 12,
    },
    dailyTomorrow: {
        fontSize: 14,
        fontWeight: '600',
        color: '#B08A00',
        textAlign: 'center',
        marginTop: 14,
    },
    // Rank up modal
  rankUpOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  rankUpCard: {
    backgroundColor: '#FAF8F3',
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#E8E2D8',
  },
  rankUpEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  rankUpLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    color: '#2E5A2E',
    letterSpacing: 4,
    marginBottom: 8,
  },
  rankUpTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2C2418',
    textAlign: 'center',
    marginBottom: 28,
  },
  rankUpSubtitle: {
    fontSize: 14,
    color: '#9A8E7F',
    marginBottom: 4,
  },
  rankUpButton: {
    backgroundColor: '#2E5A2E',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  rankUpButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});