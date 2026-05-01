import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { AppState } from 'react-native';

// ─── Global singleton — persists across navigation ────────────────────────────
let sharedSound = null;
let appStateSubscription = null;

const SOURCES = [
  require('@/assets/audio/calmive-bg.mp3'),
];

const STORAGE_KEY = 'ambientOn';

// ─── Auto-resume (checks AsyncStorage pref) ───────────────────────────────────
async function tryAutoResume() {
  try {
    const pref = await AsyncStorage.getItem(STORAGE_KEY);
    const on = pref === null ? true : pref === 'true';
    if (on && sharedSound) {
      await sharedSound.setIsMutedAsync(false);
      await sharedSound.playAsync();
    }
  } catch {}
}

// ─── Public: get (or create) the shared sound instance ───────────────────────
export async function getAmbientAudio() {
  try {
    if (!sharedSound) {
      // Allow audio in silent mode + background
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        SOURCES[0],
        {
          isLooping: true,
          volume: 0.08,
          isMuted: true,    // start muted like web version
          shouldPlay: true, // attempt autoplay
        }
      );

      sharedSound = sound;

      // AppState listener — auto-resume when app comes to foreground
      if (!appStateSubscription) {
        appStateSubscription = AppState.addEventListener('change', (nextState) => {
          if (nextState === 'active') tryAutoResume();
        });
      }
    }

    return sharedSound;
  } catch (e) {
    console.warn('[ambientAudio] getAmbientAudio failed:', e);
    return null;
  }
}

// ─── Public: turn ambient audio on or off ────────────────────────────────────
export async function setAmbientPlayback(on) {
  try {
    const sound = await getAmbientAudio();
    if (!sound) return;

    // Persist preference
    await AsyncStorage.setItem(STORAGE_KEY, String(on));

    if (on) {
      await sound.setIsMutedAsync(false);
      await sound.playAsync();
    } else {
      await sound.setIsMutedAsync(true);
      await sound.pauseAsync();
    }
  } catch (e) {
    console.warn('[ambientAudio] setAmbientPlayback failed:', e);
  }
}

// ─── Public: cleanup (call on app unmount if needed) ─────────────────────────
export async function destroyAmbientAudio() {
  try {
    appStateSubscription?.remove();
    appStateSubscription = null;
    if (sharedSound) {
      await sharedSound.stopAsync();
      await sharedSound.unloadAsync();
      sharedSound = null;
    }
  } catch (e) {
    console.warn('[ambientAudio] destroy failed:', e);
  }
}