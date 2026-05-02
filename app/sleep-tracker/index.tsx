import NavigationBar from '@/components/Navigation';
import { Activity, Clock, Crown, Moon, Star } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const SleepPaywall = () => {
  return (
    <NavigationBar title='Sleep Tracker'>
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          paddingVertical: 5,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card */}
        <View className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8">

          {/* Badge */}
          <View className="flex-row items-center mb-4">
            <Crown size={18} color="#f59e0b" />
            <Text className="ml-2 text-sm font-bold text-amber-500">
              Premium feature
            </Text>
          </View>

          {/* Title */}
          <Text className="text-3xl font-black text-black">
            Unlock sleep insights
          </Text>

          <Text className="mt-3 text-base text-gray-500 leading-6">
            Track your sleep patterns, discover insights, and improve your rest quality.
          </Text>

          {/* Features */}
          <View className="mt-6 gap-4">

            <View className="flex-row items-center py-1">
              <Moon size={20} color="#6366f1" />
              <Text className="ml-3 text-base text-gray-700">Advanced sleep tracking</Text>
            </View>

            <View className="flex-row items-center py-1">
              <Clock size={20} color="#6366f1" />
              <Text className="ml-3 text-base text-gray-700">Sleep recommendations</Text>
            </View>

            <View className="flex-row items-center py-1">
              <Star size={20} color="#6366f1" />
              <Text className="ml-3 text-base text-gray-700">Sleep insights & trends</Text>
            </View>

            <View className="flex-row items-center py-1">
              <Activity size={20} color="#6366f1" />
              <Text className="ml-3 text-base text-gray-700">Fitbit sync</Text>
            </View>

          </View>

          {/* Button */}
          <View className="mt-8">
            <TouchableOpacity
              onPress={() => console.log('Upgrade clicked')}
              className="bg-black py-4 px-5 rounded-full items-center"
            >
              <Text className="text-white font-bold text-base">
                Upgrade Now →
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="mt-4 text-xs text-gray-400 text-center">
            From $10.99/month • Cancel anytime
          </Text>

          {/* Image */}
          <View className="mt-8 items-center">
            <Image
              source={require('@/assets/images/lumira/for-sleep-tracker.png')}
              style={{ width: 288, height: 220 }}
              resizeMode="contain"
            />
          </View>

        </View>
      </ScrollView>
    </NavigationBar>
  );
};

export default SleepPaywall;