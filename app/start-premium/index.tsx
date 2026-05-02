// app/start-premium/index.tsx
import Icon from '@/components/AppIcon';
import NavigationBar from '@/components/Navigation';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PricingSection } from '../pricing';

const StartPremium = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isLifetime, setIsLifetime] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: fetch real premium status from Supabase
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handlePlanPress = (plan: any) => {
    // TODO: navigate to Stripe checkout with plan.ctaLink as priceId
    console.log('Plan selected:', plan.id, plan.ctaLink);
  };

  return (
    <NavigationBar title="Start Premium">
    <SafeAreaView className="flex-1 bg-white">

      {/* ── Close Button — outside ScrollView so it stays fixed ── */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-14 right-4 z-10 p-2 rounded-full border border-gray-200 bg-white"
        accessibilityLabel="Close"
        activeOpacity={0.7}
      >
        <Icon name="X" size={18} color="#374151" />
      </TouchableOpacity>

      {/* ── THE ONLY ScrollView on this screen ── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View className="items-center mb-8">
          <View className="flex-row items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white mb-3">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A5A88C' }} />
            <Text className="text-xs text-gray-700">Unlock Lumira Premium</Text>
          </View>

          <Text className="text-2xl font-semibold text-gray-900 mb-1 text-center">
            Continue your journey
          </Text>
          <Text className="text-sm text-gray-500 text-center leading-5 mb-6">
            Choose a plan to access deeper sessions. You can start free and upgrade anytime.
          </Text>

          {/* Billing Toggle */}
          <View
            className="flex-row p-1.5 rounded-xl bg-white"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <TouchableOpacity
              onPress={() => setIsAnnual(false)}
              className="px-5 py-2 rounded-xl"
              style={{ backgroundColor: !isAnnual ? '#F3F4F6' : '#FFFFFF' }}
            >
              <Text className="text-sm font-medium text-gray-900">Monthly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsAnnual(true)}
              className="px-5 py-2 rounded-xl"
              style={{ backgroundColor: isAnnual ? '#F3F4F6' : '#FFFFFF' }}
            >
              <Text className="text-sm font-medium text-gray-900">Annual</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── PricingSection rendered INSIDE ScrollView, no own scroll ── */}
        <PricingSection
          isPremium={isPremium}
          isLifetime={isLifetime}
          isLoading={isLoading}
          isAnnual={isAnnual}
          onPlanPress={handlePlanPress}
        />

      </ScrollView>
    </SafeAreaView>
    </NavigationBar>
  );
};

export default StartPremium;