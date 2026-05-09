import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '@/types';
import { normalizeGameState, SAVE_VERSION } from '@/game/saveGame';

const SAVE_KEY = 'kariakoo_hustle_save_v1';

export type LoadGameError = 'corrupt_save' | 'read_failed';

export interface LoadGameResult {
  state: GameState | null;
  error?: LoadGameError;
}

export async function loadGameResult(): Promise<LoadGameResult> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    if (!raw) return { state: null };
    try {
      return { state: normalizeGameState(JSON.parse(raw) as Partial<GameState>) };
    } catch (e) {
      return { state: null, error: 'corrupt_save' };
    }
  } catch (e) {
    return { state: null, error: 'read_failed' };
  }
}

export async function loadGame(): Promise<GameState | null> {
  const result = await loadGameResult();
  return result.state;
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
