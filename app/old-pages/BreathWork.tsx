import React, { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';

import BreathingForm from '@/app/breathing-exercise/components/BreathingForm';
import BreathingHelp from '@/app/breathing-exercise/components/BreathingHelp';
import BreathingSession from '@/app/breathing-exercise/components/BreathingSession';
import Icon from '@/components/AppIcon';
import NavigationBar from '@/components/Navigation';

type BreathingSettings = {
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  minutes: number;
  music: string;
};

export default function HomeScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [mode, setMode] = useState<'form' | 'session'>('form');
  const [settings, setSettings] = useState<BreathingSettings | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const toggleHelp = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowHelp(prev => !prev);
  };

  return (
    <NavigationBar title="Breath Work" activeRoute="home">
      <ScrollView>
        <View className="px-4 py-6 bg-white">

          {/* TITLE */}
          <View className="mb-6 items-center">
            <Text className="text-xl font-semibold text-gray-800">
              Breath Work
            </Text>
            <Text className="text-sm text-gray-500 mt-1 font-semibold text-center">
              Simple breathing exercise to help you relax, focus, and reset your mind.
            </Text>
          </View>

          {/* HEADER CARD */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">

            <View className="flex-row justify-between items-center">

              <View className="flex-row items-center gap-2">
                <Icon name="Wind" size={18} color="#4B5563" />
                <Text className="text-lg font-semibold">
                  Box breathing
                </Text>
              </View>

              <TouchableOpacity
                onPress={toggleHelp}
                className={`flex-row items-center gap-1 px-3 py-1 rounded-xl ${
                  showHelp ? 'bg-blue-600' : 'bg-gray-100'
                }`}
              >
                <Icon
                  name="HelpCircle"
                  size={14}
                  color={showHelp ? 'white' : '#4B5563'}
                />
                <Text className={`text-base font-semibold ${
                  showHelp ? 'text-white' : 'text-gray-700'
                }`}>
                  About
                </Text>
              </TouchableOpacity>

            </View>

            <Text className="text-sm text-gray-500 font-semibold mt-2">
              {showHelp
                ? 'Learn how box breathing helps calm your mind.'
                : 'Begin to slow your breathing and relax before starting.'}
            </Text>

          </View>

          {/* HELP */}
          {showHelp && (
            <View className="mb-4">
              <BreathingHelp />
            </View>
          )}

          {/* FORM */}
          <View className="mb-6">
            {mode === 'form' && (
              <BreathingForm
                onStart={(data: BreathingSettings) => {
                  setSettings(data);
                  setMode('session');
                  setShowHelp(false);
                }}
              />
            )}

            {/* SESSION */}
            {mode === 'session' && settings && (
              <View
                className="bg-white rounded-xl border border-gray-200 p-6 items-center"
                style={{ minHeight: 420, overflow: 'hidden' }}
              >
                <BreathingSession
                  settings={settings}
                  onExit={() => {
                    setMode('form');
                    setSettings(null);
                  }}
                />
              </View>
            )}

          </View>

        </View>
      </ScrollView>
    </NavigationBar>
  );
}