import { Audio } from 'expo-av';
import { useSettingsStore } from '../stores/settingsStore';

const sounds: Record<string, Audio.Sound | null> = {
  correct: null,
  incorrect: null,
  complete: null,
};

export async function loadSounds() {
  try {
    const { sound: correct } = await Audio.Sound.createAsync(
      require('../../assets/sounds/ding1.mp3')
    );
    const { sound: incorrect } = await Audio.Sound.createAsync(
      require('../../assets/sounds/wrong1.mp3')
    );
    const { sound: complete } = await Audio.Sound.createAsync(
      require('../../assets/sounds/win1.mp3')
    );
    sounds.correct = correct;
    sounds.incorrect = incorrect;
    sounds.complete = complete;
  } catch {
    // Ignore load errors
  }
}

export async function playSound(type: 'correct' | 'incorrect' | 'complete') {
  const enabled = useSettingsStore.getState().soundEnabled;
  if (!enabled) return;

  try {
    const sound = sounds[type];
    if (sound) {
      await sound.replayAsync();
    }
  } catch {
    // Ignore playback errors
  }
}