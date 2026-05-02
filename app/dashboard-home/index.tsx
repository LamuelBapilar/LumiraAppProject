import Icon from '@/components/AppIcon';
import NavigationBar from '@/components/Navigation';
import WellnessGraph from '@/components/WellnessGraph';
import { MoodEntriesService } from '@/utils/supabaseWellness';
import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Hardcoded user ───────────────────────────────────────────────────────────
const USER_ID = 'user_3CClVidzX562pYzJPZjhejzmvn7';

const { width: SW } = Dimensions.get('window');

// ─── Mood image map ───────────────────────────────────────────────────────────
const MOOD_IMAGES: Record<string, any> = {
    happy:     require('@/assets/images/lumira/happy.png'),
    sad:       require('@/assets/images/lumira/sad.png'),
    depressed: require('@/assets/images/lumira/depressed.png'),
    angry:     require('@/assets/images/lumira/angry.png'),
    tired:     require('@/assets/images/lumira/tired.png'),
    confused:  require('@/assets/images/lumira/confused.png'),
    calm:      require('@/assets/images/lumira/calm.png'),
    confident: require('@/assets/images/lumira/confident.png'),
    cool:      require('@/assets/images/lumira/cool.png'),
    shy:       require('@/assets/images/lumira/shy.png'),
    surprised: require('@/assets/images/lumira/suprise.png'),
    worried:   require('@/assets/images/lumira/worried.png'),
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getWelcomeMessage = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning!';
  if (h < 17) return 'Good afternoon!';
  return 'Good evening!';
};

const SUBTITLES = [
  'Track your progress and keep up the great work! 🎉',
  'Your mental wellness journey is inspiring. Keep going! ✨',
  "You're building healthy habits every day. Stay strong! 🌟",
  'Your dedication to self-care is truly remarkable! 💪',
  'Keep up the amazing work on your wellness journey! 🌱',
];

const randomSubtitle = () => SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)];

const fmtDate = () =>
  new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const levelLabel = (v: number) => (v >= 7 ? 'High' : v >= 4 ? 'Medium' : 'Low');

const gaugeColor = (value: number, invert = false): string => {
  if (invert) {
    if (value <= 3) return '#6BCB77';
    if (value <= 6) return '#FFD93D';
    return '#FF6B6B';
  }
  if (value <= 3) return '#FF6B6B';
  if (value <= 6) return '#FFD93D';
  return '#6BCB77';
};

// ─── SemiGauge ────────────────────────────────────────────────────────────────

interface GaugeProps {
  value: number;
  size?: number;
  invertColors?: boolean;
  leftText?: string;
  midText?: string;
  rightText?: string;
}

const SemiGauge: React.FC<GaugeProps> = ({
  value,
  size = 130,
  invertColors = false,
  leftText = 'Low',
  midText = 'Mod',
  rightText = 'High',
}) => {
  const animPct = useRef(new Animated.Value(0)).current;
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.58;
  const circumference = Math.PI * r;
  const pct = Math.max(0, Math.min(10, value)) / 10;
  const color = gaugeColor(value, invertColors);

  useEffect(() => {
    Animated.timing(animPct, {
      toValue: pct,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const filled = circumference * pct;

  return (
    <View className="items-center">
      <Svg width={size} height={size * 0.62}>
        <Path
          d={arcPath}
          stroke="#E5E7EB"
          strokeWidth={size * 0.1}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d={arcPath}
          stroke={color}
          strokeWidth={size * 0.1}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          fill="none"
        />
      </Svg>
      <View
        className="absolute items-center justify-center"
        style={{ top: size * 0.28, left: 0, right: 0 }}
      >
        <Text style={{ color, fontSize: size * 0.16, fontWeight: '800' }}>{value}</Text>
        <Text className="text-gray-400" style={{ fontSize: size * 0.08, fontWeight: '600' }}>
          /10
        </Text>
      </View>
      <View className="flex-row justify-between w-full px-1 mt-1">
        <Text className="text-gray-400 text-xs">{leftText}</Text>
        <Text className="text-gray-400 text-xs">{midText}</Text>
        <Text className="text-gray-400 text-xs">{rightText}</Text>
      </View>
    </View>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      className={`bg-gray-200 rounded-lg ${className}`}
      style={{ opacity: anim }}
    />
  );
};

// ─── Stress Alert Banner ──────────────────────────────────────────────────────

interface AlertInfo {
  title: string;
  message: string;
  action: string;
}

const StressAlert: React.FC<{ alert: AlertInfo; onDismiss: () => void }> = ({
  alert,
  onDismiss,
}) => (
  <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-2xl px-3 py-3 mb-5 gap-3">
    <View className="w-8 h-8 rounded-full bg-white/80 items-center justify-center">
      <Text className="text-base">🧠</Text>
    </View>
    <View className="flex-1">
      <Text className="text-blue-900 text-xs font-bold">{alert.title}</Text>
      <Text className="text-blue-700 text-xs mt-0.5" numberOfLines={2}>
        {alert.message}
      </Text>
    </View>
    <TouchableOpacity className="bg-white/80 border border-white/60 rounded-xl px-3 py-1.5">
      <Text className="text-blue-800 text-xs font-bold">{alert.action}</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={onDismiss}
      className="w-7 h-7 rounded-full bg-white/70 items-center justify-center"
    >
      <Text className="text-blue-700 text-xs font-bold">✕</Text>
    </TouchableOpacity>
  </View>
);

// ─── Widget Card ──────────────────────────────────────────────────────────────

const WidgetCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <View className={`bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm ${className}`}>
    {children}
  </View>
);

// ─── Advice ───────────────────────────────────────────────────────────────────

const ADVICE = [
  { emoji: '🧘', title: 'Take a 5-min breathing break', desc: 'Your stress levels suggest you need a quick reset' },
  { emoji: '🚶', title: 'Schedule a 30-min walk', desc: 'Your energy is high — perfect for outdoor activity' },
  { emoji: '📖', title: "Journal about today's wins", desc: "Capture your positive mood while it's fresh" },
  { emoji: '🎯', title: "Plan tomorrow's wellness", desc: 'Set intentions for continued positive momentum' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface MoodState {
  emoji: string;
  label: string;
  intensity: number;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const DashboardHome: React.FC = () => {
  const subtitle = useRef(randomSubtitle()).current;

  const [currentMood, setCurrentMood] = useState<MoodState | null>(null);
  const [stressValue, setStressValue] = useState<number | null>(null);
  const [energyValue, setEnergyValue] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(true);

  const [isMoodLoading, setIsMoodLoading] = useState(true);
  const [isStressLoading, setIsStressLoading] = useState(true);
  const [isEnergyLoading, setIsEnergyLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setIsMoodLoading(true);
        setIsStressLoading(true);
        setIsEnergyLoading(true);

        const latest = await MoodEntriesService.getLatestMoodEntry(USER_ID);

        if (latest) {
          const feelingStr = latest.feeling || '';
          const tokens = feelingStr.trim().split(' ');
          const lastToken = tokens[tokens.length - 1] || 'happy';
          const emoji = lastToken.toLowerCase();
          const label = lastToken.charAt(0).toUpperCase() + lastToken.slice(1).toLowerCase();
          const intensity = Math.max(1, Math.min(10, Number(latest.intensity_level ?? 5)));

          setCurrentMood({ emoji, label, intensity });
          setIsMoodLoading(false);

          const insight = await MoodEntriesService.getLatestAiInsight(USER_ID);

          if (insight) {
            const s = Math.max(1, Math.min(10, Number(insight.stress_level ?? intensity)));
            const e = Math.max(1, Math.min(10, Number(insight.energy_level ?? Math.max(1, 11 - intensity))));
            setStressValue(s);
            setEnergyValue(e);
            setStressLevel(levelLabel(s));
          } else {
            const s = Math.max(1, Math.min(10, intensity));
            const e = Math.max(1, Math.min(10, 11 - s));
            setStressValue(s);
            setEnergyValue(e);
            setStressLevel(levelLabel(s));
          }
        } else {
          setCurrentMood(null);
          setStressValue(null);
          setEnergyValue(null);
          setStressLevel(null);
          setIsMoodLoading(false);
        }
      } catch (e) {
        console.error('Failed to load mood:', e);
        setIsMoodLoading(false);
      } finally {
        setIsStressLoading(false);
        setIsEnergyLoading(false);
      }
    };

    load();
  }, []);

  const stressAlert: AlertInfo | null =
    stressLevel === 'High'
      ? {
          title: 'Stress Alert',
          message: 'Your stress levels are elevated. Take a 5-minute meditation break.',
          action: 'Meditate',
        }
      : stressLevel === 'Medium'
      ? {
          title: 'Mindfulness Reminder',
          message: 'Consider a quick breathing exercise to maintain calm.',
          action: 'Take a Break',
        }
      : null;

  return (
  <NavigationBar title="DashBoard">
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingTop: 15, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Welcome ───────────────────────────────────────────────── */}
          <View className="flex-row items-start justify-between mb-6">
            <View className="flex-1 pr-3">
              <Text className="text-gray-900 text-2xl font-extrabold tracking-tight mb-1">
                {getWelcomeMessage()} 👋
              </Text>
              <Text className="text-gray-500 text-sm leading-5" numberOfLines={2}>
                {subtitle}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5 bg-white rounded-xl px-3 py-2">
              <Text className="text-gray-500 text-xs font-semibold">{fmtDate()}</Text>
              <Icon name="Calendar" size={16} color="#6B7280" />
            </View>
          </View>

          {/* ── Stress Alert ──────────────────────────────────────────── */}
          {stressAlert && showAlert && (
            <StressAlert alert={stressAlert} onDismiss={() => setShowAlert(false)} />
          )}

          {/* ── Widgets ───────────────────────────────────────────────── */}
          <View className="flex-col gap-3 mb-6">

            {/* Current Mood */}
            <WidgetCard className="w-full">
              <View className="flex-row items-center mb-3">
                <Image
                  source={require('@/assets/images/current-mood.png')}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
                <View className="ml-2">
                  <Text className="text-gray-800 text-xs font-bold">Current Mood</Text>
                  <Text className="text-gray-400 text-xs">How you're feeling</Text>
                </View>
              </View>

              {isMoodLoading ? (
                <View className="items-center gap-2 py-2">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <Skeleton className="w-20 h-3" />
                  <Skeleton className="w-24 h-2.5" />
                </View>
              ) : currentMood ? (
                <View className="items-center">
                  {MOOD_IMAGES[currentMood.emoji.toLowerCase()] ? (
                    <Image
                      source={MOOD_IMAGES[currentMood.emoji.toLowerCase()]}
                      style={{ width: 130, height: 100 }}
                      className=" mb-0"
                      resizeMode="contain"
                    />
                  ) : (
                    <Image
                      source={require('@/assets/images/lumira/shy.png')}
                      style={{ width: 120, height: 100 }}
                      className="mb-0"
                      resizeMode="contain"
                    />
                  )}
                  <Text className="text-gray-800 text-sm font-bold mt-1">
                    {currentMood.label}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    Intensity: {currentMood.intensity}/10
                  </Text>
                </View>
              ) : (
                <View className="items-center py-2">
                  <Video
                    source={require('@/assets/images/lumira/animation.mp4')}
                    className="w-16 h-16 rounded-lg mb-2"
                    resizeMode={ResizeMode.COVER}
                    shouldPlay
                    isLooping
                    isMuted
                  />
                  <Text className="text-gray-400 text-xs italic mb-3">
                    No mood logged yet
                  </Text>
                  <TouchableOpacity className="bg-[#A5A88C] rounded-full px-4 py-2">
                    <Text className="text-white text-xs font-bold">Track my mood</Text>
                  </TouchableOpacity>
                </View>
              )}
            </WidgetCard>

            {/* Stress Level */}
            {currentMood && (
              <WidgetCard className="w-full">
                <View className="flex-row items-center mb-3">
                  <Image
                    source={require('@/assets/images/stress-level.png')}
                    className="w-6 h-6"
                    resizeMode="contain"
                  />
                  <View className="ml-2">
                    <Text className="text-gray-800 text-xs font-bold">Stress Level</Text>
                    <Text className="text-gray-400 text-xs">Current tension</Text>
                  </View>
                </View>
                <View className="items-center">
                  {isStressLoading ? (
                    <Skeleton className="w-40 h-24 rounded-xl" />
                  ) : (
                    <SemiGauge
                      value={stressValue ?? 5}
                      size={SW * 0.45}
                      invertColors
                      leftText="Low"
                      midText="Moderate"
                      rightText="High"
                    />
                  )}
                </View>
              </WidgetCard>
            )}

            {/* Energy Level */}
            {currentMood && (
              <WidgetCard className="w-full">
                <View className="flex-row items-center mb-3">
                  <Image
                    source={require('@/assets/images/energy-level.png')}
                    className="w-8 h-8"
                    resizeMode="contain"
                  />
                  <View className="ml-2">
                    <Text className="text-gray-800 text-xs font-bold">Energy Level</Text>
                    <Text className="text-gray-400 text-xs">Your vitality</Text>
                  </View>
                </View>
                <View className="items-center">
                  {isEnergyLoading ? (
                    <Skeleton className="w-40 h-24 rounded-xl" />
                  ) : (
                    <SemiGauge
                      value={energyValue ?? 5}
                      size={SW * 0.45}
                      leftText="Low"
                      midText="Moderate"
                      rightText="High"
                    />
                  )}
                </View>
              </WidgetCard>
            )}
          </View>

          {/* ── Personalized Advice ───────────────────────────────────── 
          <Text className="text-gray-900 text-base font-extrabold tracking-tight mb-3">
            💡 Personalized Advice
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 4 }}
          >
            {ADVICE.map((a, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                style={{ width: 148 }}
              >
                <Text className="text-2xl mb-2">{a.emoji}</Text>
                <Text className="text-gray-800 text-xs font-bold leading-4 mb-1">
                  {a.title}
                </Text>
                <Text className="text-gray-400 text-xs leading-4">{a.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
           */}   

          {/* ── Wellness Graph ────────────────────────────────────────── */}
          <WellnessGraph isPremium={false} />

        </Animated.View>
      </ScrollView>
    </View>
    </NavigationBar>
  );
};

export default DashboardHome;