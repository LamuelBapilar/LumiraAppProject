import React from 'react';
import { Text, View } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AIInsightProgressProps {
  phase?: number;
}

// ─── Steps ────────────────────────────────────────────────────────────────────
const steps = [
  { id: 1, label: 'Saved',      desc: 'Entry stored' },
  { id: 2, label: 'Processing', desc: 'Preparing insights' },
  { id: 3, label: 'Analyzing',  desc: 'Reviewing patterns' },
  { id: 4, label: 'Ready',      desc: 'Insights ready' },
];

// ─── AIInsightProgress ────────────────────────────────────────────────────────
const AIInsightProgress = ({ phase = 0 }: AIInsightProgressProps) => {
  if (phase <= 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 90,
        right: 16,
        width: 210,
        zIndex: 999,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        // Shadow for Android
        elevation: 8,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
      }}
    >
      {/* Title */}
      <Text
        style={{ fontSize: 14, fontWeight: '600', marginBottom: 14, color: '#111' }}
      >
        Lumira
      </Text>

      {/* Steps */}
      {steps.map((s, index) => {
        const active = s.id === phase;
        const done   = s.id < phase;
        const idle   = !active && !done;

        return (
          <View
            key={s.id}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: index < steps.length - 1 ? 12 : 0,
            }}
          >
            {/* Circle indicator */}
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                marginRight: 10,
                marginTop: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: done
                  ? '#10b981'       // emerald-500
                  : active
                  ? '#6b7280'       // gray-500 filled (matches screenshot)
                  : 'transparent',
                borderWidth: idle ? 1.5 : 0,
                borderColor: '#d1d5db', // gray-300
              }}
            >
              {done && (
                <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
                  ✓
                </Text>
              )}
            </View>

            {/* Text */}
            <View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: active || done ? '600' : '400',
                  color: done
                    ? '#059669'   // emerald-700
                    : active
                    ? '#111827'   // gray-900
                    : '#9ca3af',  // gray-400
                }}
              >
                {s.label}
              </Text>
              <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                {s.desc}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default AIInsightProgress;