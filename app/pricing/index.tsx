// components/PricingSection.tsx
import Icon from '@/components/ui/AppIcon';
import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string | null;
  isStripeCheckout: boolean;
  popular: boolean;
  savings?: string | null;
}

// ─── Check Item ───────────────────────────────────────────────────────────────
const CheckItem = ({ text }: { text: string }) => (
  <View className="flex-row items-center gap-2 mb-2">
    <View
      className="w-5 h-5 rounded-full items-center justify-center"
      style={{ backgroundColor: '#EEF0F4' }}
    >
      <Icon name="Check" size={11} color="#111827" />
    </View>
    <Text className="text-sm text-gray-900 flex-1">{text}</Text>
  </View>
);

// ─── Plan Card ────────────────────────────────────────────────────────────────
const PlanCard = ({
  plan,
  isPremium,
  isLifetime,
  isLoading,
  onPress,
}: {
  plan: Plan;
  isPremium: boolean;
  isLifetime: boolean;
  isLoading: boolean;
  onPress: (plan: Plan) => void;
}) => {
  const isActive =
    (!isLoading && plan.id === 'free' && !isPremium) ||
    (!isLoading && plan.id === 'premium' && isPremium && !isLifetime) ||
    (!isLoading && plan.id === 'pro' && isPremium && isLifetime);

  const isCurrentPlan =
    plan.id === 'free' ||
    (plan.id === 'premium' && isPremium && !isLifetime) ||
    (plan.id === 'pro' && isPremium && isLifetime);

  const ctaDisabled = isCurrentPlan || (!plan.ctaLink && plan.isStripeCheckout);

  return (
    <View
      className="bg-white rounded-2xl p-5 mb-4"
      style={{
        borderWidth: plan.popular ? 2 : 1,
        borderColor: plan.popular ? '#A5A88C' : '#D1D5DB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: plan.popular ? 6 : 2 },
        shadowOpacity: plan.popular ? 0.12 : 0.06,
        shadowRadius: plan.popular ? 16 : 6,
        elevation: plan.popular ? 6 : 2,
      }}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-2 mb-1">
            {plan.id === 'premium' && (
                <Svg fill="none" viewBox="0 0 22 22" width={20} height={20}>
                  <Path d="M18.5625 4.125C17.4231 4.125 16.5 5.04883 16.5 6.1875C16.5 6.47625 16.5605 6.75005 16.6672 6.99995L13.75 8.25L11.3095 3.85773C11.9419 3.5047 12.375 2.83731 12.375 2.0625C12.375 0.923828 11.4519 0 10.3125 0C9.17314 0 8.25 0.923828 8.25 2.0625C8.25 2.83731 8.68313 3.5047 9.31545 3.85773L6.875 8.25L3.95777 6.99995C4.0645 6.75005 4.125 6.47625 4.125 6.1875C4.125 5.04883 3.20186 4.125 2.0625 4.125C0.923141 4.125 0 5.04883 0 6.1875C0 7.32617 0.923141 8.25 2.0625 8.25C2.22234 8.25 2.37566 8.22714 2.5257 8.19363L4.125 15.125V16.5C4.125 17.26 4.74066 17.875 5.5 17.875H15.125C15.8843 17.875 16.5 17.26 16.5 16.5V15.125L18.1 8.19363C18.249 8.22852 18.4027 8.25 18.5625 8.25C19.7019 8.25 20.625 7.32617 20.625 6.1875C20.625 5.04883 19.7019 4.125 18.5625 4.125ZM10.3125 1.375C10.6918 1.375 11 1.68386 11 2.0625C11 2.44114 10.6918 2.75 10.3125 2.75C9.93317 2.75 9.625 2.44114 9.625 2.0625C9.625 1.68386 9.93317 1.375 10.3125 1.375ZM1.375 6.1875C1.375 5.80886 1.68317 5.5 2.0625 5.5C2.44183 5.5 2.75 5.80886 2.75 6.1875C2.75 6.56614 2.44183 6.875 2.0625 6.875C1.68317 6.875 1.375 6.56614 1.375 6.1875ZM15.125 16.5H5.5V15.125H15.125V16.5ZM15.4057 13.75H5.21933L4.01156 8.51864L6.33325 9.51362C6.50908 9.58873 6.69298 9.625 6.87431 9.625C7.36037 9.625 7.8277 9.36719 8.07675 8.91739L10.3125 4.89448L12.5483 8.91739C12.7973 9.36719 13.2646 9.625 13.7507 9.625C13.932 9.625 14.1159 9.58873 14.2917 9.51362L16.6134 8.51864L15.4057 13.75ZM18.5625 6.875C18.1832 6.875 17.875 6.56614 17.875 6.1875C17.875 5.80886 18.1832 5.5 18.5625 5.5C18.9418 5.5 19.25 5.80886 19.25 6.1875C19.25 6.56614 18.9418 6.875 18.5625 6.875Z" fill="#A5A88C" />
                </Svg>
              )}
            <Text className="text-base font-semibold text-gray-900">{plan.name}</Text>
          </View>
          <Text className="text-xs text-gray-500 leading-4">{plan.description}</Text>
        </View>
        <View className="items-end gap-1">
          {isActive && (
            <View className="px-2 py-1 rounded-xl" style={{ backgroundColor: '#A5A88C' }}>
              <Text className="text-white text-xs font-semibold uppercase">Active</Text>
            </View>
          )}
          {plan.popular && !isActive && (
            <View className="px-2 py-1 rounded-xl" style={{ backgroundColor: '#A5A88C' }}>
              <Text className="text-white text-xs font-semibold uppercase">Special</Text>
            </View>
          )}
        </View>
      </View>

      {/* Price */}
      <View className="flex-row items-baseline gap-1 mb-4">
        <Text className="text-2xl font-bold text-gray-900">{plan.price}</Text>
        <Text className="text-sm text-gray-500">/ {plan.period}</Text>
      </View>

      {/* Usage label */}
      <View className="border-y border-gray-200 py-3 mb-4">
        <Text className="text-sm text-gray-900 text-center">
          {plan.id === 'free' && 'Basic wellness tracking'}
          {plan.id === 'premium' && 'Unlimited wellness features'}
          {plan.id === 'pro' && 'Lifetime access to everything'}
        </Text>
      </View>

      {/* Features */}
      <View className="mb-5">
        {plan.features.map((feature, index) => (
          <CheckItem key={index} text={feature} />
        ))}
      </View>

      {/* CTA */}
      {!isLoading && !isCurrentPlan && (
        <TouchableOpacity
          onPress={() => !ctaDisabled && onPress(plan)}
          disabled={ctaDisabled}
          className="rounded-xl py-3 items-center justify-center border"
          style={{
            borderColor: ctaDisabled ? '#D1D5DB' : '#111827',
            backgroundColor: ctaDisabled ? '#F9FAFB' : 'transparent',
          }}
          activeOpacity={0.7}
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: ctaDisabled ? '#9CA3AF' : '#111827' }}
          >
            {ctaDisabled && plan.isStripeCheckout && !plan.ctaLink
              ? `${plan.cta} (Coming Soon)`
              : plan.cta}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── PricingSection — NO ScrollView, plain View only ─────────────────────────
export const PricingSection = ({
  isPremium = false,
  isLifetime = false,
  isLoading = false,
  isAnnual = false,
  onPlanPress,
}: {
  isPremium?: boolean;
  isLifetime?: boolean;
  isLoading?: boolean;
  isAnnual?: boolean;
  onPlanPress?: (plan: Plan) => void;
}) => {
  const pricingPlans: Plan[] = [
    {
      id: 'free',
      name: 'Lumira Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with your wellness journey',
      features: [
        'Mood Tracking',
        'Basic Wellness Score',
        'Meditation Library (Limited)',
        'Therapy Sessions (2 per month)',
        'Basic Insights',
        'Daily Reminders',
      ],
      cta: 'Get Started',
      ctaLink: null,
      isStripeCheckout: false,
      popular: false,
    },
    {
      id: 'premium',
      name: 'Lumira Premium',
      price: isAnnual ? '$89.99' : '$10.99',
      period: isAnnual ? 'per year' : 'per month',
      description: 'Built for power users who want smart, emotional support',
      features: [
        'Everything in Free',
        '30 LumiBot sessions (Advanced)',
        'AI-Powered Mood Insights',
        'Personalized routine builder',
        'Journaling, Sound Therapy',
        'Calming Analytics Dashboard',
        'Priority Support',
      ],
      cta: 'Upgrade to Premium',
      ctaLink: isAnnual
        ? '25a4e2d5-9426-4784-a712-9038da5f6000'
        : '901b37d4-dadd-4720-9acb-1f56fd1680a0',
      isStripeCheckout: true,
      popular: true,
      savings: isAnnual ? 'Save 50%' : null,
    },
    {
      id: 'pro',
      name: 'Lumira Lifetime',
      price: '$99.99',
      period: 'lifetime',
      description: 'Lifetime Lumira Pro access with advanced features',
      features: [
        'Everything in Premium',
        'Lifetime access',
        'Mood Prediction powered by AI',
        'Unlimited therapy sessions included',
        'Advanced Tracking Dashboard + analytics',
        'Advanced AI Insights with correlation charts',
        'Calm Room for relaxation + meditation',
        'Priority support & advanced notifications',
      ],
      cta: 'Get Lifetime',
      ctaLink: '75609360-bec8-4c80-889d-0ef7262e491d',
      isStripeCheckout: true,
      popular: false,
    },
  ];

  if (isLoading) {
    return (
      <View className="items-center py-10">
        <ActivityIndicator size="large" color="#A5A88C" />
      </View>
    );
  }

  // ✅ Plain View — NO ScrollView here
  return (
    <View>
      {pricingPlans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isPremium={isPremium}
          isLifetime={isLifetime}
          isLoading={isLoading}
          onPress={onPlanPress ?? (() => {})}
        />
      ))}
    </View>
  );
};

export default PricingSection;