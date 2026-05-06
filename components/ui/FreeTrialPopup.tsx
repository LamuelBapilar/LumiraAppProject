// FreeTrialPopup.tsx
import AppIcon from '@/components/ui/AppIcon';
import React from 'react';
import {
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
  open: boolean;
  onClose: () => void;
  onCtaClick: () => void;
};

const FreeTrialPopup = ({ open, onClose, onCtaClick }: Props) => {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 bg-black/40 items-center justify-center p-4"
        onPress={onClose}
      >
        {/* Card */}
        <Pressable
          className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl"
          onPress={e => e.stopPropagation()}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-2 right-2 p-2 rounded-lg"
            activeOpacity={0.7}
          >
            <AppIcon name="X" size={16} color="#374151" />
          </TouchableOpacity>

          <View className="p-6 gap-4">

            {/* Header row */}
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-xl bg-primary-200 items-center justify-center">
                <Text className="text-primary text-xs font-bold font-heading">7d</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground font-heading">
                  Start your free trial
                </Text>
                <Text className="text-sm text-text-secondary font-body">
                  Unlock advanced insights, therapy sessions, and more.
                </Text>
              </View>
            </View>

            {/* Feature list */}
            <View className="gap-1">
              {[
                'Advanced tracking dashboard',
                'Advanced insights and predictions',
                'Calm therapy sessions',
              ].map((item, i) => (
                <View key={i} className="flex-row items-center gap-2">
                  <View className="w-1.5 h-1.5 rounded-full bg-foreground mt-px" />
                  <Text className="text-sm text-foreground font-body">{item}</Text>
                </View>
              ))}
            </View>

            {/* CTA button */}
            <TouchableOpacity
              onPress={onCtaClick}
              className="w-full flex-row items-center justify-center rounded-xl bg-foreground px-4 py-3"
              activeOpacity={0.85}
            >
              <Text className="text-white font-semibold text-sm font-heading">
                Try Lumira free
              </Text>
            </TouchableOpacity>

            {/* Fine print */}
            <Text className="text-[11px] text-text-secondary text-center font-body">
              No commitment. Cancel anytime.
            </Text>

          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default FreeTrialPopup;