import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Crown, Moon, Clock, Star, Activity } from 'lucide-react-native';
import NavigationBar from '@/components/Navigation';

const SleepPaywall = () => {
  return (
    <NavigationBar>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          backgroundColor: '#f9fafb',
        }}
      >
        
        {/* Card */}
        <View
          style={{
            width: '100%',
            maxWidth: 480,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            backgroundColor: '#fff',
            padding: 28,
          }}
        >
          
          {/* badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Crown size={18} color="#f59e0b" />
            <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '700', color: '#f59e0b' }}>
              Premium feature
            </Text>
          </View>

          {/* title */}
          <Text style={{ fontSize: 30, fontWeight: '900', color: '#000' }}>
            Unlock sleep insights
          </Text>

          <Text style={{ marginTop: 10, fontSize: 16, color: '#6b7280', lineHeight: 22 }}>
            Track your sleep patterns, discover insights, and improve your rest quality.
          </Text>

          {/* features */}
          <View style={{ marginTop: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Moon size={20} color="#6366f1" />
              <Text style={{ marginLeft: 10, fontSize: 15 }}>Advanced sleep tracking</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={20} color="#6366f1" />
              <Text style={{ marginLeft: 10, fontSize: 15 }}>Sleep recommendations</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Star size={20} color="#6366f1" />
              <Text style={{ marginLeft: 10, fontSize: 15 }}>Sleep insights & trends</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Activity size={20} color="#6366f1" />
              <Text style={{ marginLeft: 10, fontSize: 15 }}>Fitbit sync</Text>
            </View>
          </View>

          {/* button */}
          <View style={{ marginTop: 24 }}>
            <TouchableOpacity
              onPress={() => console.log('Upgrade clicked')}
              style={{
                backgroundColor: '#000',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 999,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                Upgrade Now →
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            From $10.99/month • Cancel anytime
          </Text>

          {/* image */}
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Image
              source={require('./for-sleep-tracker.png')}
              style={{ width: 280, height: 180, resizeMode: 'contain' }}
            />
          </View>

        </View>
      </View>
    </NavigationBar>
  );
};

export default SleepPaywall;