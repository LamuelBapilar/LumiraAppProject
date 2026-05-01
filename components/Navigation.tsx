//Navigation.tsx
import Icon from '@/components/AppIcon';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const DRAWER_WIDTH = 260;

type NavItem = {
  name: string;
  icon: string;
  label: string;
  badge?: number;
};

const NAV_ITEMS: NavItem[] = [
  { name: 'HomePage', icon: 'House', label: 'Home' },
  { name: 'mood-tracker', icon: 'SmilePlus', label: 'Mood Tracker' },
  { name: 'SleepTracker', icon: 'Moon', label: 'Sleep Tracker' },
  { name: 'journal', icon: 'BookOpen', label: 'Journal' },
  { name: 'insights', icon: 'BarChart2', label: 'Insights' },
  { name: 'SBwellnessCheck', icon: 'Heart', label: 'Lumi Therapy' },
  { name: 'MeditationRoom', icon: 'Leaf', label: 'Meditation Room' },
  { name: 'BreathWork', icon: 'Wind', label: 'Breath Work' },
];

type Props = {
  children: React.ReactNode;
  title?: string;
  activeRoute?: string;
  onNavigate?: (name: string) => void;
};

const DrawerLayout = ({ children, title = 'App', activeRoute = 'index', onNavigate }: Props) => {
  // Safely get router — avoids crash when navigation context is not yet ready
  let router: ReturnType<typeof useRouter> | null = null;
  try {
    router = useRouter();
  } catch (_) {
    router = null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setIsOpen(false));
  };

  const handleNavigate = (name: string) => {
    closeDrawer();
    onNavigate?.(name);
    if (!router) return;
    if (name === 'index') {
      router.push('/');
    } else {
      router.push(`/${name}` as any);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">

      {/* MAIN CONTENT */}
      <SafeAreaView className="flex-1">

        {/* TOP BAR */}
        <View className="h-16 bg-white border-b border-gray-200 flex-row items-center px-4 gap-3 mt-7">
          <TouchableOpacity
            onPress={isOpen ? closeDrawer : openDrawer}
            className="w-10 h-10 border border-gray-200 rounded-lg items-center justify-center"
          >
            <Icon name={isOpen ? 'X' : 'Menu'} size={22} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">{title}</Text>
        </View>

        {/* PAGE CONTENT */}
        <View className="flex-1">
          {children}
        </View>

      </SafeAreaView>

      {/* OVERLAY */}
      {isOpen && (
        <Animated.View
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-black/30"
        >
          <Pressable className="flex-1" onPress={closeDrawer} />
        </Animated.View>
      )}

      {/* DRAWER */}
      <Animated.View
        style={{
          transform: [{ translateX }],
          width: DRAWER_WIDTH,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <SafeAreaView className="flex-1">

          {/* DRAWER HEADER */}
          <View className="px-4 py-5 border-b border-gray-100 flex-row items-center gap-3 mt-7">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
              <Text className="text-blue-600 font-semibold text-sm">JD</Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-gray-800">John Doe</Text>
              <Text className="text-xs text-gray-500">john@example.com</Text>
            </View>
          </View>

          {/* NAV ITEMS */}
          <ScrollView className="flex-1 px-2 pt-3">
            <Text className="text-xs text-gray-400 px-2 mb-2 uppercase tracking-widest">Main</Text>

            {NAV_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.name}
                onPress={() => handleNavigate(item.name)}
                className={`flex-row items-center gap-3 px-3 py-3 rounded-xl mb-1 ${
                  activeRoute === item.name ? 'bg-gray-100' : ''
                }`}
              >
                <Icon
                  name={item.icon}
                  size={18}
                  color={activeRoute === item.name ? '#1D4ED8' : '#6B7280'}
                />
                <Text className={`text-sm flex-1 ${
                  activeRoute === item.name
                    ? 'font-semibold text-blue-700'
                    : 'text-gray-600'
                }`}>
                  {item.label}
                </Text>
                {item.badge && (
                  <View className="bg-red-100 px-2 py-0.5 rounded-full">
                    <Text className="text-red-600 text-xs font-semibold">{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* DRAWER FOOTER */}
          <View className="px-2 pb-4 border-t border-gray-100 pt-3">
            <TouchableOpacity className="flex-row items-center gap-3 px-3 py-3 rounded-xl">
              <Icon name="LogOut" size={18} color="#6B7280" />
              <Text className="text-sm text-gray-600">Log out</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </Animated.View>

    </View>
  );
};

export default DrawerLayout;