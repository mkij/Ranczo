import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../src/stores/settingsStore';
import { FontScale } from '../src/constants/theme';
import { useQuizStore } from '../src/stores/quizStore';

const FONT_SCALE_OPTIONS: { key: FontScale; label: string; size: number }[] = [
  { key: 'small', label: 'A', size: 14 },
  { key: 'normal', label: 'A', size: 18 },
  { key: 'large', label: 'A', size: 22 },
];

const QUESTIONS_OPTIONS = [10, 15, 20];

export default function SettingsScreen() {
  const router = useRouter();
  const {
    fontScale,
    soundEnabled,
    questionsPerQuiz,
    setFontScale,
    setSoundEnabled,
    setQuestionsPerQuiz,
  } = useSettingsStore();

  const clearAllProgress = useQuizStore((s) => s.clearAllProgress);

  const handleClearProgress = () => {
    Alert.alert(
      'Wyczyść postęp',
      'Na pewno chcesz usunąć wszystkie wyniki? Tego nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Wyczyść', style: 'destructive', onPress: clearAllProgress },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Wróć</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Ustawienia</Text>

        {/* Font size */}
        <Text style={styles.sectionLabel}>ROZMIAR TEKSTU</Text>
        <View style={styles.fontScaleRow}>
          {FONT_SCALE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.fontScaleOption,
                fontScale === opt.key && styles.fontScaleOptionActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setFontScale(opt.key)}
            >
              <Text style={[
                styles.fontScaleText,
                { fontSize: opt.size },
                fontScale === opt.key && styles.fontScaleTextActive,
              ]}>
                {opt.label}
              </Text>
              <Text style={[
                styles.fontScaleLabel,
                fontScale === opt.key && styles.fontScaleLabelActive,
              ]}>
                {opt.key === 'small' ? 'mały' : opt.key === 'normal' ? 'normalny' : 'duży'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Questions per quiz */}
        <Text style={styles.sectionLabel}>LICZBA PYTAŃ W QUIZIE</Text>
        <View style={styles.questionsRow}>
          {QUESTIONS_OPTIONS.map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.questionsOption,
                questionsPerQuiz === count && styles.questionsOptionActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setQuestionsPerQuiz(count)}
            >
              <Text style={[
                styles.questionsText,
                questionsPerQuiz === count && styles.questionsTextActive,
              ]}>
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sound */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>Dźwięki</Text>
            <Text style={styles.switchDesc}>Efekty przy odpowiedziach</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#E8E2D8', true: '#A5CBA5' }}
            thumbColor={soundEnabled ? '#2E5A2E' : '#FEFDFB'}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Links */}
        <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
          <Text style={styles.linkText}>Oceń aplikację</Text>
          <Text style={styles.linkChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
          <Text style={styles.linkText}>Zgłoś błąd / Kontakt</Text>
          <Text style={styles.linkChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
          <Text style={styles.linkText}>Polityka prywatności</Text>
          <Text style={styles.linkChevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Reset */}
                <TouchableOpacity style={styles.resetButton} activeOpacity={0.85} onPress={handleClearProgress}>

          <Text style={styles.resetButtonText}>Wyczyść postęp</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Ranczo Quiz v1.0.0</Text>
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
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontWeight: '700',
    color: '#2C2418',
    marginBottom: 28,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    color: '#9A8E7F',
    letterSpacing: 3,
    marginBottom: 12,
  },

  // Font scale
  fontScaleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  fontScaleOption: {
    flex: 1,
    backgroundColor: '#FEFDFB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E2D8',
  },
  fontScaleOptionActive: {
    borderColor: '#2E5A2E',
    backgroundColor: '#F0F5F0',
  },
  fontScaleText: {
    fontWeight: '700',
    color: '#2C2418',
    marginBottom: 4,
  },
  fontScaleTextActive: {
    color: '#2E5A2E',
  },
  fontScaleLabel: {
    fontSize: 11,
    color: '#9A8E7F',
  },
  fontScaleLabelActive: {
    color: '#2E5A2E',
  },

  // Questions per quiz
  questionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  questionsOption: {
    flex: 1,
    backgroundColor: '#FEFDFB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E2D8',
  },
  questionsOptionActive: {
    borderColor: '#2E5A2E',
    backgroundColor: '#F0F5F0',
  },
  questionsText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C2418',
  },
  questionsTextActive: {
    color: '#2E5A2E',
  },

  // Switch
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEFDFB',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8E2D8',
    marginBottom: 28,
  },
  switchTitle: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    color: '#2C2418',
  },
  switchDesc: {
    fontSize: 12,
    color: '#9A8E7F',
    marginTop: 2,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E8E2D8',
    marginBottom: 16,
  },

  // Links
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2C2418',
  },
  linkChevron: {
    fontSize: 18,
    color: '#B0A594',
  },

  // Reset
  resetButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C62828',
  },

  // Version
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#B0A594',
    marginTop: 20,
  },
});