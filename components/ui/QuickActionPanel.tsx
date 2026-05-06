// QuickActionPanel.tsx
// Converted from web QuickActionPanel.jsx
// Styling: NativeWind (Tailwind classes)

import Icon from '@/components/ui/AppIcon';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Commented imports (web-only) ─────────────────────────────────────────────
// import Button from './Button';  // not needed — using TouchableOpacity with NativeWind

// ─── Types ────────────────────────────────────────────────────────────────────
type BreathingPhase = 'inhale' | 'hold' | 'exhale';

type QuickAction = {
  id: string;
  label: string;
  icon: string;
  iconColor: string;
  action: () => void;
};

type Props = {
  className?: string;
};

// ─── QuickActionPanel ─────────────────────────────────────────────────────────
const QuickActionPanel = ({ className = '' }: Props) => {
  const router = useRouter();

  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [breathingPhase, setBreathingPhase]               = useState<BreathingPhase>('inhale');
  const [breathingCount, setBreathingCount]               = useState(0);

  // ── Quick actions ─────────────────────────────────────────────────────────
  const quickActions: QuickAction[] = [
    {
      id: 'mood',
      label: 'Quick Mood',
      icon: 'Heart',
      iconColor: '#A5A88C', // primary
      action: () => router.push('/mood-tracking' as any),
    },
    {
      id: 'breathing',
      label: 'Breathing',
      icon: 'Wind',
      iconColor: '#A5A88C', // accent → primary (tailwind.config)
      action: () => setShowBreathingExercise(true),
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: 'PenTool',
      iconColor: '#666666', // text-secondary
      action: () => router.push('/journal' as any),
    },
    {
      id: 'sos',
      label: 'SOS',
      icon: 'Phone',
      iconColor: '#ef4444', // error red
      action: () => {},
    },
  ];

  // ── Breathing cycle — mirrors web breathingCycle timing exactly ───────────
  useEffect(() => {
    if (!showBreathingExercise) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    const runCycle = (count: number) => {
      timers.push(setTimeout(() => setBreathingPhase('hold'),   4000));
      timers.push(setTimeout(() => setBreathingPhase('exhale'), 8000));
      timers.push(
        setTimeout(() => {
          if (count < 5) {
            setBreathingPhase('inhale');
            setBreathingCount(count + 1);
          } else {
            setShowBreathingExercise(false);
            setBreathingCount(0);
          }
        }, 12000)
      );
    };

    runCycle(breathingCount);

    return () => timers.forEach(clearTimeout);
  }, [showBreathingExercise, breathingCount]);

  // Reset phase when modal opens
  useEffect(() => {
    if (showBreathingExercise && breathingCount === 0) {
      setBreathingPhase('inhale');
    }
  }, [showBreathingExercise]);

  const phaseLabel = {
    inhale: 'Breathe in slowly...',
    hold:   'Hold your breath...',
    exhale: 'Breathe out slowly...',
  }[breathingPhase];

  // Circle expands on inhale/hold, shrinks on exhale — mirrors web scale logic
  const circleSize = breathingPhase === 'exhale' ? 'w-24 h-24' : 'w-32 h-32';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View className={className}>

      {/* ── Breathing Exercise Modal ──────────────────────────────────────── */}
      <Modal
        visible={showBreathingExercise}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBreathingExercise(false)}
      >
        <Pressable
          className="flex-1 bg-black/20 items-center justify-center p-4"
          onPress={() => setShowBreathingExercise(false)}
        >
          <View
            className="w-full max-w-sm bg-background border border-border rounded-organic-xl p-8 items-center"
            onStartShouldSetResponder={() => true}
          >
            {/* Close button */}
            <TouchableOpacity
              onPress={() => setShowBreathingExercise(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-organic-sm bg-muted items-center justify-center"
              activeOpacity={0.7}
            >
              <Icon name="X" size={16} color="#666666" />
            </TouchableOpacity>

            {/* Title */}
            <Text className="font-heading font-medium text-fluid-lg text-foreground mb-1">
              Breathing Exercise
            </Text>
            <Text className="text-fluid-sm text-muted-foreground font-body mb-7 text-center">
              Follow the circle and breathe deeply
            </Text>

            {/* Breathing circle */}
            <View className="w-32 h-32 items-center justify-center mb-6">
              <View className={`${circleSize} rounded-full border-4 border-primary items-center justify-center`}>
                <Text className="font-heading font-medium text-fluid-xl text-primary capitalize">
                  {breathingPhase}
                </Text>
                <Text className="font-body text-fluid-xs text-muted-foreground">
                  {breathingCount + 1}/6
                </Text>
              </View>
            </View>

            {/* Phase instruction */}
            <Text className="font-body text-fluid-sm text-muted-foreground text-center">
              {phaseLabel}
            </Text>

          </View>
        </Pressable>
      </Modal>

    </View>
  );
};

export default QuickActionPanel;