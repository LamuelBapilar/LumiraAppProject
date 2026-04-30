import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '@/components/AppIcon';

type BreathingSettings = {
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  minutes: number;
  music: string;
};

type Props = {
  onStart?: (data: BreathingSettings) => void;
};

const MUSIC_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Delta 1–4 Hz', value: 'delta' },
  { label: 'Theta 4–8 Hz', value: 'theta' },
  { label: 'Alpha 8–12 Hz', value: 'alpha' },
  { label: 'Solfeggio ~412 Hz', value: 'solfeggio' },
];

const BreathingExerciseForm: React.FC<Props> = ({ onStart }) => {
  const [inhale, setInhale] = useState('4');
  const [hold, setHold] = useState('4');
  const [exhale, setExhale] = useState('4');
  const [pause, setPause] = useState('4');
  const [minutes, setMinutes] = useState('5');

  const [music, setMusic] = useState('none');

  return (
    <View className="bg-white rounded-xl p-6 border border-gray-200 space-y-5">

      {/* HEADER */}
      <View className="flex-row items-center gap-2">
        <Icon name="Settings" size={20} color="#4B5563" />
        <Text className="text-lg font-semibold mb-2 pt-1">
          Breathing Settings
        </Text>
      </View>

      <Text className="text-base text-gray-500 mb-2">
        Customize your breathing pattern.
      </Text>

      {/* INPUT GRID */}
      <View className="flex-row flex-wrap">

        {/* Inhale */}
        <View className="w-1/2 pr-2 mb-4">
          <Text className="text-sm text-gray-500 mb-1">Inhale (sec)</Text>
          <TextInput
            value={inhale}
            onChangeText={setInhale}
            keyboardType="numeric"
            className="border border-gray-200 rounded-xl p-3 text-base"
          />
        </View>

        {/* Hold in */}
        <View className="w-1/2 pl-2 mb-4">
          <Text className="text-sm text-gray-500 mb-1">Hold in (sec)</Text>
          <TextInput
            value={hold}
            onChangeText={setHold}
            keyboardType="numeric"
            className="border border-gray-200 rounded-xl p-3 text-base"
          />
        </View>

        {/* Exhale */}
        <View className="w-1/2 pr-2 mb-4">
          <Text className="text-sm text-gray-500 mb-1">Exhale (sec)</Text>
          <TextInput
            value={exhale}
            onChangeText={setExhale}
            keyboardType="numeric"
            className="border border-gray-200 rounded-xl p-3 text-base"
          />
        </View>

        {/* Hold out */}
        <View className="w-1/2 pl-2 mb-4">
          <Text className="text-sm text-gray-500 mb-1">Hold out (sec)</Text>
          <TextInput
            value={pause}
            onChangeText={setPause}
            keyboardType="numeric"
            className="border border-gray-200 rounded-xl p-3 text-base"
          />
        </View>

        {/* Duration */}
        <View className="w-full mb-4">
          <Text className="text-sm text-gray-500 mb-1">
            Duration (minutes)
          </Text>
          <TextInput
            value={minutes}
            onChangeText={setMinutes}
            keyboardType="numeric"
            className="border border-gray-200 rounded-xl p-3 text-base"
          />
        </View>

      </View>

      {/* MUSIC */}
      <View>
        <Text className="text-sm text-gray-500 mb-2">
          Background Music
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {MUSIC_OPTIONS.map((item) => {
              const active = music === item.value;

              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setMusic(item.value)}
                  className={`px-4 py-2 rounded-xl border ${
                    active
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text className={`text-sm font-semibold ${
                    active ? 'text-white' : 'text-gray-700'
                  }`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* START BUTTON */}
      <TouchableOpacity
        onPress={() => {
          onStart?.({
            inhale: Number(inhale),
            hold: Number(hold),
            exhale: Number(exhale),
            pause: Number(pause),
            minutes: Number(minutes),
            music,
          });
        }}
        className="w-full bg-blue-600 py-4 rounded-xl mt-4"
      >
        <Text className="text-white text-center text-base font-semibold">
          Start Session
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default BreathingExerciseForm;