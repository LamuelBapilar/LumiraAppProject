import Icon from '@/components/ui/AppIcon';
import React, { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_LENGTH = 1000;
const WORD_GOAL  = 50;

const QUICK_PROMPTS = [
  "What happened today that influenced your mood?",
  "How did you handle stress today?",
  "What are you grateful for right now?",
  "What would make tomorrow better?",
  "How are you taking care of yourself?",
  "What emotions are you experiencing?",
  "What thoughts are going through your mind?",
  "How is your energy level today?",
];

const QUICK_ACTIONS = [
  { label: '+ Today I felt...',      prompt: 'Today I felt...' },
  { label: "+ I'm grateful for...",  prompt: "I'm grateful for..." },
  { label: '+ Tomorrow I want to...', prompt: 'Tomorrow I want to...' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickNotesProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

// ─── QuickNotes ───────────────────────────────────────────────────────────────

const QuickNotes = ({ notes, onNotesChange }: QuickNotesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const wordCount = (notes || '')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const handleNotesChange = (value: string) => {
    onNotesChange(value);
  };

  const insertPrompt = (prompt: string) => {
    const current  = notes || '';
    const newNotes = current ? `${current}\n\n${prompt}\n` : `${prompt}\n`;
    handleNotesChange(newNotes);
  };

  const clearNotes = () => handleNotesChange('');

  const wordProgress = Math.min((wordCount / WORD_GOAL) * 100, 100);

  return (
    <View className="bg-card rounded-organic-xl p-4 border border-border">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center space-x-3">
          <Icon name="FileText" size={20} color="#A5A88C" />
          <Text className="font-heading font-semibold text-lg text-foreground">
            Quick Notes
          </Text>
        </View>
        <View className="flex-row items-center space-x-2">
          <Text className="text-xs text-text-secondary font-caption">
            {wordCount} words
          </Text>
          {!!notes && (
            <Pressable
              onPress={clearNotes}
              className="p-1 bg-white border border-border rounded-md"
            >
              <Icon name="Trash2" size={14} color="#666666" />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Writing Prompts Toggle ──────────────────────────────────────────── */}
      <View className="mb-4">
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row items-center space-x-2"
        >
          <Icon
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            size={16}
            color="#666666"
          />
          <Text className="text-sm text-text-secondary font-caption">
            Writing prompts
          </Text>
        </Pressable>

        {isExpanded && (
          <View className="mt-3 space-y-2">
            {QUICK_PROMPTS.map((prompt, index) => (
              <Pressable
                key={index}
                onPress={() => insertPrompt(prompt)}
                className="p-3 mb-1 bg-white rounded-organic-md border border-border"
              >
                <View className="flex-row items-start space-x-2">
                  <Icon name="MessageSquare" size={14} color="#A5A88C" />
                  <Text className="text-sm text-foreground font-body flex-1">
                    {prompt}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ── Text Area ──────────────────────────────────────────────────────── */}
      <View className="relative mb-4">
        <TextInput
          value={notes || ''}
          onChangeText={handleNotesChange}
          placeholder="Write about your feelings, thoughts, or what happened today..."
          placeholderTextColor="#666666"
          multiline
          maxLength={MAX_LENGTH}
          textAlignVertical="top"
          className="bg-background border border-border rounded-organic-lg text-sm text-foreground font-body p-4"
          style={{ height: 128, paddingRight: 48 }}
        />

        {/* Mic button */}
        <Pressable
          className="absolute right-2 bottom-8 w-10 h-10 rounded-full bg-primary-500 items-center justify-center"
        >
          <Icon name="Mic" size={16} color="#FFFFFF" />
        </Pressable>

        {/* Character counter */}
        <Text className="absolute bottom-2 right-3 text-xs text-text-secondary font-caption">
          {(notes || '').length}/{MAX_LENGTH}
        </Text>
      </View>

      {/* ── Quick Action Chips ──────────────────────────────────────────────── */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        {QUICK_ACTIONS.map(({ label, prompt }) => (
          <Pressable
            key={label}
            onPress={() => insertPrompt(prompt)}
            className="px-3 py-1 bg-primary-200 rounded-full"
          >
            <Text className="text-xs text-primary-600 font-caption">{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* ── Writing Tips (shown when empty) ────────────────────────────────── */}
      {!notes && (
        <View className="p-4 bg-white rounded-organic-lg">
          <View className="flex-row items-start space-x-3">
            <Icon name="Lightbulb" size={16} color="#A5A88C" />
            <View className="flex-1">
              <Text className="font-body font-medium text-sm text-foreground mb-1">
                Writing Tips
              </Text>
              {[
                'Be honest about your feelings',
                "Don't worry about grammar or structure",
                'Include specific details about your day',
                "Note any patterns you're observing",
              ].map((tip) => (
                <Text key={tip} className="text-xs text-text-secondary font-caption">
                  • {tip}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* ── Word Count Progress ─────────────────────────────────────────────── */}
      {wordCount > 0 && (
        <View className="mt-4 flex-row items-center space-x-2">
          <View className="flex-1 bg-muted rounded-full h-2">
            <View
              className="bg-primary-500 h-2 rounded-full"
              style={{ width: `${wordProgress}%` }}
            />
          </View>
          <Text className="text-xs text-text-secondary font-caption">
            {wordCount >= WORD_GOAL
              ? 'Great detail!'
              : `${WORD_GOAL - wordCount} more words for detailed entry`}
          </Text>
        </View>
      )}
    </View>
  );
};

export default QuickNotes;