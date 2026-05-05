import Icon from '@/components/ui/AppIcon';
import React, { useState } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TriggerIdentificationProps {
  selectedTriggers: string[];
  onTriggersChange: (triggers: string[]) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const triggerCategories = [
  {
    id: 'work',
    label: 'Work & Career',
    icon: 'Briefcase',
    triggers: ['Deadline pressure', 'Team conflict', 'Heavy workload', 'Work-life balance'],
  },
  {
    id: 'relationships',
    label: 'Relationships',
    icon: 'Heart',
    triggers: ['Argument with partner', 'Family conflict', 'Loneliness', 'Communication issues'],
  },
  {
    id: 'health',
    label: 'Health & Body',
    icon: 'Activity',
    triggers: ['Physical pain', 'Poor sleep', 'Fatigue', 'Illness/symptoms'],
  },
  {
    id: 'financial',
    label: 'Financial',
    icon: 'DollarSign',
    triggers: ['Money worries', 'Debt stress', 'Unexpected expenses', 'Budget constraints'],
  },
];

// ─── TriggerIdentification ────────────────────────────────────────────────────
const TriggerIdentification = ({ selectedTriggers, onTriggersChange }: TriggerIdentificationProps) => {
  const [customTrigger, setCustomTrigger]     = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleTrigger = (trigger: string) => {
    if (selectedTriggers?.includes(trigger)) {
      onTriggersChange(selectedTriggers.filter(t => t !== trigger));
    } else {
      onTriggersChange([...selectedTriggers, trigger]);
    }
  };

  const addCustomTrigger = () => {
    const trimmed = customTrigger?.trim();
    if (trimmed && !selectedTriggers?.includes(trimmed)) {
      onTriggersChange([...selectedTriggers, trimmed]);
      setCustomTrigger('');
      setShowCustomInput(false);
    }
  };

  const removeTrigger = (trigger: string) => {
    onTriggersChange(selectedTriggers.filter(t => t !== trigger));
  };

  const insightText = () => {
    const count = selectedTriggers?.length;
    if (count === 1)
      return `You've identified "${selectedTriggers[0]}" as a trigger. Consider developing specific coping strategies for this situation.`;
    if (count <= 3)
      return `You've identified ${count} triggers. Look for connections between them to understand underlying patterns.`;
    return `You've identified multiple triggers (${count}). This might indicate a particularly stressful period. Consider reaching out for additional support.`;
  };

  return (
    <View className="rounded-xl p-4 pr-6 border border-border">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="mr-2">
            <Icon name="AlertTriangle" size={20} color="#A5A88C" />
          </View>
          <Text className="font-heading font-semibold text-lg text-foreground">
            Trigger Identification
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCustomInput(!showCustomInput)}
          activeOpacity={0.7}
          className="p-2 rounded-lg"
        >
          <Icon name="Plus" size={16} color="gray" />
        </TouchableOpacity>
      </View>

      {/* ── Selected Triggers ──────────────────────────────────────────────── */}
      {selectedTriggers?.length > 0 && (
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-3">Identified Triggers</Text>
          <View className="flex-row flex-wrap">
            {selectedTriggers.map((trigger) => (
              <View
                key={trigger}
                className="flex-row items-center space-x-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full mr-2 mb-2"
              >
                <Text className="text-sm text-primary-500">{trigger}</Text>
                <TouchableOpacity
                  onPress={() => removeTrigger(trigger)}
                  activeOpacity={0.7}
                  className="ml-1"
                >
                  <Icon name="X" size={12} color='#A5A88C' />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Custom Trigger Input ───────────────────────────────────────────── */}
      {showCustomInput && (
        <View className="mb-6 p-4 bg-muted/30 rounded-xl border border-border">
          <Text className="font-body font-medium text-sm mb-3 text-foreground">
            Add Custom Trigger
          </Text>
          <View className="flex-row space-x-2">
            <TextInput
              placeholder="Describe what triggered this feeling..."
              placeholderTextColor="gray"
              value={customTrigger}
              onChangeText={setCustomTrigger}
              onSubmitEditing={addCustomTrigger}
              returnKeyType="done"
              maxLength={50}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
            />
            <TouchableOpacity
              onPress={addCustomTrigger}
              disabled={!customTrigger?.trim()}
              activeOpacity={0.7}
              className={`px-4 py-2 rounded-lg ${customTrigger?.trim() ? 'bg-primary' : 'bg-primary opacity-50'}`}
            >
              <Text className="text-primary-foreground text-sm font-medium">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Trigger Categories ─────────────────────────────────────────────── */}
      <View className="space-y-6">
        {triggerCategories.map((category) => {
          const selectedCount = category.triggers.filter(t => selectedTriggers?.includes(t)).length;
          return (
            <View key={category.id}>
              {/* Category Header */}
              <View className="flex-row items-center mb-3">
                <View className="mr-2">
                  <Icon name={category.icon} size={16} color='#A5A88C' />
                </View>
                <Text className="font-body font-medium text-foreground">{category.label}</Text>
                <Text className="text-xs text-text-secondary ml-1">({selectedCount} selected)</Text>
              </View>

              {/* Trigger Chips */}
              <View className="flex-row flex-wrap">
                {category.triggers.map((trigger) => {
                  const isSelected = selectedTriggers?.includes(trigger);
                  return (
                    <TouchableOpacity
                      key={trigger}
                      onPress={() => toggleTrigger(trigger)}
                      activeOpacity={0.7}
                      className={`flex-row items-center justify-between px-3 py-2 rounded-lg border mr-2 mb-2 ${
                        isSelected
                          ? 'bg-primary-500/10 border-primary-500/20'
                          : 'bg-muted/20 border-border'
                      }`}
                    >
                      <Text className={`text-sm mr-2 ${isSelected ? 'text-primary-500' : 'text-text-secondary'}`}>
                        {trigger}
                      </Text>
                      {isSelected && <Icon name="Check" size={14} color='#A5A88C' />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Trigger Insight ────────────────────────────────────────────────── */}
      {selectedTriggers?.length > 0 && (
        <View className="mt-6 p-4 bg-accent/5 rounded-xl border border-accent/20">
          <View className="flex-row items-start">
            <View className="mr-2">
              <Icon name="Lightbulb" size={16} color='#A5A88C' />
            </View>
            <View className="flex-1">
              <Text className="font-body font-medium text-sm text-foreground mb-1">
                Trigger Pattern Insight
              </Text>
              <Text className="text-sm text-text-secondary">{insightText()}</Text>
            </View>
          </View>
        </View>
      )}

    </View>
  );
};

export default TriggerIdentification;