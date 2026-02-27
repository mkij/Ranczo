import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuizStore } from '../src/stores/quizStore';
import { Question } from '../src/types/quiz';
import { useEffect, useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { playSound } from '../src/utils/sounds';
import { getShareText } from '../src/utils/shareTexts';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';
import { ScaledText } from '../src/components/ScaledText';
import { getItem, setItem } from '../src/utils/storage';
import { useLocalSearchParams } from 'expo-router';


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

    const shareCardRef = useRef<View>(null);


    const handleShare = async () => {
        try {
            const text = getShareText(percent, quizType === 'daily');
            await Clipboard.setStringAsync(text);

            const uri = await captureRef(shareCardRef, {
                format: 'png',
                quality: 1,
            });

            Alert.alert(
                'Tekst skopiowany!',
                'Wklej go do wiadomości po wybraniu gdzie chcesz udostępnić.',
                [
                    {
                        text: 'Udostępnij',
                        onPress: async () => {
                            await Sharing.shareAsync(uri, {
                                mimeType: 'image/png',
                            });
                        },
                    },
                ]
            );
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
                useQuizStore.setState({ history: updated });
            });
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
                    <Text style={styles.levelEmoji}>{fanLevel.emoji}</Text>
                    <Text style={styles.levelLabel}>TWÓJ POZIOM</Text>
                    <Text style={styles.levelTitle}>{fanLevel.title}</Text>
                </View>

                {/* Score card */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreRow}>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreValue}>{earnedPoints}</Text>
                            <Text style={styles.scoreLabel}>punktów</Text>
                        </View>
                        <View style={styles.scoreDivider} />
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreValue}>{correctCount}/{questions.length}</Text>
                            <Text style={styles.scoreLabel}>poprawnych</Text>
                        </View>
                        <View style={styles.scoreDivider} />
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreValue}>{percent}%</Text>
                            <Text style={styles.scoreLabel}>wyniku</Text>
                        </View>
                    </View>
                </View>

                {/* Action buttons */}
                {!isReview && (
                    <>
                        <TouchableOpacity style={styles.shareButton} activeOpacity={0.85} onPress={handleShare}>
                            <Text style={styles.shareButtonText}>Udostępnij wynik</Text>
                        </TouchableOpacity>
                        <ScaledText style={styles.shareHint}>Tekst do wklejenia zostanie skopiowany</ScaledText>
                    </>
                )}

                {!isReview && quizType !== 'daily' && (
                    <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={handlePlayAgain}>
                        <Text style={styles.primaryButtonText}>Zagraj ponownie</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={isReview ? () => router.back() : handlePlayAgain}>
                    <Text style={styles.secondaryButtonText}>{isReview ? '← Wróć do historii' : 'Wróć do menu'}</Text>
                </TouchableOpacity>

                {/* Hidden share card */}
                {/* Hidden share card */}
                <View style={styles.shareCardWrapper}>
                    <View ref={shareCardRef} style={styles.shareCard} collapsable={false}>
                        {/* Green hero header */}
                        <View style={styles.shareCardHeader}>
                            <View style={styles.shareCardCircleTop} />
                            <View style={styles.shareCardCircleBottom} />
                            <Text style={styles.shareCardApp}>RANCZO QUIZ</Text>
                            <Text style={styles.shareCardQuizName}>
                                {quizType === 'daily' ? `Quiz Dnia — ${new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}` : quizType === 'category' ? `Kategoria: ${questions[0]?.category ?? ''}` : 'Losowy Quiz'}
                            </Text>
                            <Text style={styles.shareCardHeroScore}>
                                {earnedPoints}
                                <Text style={styles.shareCardHeroMax}>/{totalPoints}</Text>
                            </Text>
                            <Text style={styles.shareCardHeroLabel}>PUNKTÓW</Text>
                        </View>

                        {/* Bottom section */}
                        <View style={styles.shareCardBottom}>
                            <Text style={styles.shareCardEmoji}>{fanLevel.emoji}</Text>
                            <Text style={styles.shareCardLevel}>{fanLevel.title}</Text>
                            <Text style={styles.shareCardStats}>
                                {correctCount}/{questions.length} poprawnych | {percent}% wyniku
                            </Text>
                            <View style={styles.shareCardSeparator} />
                            <Text style={styles.shareCardFooter}>Zagraj w Quiz Ranczo</Text>
                        </View>
                    </View>
                </View>



                {/*
                
                <View style={styles.shareCardWrapper}>
                    <View ref={shareCardRef} style={styles.shareCard} collapsable={false}>
                        <Text style={styles.shareCardApp}>Ranczo Quiz</Text>
                        <Text style={styles.shareCardEmoji}>{fanLevel.emoji}</Text>
                        <Text style={styles.shareCardLevel}>{fanLevel.title}</Text>
                        <View style={styles.shareCardScoreRow}>
                            <View style={styles.shareCardScoreItem}>
                                <Text style={styles.shareCardScoreValue}>{earnedPoints}/{totalPoints}</Text>
                                <Text style={styles.shareCardScoreLabel}>punktów</Text>
                            </View>
                            <View style={styles.shareCardScoreDivider} />
                            <View style={styles.shareCardScoreItem}>
                                <Text style={styles.shareCardScoreValue}>{percent}%</Text>
                                <Text style={styles.shareCardScoreLabel}>wyniku</Text>
                            </View>
                        </View>
                        <Text style={styles.shareCardFooter}>A Ty ile wiesz o Ranczu? 🏡</Text>
                    </View>
                </View> */}

                {/* Answers review */}
                <Text style={styles.reviewTitle}>PRZEGLĄD ODPOWIEDZI</Text>

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
                                    <Text style={[
                                        styles.reviewIndicatorText,
                                        { color: correct ? '#2E5A2E' : '#C62828' },
                                    ]}>
                                        {correct ? '✓' : '✗'}
                                    </Text>
                                </View>
                                <Text style={styles.reviewNumber}>Pytanie {index + 1}</Text>
                                <View style={styles.reviewPointsBadge}>
                                    <Text style={styles.reviewPointsText}>
                                        {correct ? `+${q.points}` : '+0'} pkt
                                    </Text>
                                </View>
                            </View>

                            {/* Question text */}
                            <Text style={styles.reviewQuestion}>{q.question}</Text>

                            {/* Answers */}
                            {!correct && (
                                <View style={styles.reviewAnswerRow}>
                                    <Text style={styles.reviewAnswerLabel}>Twoja odpowiedź:</Text>
                                    <Text style={styles.reviewAnswerWrong}>{selectedOptions}</Text>
                                </View>
                            )}
                            <View style={styles.reviewAnswerRow}>
                                <Text style={styles.reviewAnswerLabel}>Poprawna:</Text>
                                <Text style={styles.reviewAnswerCorrect}>{correctOptions}</Text>
                            </View>

                            {/* Explanation */}
                            <View style={styles.reviewExplanation}>
                                <Text style={styles.reviewExplanationText}>{q.explanation}</Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
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
        borderRadius: 24,
        overflow: 'hidden',
    },
    shareCardHeader: {
        backgroundColor: '#2E5A2E',
        paddingTop: 36,
        paddingBottom: 32,
        paddingHorizontal: 28,
        alignItems: 'center',
        overflow: 'hidden',
    },
    shareCardCircleTop: {
        position: 'absolute',
        top: -25,
        right: -25,
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    shareCardCircleBottom: {
        position: 'absolute',
        bottom: -20,
        left: -15,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    shareCardApp: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: 3,
        marginBottom: 8,
    },
    shareCardQuizName: {
        fontSize: 13,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 20,
    },
    shareCardHeroScore: {
        fontSize: 56,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    shareCardHeroMax: {
        fontSize: 28,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.5)',
    },
    shareCardHeroLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 2,
    },
    shareCardBottom: {
        backgroundColor: '#FAF8F3',
        paddingTop: 28,
        paddingBottom: 32,
        paddingHorizontal: 28,
        alignItems: 'center',
    },
    shareCardEmoji: {
        fontSize: 52,
        marginBottom: 10,
    },
    shareCardLevel: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2C2418',
        textAlign: 'center',
        marginBottom: 16,
    },
    shareCardStats: {
        fontSize: 13,
        color: '#9A8E7F',
        marginBottom: 20,
    },
    shareCardSeparator: {
        width: 40,
        height: 1,
        backgroundColor: '#E8E2D8',
        marginBottom: 20,
    },
    shareCardFooter: {
        fontSize: 14,
        fontWeight: '400',
        color: '#9A8E7F',
    },
    shareHint: {
        fontSize: 12,
        color: '#9A8E7F',
        textAlign: 'center',
        marginBottom: 10,
    },
});