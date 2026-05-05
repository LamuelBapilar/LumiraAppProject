import Icon from '@/components/ui/AppIcon';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestionnaireValue = Record<string, any>;

interface WellnessQuestionnaireProps {
  value?: QuestionnaireValue;
  onChange?: (val: QuestionnaireValue) => void;
}

interface OptionProps {
  name: string;
  current: any;
  val: any;
  label: string;
}

// ─── WellnessQuestionnaire ────────────────────────────────────────────────────
const WellnessQuestionnaire = ({ value, onChange }: WellnessQuestionnaireProps) => {
  const v = value || {};

  const setField = (key: string, val: any) => {
    onChange?.({ ...(value || {}), [key]: val });
  };

  // ── Option chip ─────────────────────────────────────────────────────────────
  const Option = ({ name, current, val, label }: OptionProps) => {
    const isSelected = current === val;
    return (
      <TouchableOpacity
        onPress={() => setField(name, val)}
        activeOpacity={0.7}
        className={`flex-row items-center px-3 py-1.5 rounded-lg border mr-2 mb-2 ${
          isSelected
            ? 'bg-primary border-primary'
            : 'bg-muted/30 border-border'
        }`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        {isSelected && (
          <Icon name="Check" size={12} color="white" />
        )}
        <Text
          className={`text-xs font-body ml-1 ${
            isSelected ? 'text-primary-foreground' : 'text-text-secondary'
          }`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // ── Section helper ──────────────────────────────────────────────────────────
  const Section = ({
    label,
    name,
    options,
  }: {
    label: string;
    name: string;
    options: { val: any; label: string }[];
  }) => (
    <View className="mb-4">
      <Text className="text-xs font-medium text-text-secondary mb-2">{label}</Text>
      <View className="flex-row flex-wrap">
        {options.map((opt) => (
          <Option
            key={String(opt.val)}
            name={name}
            current={v[name]}
            val={opt.val}
            label={opt.label}
          />
        ))}
      </View>
    </View>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View className="bg-white rounded-xl p-4 border border-border">
      {/* Header */}
      <View className="flex-row items-center space-x-3 mb-4">
        <Icon name="ListChecks" size={20} color="#A5A88C" />
        <Text className="font-heading font-semibold text-lg text-foreground">
          Profile & Daily Factors{' '}
          <Text className="font-body text-sm text-text-secondary font-normal">
            (optional)
          </Text>
        </Text>
      </View>

      {/* Sections */}
      <Section
        label="Age Range"
        name="age"
        options={[
          { val: '18-25', label: '18–25' },
          { val: '26-35', label: '26–35' },
          { val: '36-45', label: '36–45' },
          { val: '46-55', label: '46–55' },
          { val: '56-65', label: '56–65' },
          { val: '65+',   label: '65+' },
        ]}
      />

      <Section
        label="Gender"
        name="gender"
        options={[
          { val: 'male',              label: 'Male' },
          { val: 'female',            label: 'Female' },
          { val: 'non-binary',        label: 'Non-binary' },
          { val: 'prefer-not-to-say', label: 'Prefer not to say' },
        ]}
      />

      <Section
        label="Sleep last night"
        name="sleep"
        options={[
          { val: '<5h',  label: '<5h' },
          { val: '5-7h', label: '5–7h' },
          { val: '7-9h', label: '7–9h' },
          { val: '>9h',  label: '>9h' },
        ]}
      />

      <Section
        label="Exercise today"
        name="exercise"
        options={[
          { val: 'none',     label: 'None' },
          { val: 'light',    label: 'Light' },
          { val: 'moderate', label: 'Moderate' },
          { val: 'intense',  label: 'Intense' },
        ]}
      />

      <Section
        label="Meditated today"
        name="meditated"
        options={[
          { val: true,  label: 'Yes' },
          { val: false, label: 'No' },
        ]}
      />

      <Section
        label="Caffeine"
        name="caffeine"
        options={[
          { val: 'none', label: 'None' },
          { val: '1',    label: '1 cup' },
          { val: '2-3',  label: '2–3 cups' },
          { val: '>3',   label: '>3 cups' },
        ]}
      />

      <Section
        label="Time outdoors"
        name="outdoors"
        options={[
          { val: 'none',   label: 'None' },
          { val: '<30m',   label: '<30m' },
          { val: '30-60m', label: '30–60m' },
          { val: '>60m',   label: '>60m' },
        ]}
      />

      <Section
        label="Social interaction"
        name="social"
        options={[
          { val: 'alone', label: 'Alone' },
          { val: 'some',  label: 'Some' },
          { val: 'lots',  label: 'Lots' },
        ]}
      />
    </View>
  );
};

export default WellnessQuestionnaire;