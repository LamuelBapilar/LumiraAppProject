// Music API utility for Jamendo integration and caching
import { getTracksFromCache, saveTracksToCache } from '@/utils/db';

const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const CLIENT_ID = '5b40dd27'; // Jamendo client ID

// Mood to Jamendo tag mapping
const moodTagMap = {
  relaxing: ['relaxing', 'ambient', 'peaceful'],
  sleep: ['sleep', 'lullaby', 'meditation'],
  focus: ['focus', 'concentration', 'study'],
  nature: ['nature', 'outdoor', 'environmental'],
  piano: ['piano', 'classical', 'instrumental'],
  ambient: ['ambient', 'atmospheric', 'electronic'],
  chill: ['chill', 'lo-fi', 'downtempo'],
  anxious: ['calming', 'soothing', 'peaceful'],
  sad: ['melancholy', 'emotional', 'healing'],
  happy: ['upbeat', 'positive', 'energetic'],
  stressed: ['relaxing', 'meditation', 'zen'],
  excited: ['energetic', 'upbeat', 'motivational']
};

/**
 * Get tracks by mood with caching
 * @param {string} mood - The mood to search for
 * @param {boolean} forceRefresh - Force refresh from API
 * @returns {Promise<Array>} Array of tracks
 */
export const getTracksByMood = async (mood, forceRefresh = false) => {
  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedTracks = await getTracksFromCache(mood);
      if (cachedTracks && cachedTracks.length > 0) {
        console.log(`Using cached tracks for mood: ${mood}`);
        return cachedTracks;
      }
    }

    // Fetch from Jamendo API
    const tracks = await fetchTracksFromJamendo(mood);
    
    // Cache the results
    if (tracks && tracks.length > 0) {
      await saveTracksToCache(mood, tracks);
    }

    return tracks;
  } catch (error) {
    console.error('Error fetching tracks by mood:', error);
    throw error;
  }
};

/**
 * Fetch tracks from Jamendo API
 * @param {string} mood - The mood to search for
 * @returns {Promise<Array>} Array of tracks
 */
const fetchTracksFromJamendo = async (mood) => {
  const tags = moodTagMap[mood] || [mood];
  const tagString = tags.join(',');
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    format: 'json',
    limit: 20,
    tags: tagString,
    groupby: 'artist_id'
  });

  try {
    const response = await fetch(`${JAMENDO_API_BASE}/tracks/?${params}`);
    
    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results) {
      throw new Error('Invalid response from Jamendo API');
    }

    // Transform Jamendo tracks to our format
    return data.results.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artist_name,
      album: track.album_name || 'Single',
      duration: formatDuration(track.duration),
      image: track.image || track.album_image,
      audio: track.audio,
      preview: track.audio,
      tags: track.tags,
      mood: mood
    }));
  } catch (error) {
    console.error('Error fetching from Jamendo:', error);
    // Return mock data as fallback
    return getMockTracksForMood(mood);
  }
};

/**
 * Search tracks by keyword
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of tracks
 */
export const searchTracks = async (query) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    format: 'json',
    limit: 20,
    search: query,
    groupby: 'artist_id'
  });

  try {
    const response = await fetch(`${JAMENDO_API_BASE}/tracks/?${params}`);
    
    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artist_name,
      album: track.album_name || 'Single',
      duration: formatDuration(track.duration),
      image: track.image || track.album_image,
      audio: track.audio,
      preview: track.audio,
      tags: track.tags
    }));
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

/**
 * Get trending tracks
 * @returns {Promise<Array>} Array of trending tracks
 */
export const getTrendingTracks = async () => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    format: 'json',
    limit: 10,
    orderby: 'popularity_total'
  });

  try {
    const response = await fetch(`${JAMENDO_API_BASE}/tracks/?${params}`);
    
    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artist_name,
      album: track.album_name || 'Single',
      duration: formatDuration(track.duration),
      image: track.image || track.album_image,
      audio: track.audio,
      preview: track.audio,
      tags: track.tags
    }));
  } catch (error) {
    console.error('Error fetching trending tracks:', error);
    return [];
  }
};

/**
 * Format duration from seconds to MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Get mock tracks for fallback
 * @param {string} mood - The mood
 * @returns {Array} Array of mock tracks
 */
const getMockTracksForMood = (mood) => {
  const mockTracks = {
    relaxing: [
      {
        id: 1,
        name: "Gentle Rain",
        artist: "Nature Sounds Collective",
        album: "Peaceful Moments",
        duration: "3:45",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
      },
      {
        id: 2,
        name: "Ocean Waves",
        artist: "Calm Ocean",
        album: "Meditation Sounds",
        duration: "4:20",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
      }
    ],
    sleep: [
      {
        id: 3,
        name: "Lullaby Dreams",
        artist: "Sleep Harmony",
        album: "Night Collection",
        duration: "5:15",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
      }
    ],
    focus: [
      {
        id: 4,
        name: "Concentration Flow",
        artist: "Focus Music",
        album: "Study Sessions",
        duration: "3:30",
        image: "https://images.unsplash.com/photo-1520523839897-b3840ca07d7a?w=300&h=300&fit=crop",
        audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
      }
    ]
  };

  return mockTracks[mood] || mockTracks.relaxing;
};

/**
 * Get available moods
 * @returns {Array} Array of available moods
 */
export const getAvailableMoods = () => {
  return Object.keys(moodTagMap);
};

/**
 * Get mood display name
 * @param {string} mood - The mood key
 * @returns {string} Display name
 */
export const getMoodDisplayName = (mood) => {
  const displayNames = {
    relaxing: 'Relaxing',
    sleep: 'Sleep',
    focus: 'Focus',
    nature: 'Nature',
    piano: 'Piano',
    ambient: 'Ambient',
    chill: 'Chill',
    anxious: 'Anxious',
    sad: 'Sad',
    happy: 'Happy',
    stressed: 'Stressed',
    excited: 'Excited'
  };
  
  return displayNames[mood] || mood;
};