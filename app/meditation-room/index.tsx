import MeditationCard from '@/app/meditation-room/components/MeditationCard';
import NavigationBar from '@/components/Navigation';
import Icon from '@/components/ui/AppIcon';
import { MeditationService } from '@/utils/meditationService';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// ─── Hardcoded user ID ────────────────────────────────────────────────────────
const USER_ID = 'user_3CClVidzX562pYzJPZjhejzmvn7';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Meditation {
  id?: string;
  title?: string;
  cover_image_url?: string;
  category?: string;
  is_premium?: boolean;
  speaker?: string;
  session_count?: number;
  description?: string;
}

interface Course extends Meditation {
  session_count?: number;
}

interface UserStats {
  currentStreak: number;
  totalSessions: number;
  totalHours: number;
  averageSessionLength: number;
  totalMinutes: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'Grid3X3' },
  { id: 'mindfulness', label: 'Guided Mindfulness', icon: 'Brain' },
  { id: 'sleep', label: 'Sleep Meditation', icon: 'Moon' },
  { id: 'anxiety', label: 'Stress & Anxiety Relief', icon: 'Heart' },
  { id: 'focus', label: 'Focus Lo-fi Music', icon: 'Target' },
  { id: 'breathing', label: 'Breathing & Quick Calm', icon: 'Wind' },
];

const DURATIONS = [
  { id: 'all', label: 'All' },
  { id: '5-10', label: '5-10 min' },
  { id: '10-20', label: '10-20 min' },
  { id: '20-30', label: '20-30 min' },
  { id: '30+', label: '30+ min' },
];

const LEVELS = [
  { id: 'all', label: 'All' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <View className="bg-gray-50 rounded-xl p-4 mb-5 w-72" style={{ height: 420 }}>
    <View className="w-full h-44 bg-gray-200 rounded-xl mb-4" />
    <View className="mb-3 gap-2">
      <View className="flex-row gap-2">
        <View className="h-6 w-20 bg-gray-200 rounded-xl" />
        <View className="h-6 w-24 bg-gray-200 rounded-xl" />
      </View>
      <View className="flex-row gap-2">
        <View className="h-6 w-16 bg-gray-200 rounded-xl" />
      </View>
    </View>
    <View className="mb-3 gap-2">
      <View className="h-5 bg-gray-200 rounded w-full" />
      <View className="h-4 bg-gray-200 rounded w-3/4" />
    </View>
    <View className="flex-row items-center justify-between mt-auto">
      <View className="h-6 w-20 bg-gray-200 rounded" />
      <View className="h-8 w-20 bg-gray-200 rounded-xl" />
    </View>
  </View>
);

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  showAll: boolean;
  onToggleAll: () => void;
  hasItems: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  showAll,
  onToggleAll,
  hasItems,
}) => (
  <View className="flex-row items-center justify-between mb-4">
    <Text className="text-lg font-semibold text-slate-800">{title}</Text>
    {hasItems && (
      <TouchableOpacity
        onPress={onToggleAll}
        className="flex-row items-center gap-1"
      >
        <Text className="text-sm font-medium text-slate-700">
          {showAll ? 'Show Less' : 'See All'}
        </Text>
        <Icon name="ChevronRight" size={14} color="#374151" />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const MeditationRoom: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllSimple, setShowAllSimple] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Filters
  const [category, setCategory] = useState('all');
  const [duration, setDuration] = useState('all');
  const [level, setLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  // Stats
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Premium — hardcoded for now, replace with useUserSync later
  const isPremium = false;

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = {
          category: category === 'all' ? null : category,
          duration: duration === 'all' ? null : duration,
          level: level === 'all' ? null : level,
          search: searchQuery,
          userFavorites: showFavorites,
          userId: USER_ID,
        };

        const [data, courseList] = await Promise.all([
          MeditationService.getMeditations({ ...params, onlyStandalone: true }),
          MeditationService.getCourses({
            category: category === 'all' ? null : category,
            level: level === 'all' ? null : level,
            search: searchQuery,
          }),
        ]);

        // Sort: free first, then premium
        const sorted = [...data].sort((a: any, b: any) => {
          if (!a.is_premium && b.is_premium) return -1;
          if (a.is_premium && !b.is_premium) return 1;
          return 0;
        });

        setMeditations(sorted);
        setCourses(courseList);
      } catch (e) {
        console.error('Error loading meditations:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category, duration, level, searchQuery, showFavorites]);

  // ── Load user stats ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await MeditationService.getUserStats(USER_ID);
        setUserStats(stats);
      } catch (e) {
        console.error('Error loading user stats:', e);
      }
    };
    loadStats();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleMeditationClick = (meditation: Meditation) => {
    // TODO: navigate to meditation player
    console.log('Open meditation:', meditation.id);
  };

  const handleCourseClick = (course: Course) => {
    // TODO: navigate to course
    console.log('Open course:', course.id);
  };

  const simpleSessions = meditations;
  const isEmpty = meditations.length === 0 && (courses?.length || 0) === 0;

  return (
    <NavigationBar title="Meditation Room">
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >

      {/* ── Header ── */}
      <View className="mb-6">
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1 pr-4">
            <Text className="text-2xl font-bold text-slate-800 mb-1">
              Meditation Room
            </Text>
            <Text className="text-sm text-slate-500">
              Find peace and mindfulness with guided meditations
            </Text>
          </View>

          {/* Stats */}
          {userStats && (
            <View className="flex-row gap-4">
              <View className="items-center">
                <Text className="text-xl font-bold text-violet-600">
                  {userStats.currentStreak}
                </Text>
                <Text className="text-xs text-gray-500">Day Streak</Text>
              </View>
              <View className="items-center">
                <Text className="text-xl font-bold text-violet-600">
                  {userStats.totalSessions}
                </Text>
                <Text className="text-xs text-gray-500">Sessions</Text>
              </View>
              <View className="items-center">
                <Text className="text-xl font-bold text-violet-600">
                  {userStats.totalHours}
                </Text>
                <Text className="text-xs text-gray-500">Hours</Text>
              </View>
            </View>
          )}
        </View>

        {/* Search 
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 mb-4 gap-2">
          <Icon name="Search" size={16} color="#9ca3af" />
          <TextInput
            className="flex-1 text-sm text-gray-800"
            placeholder="Search meditations..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="X" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        */}

        {/* Category Filter 
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          className="mb-4"
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategory(cat.id)}
              className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                category === cat.id
                  ? 'bg-slate-800 border-slate-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Icon
                name={cat.icon}
                size={14}
                color={category === cat.id ? '#ffffff' : '#6b7280'}
              />
              <Text
                className={`text-xs font-medium ${
                  category === cat.id ? 'text-white' : 'text-gray-600'
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        */}

        {/* Favorites Toggle */}
        <View className="flex-row items-center gap-2">
          <Switch
            value={showFavorites}
            onValueChange={setShowFavorites}
            trackColor={{ false: '#e5e7eb', true: '#8b5cf6' }}
            thumbColor="#ffffff"
          />
          <Text className="text-sm text-gray-700">Show only favorites</Text>
        </View>
      </View>

      {/* ── Content ── */}
      {loading ? (
        // Skeleton
        <View>
          <Text className="text-lg font-semibold text-slate-800 mb-4">Latest on Lumira</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </ScrollView>
          <Text className="text-lg font-semibold text-slate-800 mb-4 mt-8">Trending on Lumira</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </ScrollView>
        </View>
      ) : isEmpty ? (
        // Empty State
        <View className="items-center py-16">
          <Icon name="Search" size={48} color="#d1d5db" />
          <Text className="text-base font-medium text-gray-900 mt-4 mb-2">
            No meditations found
          </Text>
          <Text className="text-sm text-gray-500">
            Try adjusting your category filter
          </Text>
        </View>
      ) : (
        <View className="gap-8">

          {/* ── Courses Section ── */}
          {courses && courses.length > 0 && (
            <View>
              <SectionHeader
                title="Latest on Lumira"
                showAll={showAllCourses}
                onToggleAll={() => setShowAllCourses((v) => !v)}
                hasItems={courses.length > 0}
              />

              {showAllCourses ? (
                // Grid
                <View className="flex-row flex-wrap gap-4">
                  {courses.map((course) => (
                    <View key={`course-grid-${course.id}`} className="w-[47%]">
                      <MeditationCard
                        meditation={course}
                        variant="course"
                        speaker={course.speaker}
                        sessionCount={course.session_count}
                        onMeditationClick={() => handleCourseClick(course)}
                        isPremium={isPremium}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                // Horizontal scroll
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 16, paddingRight: 16 }}
                >
                  {courses.map((course) => (
                    <View key={`course-${course.id}`} style={{ width: 280 }}>
                      <MeditationCard
                        meditation={course}
                        variant="course"
                        speaker={course.speaker}
                        sessionCount={course.session_count}
                        onMeditationClick={() => handleCourseClick(course)}
                        isPremium={isPremium}
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* ── Simple Sessions Section ── */}
          <View>
            <SectionHeader
              title="Trending on Lumira"
              showAll={showAllSimple}
              onToggleAll={() => setShowAllSimple((v) => !v)}
              hasItems={(simpleSessions?.length || 0) > 0}
            />

            {simpleSessions && simpleSessions.length > 0 ? (
              showAllSimple ? (
                // Grid
                <View className="flex-row flex-wrap gap-4">
                  {simpleSessions.map((meditation) => (
                    <View key={meditation.id} className="w-[47%]">
                      <MeditationCard
                        meditation={meditation}
                        onMeditationClick={handleMeditationClick}
                        isPremium={isPremium}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                // Horizontal scroll
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 16, paddingRight: 16 }}
                >
                  {simpleSessions.map((meditation) => (
                    <View key={meditation.id} style={{ width: 280 }}>
                      <MeditationCard
                        meditation={meditation}
                        onMeditationClick={handleMeditationClick}
                        isPremium={isPremium}
                      />
                    </View>
                  ))}
                </ScrollView>
              )
            ) : (
              <View className="items-center py-8">
                <Text className="text-sm text-slate-500">No sessions available</Text>
              </View>
            )}
          </View>

        </View>
      )}
    </ScrollView>
    </NavigationBar>
  );
};

export default MeditationRoom;