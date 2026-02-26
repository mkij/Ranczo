import { useEffect, useState, useCallback } from 'react';
import { Slot } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { PlayfairDisplay_700Bold, PlayfairDisplay_800ExtraBold } from '@expo-google-fonts/playfair-display';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useQuizStore } from '../src/stores/quizStore';
import { loadSounds } from '../src/utils/sounds';

export default function RootLayout() {
  const [dataReady, setDataReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadScores = useQuizStore((s) => s.loadScores);

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
  });

  useEffect(() => {
    Promise.all([loadSettings(), loadScores(), loadSounds()]).then(() => {
      setDataReady(true);
    });
  }, []);

  if (!fontsLoaded || !dataReady) {
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