import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';

// ─── Mood Data ────────────────────────────────────────────────────────────────

const defaultMoods = [
  { emoji: require('@/assets/images/lumira/happy.png'),     label: 'Happy',     value: 'happy',     color: 'text-primary-500' },
  { emoji: require('@/assets/images/lumira/sad.png'),       label: 'Sad',       value: 'sad',       color: 'text-text-secondary' },
  { emoji: require('@/assets/images/lumira/depressed.png'), label: 'Depressed', value: 'depressed', color: 'text-text-secondary' },
  { emoji: require('@/assets/images/lumira/angry.png'),     label: 'Angry',     value: 'angry',     color: 'text-text-secondary' },
  { emoji: require('@/assets/images/lumira/tired.png'),     label: 'Tired',     value: 'tired',     color: 'text-text-secondary' },
  { emoji: require('@/assets/images/lumira/confused.png'),  label: 'Confused',  value: 'confused',  color: 'text-text-secondary' },
  { emoji: require('@/assets/images/lumira/calm.png'),      label: 'Calm',      value: 'calm',      color: 'text-text-secondary' },
  { emoji: require('@/assets/images/lumira/confident.png'), label: 'Confident', value: 'confident', color: 'text-text-secondary' },
  { emoji: require('@/assets/images/lumira/cool.png'),      label: 'Cool',      value: 'cool',      color: 'text-text-secondary' },
  { emoji: require('@/assets/images/lumira/shy.png'),       label: 'Shy',       value: 'shy',       color: 'text-text-secondary' },
  { emoji: require('@/assets/images/lumira/suprise.png'),   label: 'Surprised', value: 'surprised', color: 'text-text-secondary' },
  { emoji: require('@/assets/images/lumira/worried.png'),   label: 'Worried',   value: 'worried',   color: 'text-text-secondary' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mood {
  emoji: any;
  label: string;
  value: string;
  color: string;
}

interface EmojiSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

// ─── EmojiSelector ────────────────────────────────────────────────────────────

const EmojiSelector = ({ selectedMood, onMoodSelect }: EmojiSelectorProps) => {
  const renderMood = ({ item }: { item: Mood }) => {
    const isSelected = selectedMood?.value === item.value;

    return (
      <Pressable
        onPress={() => onMoodSelect(item)}
        className={`flex-1 flex-col items-center p-3 rounded-xl border m-1 ${
          isSelected
            ? 'border-primary-300 bg-white'
            : 'border-border bg-white'
        }`}
      >
        <Image
          source={item.emoji}
          style={{ width: 56, height: 80, marginBottom: 8 }}
          resizeMode="contain"
        />
        <Text className={`text-xs font-medium text-center font-caption ${item.color}`}>
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="bg-card rounded-organic-lg p-4 border border-border">
      {/* Header */}
      <Text className="font-heading font-semibold text-lg text-foreground mb-4">
        How are you feeling?
      </Text>

      {/* Mood Grid — 3 columns */}
      <FlatList
        data={defaultMoods}
        keyExtractor={(item) => item.value}
        renderItem={renderMood}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperClassName="justify-between"
      />

      {/* Selected mood summary */}
      {selectedMood && (
        <View className="mt-4 p-4 bg-white rounded-xl border border-primary-300">
          <View className="flex-row items-center gap-3">
            <Image
              source={selectedMood.emoji}
              style={{ width: 40, height: 56 }}
              resizeMode="contain"
            />
            <View>
              <Text className="font-medium text-foreground font-body">
                Feeling {selectedMood.label}
              </Text>
              <Text className="text-xs text-text-secondary font-caption">
                Selected at {new Date().toLocaleTimeString()}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default EmojiSelector;