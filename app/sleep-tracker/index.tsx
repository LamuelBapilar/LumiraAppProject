import NavigationBar from '@/components/Navigation';
import Icon from '@/components/ui/AppIcon';
import Button from '@/components/ui/Button';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

const FEATURES = [
  { icon: 'Moon',     label: 'Advanced sleep tracking' },
  { icon: 'Clock',    label: 'Sleep recommendations' },
  { icon: 'Star',     label: 'Sleep insights & trends' },
  { icon: 'Activity', label: 'Fitbit sync' },
];

interface SleepPaywallProps {
  onUpgradePress?: () => void;
}

const SleepPaywall: React.FC<SleepPaywallProps> = ({ onUpgradePress }) => {
  return (
    <NavigationBar activeRoute="sleep-tracker">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 grow"
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-organic-xl border border-border bg-white px-6 pt-8 pb-0 overflow-hidden shadow-sm">

          {/* Premium badge */}
          <View className="self-start flex-row items-center gap-2 bg-primary-200 px-3 py-1.5 mb-4" style={{ borderRadius: 999 }}>
            <Icon name="Crown" size={14} color="#A5A88C" />
            <Text className="text-sm font-semibold text-primary">Premium feature</Text>
          </View>

          {/* Headline */}
          <Text className="text-3xl font-heading font-extrabold text-foreground tracking-tight mb-3">
            Unlock sleep insights
          </Text>

          {/* Subtext */}
          <Text className="text-base text-muted-foreground leading-6 mb-8">
            Track your sleep patterns, discover insights, and improve your rest quality.
          </Text>

          {/* Feature list */}
          <View className="gap-6 mb-10">
            {FEATURES.map((f) => (
              <View key={f.icon} className="flex-row items-center gap-4">
                <Icon name={f.icon} size={20} color="#A5A88C" />
                <Text className="text-base text-foreground flex-1">
                  {f.label}
                </Text>
              </View>
            ))}
          </View>

          {/* CTA — full width */}
          <Button
            variant="default"
            size="lg"
            onPress={onUpgradePress}
            fullWidth
            className="rounded-full bg-black mb-3"
          >
            Upgrade Now →
          </Button>

          {/* Price */}
          <Text className="text-xs text-muted-foreground text-center mb-6">
            From $10.99/month • Cancel anytime
          </Text>

          {/* Illustration with glow */}
          <View className="items-center justify-center">
            <View className="absolute rounded-full bg-primary-200" />
            <Image
              source={require('@/assets/images/lumira/for-sleep-tracker.png')}
              className="w-72 h-64"
              resizeMode="contain"
            />
          </View>

        </View>
      </ScrollView>
    </NavigationBar>
  );
};

export default SleepPaywall;