// Database utility for caching mood-based tracks
// React Native / Expo version (AsyncStorage)

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'calm_room_tracks_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get tracks from cache for a specific mood
 */
export const getTracksFromCache = async (mood) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${mood}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (!cachedData) return null;

    const parsedData = JSON.parse(cachedData);
    const now = Date.now();

    if (parsedData.expiresAt && now > parsedData.expiresAt) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return parsedData.tracks || null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

/**
 * Save tracks to cache
 */
export const saveTracksToCache = async (mood, tracks) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${mood}`;
    const expiresAt = Date.now() + CACHE_TTL;

    const cacheData = {
      mood,
      tracks,
      expiresAt,
      cachedAt: Date.now(),
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`Cached ${tracks.length} tracks for mood: ${mood}`);
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

/**
 * Clear cache for a mood
 */
export const clearMoodCache = async (mood) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${mood}`;
    await AsyncStorage.removeItem(cacheKey);
    console.log(`Cleared cache for mood: ${mood}`);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Clear all cached tracks
 */
export const clearAllCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) =>
      key.startsWith(CACHE_PREFIX)
    );

    await AsyncStorage.multiRemove(cacheKeys);

    console.log(`Cleared ${cacheKeys.length} cached mood playlists`);
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) =>
      key.startsWith(CACHE_PREFIX)
    );

    const result = await AsyncStorage.multiGet(cacheKeys);

    const stats = {
      totalCachedMoods: cacheKeys.length,
      totalSize: 0,
      moods: [],
    };

    result.forEach(([key, value]) => {
      if (!value) return;

      const mood = key.replace(CACHE_PREFIX, '');
      const parsed = JSON.parse(value);

      stats.totalSize += value.length;

      stats.moods.push({
        mood,
        trackCount: parsed.tracks?.length || 0,
        cachedAt: parsed.cachedAt,
        expiresAt: parsed.expiresAt,
        isExpired: Date.now() > parsed.expiresAt,
      });
    });

    return stats;
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalCachedMoods: 0, totalSize: 0, moods: [] };
  }
};

/**
 * Get favorites
 */
export const getFavoriteTracks = async () => {
  try {
    const data = await AsyncStorage.getItem('calm_room_favorites');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

/**
 * Add to favorites
 */
export const addToFavorites = async (track) => {
  try {
    const favorites = await getFavoriteTracks();

    const exists = favorites.find((f) => f.id === track.id);

    if (!exists) {
      favorites.push({
        ...track,
        addedAt: Date.now(),
      });

      await AsyncStorage.setItem(
        'calm_room_favorites',
        JSON.stringify(favorites)
      );
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
  }
};

/**
 * Remove from favorites
 */
export const removeFromFavorites = async (trackId) => {
  try {
    const favorites = await getFavoriteTracks();
    const filtered = favorites.filter((f) => f.id !== trackId);

    await AsyncStorage.setItem(
      'calm_room_favorites',
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error('Error removing from favorites:', error);
  }
};

/**
 * Listening history
 */
export const getListeningHistory = async () => {
  try {
    const data = await AsyncStorage.getItem('calm_room_history');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

/**
 * Add to history
 */
export const addToHistory = async (track) => {
  try {
    const history = await getListeningHistory();

    const filtered = history.filter((h) => h.id !== track.id);

    filtered.unshift({
      ...track,
      playedAt: Date.now(),
    });

    const limited = filtered.slice(0, 50);

    await AsyncStorage.setItem(
      'calm_room_history',
      JSON.stringify(limited)
    );
  } catch (error) {
    console.error('Error adding to history:', error);
  }
};

/**
 * Mood preferences
 */
export const getMoodPreferences = async () => {
  try {
    const data = await AsyncStorage.getItem(
      'calm_room_mood_preferences'
    );
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting mood preferences:', error);
    return {};
  }
};

/**
 * Save mood preference
 */
export const saveMoodPreference = async (mood, rating) => {
  try {
    const prefs = await getMoodPreferences();

    prefs[mood] = {
      rating,
      updatedAt: Date.now(),
    };

    await AsyncStorage.setItem(
      'calm_room_mood_preferences',
      JSON.stringify(prefs)
    );
  } catch (error) {
    console.error('Error saving mood preference:', error);
  }
};

/**
 * Popular moods
 */
export const getPopularMoods = async () => {
  try {
    const prefs = await getMoodPreferences();

    return Object.entries(prefs)
      .sort((a, b) => b[1].rating - a[1].rating)
      .map(([mood]) => mood);
  } catch (error) {
    console.error('Error getting popular moods:', error);
    return [];
  }
};