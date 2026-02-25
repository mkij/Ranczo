import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useQuizStore } from '../src/stores/quizStore';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadScores = useQuizStore((s) => s.loadScores);

  useEffect(() => {
    Promise.all([loadSettings(), loadScores()]).then(() => {
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E5A2E" />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F3',
  },
});