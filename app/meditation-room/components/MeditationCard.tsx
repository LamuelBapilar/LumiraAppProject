import Icon from '@/components/AppIcon';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

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

interface MeditationCardProps {
  meditation: Meditation;
  onMeditationClick?: (meditation: Meditation) => void;
  variant?: 'default' | 'course';
  speaker?: string;
  sessionCount?: number;
  isPremium?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  'Guided Mindfulness': 'Mindfulness',
  'Sleep Meditation': 'Sleep',
  'Stress & Anxiety Relief': 'Stress Relief',
  'Focus Lo-fi Music': 'Focus Music',
  'Breathing & Quick Calm': 'Breathing',
  'All': 'All',
};

const getDisplayCategory = (category: string) =>
  CATEGORY_MAP[category] || category;

// ─── Component ────────────────────────────────────────────────────────────────

const MeditationCard: React.FC<MeditationCardProps> = ({
  meditation,
  onMeditationClick,
  variant = 'default',
  speaker,
  sessionCount,
  isPremium = false,
}) => {
  const isPremiumLocked = meditation?.is_premium && !isPremium;

  return (
    <View className="bg-gray-50 rounded-xl p-4 mb-5 min-h-[420px]">

      {/* Cover Image */}
      <View className="w-full h-60 mb-4 relative">
        {meditation?.cover_image_url ? (
          <Image
            source={{ uri: meditation.cover_image_url }}
            className="w-full h-60  rounded-xl"
            resizeMode="stretch"
          />
        ) : (
          <View className="w-full h-full rounded-xl bg-violet-100 items-center justify-center">
            <Icon name="Play" size={48} color="#a78bfa" />
          </View>
        )}

        {isPremiumLocked && (
          <View className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-slate-200 items-center justify-center shadow">
            <Icon name="Lock" size={14} color="#475569" />
          </View>
        )}
      </View>

      {/* Meta */}
      <View
        className="w-full mb-3 justify-center"
        style={{ height: variant === 'course' ? 40 : 64 }}
      >
        {variant === 'course' ? (
          <View className="flex-1 justify-center gap-0.5">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-lg font-medium text-slate-800 shrink" numberOfLines={1}>
                {speaker || meditation?.speaker || 'Lumira'}
              </Text>
              <Image
                source={require('@/assets/images/lumira/main icon.png')}
                className="w-10 h-10"
                resizeMode="contain"
              />
            </View>
            <Text className="text-xs text-slate-500 mt-0.5">
              {Number(sessionCount ?? meditation?.session_count ?? 0)} sessions
            </Text>
          </View>
        ) : (
          <View className="flex-1 justify-center gap-2">
            <View className="flex-row items-center gap-2">
              <View
                className="px-2.5 py-1 rounded-xl"
                style={{ backgroundColor: 'rgba(234, 88, 12, 0.15)' }}
              >
                <Text className="text-base font-medium" style={{ color: 'rgb(234, 88, 12)' }}>
                  {getDisplayCategory(meditation?.category ?? '')}
                </Text>
              </View>
              <View className="px-2.5 py-1 rounded-xl" style={{ backgroundColor: '#DFF4D6' }}>
                <Text className="text-base font-medium" style={{ color: '#26A643' }}>
                  Meditation
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <View
                className="px-2.5 py-1 rounded-xl"
                style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)' }}
              >
                <Text className="text-base font-medium" style={{ color: 'rgb(234, 179, 8)' }}>
                  Lumira
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Title */}
      <View
        className="flex-row items-center gap-2 mb-3"
        style={{ minHeight: variant === 'course' ? 64 : 80 }}
      >
        <Text className="flex-1 text-lg font-medium text-gray-900 leading-6" numberOfLines={2}>
          {meditation?.title}
        </Text>
        {variant !== 'course' && (
          <Image
            source={require('@/assets/images/lumira/main icon.png')}
            className="w-10 h-10 shrink-0"
            resizeMode="contain"
          />
        )}
      </View>

      {/* Bottom Row */}
      <View className="flex-row items-center justify-between mt-auto h-10">
        <Image
          source={require('@/assets/images/lumira/main logo.png')}
          className="h-15 w-36"
          resizeMode="contain"
        />
        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-4 py-2 bg-violet-500 rounded-xl"
          onPress={() => onMeditationClick?.(meditation)}
          activeOpacity={0.8}
        >
          <Icon name="Music" size={14} color="#ffffff" />
          <Text className="text-sm font-medium text-white">Listen</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default MeditationCard;