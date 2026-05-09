import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '@/types';
import { normalizeGameState, SAVE_VERSION } from '@/game/saveGame';

const SAVE_KEY = 'kariakoo_hustle_save_v1';

export async function loadGame(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return normalizeGameState(JSON.parse(raw) as Partial<GameState>);
  } catch (e) {
    return null;
  }
}

export async function saveGame(state: GameState): Promise<void> {
  try {
    const stampedState: GameState = {
      ...state,
      saveVersion: SAVE_VERSION,
      lastSavedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(stampedState));
  } catch (e) {
    // ignore
  }
}

export async function clearGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch (e) {
    // ignore
  }
}
