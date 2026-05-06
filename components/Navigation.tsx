// Navigation.tsx
// Shell layout — combines NavigationHeader + PrimaryNavigation
// Holds all animation state and passes props down to each component

import NavigationHeader from '@/components/ui/NavigationHeader';
import PrimaryNavigation, { DRAWER_WIDTH } from '@/components/ui/PrimaryNavigation';
import React, { useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  View,
} from 'react-native';

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  children: React.ReactNode;
  activeRoute?: string;
  onNavigate?: (name: string) => void;
};

// ─── DrawerLayout ─────────────────────────────────────────────────────────────
const NavigationBar = ({
  children,
  activeRoute = 'dashboard-home',
  onNavigate,
}: Props) => {

  // ── Animation state (owned here, passed down to both children) ───────────
  const [isOpen, setIsOpen]             = useState(false);
  const translateX                       = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity                   = useRef(new Animated.Value(0)).current;

  // ── Open drawer ───────────────────────────────────────────────────────────
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

  // ── Close drawer ──────────────────────────────────────────────────────────
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

  const toggleDrawer = () => (isOpen ? closeDrawer() : openDrawer());

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <SafeAreaView style={{ flex: 1 }}>

        {/* NavigationHeader owns: top bar, smart tip, modals (notifs/feedback/streak) */}
        <NavigationHeader onToggleSidebar={toggleDrawer} />

        {/* Page content */}
        <View style={{ flex: 1 }}>
          {children}
        </View>

      </SafeAreaView>

      {/* PrimaryNavigation owns: backdrop overlay + animated drawer panel */}
      <PrimaryNavigation
        isOpen={isOpen}
        translateX={translateX}
        overlayOpacity={overlayOpacity}
        activeRoute={activeRoute}
        onClose={closeDrawer}
      />

    </View>
  );
};

export default NavigationBar;