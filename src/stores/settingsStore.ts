import { create } from 'zustand';
import { getItem, setItem } from '../utils/storage';
import { FontScale } from '../constants/theme';

const STORAGE_KEY = 'ranczo_settings';

interface SettingsState {
    fontScale: FontScale;
    soundEnabled: boolean;
    questionsPerQuiz: number;
    loaded: boolean;
    setFontScale: (scale: FontScale) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setQuestionsPerQuiz: (count: number) => void;
    loadSettings: () => Promise<void>;
}

function persistSettings(state: SettingsState) {
    const data = {
        fontScale: state.fontScale,
        soundEnabled: state.soundEnabled,
        questionsPerQuiz: state.questionsPerQuiz,
    };
    setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    fontScale: 'normal',
    soundEnabled: true,
    questionsPerQuiz: 10,
    loaded: false,

    setFontScale: (scale) => {
        set({ fontScale: scale });
        persistSettings(get());
    },

    setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled });
        persistSettings(get());
    },

    setQuestionsPerQuiz: (count) => {
        set({ questionsPerQuiz: count });
        persistSettings(get());
    },

    loadSettings: async () => {
        try {
            const raw = await getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                set({
                    fontScale: data.fontScale ?? 'normal',
                    soundEnabled: data.soundEnabled ?? true,
                    questionsPerQuiz: data.questionsPerQuiz ?? 10,
                    loaded: true,
                });
            } else {
                set({ loaded: true });
            }
        } catch {
            set({ loaded: true });
        }
    },
}));