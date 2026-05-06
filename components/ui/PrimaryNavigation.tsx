// PrimaryNavigation.tsx
// Mobile drawer navigation — converted to NativeWind (className)

import AppIcon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Commented imports (not yet converted / web-only) ─────────────────────────
// import { Link, useLocation } from 'react-router-dom';
// import { useClerk } from '@clerk/clerk-react';
// import { useSnackbar } from './Snackbar';
// import StripeCheckoutButton from '../checkout/StripeCheckoutButton';
// import PaymentsService from '../../services/PaymentsService';
// import { useUserSync } from '@/hooks/useUserSync';

// ─── Static user (replaces Clerk useUser) ─────────────────────────────────────
const USER_ID = 'user_3CClVidzX562pYzJPZjhejzmvn7';

// ─── Drawer width (export so Navigation.tsx can use it) ───────────────────────
export const DRAWER_WIDTH = 260;

// ─── Nav items ────────────────────────────────────────────────────────────────
type NavItem = {
  name: string;
  icon: string;
  label: string;
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  { name: 'dashboard-home',     icon: 'House',         label: 'Home',            description: 'Dashboard overview'    },
  { name: 'mood-tracking',      icon: 'SmilePlus',     label: 'Mood Tracker',    description: 'Log your mood'         },
  { name: 'sleep-tracker',      icon: 'Moon',          label: 'Sleep Tracker',   description: 'Track your sleep'      },
  { name: 'journal',            icon: 'BookOpen',      label: 'Journal',         description: 'Smart reflection'      },
  { name: 'analytics-insights', icon: 'Sparkles',      label: 'Insights',        description: 'Analytics & patterns'  },
  { name: 'start-premium',      icon: 'MessageCircle', label: 'Lumi Therapy',    description: 'Guided therapy tools'  },
  { name: 'meditation-room',    icon: 'Leaf',          label: 'Meditation Room', description: 'Guided meditations'    },
  { name: 'breathing-exercise', icon: 'Wind',          label: 'Breath Work',     description: 'Guided breathing'      },
];

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  isOpen: boolean;
  translateX: Animated.Value;
  overlayOpacity: Animated.Value;
  activeRoute?: string;
  onClose: () => void;
};

// ─── PrimaryNavigation ────────────────────────────────────────────────────────
const PrimaryNavigation = ({
  isOpen,
  translateX,
  overlayOpacity,
  activeRoute = 'dashboard-home',
  onClose,
}: Props) => {
  const router = useRouter();

  const handleNavigate = (name: string) => {
    onClose();
    try {
      router.push(`/${name}` as any);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop overlay ──────────────────────────────────────────────── */}
      <Animated.View
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 z-40 bg-black/20"
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      {/* ── Drawer panel ──────────────────────────────────────────────────── */}
      <Animated.View
        style={{
          transform: [{ translateX }],
          width: DRAWER_WIDTH,
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        }}
        className="absolute top-0 bottom-0 left-0 z-50 bg-background elevation-10"
      >
        <SafeAreaView className="flex-1">

          {/* ── Drawer header: logo + close ───────────────────────────────── */}
          <View className="h-16 px-4 border-b border-border flex-row items-center justify-between mt-9">
            <AppImage
              source={require('@/assets/images/lumira/main logo.png')}
              className="w-[90px] h-[90px]"
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center rounded-organic-sm"
              activeOpacity={0.7}
            >
              <AppIcon name="X" size={20} />
            </TouchableOpacity>
          </View>

          {/* ── Nav item list ──────────────────────────────────────────────── */}
          <ScrollView
            className="flex-1 px-2 pt-3"
            showsVerticalScrollIndicator={false}
          >
            {NAV_ITEMS.map((item) => {
              const active = activeRoute === item.name;

              return (
                <TouchableOpacity
                  key={item.name}
                  onPress={() => handleNavigate(item.name)}
                  activeOpacity={0.7}
                  className={`flex-row items-center px-3 py-3 rounded-organic-md mb-0.5 ${active ? 'bg-primary-200' : 'bg-transparent'}`}
                >
                  <AppIcon
                    name={item.icon}
                    size={20}
                    color="#000000"
                    strokeWidth={active ? 2.2 : 1.8}
                  />

                  <View className="ml-3 flex-1">
                    <Text
                      className={`text-fluid-sm font-heading text-foreground ${active ? 'font-semibold' : 'font-normal'}`}
                    >
                      {item.label}
                    </Text>
                    <Text className="text-[11px] font-body text-text-secondary opacity-70 mt-px">
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Bottom spacer */}
            <View className="h-6" />
          </ScrollView>

        </SafeAreaView>
      </Animated.View>
    </>
  );
};

export default PrimaryNavigation;