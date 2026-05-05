import Icon from '@/components/ui/AppIcon';
import React from 'react';
import { Text, View } from 'react-native';

const BreathingHelp = () => {
  return (
    <View className="bg-white rounded-xl p-5 border border-gray-200">

      {/* Title */}
      <View className="flex-row items-center gap-2 mb-5">
        <Icon name="HelpCircle" size={18} color="#4B5563" />
        <Text className="text-base font-semibold">
          About Box Breathing
        </Text>
      </View>

      {/* What it is */}
      <View className="gap-2 mb-5">
        <Text className="text-sm text-gray-600">
          Box Breathing is a simple breathing technique where each step has equal timing.
          It helps slow down your heart rate and calm your mind.
        </Text>
        <Text className="text-sm text-gray-600">
          It is often used by athletes, soldiers, and people who deal with stress
          to regain focus and control.
        </Text>
      </View>

      {/* How it works */}
      <View className="bg-gray-50 rounded-lg p-3 mb-5">
        <Text className="font-semibold text-base mb-2">The Pattern</Text>
        <Text className="text-sm text-gray-600">1. Inhale — breathe in slowly through your nose</Text>
        <Text className="text-sm text-gray-600">2. Hold — keep your lungs full, stay relaxed</Text>
        <Text className="text-sm text-gray-600">3. Exhale — breathe out slowly through your mouth</Text>
        <Text className="text-sm text-gray-600">4. Hold — stay empty, relax your body</Text>
      </View>

      {/* Why it works */}
      <View className="gap-2 mb-5">
        <Text className="font-semibold text-base">Why it helps</Text>
        <Text className="text-sm text-gray-600">
          This rhythm signals your nervous system to switch from stress mode
          (fight or flight) to calm mode (rest and recovery).
        </Text>
        <Text className="text-sm text-gray-600">
          It can help reduce anxiety, improve focus, and make breathing more controlled.
        </Text>
      </View>

      {/* Background sound */}
      <View className="bg-gray-50 rounded-lg p-3 gap-2 mb-5">
        <Text className="font-semibold text-base">
          Choose Your Background Sound
        </Text>
        <Text className="text-sm text-gray-600">
          You can pair your breathing session with calming audio designed to support focus and relaxation.
          These sounds use different frequencies that may influence how your mind and body respond during breathing.
        </Text>
        <View className="gap-1">
          <Text className="text-sm text-gray-600">
            <Text className="font-bold">Delta (1–4 Hz)</Text> — deep sleep, full rest, body recovery
          </Text>
          <Text className="text-sm text-gray-600">
            <Text className="font-bold">Theta (4–8 Hz)</Text> — meditation, emotional release, anxiety relief
          </Text>
          <Text className="text-sm text-gray-600">
            <Text className="font-bold">Alpha (8–12 Hz)</Text> — calm focus, relaxed awareness
          </Text>
          <Text className="text-sm text-gray-600">
            <Text className="font-bold">Solfeggio (~412 Hz)</Text> — emotional balance and mental reset
          </Text>
        </View>
        <Text className="text-sm text-gray-600">
          Best used with headphones for stronger effect, but still works without them.
        </Text>
      </View>

      {/* Tips */}
      <View className="bg-blue-50 rounded-lg p-3">
        <Text className="font-semibold text-base mb-2">Tips</Text>
        <View className="gap-1">
          <Text className="text-sm text-gray-600">• Try to stay relaxed, don't force your breath</Text>
          <Text className="text-sm text-gray-600">• Close your eyes if it helps you focus</Text>
          <Text className="text-sm text-gray-600">• If dizzy, stop and breathe normally</Text>
          <Text className="text-sm text-gray-600">• Start with 1–2 minutes only</Text>
        </View>
      </View>

    </View>
  );
};

export default BreathingHelp;