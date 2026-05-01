import { calculateWellnessScore } from './wellnessScore';

// Mock wellness data for the last 7 days
export const mockWellnessData = [
  {
    date: '2025-01-20',
    mood_emoji: '😊',
    stress_level: 3,
    energy_level: 8,
    focus_level: 7,
    journaled: true,
    meditated: true,
    timestamp: '2025-01-20T09:30:00Z'
  },
  {
    date: '2025-01-21',
    mood_emoji: '🤩',
    stress_level: 2,
    energy_level: 9,
    focus_level: 8,
    journaled: true,
    meditated: true,
    timestamp: '2025-01-21T08:45:00Z'
  },
  {
    date: '2025-01-22',
    mood_emoji: '😐',
    stress_level: 6,
    energy_level: 5,
    focus_level: 4,
    journaled: false,
    meditated: false,
    timestamp: '2025-01-22T10:15:00Z'
  },
  {
    date: '2025-01-23',
    mood_emoji: '😔',
    stress_level: 7,
    energy_level: 4,
    focus_level: 3,
    journaled: true,
    meditated: false,
    timestamp: '2025-01-23T11:20:00Z'
  },
  {
    date: '2025-01-24',
    mood_emoji: '🙂',
    stress_level: 4,
    energy_level: 6,
    focus_level: 6,
    journaled: false,
    meditated: true,
    timestamp: '2025-01-24T09:00:00Z'
  },
  {
    date: '2025-01-25',
    mood_emoji: '😊',
    stress_level: 3,
    energy_level: 7,
    focus_level: 7,
    journaled: true,
    meditated: true,
    timestamp: '2025-01-25T08:30:00Z'
  },
  {
    date: '2025-01-26',
    mood_emoji: '🤩',
    stress_level: 2,
    energy_level: 8,
    focus_level: 8,
    journaled: true,
    meditated: true,
    timestamp: '2025-01-26T09:15:00Z'
  }
];

// Calculate wellness scores for each day
export const wellnessScores = mockWellnessData.map(entry => ({
  date: entry.date,
  score: calculateWellnessScore(entry),
  mood_emoji: entry.mood_emoji,
  stress_level: entry.stress_level,
  energy_level: entry.energy_level,
  journaled: entry.journaled,
  meditated: entry.meditated
}));

// Output the 7-day wellness scores
console.log('7-Day Wellness Scores:');
wellnessScores.forEach(day => {
  console.log(`${day.date}: ${day.score}/100 (${day.mood_emoji})`);
});

export default wellnessScores;
