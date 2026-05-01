// wellnessScore.js for calculation
// Wellness Score Calculation System
// Formula: Wellness Score = (Avg Mood * 0.4) + (Sleep Score * 0.2) + (Journaling Score * 0.2) + (Meditation Score * 0.2)

// Emoji to score mapping
const EMOJI_SCORES = {
  '🤩': 10, // Amazing
  '😊': 8,  // Happy
  '🙂': 7,  // Good
  '😐': 5,  // Neutral
  '😔': 3,  // Sad
  '😰': 2,  // Anxious
  '😠': 1,  // Angry
  '😵': 0   // Overwhelmed
};

// Calculate average mood score from emoji
const getMoodScore = (mood_emoji) => {
  return EMOJI_SCORES[mood_emoji] || 5; // Default to neutral if emoji not found
};

// Calculate sleep score from energy level (since we don't track sleep yet)
const getSleepScore = (energy_level) => {
  return energy_level * 10; // Convert 1-10 to 0-100 scale
};

// Calculate journaling score
const getJournalingScore = (journaled) => {
  return journaled ? 100 : 0;
};

// Calculate meditation score
const getMeditationScore = (meditated) => {
  return meditated ? 100 : 0;
};

// Main wellness score calculation
export const calculateWellnessScore = (data) => {
  // New real-world scoring using mood emoji, intensity (1-10), stress (1-10), energy (1-10)
  const { mood_emoji, intensity_level, stress_level, energy_level } = data;

  // Base mood on emoji, scaled to 0–100
  const moodScore = getMoodScore(mood_emoji) * 10;

  // Intensity maps to affect strength; map to [0..100] favoring mid-high positive intensity only through mood
  // Here we convert intensity to a balance score where extreme intensity with negative mood reduces overall
  const intensityScore = Math.max(0, Math.min(100, 10 * (10 - Math.abs((intensity_level ?? 5) - 5))));

  // Stress (1–10) inverted to 0–100
  const stressScore = Math.max(0, Math.min(100, ((10 - (stress_level ?? 5)) / 10) * 100));

  // Energy (1–10) linear 0–100
  const energyScore = Math.max(0, Math.min(100, ((energy_level ?? 5) / 10) * 100));

  // Weights tuned to reflect stronger impact of stress and mood
  const wellnessScore = (
    moodScore * 0.35 +
    intensityScore * 0.15 +
    stressScore * 0.30 +
    energyScore * 0.20
  );

  return Math.round(wellnessScore);
};

// Get wellness level description
export const getWellnessLevel = (score) => {
  if (score >= 80) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
  if (score >= 60) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (score >= 40) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  return { level: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
};

// Calculate trend (improving, declining, stable)
export const getWellnessTrend = (scores) => {
  if (scores.length < 2) return 'stable';
  
  const recent = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const previous = scores.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
  
  if (recent > previous + 5) return 'improving';
  if (recent < previous - 5) return 'declining';
  return 'stable';
};
