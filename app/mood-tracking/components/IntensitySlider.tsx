import Icon from '@/components/ui/AppIcon';
import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, Text, View } from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const THUMB_SIZE   = 22;
const TRACK_HEIGHT = 10;
const QUICK_VALUES = [1, 3, 5, 7, 10];

// Static segmented track — light → dark, never changes
const SEGMENT_COLORS = [
  '#E8EAE0', '#E0E2D7', '#D8DBCE', '#D1D4C1', '#C9CDB9',
  '#BABDA2', '#AEAF97', '#A5A88C', '#969880', '#8E9178',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getIntensityBg = (value: number): string => {
  if (value <= 2) return 'bg-primary-200';
  if (value <= 4) return 'bg-primary-300';
  if (value <= 6) return 'bg-primary-400';
  if (value <= 8) return 'bg-primary-500';
  return 'bg-primary-600';
};

const getIntensityLabel = (value: number): string => {
  if (value <= 2) return 'Very Low';
  if (value <= 4) return 'Low';
  if (value <= 6) return 'Moderate';
  if (value <= 8) return 'High';
  return 'Very High';
};

const getIntensityDescription = (value: number): string => {
  if (value <= 2) return 'Barely noticeable, very mild';
  if (value <= 4) return 'Noticeable but manageable';
  if (value <= 6) return 'Moderate impact on daily activities';
  if (value <= 8) return 'Strong impact, difficult to ignore';
  return 'Overwhelming, severely impacting function';
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mood {
  label: string;
  value: string;
}

interface IntensitySliderProps {
  intensity: number;
  onIntensityChange: (value: number) => void;
  selectedMood?: Mood | null;
}

// ─── IntensitySlider ──────────────────────────────────────────────────────────

const IntensitySlider = ({ intensity, onIntensityChange, selectedMood }: IntensitySliderProps) => {
  const [localIntensity, setLocalIntensity] = useState(intensity || 5);
  const [trackWidth, setTrackWidth]         = useState(0);
  const trackWidthRef                       = useRef(0);
  const trackPageXRef                       = useRef(0);
  const trackRef                            = useRef<View>(null);

  useEffect(() => {
    setLocalIntensity(intensity || 5);
  }, [intensity]);

  const handleChange = (value: number) => {
    const clamped = Math.min(10, Math.max(1, value));
    setLocalIntensity(clamped);
    onIntensityChange(clamped);
  };

  const pageXToValue = (pageX: number): number => {
    const relative = pageX - trackPageXRef.current;
    const clamped  = Math.max(0, Math.min(relative, trackWidthRef.current));
    return Math.round((clamped / trackWidthRef.current) * 9) + 1;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (e) => {
        handleChange(pageXToValue(e.nativeEvent.pageX));
      },
      onPanResponderMove: (e) => {
        handleChange(pageXToValue(e.nativeEvent.pageX));
      },
    })
  ).current;

  const thumbLeft = trackWidth > 0
    ? ((localIntensity - 1) / 9) * trackWidth - THUMB_SIZE / 2
    : 0;

  return (
    <View className="bg-card rounded-organic-lg p-4 border border-border">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View className="flex-row items-center space-x-3 mb-6">
        <Icon name="Activity" size={20} color="#A5A88C" />
        <Text className="font-heading font-semibold text-lg text-foreground">
          Intensity Level
        </Text>
      </View>

      {/* ── Intensity Display ───────────────────────────────────────────────── */}
      <View className="items-center mb-6">
        <View className={`w-14 h-14 rounded-full items-center justify-center mb-3 ${getIntensityBg(localIntensity)}`}>
          <Text className="text-2xl font-heading font-bold text-white">
            {localIntensity}
          </Text>
        </View>
        <Text className="font-body font-medium text-foreground">
          {getIntensityLabel(localIntensity)}
        </Text>
        <Text className="text-sm text-text-secondary mt-1 text-center font-caption">
          {getIntensityDescription(localIntensity)}
        </Text>
      </View>

      {/* ── Track + Thumb ───────────────────────────────────────────────────── */}
      <View style={{ paddingVertical: THUMB_SIZE / 2 + 2, marginBottom: 4 }}>
        {/* Static segmented track */}
        <View
          ref={trackRef}
          style={{ height: TRACK_HEIGHT, flexDirection: 'row', borderRadius: TRACK_HEIGHT / 2, overflow: 'hidden' }}
          onLayout={() => {
            trackRef.current?.measure((_x, _y, width, _height, pageX) => {
              trackWidthRef.current = width;
              trackPageXRef.current = pageX;
              setTrackWidth(width);
            });
          }}
          {...panResponder.panHandlers}
        >
          {SEGMENT_COLORS.map((color, i) => (
            <View
              key={i}
              style={{ flex: 1, backgroundColor: color, marginRight: i < 9 ? 1 : 0 }}
            />
          ))}
        </View>

        {/* Circle thumb */}
        {trackWidth > 0 && (
          <View
            pointerEvents="none"
            style={{
              position:        'absolute',
              top:             6,
              left:            thumbLeft,
              width:           THUMB_SIZE,
              height:          THUMB_SIZE,
              borderRadius:    THUMB_SIZE / 2,
              backgroundColor: '#FFFFFF',
              borderWidth:     3,
              borderColor:     '#A5A88C',
              shadowColor:     '#000',
              shadowOffset:    { width: 0, height: 2 },
              shadowOpacity:   0.18,
              shadowRadius:    4,
              elevation:       4,
            }}
          />
        )}
      </View>

      {/* ── Scale Labels ────────────────────────────────────────────────────── */}
      <View className="flex-row justify-between mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <Text
            key={n}
            className="text-xs text-text-secondary font-caption"
            style={{ flex: 1, textAlign: 'center' }}
          >
            {n}
          </Text>
        ))}
      </View>

      {/* ── Quick Buttons ────────────────────────────────────────────────────── */}
      <View className="flex-row gap-2">
        {QUICK_VALUES.map((value) => {
          const isSelected = localIntensity === value;
          return (
            <Pressable
              key={value}
              onPress={() => handleChange(value)}
              className={`flex-1 py-2 rounded-organic-md items-center ${
                isSelected ? getIntensityBg(value) : 'bg-muted'
              }`}
            >
              <Text className={`text-sm font-medium font-body ${isSelected ? 'text-white' : 'text-text-secondary'}`}>
                {value}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Contextual Message ───────────────────────────────────────────────── */}
      {selectedMood && (
        <View className="mt-4 p-3 bg-surface rounded-organic-lg">
          <Text className="text-sm font-medium text-foreground font-body">
            {selectedMood.label} at intensity {localIntensity}
          </Text>
          {localIntensity >= 8 && (
            <Text className="text-sm text-primary-600 mt-1 font-caption">
              Consider using coping strategies or reaching out for support.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default IntensitySlider;