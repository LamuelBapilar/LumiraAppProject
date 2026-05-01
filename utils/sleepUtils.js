/**
 * Sleep Tracker Utilities
 * Calculation and helper functions for sleep tracking
 */

/**
 * Calculate sleep duration between bedtime and wake time
 * @param {string} bedtime - Time in HH:MM format (e.g., "23:00")
 * @param {string} wakeTime - Time in HH:MM format (e.g., "07:00")
 * @returns {number} Duration in hours
 */
export function calculateSleepDuration(bedtime, wakeTime) {
  if (!bedtime || !wakeTime) return 0;
  
  const bed = new Date(`1970-01-01T${bedtime}:00Z`);
  let wake = new Date(`1970-01-01T${wakeTime}:00Z`);
  
  // If wake time is earlier than bedtime, assume it's the next day
  if (wake <= bed) {
    wake = new Date(`1970-01-02T${wakeTime}:00Z`);
  }
  
  const diff = (wake.getTime() - bed.getTime()) / (1000 * 60 * 60);
  return Number(diff.toFixed(2));
}

/**
 * Calculate sleep score based on duration and quality
 * @param {number} duration - Sleep duration in hours
 * @param {number} quality - Sleep quality rating (1-5)
 * @returns {number} Sleep score (0-100)
 */
export function calculateSleepScore(duration, quality) {
  if (!duration || !quality) return 0;
  
  const idealDuration = 8;
  const durationScore = Math.min(100, (duration / idealDuration) * 100);
  const qualityScore = (quality / 5) * 100;
  
  // 70% weight on duration, 30% on quality
  return Math.round(durationScore * 0.7 + qualityScore * 0.3);
}

/**
 * Calculate consistency score based on sleep times
 * @param {string[]} sleepTimes - Array of sleep times in HH:MM format
 * @returns {number} Consistency score (0-100)
 */
export function calculateConsistency(sleepTimes) {
  if (!sleepTimes || sleepTimes.length < 2) return 0;
  
  const diffs = [];
  for (let i = 1; i < sleepTimes.length; i++) {
    const prev = new Date(`1970-01-01T${sleepTimes[i-1]}:00Z`).getTime();
    const curr = new Date(`1970-01-01T${sleepTimes[i]}:00Z`).getTime();
    diffs.push(Math.abs(curr - prev) / (1000 * 60));
  }
  
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  // Lower average difference = higher consistency
  return Math.max(0, Math.round(100 - avgDiff / 10));
}

/**
 * Generate sleep insights based on sleep data
 * @param {number} avgDuration - Average sleep duration
 * @param {number} avgQuality - Average sleep quality (1-5)
 * @param {number} avgMood - Average mood score
 * @param {number} consistency - Consistency score (0-100)
 * @returns {string[]} Array of insight messages
 */
export function generateSleepInsights(avgDuration, avgQuality, avgMood, consistency) {
  const insights = [];
  
  // Duration insights
  if (avgDuration < 6) {
    insights.push("⚠️ You're sleeping less than recommended (6-9 hours). Try to prioritize more rest.");
  } else if (avgDuration < 7) {
    insights.push("📊 Your sleep duration is below optimal. Aim for 7-9 hours for better wellness.");
  } else if (avgDuration >= 7 && avgDuration <= 9) {
    insights.push("✅ Great! You're getting the recommended amount of sleep (7-9 hours).");
  } else if (avgDuration > 9) {
    insights.push("💤 You're sleeping more than typical. Consider if this affects your daily energy.");
  }
  
  // Quality insights
  if (avgQuality < 2.5) {
    insights.push("😴 Your sleep quality seems low. Try relaxation techniques before bed or meditation.");
  } else if (avgQuality >= 4) {
    insights.push("⭐ Excellent sleep quality! Keep up your healthy sleep habits.");
  }
  
  // Consistency insights
  if (consistency < 50) {
    insights.push("🔄 Your sleep schedule varies a lot. Try going to bed at similar times each night.");
  } else if (consistency >= 80) {
    insights.push("🎯 Outstanding consistency! A regular schedule supports better sleep quality.");
  }
  
  // Mood correlation
  if (avgMood && avgMood < 3 && avgDuration < 7) {
    insights.push("💡 Your mood might improve with longer rest. Sleep affects emotional well-being.");
  }
  
  // Default positive message
  if (insights.length === 0 || (avgDuration >= 7 && avgQuality >= 3.5)) {
    insights.push("🌟 Your sleep pattern looks balanced! Keep maintaining healthy habits.");
  }
  
  return insights.slice(0, 4); // Return max 4 insights
}

/**
 * Calculate weekly averages from sleep data
 * @param {Array} sleepData - Array of sleep log objects
 * @returns {Array} Weekly averages
 */
export function calculateWeeklyAverages(sleepData) {
  if (!sleepData || sleepData.length === 0) return [];
  
  const weeklyData = {};
  
  sleepData.forEach(log => {
    const date = new Date(log.sleep_date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        week: weekKey,
        totalSleep: 0,
        count: 0,
        totalQuality: 0
      };
    }
    
    weeklyData[weekKey].totalSleep += log.sleep_duration || 0;
    weeklyData[weekKey].totalQuality += log.sleep_quality || 0;
    weeklyData[weekKey].count += 1;
  });
  
  return Object.values(weeklyData)
    .map(week => ({
      week: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgSleep: Number((week.totalSleep / week.count).toFixed(2)),
      avgQuality: Number((week.totalQuality / week.count).toFixed(2))
    }))
    .sort((a, b) => new Date(a.week) - new Date(b.week));
}

/**
 * Prepare radar chart data for sleep quality balance
 * @param {Array} sleepData - Array of sleep log objects
 * @returns {Array} Radar chart data
 */
export function prepareRadarData(sleepData) {
  if (!sleepData || sleepData.length === 0) {
    return [
      { metric: 'Duration', value: 0 },
      { metric: 'Quality', value: 0 },
      { metric: 'Consistency', value: 0 },
      { metric: 'Regularity', value: 0 }
    ];
  }
  
  const avgDuration = sleepData.reduce((sum, log) => sum + (log.sleep_duration || 0), 0) / sleepData.length;
  const avgQuality = sleepData.reduce((sum, log) => sum + (log.sleep_quality || 0), 0) / sleepData.length;
  const bedtimes = sleepData.map(log => log.bedtime).filter(Boolean);
  const consistency = calculateConsistency(bedtimes);
  
  // Normalize to 0-100 scale
  const durationScore = Math.min(100, (avgDuration / 8) * 100);
  const qualityScore = (avgQuality / 5) * 100;
  
  return [
    { metric: 'Duration', value: Math.round(durationScore) },
    { metric: 'Quality', value: Math.round(qualityScore) },
    { metric: 'Consistency', value: consistency },
    { metric: 'Score', value: Math.round((durationScore + qualityScore + consistency) / 3) }
  ];
}

/**
 * Prepare scatter data for mood vs sleep correlation
 * @param {Array} sleepData - Array of sleep log objects
 * @param {Array} moodData - Array of mood entry objects
 * @returns {Array} Scatter plot data
 */
export function prepareMoodSleepScatter(sleepData, moodData) {
  if (!sleepData || !moodData || sleepData.length === 0 || moodData.length === 0) {
    return [];
  }
  
  const moodByDate = {};
  moodData.forEach(mood => {
    const date = mood.created_at?.split('T')[0] || mood.date;
    if (date && mood.intensity_level) {
      moodByDate[date] = mood.intensity_level;
    }
  });
  
  return sleepData
    .map(sleep => {
      const moodScore = moodByDate[sleep.sleep_date];
      if (moodScore && sleep.sleep_duration) {
        return {
          sleep_duration: sleep.sleep_duration,
          mood_score: moodScore,
          date: sleep.sleep_date
        };
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Format time for display (HH:MM to 12-hour format)
 * @param {string} time - Time in HH:MM format
 * @returns {string} Formatted time
 */
export function formatTime(time) {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  
  return `${displayHour}:${minutes} ${period}`;
}

/**
 * Get sleep quality label
 * @param {number} quality - Quality rating (1-5)
 * @returns {string} Quality label
 */
export function getSleepQualityLabel(quality) {
  const labels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };
  return labels[quality] || 'Unknown';
}

/**
 * Get sleep score color based on value
 * @param {number} score - Sleep score (0-100)
 * @returns {string} Color class
 */
export function getSleepScoreColor(score) {
  if (score >= 80) return '#28a745'; // success green
  if (score >= 60) return '#ff9b00'; // warning orange
  return '#dc3545'; // error red
}


