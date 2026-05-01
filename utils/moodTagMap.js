// Mood to Jamendo API tag mapping utility

/**
 * Map user moods to Jamendo API tags
 * This helps convert user-friendly mood names to API-compatible search terms
 */
export const moodTagMap = {
  // Calm/Relaxation moods
  relaxing: ['relaxing', 'ambient', 'peaceful', 'calm', 'soothing'],
  sleep: ['sleep', 'lullaby', 'meditation', 'bedtime', 'dreamy'],
  focus: ['focus', 'concentration', 'study', 'work', 'productivity'],
  meditation: ['meditation', 'zen', 'mindfulness', 'spiritual', 'tranquil'],
  
  // Nature-based moods
  nature: ['nature', 'outdoor', 'environmental', 'natural', 'organic'],
  forest: ['forest', 'woodland', 'trees', 'green', 'outdoor'],
  ocean: ['ocean', 'waves', 'sea', 'water', 'marine'],
  rain: ['rain', 'rainy', 'storm', 'weather', 'atmospheric'],
  
  // Instrumental moods
  piano: ['piano', 'classical', 'instrumental', 'keys', 'melodic'],
  guitar: ['guitar', 'acoustic', 'strings', 'folk', 'melodic'],
  violin: ['violin', 'strings', 'classical', 'orchestral', 'melodic'],
  flute: ['flute', 'wind', 'woodwind', 'melodic', 'peaceful'],
  
  // Electronic/Ambient moods
  ambient: ['ambient', 'atmospheric', 'electronic', 'space', 'ethereal'],
  chill: ['chill', 'lo-fi', 'downtempo', 'laid-back', 'mellow'],
  electronic: ['electronic', 'synth', 'digital', 'modern', 'tech'],
  
  // Emotional states
  anxious: ['calming', 'soothing', 'peaceful', 'relaxing', 'healing'],
  sad: ['melancholy', 'emotional', 'healing', 'comforting', 'gentle'],
  happy: ['upbeat', 'positive', 'energetic', 'joyful', 'cheerful'],
  excited: ['energetic', 'upbeat', 'motivational', 'dynamic', 'powerful'],
  stressed: ['relaxing', 'meditation', 'zen', 'calming', 'peaceful'],
  angry: ['calming', 'soothing', 'peaceful', 'relaxing', 'healing'],
  
  // Time-based moods
  morning: ['morning', 'sunrise', 'fresh', 'energetic', 'positive'],
  evening: ['evening', 'sunset', 'warm', 'cozy', 'relaxing'],
  night: ['night', 'dark', 'mysterious', 'dreamy', 'atmospheric'],
  
  // Activity-based moods
  workout: ['energetic', 'motivational', 'dynamic', 'powerful', 'upbeat'],
  study: ['focus', 'concentration', 'study', 'academic', 'productive'],
  work: ['focus', 'concentration', 'productivity', 'professional', 'work'],
  driving: ['road', 'travel', 'journey', 'adventure', 'freedom'],
  
  // Seasonal moods
  spring: ['spring', 'fresh', 'renewal', 'growth', 'vibrant'],
  summer: ['summer', 'warm', 'bright', 'energetic', 'outdoor'],
  autumn: ['autumn', 'fall', 'cozy', 'warm', 'melancholy'],
  winter: ['winter', 'cold', 'cozy', 'warm', 'peaceful']
};

/**
 * Get tags for a specific mood
 * @param {string} mood - The mood to get tags for
 * @returns {Array} Array of Jamendo API tags
 */
export const getTagsForMood = (mood) => {
  return moodTagMap[mood.toLowerCase()] || [mood];
};

/**
 * Get all available moods
 * @returns {Array} Array of all available mood keys
 */
export const getAvailableMoods = () => {
  return Object.keys(moodTagMap);
};

/**
 * Get mood display name
 * @param {string} mood - The mood key
 * @returns {string} Display name for the mood
 */
export const getMoodDisplayName = (mood) => {
  const displayNames = {
    relaxing: 'Relaxing',
    sleep: 'Sleep',
    focus: 'Focus',
    meditation: 'Meditation',
    nature: 'Nature',
    forest: 'Forest',
    ocean: 'Ocean',
    rain: 'Rain',
    piano: 'Piano',
    guitar: 'Guitar',
    violin: 'Violin',
    flute: 'Flute',
    ambient: 'Ambient',
    chill: 'Chill',
    electronic: 'Electronic',
    anxious: 'Anxious',
    sad: 'Sad',
    happy: 'Happy',
    excited: 'Excited',
    stressed: 'Stressed',
    angry: 'Angry',
    morning: 'Morning',
    evening: 'Evening',
    night: 'Night',
    workout: 'Workout',
    study: 'Study',
    work: 'Work',
    driving: 'Driving',
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    winter: 'Winter'
  };
  
  return displayNames[mood] || mood.charAt(0).toUpperCase() + mood.slice(1);
};

/**
 * Get mood category
 * @param {string} mood - The mood key
 * @returns {string} Category of the mood
 */
export const getMoodCategory = (mood) => {
  const categories = {
    // Calm/Relaxation
    relaxing: 'calm',
    sleep: 'calm',
    meditation: 'calm',
    
    // Focus/Productivity
    focus: 'productivity',
    study: 'productivity',
    work: 'productivity',
    
    // Nature
    nature: 'nature',
    forest: 'nature',
    ocean: 'nature',
    rain: 'nature',
    
    // Instrumental
    piano: 'instrumental',
    guitar: 'instrumental',
    violin: 'instrumental',
    flute: 'instrumental',
    
    // Electronic
    ambient: 'electronic',
    chill: 'electronic',
    electronic: 'electronic',
    
    // Emotional
    anxious: 'emotional',
    sad: 'emotional',
    happy: 'emotional',
    excited: 'emotional',
    stressed: 'emotional',
    angry: 'emotional',
    
    // Time-based
    morning: 'time',
    evening: 'time',
    night: 'time',
    
    // Activity
    workout: 'activity',
    driving: 'activity',
    
    // Seasonal
    spring: 'seasonal',
    summer: 'seasonal',
    autumn: 'seasonal',
    winter: 'seasonal'
  };
  
  return categories[mood] || 'other';
};

/**
 * Get mood icon
 * @param {string} mood - The mood key
 * @returns {string} Emoji icon for the mood
 */
export const getMoodIcon = (mood) => {
  const icons = {
    relaxing: '🌿',
    sleep: '🌙',
    focus: '🎯',
    meditation: '🧘',
    nature: '🌲',
    forest: '🌳',
    ocean: '🌊',
    rain: '🌧️',
    piano: '🎹',
    guitar: '🎸',
    violin: '🎻',
    flute: '🎼',
    ambient: '☁️',
    chill: '🍃',
    electronic: '⚡',
    anxious: '😰',
    sad: '😢',
    happy: '😊',
    excited: '🤩',
    stressed: '😤',
    angry: '😠',
    morning: '🌅',
    evening: '🌆',
    night: '🌃',
    workout: '💪',
    study: '📚',
    work: '💼',
    driving: '🚗',
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂',
    winter: '❄️'
  };
  
  return icons[mood] || '🎵';
};

/**
 * Get mood color gradient
 * @param {string} mood - The mood key
 * @returns {string} Tailwind gradient classes
 */
export const getMoodGradient = (mood) => {
  const gradients = {
    relaxing: 'from-emerald-400 to-teal-500',
    sleep: 'from-indigo-400 to-purple-500',
    focus: 'from-blue-400 to-cyan-500',
    meditation: 'from-purple-400 to-pink-500',
    nature: 'from-green-400 to-emerald-500',
    forest: 'from-green-500 to-emerald-600',
    ocean: 'from-blue-400 to-cyan-500',
    rain: 'from-gray-400 to-blue-500',
    piano: 'from-amber-400 to-orange-500',
    guitar: 'from-orange-400 to-red-500',
    violin: 'from-red-400 to-pink-500',
    flute: 'from-cyan-400 to-blue-500',
    ambient: 'from-slate-400 to-gray-500',
    chill: 'from-teal-400 to-green-500',
    electronic: 'from-purple-400 to-indigo-500',
    anxious: 'from-yellow-400 to-orange-500',
    sad: 'from-blue-400 to-indigo-500',
    happy: 'from-yellow-400 to-green-500',
    excited: 'from-orange-400 to-red-500',
    stressed: 'from-red-400 to-orange-500',
    angry: 'from-red-500 to-pink-600',
    morning: 'from-yellow-400 to-orange-500',
    evening: 'from-orange-400 to-pink-500',
    night: 'from-indigo-400 to-purple-500',
    workout: 'from-red-400 to-orange-500',
    study: 'from-blue-400 to-indigo-500',
    work: 'from-gray-400 to-blue-500',
    driving: 'from-blue-400 to-cyan-500',
    spring: 'from-green-400 to-yellow-500',
    summer: 'from-yellow-400 to-orange-500',
    autumn: 'from-orange-400 to-red-500',
    winter: 'from-blue-400 to-indigo-500'
  };
  
  return gradients[mood] || 'from-gray-400 to-gray-500';
};

/**
 * Validate if a mood is supported
 * @param {string} mood - The mood to validate
 * @returns {boolean} True if mood is supported
 */
export const isMoodSupported = (mood) => {
  return moodTagMap.hasOwnProperty(mood.toLowerCase());
};

/**
 * Get similar moods
 * @param {string} mood - The base mood
 * @returns {Array} Array of similar moods
 */
export const getSimilarMoods = (mood) => {
  const category = getMoodCategory(mood);
  const allMoods = getAvailableMoods();
  
  return allMoods.filter(m => getMoodCategory(m) === category && m !== mood);
}; 