import Icon from '@/components/ui/AppIcon';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';

type BreathingSettings = {
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  minutes: number;
  music: string;
};

type Props = {
  settings: BreathingSettings;
  onExit: () => void;
};

const BreathingSession: React.FC<Props> = ({ settings, onExit }) => {
  const { inhale, hold, exhale, pause, minutes } = settings;

  const [phase, setPhase] = useState('Inhale');
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [isDone, setIsDone] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;
  const phaseIndex = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef(false);

  const phases = [
    { name: 'Inhale', duration: inhale, to: 1.6 },
    { name: 'Hold', duration: hold, to: 1.6 },
    { name: 'Exhale', duration: exhale, to: 1 },
    { name: 'Hold', duration: pause, to: 1 },
  ];

  const stopCycle = () => {
    if (cycleTimeout.current) clearTimeout(cycleTimeout.current);
    scale.stopAnimation();
  };

  const runPhase = () => {
    if (!isRunningRef.current) return;

    const p = phases[phaseIndex.current];
    setPhase(p.name);

    Animated.timing(scale, {
      toValue: p.to,
      duration: p.duration * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    phaseIndex.current = (phaseIndex.current + 1) % phases.length;

    cycleTimeout.current = setTimeout(() => {
      runPhase();
    }, p.duration * 1000);
  };

  const startIntro = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setShowIntro(true);
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setShowIntro(false);
          isRunningRef.current = true;
          setIsRunning(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startIntro();
    return () => {
      stopCycle();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start/stop breath cycle when isRunning changes
  useEffect(() => {
    if (isRunning) {
      isRunningRef.current = true;
      runPhase();
    } else {
      isRunningRef.current = false;
      stopCycle();
    }
  }, [isRunning]);

  // SESSION TIMER
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          isRunningRef.current = false;
          setIsRunning(false);
          setIsDone(true);
          stopCycle();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // TOGGLE PAUSE/PLAY
  const toggle = () => {
    if (!isRunning) {
      stopCycle();
      phaseIndex.current = 0;
      scale.setValue(1);
      startIntro();
    } else {
      isRunningRef.current = false;
      setIsRunning(false);
    }
  };

  // RESET
  const reset = () => {
    stopCycle();
    if (timerRef.current) clearInterval(timerRef.current);
    isRunningRef.current = false;
    phaseIndex.current = 0;
    setPhase('Inhale');
    setTimeLeft(minutes * 60);
    setIsDone(false);
    setIsRunning(false);
    scale.setValue(1);
    startIntro();
  };

  return (
    <View style={{ width: '100%', minHeight: 380 }} className="items-center justify-center relative">

      {/* INTRO OVERLAY */}
      {showIntro && (
        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
          className="items-center justify-center bg-white/80"
        >
          <Text className="text-sm font-semibold mb-2">Get Ready</Text>
          <Text className="text-5xl font-bold">{countdown}</Text>
        </View>
      )}

      {/* DONE SCREEN */}
      {isDone && (
        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }}
          className="items-center justify-center bg-white/80 px-6"
        >
          <View className="bg-white p-6 rounded-2xl items-center gap-4 shadow">
            <Text className="text-lg font-semibold">Great job 🎉</Text>
            <Pressable
              onPress={onExit}
              className="bg-blue-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Go Back</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* BREATH CIRCLE */}
      <Animated.View
        style={{
          transform: [{ scale }],
          backgroundColor: '#A5A88C',
        }}
        className="w-56 h-56 rounded-full items-center justify-center"
      >
        {/* TIMER */}
        <Text className="text-white/80 text-sm">
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, '0')}
        </Text>

        {/* PHASE */}
        <Text className="text-white text-lg font-semibold mt-2">
          {phase}
        </Text>

        {/* CONTROLS */}
        <View className="flex-row gap-3 mt-4">
          <Pressable
            onPress={toggle}
            className="w-10 h-10 bg-white rounded-full items-center justify-center"
          >
            <Icon name={isRunning ? "Pause" : "Play"} size={14} color="#374151" />
          </Pressable>

          <Pressable
            onPress={reset}
            className="w-10 h-10 bg-white rounded-full items-center justify-center"
          >
            <Icon name="RotateCcw" size={14} color="#374151" />
          </Pressable>

          <Pressable
            onPress={onExit}
            className="w-10 h-10 bg-white rounded-full items-center justify-center"
          >
            <Icon name="X" size={14} color="#374151" />
          </Pressable>
        </View>

      </Animated.View>

    </View>
  );
};

export default BreathingSession;