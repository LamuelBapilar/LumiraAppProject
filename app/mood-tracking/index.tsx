import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import NavigationBar from '@/components/Navigation';
import Button from '@/components/ui/Button';
import { LogService, MoodEntriesService } from '@/utils/supabaseWellness';

// ─── Sub-components ───────────────────────────────────────────────────────────
import EmojiSelector from './components/EmojiSelector';
import IntensitySlider from './components/IntensitySlider';
import QuickNotes from './components/QuickNotes';
import TriggerIdentification from './components/TriggerIdentification';
import WellnessQuestionnaire from './components/WellnessQuestionnaire';
// import ContextualTags from './components/ContextualTags';
// import HistoricalPreview from './components/HistoricalPreview';
// import AIInsightProgress from '@/components/ui/AIInsightProgress';

// ─── Static user (replaces Clerk) ────────────────────────────────────────────
const USER_ID = 'user_3CClVidzX562pYzJPZjhejzmvn7';

// ─── MoodTracking Screen ──────────────────────────────────────────────────────
const MoodTracking = () => {
  const router = useRouter();

  const handleViewInsights = () => router.push('../analytics-insights');

  // ── Form state ──────────────────────────────────────────────────────────────
  const [selectedMood, setSelectedMood]         = useState<any>(null);
  const [intensity, setIntensity]               = useState<number>(5);
  const [selectedTags, setSelectedTags]         = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes]                       = useState<string>('');
  const [questionnaire, setQuestionnaire]       = useState<Record<string, any>>({});
  const [isSaving, setIsSaving]                 = useState<boolean>(false);
  const [aiPhase, setAiPhase]                   = useState<number>(0);
  // 0 = hidden | 1 = saved | 2 = sending | 3 = analyzing | 4 = ready

  // ── Auto-hide after phase 4 ─────────────────────────────────────────────────
  useEffect(() => {
    if (aiPhase === 4) {
      const t = setTimeout(() => setAiPhase(0), 2500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [aiPhase]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleMoodSelect      = (mood: any)          => setSelectedMood(mood);
  const handleIntensityChange = (val: number)        => setIntensity(val);
  const handleTagsChange      = (tags: string[])     => setSelectedTags(tags);
  const handleTriggersChange  = (triggers: string[]) => setSelectedTriggers(triggers);
  const handleNotesChange     = (text: string)       => setNotes(text);

  const validateEntry = (): boolean => {
    if (!selectedMood) {
      Alert.alert('Missing mood', 'Please select a mood before saving.');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setSelectedMood(null);
    setIntensity(5);
    setSelectedTags([]);
    setSelectedTriggers([]);
    setNotes('');
    setQuestionnaire({});
  };

  const handleSaveEntry = async () => {
    if (!validateEntry()) return;

    setIsSaving(true);
    setAiPhase(1);

    try {
      const feeling = selectedMood
        ? `${selectedMood.emoji} ${selectedMood.label}`
        : null;

      const intensity_level        = Math.min(10, Math.max(1, intensity));
      const daily_factors          = questionnaire || null;
      const trigger_identification = selectedTriggers?.length ? selectedTriggers : null;

      // ── Save mood entry ──────────────────────────────────────────────────────
      const created: any = await MoodEntriesService.createMoodEntry(
        USER_ID,
        {
          feeling,
          intensity_level,
          daily_factors,
          trigger_identification,
          quick_notes: notes || null,
        } as any,
        { triggerAI: false } as any
      );

      // ── Log event (fire-and-forget) ─────────────────────────────────────────
      LogService.logEvent({
        userId:      USER_ID,
        eventType:   'mood_tracked',
        severity:    'success',
        description: `Mood tracked: ${feeling ?? 'n/a'} (${intensity_level}/10)`,
        metadata:    { intensity_level },
      }).catch(() => {});

      // ── AI insight phases ────────────────────────────────────────────────────
      setAiPhase(2);
      try {
        const latestId      = await MoodEntriesService.getLatestMoodEntryId(USER_ID);
        const entryIdToSend = latestId || created?.entry_id;

        if (!entryIdToSend) throw new Error('No entry_id available');

        await MoodEntriesService.requestGeminiInsight({
          entry_id:             entryIdToSend,
          user_id:              USER_ID,
          feeling,
          intensity_level,
          quick_notes:          notes || null,
          daily_factors,
          trigger_identification,
        });

        setAiPhase(3);
        setTimeout(() => setAiPhase(4), 600);
      } catch {
        // Non-blocking — AI insight failure doesn't break the flow
        setAiPhase(0);
      }

      resetForm();

    } catch (error) {
      Alert.alert('Error', 'Failed to save mood entry. Please try again.');
      setAiPhase(0);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isFormValid = selectedMood !== null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-background">

      {/* ── Navigation Bar ───────────────────────────────────────────────── */}
      <NavigationBar title="Mood Tracker">

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <View className="mb-6 flex-row items-end justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-2xl font-heading font-bold text-foreground">
              Track my mood
            </Text>
            <Text className="text-sm text-text-secondary font-body mt-1">
              Keep it simple. Capture how you feel, quickly.
            </Text>
          </View>

          <View className="flex-row items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Sparkles"
              iconPosition="left"
              onPress={handleViewInsights}
            >
              Insights
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Save"
              iconPosition="left"
              onPress={handleSaveEntry}
              loading={isSaving}
              disabled={isSaving || !isFormValid}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </View>
        </View>

        {/* ── Primary Tracking ─────────────────────────────────────────────── */}
        <View className="mb-8">
          <EmojiSelector
            selectedMood={selectedMood}
            onMoodSelect={handleMoodSelect}
          />
        </View>

        <View className="mb-8">
          <IntensitySlider
            intensity={intensity}
            onIntensityChange={handleIntensityChange}
            selectedMood={selectedMood}
          />
        </View>

        <View className="mb-8">
          <QuickNotes notes={notes} onNotesChange={handleNotesChange} />
        </View>

        {/* ── Context Section ───────────────────────────────────────────────── */}
        <View className="mb-8">
          <WellnessQuestionnaire
            value={questionnaire}
            onChange={setQuestionnaire}
          />
        </View>

        <View className="mb-8">
          <TriggerIdentification
            selectedTriggers={selectedTriggers}
            onTriggersChange={handleTriggersChange}
          />
        </View>

        {/* ── AIInsightProgress ─────────────────────────────────────────────── */}
        {aiPhase > 0 && (
          <View className="mb-8 rounded-xl bg-primary-200 px-4 py-3">
            <Text className="text-sm text-text-primary font-body">
              {aiPhase === 1 && '✓ Entry saved'}
              {aiPhase === 2 && '⏅ Sending to AI...'}
              {aiPhase === 3 && '🔍 Analyzing...'}
              {aiPhase === 4 && '✨ Insight ready!'}
            </Text>
          </View>
        )}

        {/* Bottom spacing for sticky bar */}
        <View className="h-24" />
      </ScrollView>

      {/* ── Sticky Save Bar ───────────────────────────────────────────────── */}
      <View className="px-4 pb-4 pt-2 border-t border-border bg-white ">
        <View className="flex-row items-center justify-between bg-white rounded-xl px-4 py-3">
          <Text className="text-xs text-text-secondary font-caption flex-1 mr-3" numberOfLines={1}>
            {selectedMood
              ? `Feeling ${selectedMood.label} • ${intensity}/10`
              : 'Select a mood to start'}
          </Text>
          <Button
            size="sm"
            iconName="Save"
            iconPosition="left"
            onPress={handleSaveEntry}
            loading={isSaving}
            disabled={isSaving || !isFormValid}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </View>
      </View>
      </NavigationBar>
    </SafeAreaView>
  );
};

export default MoodTracking;