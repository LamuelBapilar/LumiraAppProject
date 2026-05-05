import AppImage from '@/components/ui/AppImage';
import { getSupabaseClient } from '@/utils/supabaseWellness';
import {
  calculateWellnessScore,
  getWellnessLevel,
  getWellnessTrend,
} from '@/utils/wellnessScore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText
} from 'react-native-svg';

// ─── Hardcoded user ID (replace Clerk) ────────────────────────────────────────
const USER_ID = 'user_3CClVidzX562pYzJPZjhejzmvn7';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DayData {
  date: string;
  score: number;
  mood_emoji: string;
  stress_level: number;
}

interface WellnessGraphProps {
  isPremium?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toISODate = (d: string) => new Date(d).toISOString().split('T')[0];

const TIME_RANGE_DAYS: Record<string, number> = {
  '7D': 7,
  '14D': 14,
  '30D': 30,
  '3M': 90,
  '6M': 180,
};

const TIME_RANGES = ['7D', '14D', '30D', '3M', '6M'];
const PRIMARY_COLOR = '#16a34a';
const GRAPH_HEIGHT = 160;
const PADDING_X = 18;
const PADDING_Y = 12;

// ─── Trend helpers ────────────────────────────────────────────────────────────
const getTrendText = (trend: string) => {
  if (trend === 'improving') return '↑ Improving';
  if (trend === 'declining') return '↓ Declining';
  return '— Stable';
};

const getTrendColor = (trend: string) => {
  if (trend === 'improving') return 'text-green-600';
  if (trend === 'declining') return 'text-red-500';
  return 'text-gray-500';
};

const getLevelColors = (level?: string) => {
  switch (level) {
    case 'Excellent':
      return { pill: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700' };
    case 'Good':
      return { pill: 'bg-lime-50 border border-lime-200', text: 'text-lime-700' };
    case 'Fair':
      return { pill: 'bg-amber-50 border border-amber-200', text: 'text-amber-700' };
    default:
      return { pill: 'bg-gray-100 border border-gray-200', text: 'text-gray-600' };
  }
};

// ─── Smooth SVG curve ─────────────────────────────────────────────────────────
const buildCurve = (
  points: DayData[],
  graphWidth: number,
  minScore: number,
  range: number
): string => {
  if (!points.length) return 'M 0 0';
  const innerW = graphWidth - PADDING_X * 2;
  const innerH = GRAPH_HEIGHT - PADDING_Y * 2;
  const denom = Math.max(1, points.length - 1);

  const pts = points.map((d, i) => ({
    x: PADDING_X + (i / denom) * innerW,
    y: GRAPH_HEIGHT - PADDING_Y - ((d.score - minScore) / range) * innerH,
  }));

  return pts.reduce((path, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) * 0.5;
    const cp2x = pt.x - (pt.x - prev.x) * 0.5;
    return `${path} C ${cp1x} ${prev.y}, ${cp2x} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');
};

const buildArea = (curve: string, graphWidth: number): string => {
  if (curve === 'M 0 0') return 'M 0 0';
  const innerW = graphWidth - PADDING_X * 2;
  return `${curve} L ${PADDING_X + innerW} ${GRAPH_HEIGHT - PADDING_Y} L ${PADDING_X} ${GRAPH_HEIGHT - PADDING_Y} Z`;
};

// ─── Ring progress ────────────────────────────────────────────────────────────
const RING_R = 22;
const RING_C = 2 * Math.PI * RING_R;

// ─── Component ────────────────────────────────────────────────────────────────
const WellnessGraph: React.FC<WellnessGraphProps> = ({ isPremium = false }) => {
  const [selectedRange, setSelectedRange] = useState('7D');
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [graphWidth, setGraphWidth] = useState(Dimensions.get('window').width - 48);

  // ── Fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!USER_ID) { setData([]); return; }

        const client = await getSupabaseClient();
        const lookback = TIME_RANGE_DAYS[selectedRange] || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - lookback);

        const { data: insights, error } = await client
          .from('ai_mood_insight')
          .select('created_at,stress_level,energy_level')
          .eq('user_id', USER_ID)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        const combined = (insights || []).map((row: any) => {
          const date = toISODate(row.created_at);
          const stress = Math.max(1, Math.min(10, Number(row.stress_level ?? 5)));
          const energy = Math.max(1, Math.min(10, Number(row.energy_level ?? 5)));
          const intensity = Math.max(1, Math.min(10, Math.round((energy + (10 - stress)) / 2)));
          const score = calculateWellnessScore({
            mood_emoji: '🙂',
            intensity_level: intensity,
            stress_level: stress,
            energy_level: energy,
          });
          return { date, score, mood_emoji: '🙂', stress_level: stress };
        });

        // Group by date → average score
        const byDate = new Map<string, DayData[]>();
        combined.forEach((r: DayData) => {
          const arr = byDate.get(r.date) || [];
          arr.push(r);
          byDate.set(r.date, arr);
        });

        const daily: DayData[] = Array.from(byDate.entries()).map(([date, arr]) => ({
          date,
          score: Math.round(arr.reduce((a, b) => a + b.score, 0) / arr.length),
          mood_emoji: arr[arr.length - 1].mood_emoji,
          stress_level: arr[arr.length - 1].stress_level,
        }));

        setData(daily);
      } catch (e) {
        console.error('Failed to load wellness graph', e);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedRange]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const points = data;
  const hasData = points.length >= 1;
  const scores = points.map(d => d.score);
  const trend = getWellnessTrend(scores);
  const currentScore = scores.length ? scores[scores.length - 1] : 0;
  const wellnessInfo = getWellnessLevel(currentScore);
  const levelColors = getLevelColors(wellnessInfo?.level);

  const minScore = 0;
  const maxScore = 100;
  const range = 100;

  const averageScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const bestDay = points.length
    ? points.reduce((b, d) => (d.score > b.score ? d : b), points[0])
    : null;

  const ringOffset = RING_C * (1 - Math.min(100, Math.max(0, currentScore)) / 100);

  const innerW = graphWidth - PADDING_X * 2;
  const innerH = GRAPH_HEIGHT - PADDING_Y * 2;
  const denom = Math.max(1, points.length - 1);

  // ── Curve paths ─────────────────────────────────────────────────────────────
  const curvePath = buildCurve(points, graphWidth, minScore, range);
  const areaPath = buildArea(curvePath, graphWidth);

  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">

      {/* ── Header ── */}
      <View className="flex-row items-center gap-2 mb-4">
        <AppImage
          source={require('@/assets/images/lumira/mental.png')}
          style={{ width: 90, height: 98, flexShrink: 0 }}
          resizeMode="contain"
        />
        <View className="flex-1">
          <Text className="font-semibold text-base text-gray-900 mb-0.5">
            Mental Wellness Tracker
          </Text>
          <Text className="text-xs text-gray-500">
            See how your mental wellness is evolving
          </Text>

          {hasData && (
            <View className="mt-2 flex-row items-center gap-2 self-start px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="text-sm font-bold text-emerald-700">
                {wellnessInfo?.level}
              </Text>
              <View className="w-px h-3 bg-emerald-300" />
              <Text className={`text-sm font-medium ${getTrendColor(trend)}`}>
                {getTrendText(trend)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Time Range Selector ── */}
      <View style={styles.rangeContainer}>
        {TIME_RANGES.slice(0, 3).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setSelectedRange(r)}
            style={[
              styles.rangeButton,
              selectedRange === r && styles.rangeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.rangeText,
                selectedRange === r ? styles.rangeTextActive : styles.rangeTextInactive,
              ]}
            >
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Stats Row ── */}
      {hasData && (
        <View style={statsStyles.row}>
          <View style={statsStyles.currentCard}>
            <Svg width={56} height={56} viewBox="0 0 56 56">
              <Circle cx={28} cy={28} r={RING_R} stroke="#e2e8f0" strokeWidth={5} fill="none" />
              <Circle
                cx={28} cy={28} r={RING_R}
                stroke={PRIMARY_COLOR}
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
                rotation={-90}
                origin="28, 28"
                strokeDasharray={`${RING_C}`}
                strokeDashoffset={ringOffset}
              />
              <SvgText x={28} y={33} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#0f172a">
                {currentScore}
              </SvgText>
            </Svg>
            <View style={statsStyles.currentLabel}>
              <Text style={statsStyles.labelMain}>Current score</Text>
              <Text style={statsStyles.labelSub}>out of 100</Text>
            </View>
          </View>

          <View style={statsStyles.sideCol}>
            <View style={statsStyles.sideCard}>
              <Text style={statsStyles.sideLabel}>Average</Text>
              <View style={statsStyles.sideRow}>
                <Text style={statsStyles.sideValue}>{averageScore}</Text>
                <View style={statsStyles.iconBox}>
                  <Text style={statsStyles.icon}>⚡</Text>
                </View>
              </View>
            </View>

            {bestDay && (
              <View style={statsStyles.sideCard}>
                <Text style={statsStyles.sideLabel}>Best day</Text>
                <View style={statsStyles.sideRow}>
                  <Text style={statsStyles.sideValue}>{bestDay.score}</Text>
                  <View style={[statsStyles.iconBox, { backgroundColor: '#fef3c7' }]}>
                    <Text style={statsStyles.icon}>🗓</Text>
                  </View>
                </View>
                <Text style={statsStyles.dateSub}>
                  {new Date(bestDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* ── Graph ── */}
      <View
        className="bg-slate-50 rounded-2xl p-3 border border-slate-200 mb-2"
        onLayout={(e) => setGraphWidth(e.nativeEvent.layout.width - 24)}
      >
        {loading && (
          <View className="absolute top-3 left-3 z-10 flex-row items-center gap-1 px-3 py-1 rounded-full bg-blue-100 border border-blue-200">
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text className="text-[10px] text-blue-800 font-medium">Loading...</Text>
          </View>
        )}

        <Svg width={graphWidth} height={GRAPH_HEIGHT} viewBox={`0 0 ${graphWidth} ${GRAPH_HEIGHT}`}>

          {/* ── Gradient definition for area fill ── */}
          <Defs>
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={PRIMARY_COLOR} stopOpacity={0.18} />
              <Stop offset="100%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = PADDING_Y + (1 - val / 100) * innerH;
            return (
              <G key={val}>
                <Line
                  x1={PADDING_X} y1={y}
                  x2={PADDING_X + innerW} y2={y}
                  stroke={val === 50 ? '#d1d5db' : '#f3f4f6'}
                  strokeWidth={val === 50 ? 1 : 0.5}
                  strokeDasharray={val === 50 ? undefined : '4,2'}
                />
                <SvgText
                  x={PADDING_X - 4} y={y + 4}
                  textAnchor="end" fontSize={9} fill="#94a3b8"
                >
                  {val}
                </SvgText>
              </G>
            );
          })}

          {/* ── Area fill under curve ── */}
          {hasData && areaPath !== 'M 0 0' && (
            <Path
              d={areaPath}
              fill="url(#areaGradient)"
            />
          )}

          {/* ── Smooth curve line ── */}
          {hasData && curvePath !== 'M 0 0' && (
            <Path
              d={curvePath}
              fill="none"
              stroke={PRIMARY_COLOR}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover guideline */}
          {hoveredIndex !== null && points[hoveredIndex] && (() => {
            const x = PADDING_X + (hoveredIndex / denom) * innerW;
            return (
              <Line
                x1={x} y1={PADDING_Y}
                x2={x} y2={GRAPH_HEIGHT - PADDING_Y}
                stroke="#86efac"
                strokeWidth={1}
              />
            );
          })()}

          {/* Data points */}
          {points.map((day, index) => {
            const x = PADDING_X + (index / denom) * innerW;
            const y = GRAPH_HEIGHT - PADDING_Y - ((day.score - minScore) / range) * innerH;
            const isHovered = hoveredIndex === index;

            return (
              <G key={day.date}>
                <Circle
                  cx={x} cy={y} r={14}
                  fill="transparent"
                  onPress={() => setHoveredIndex(isHovered ? null : index)}
                />
                <Circle
                  cx={x} cy={y}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? PRIMARY_COLOR : '#ffffff'}
                  stroke={PRIMARY_COLOR}
                  strokeWidth={2}
                />
                {isHovered && (() => {
                  const tipX = Math.max(x - 50, PADDING_X);
                  const tipY = Math.max(y - 72, 4);
                  return (
                    <G>
                      <Path
                        d={`M ${tipX} ${tipY} h 110 a 8 8 0 0 1 8 8 v 48 a 8 8 0 0 1 -8 8 h -110 a 8 8 0 0 1 -8 -8 v -48 a 8 8 0 0 1 8 -8 z`}
                        fill="#f0fdf4"
                        stroke="#86efac"
                        strokeWidth={0.5}
                      />
                      <SvgText x={tipX + 55} y={tipY + 18} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#166534">
                        {day.date}
                      </SvgText>
                      <SvgText x={tipX + 55} y={tipY + 36} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#16a34a">
                        {day.mood_emoji} {day.score}/100
                      </SvgText>
                      <SvgText x={tipX + 55} y={tipY + 54} textAnchor="middle" fontSize={10} fill="#15803d">
                        Stress: {day.stress_level}/10
                      </SvgText>
                    </G>
                  );
                })()}
              </G>
            );
          })}
        </Svg>

        {/* No data overlay */}
        {!hasData && !loading && (
          <View className="absolute inset-0 items-center justify-center px-4">
            <View className="bg-white border border-gray-200 rounded-xl px-4 py-3 items-center">
              <Text className="text-sm font-semibold text-gray-900 mb-1">
                Not enough data yet
              </Text>
              <Text className="text-xs text-gray-500 text-center">
                Keep tracking your mood for 2–3 days. The graph appears after we have at least one day of data.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ── X-axis labels ── */}
      {hasData && (
        <View className="flex-row justify-between px-2 mb-3">
          {points.map((day, index) => {
            const step = Math.max(1, Math.floor(points.length / 6));
            const show = index % step === 0 || index === points.length - 1;
            return show ? (
              <Text key={day.date} className="text-[10px] text-gray-400 font-medium">
                {new Date(day.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            ) : (
              <View key={day.date} />
            );
          })}
        </View>
      )}

      {/* ── Premium Section ── */}
      {isPremium && (
        <View className="border-t border-gray-100 pt-4 mt-2">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-yellow-500 text-base">👑</Text>
            <Text className="text-sm font-medium text-gray-900">Premium Insights</Text>
          </View>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-xs font-medium text-gray-900">Predicted Score</Text>
              <Text className="text-xs text-gray-500">Tomorrow: 98/100</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-gray-900">Best Practice</Text>
              <Text className="text-xs text-gray-500">Morning meditation</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// ─── Stats layout styles ──────────────────────────────────────────────────────
const statsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  currentCard: {
    flex: 1.2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currentLabel: {
    flexShrink: 1,
  },
  labelMain: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  labelSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  sideCol: {
    flex: 1,
    gap: 8,
  },
  sideCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  sideLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 4,
  },
  sideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 13,
  },
  dateSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
});

// ─── Range selector styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  rangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
  },
  rangeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
  },
  rangeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rangeTextActive: {
    color: '#111827',
  },
  rangeTextInactive: {
    color: '#6b7280',
  },
});

export default WellnessGraph;