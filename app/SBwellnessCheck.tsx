/**
 * CalmiveDashboard.tsx
 *
 * A React Native TSX screen that fetches and displays all data
 * from supabase.service.ts. Drop it into your Expo / RN project.
 *
 * Dependencies:
 *   npm install @supabase/supabase-js
 *   npx expo install expo-linear-gradient
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import {
    ActivityLog,
    ActivityLogService,
    AiMoodInsight,
    DailyJournalEntry,
    DailyJournalService,
    MoodEntriesService,
    MoodEntry,
    MusicPlaylist,
    MusicPlaylistsService,
    Notification,
    NotificationService,
    SessionHistory,
    SessionHistoryService,
    Update,
    UpdatesService,
    UserProfile,
    UserService,
    WellnessEntry,
    WellnessService,
} from '@/utils/supabaseWelness';

// ─── Replace with your auth-provider's hook ───────────────────────────────────
// e.g. import { useUser } from '@clerk/clerk-expo';
// For demo purposes we use a mock user ID
const DEMO_USER_ID = 'user_3CWcUum8iYauDdrnLHGcsCdE97y';

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  bg: '#0F0F1A',
  surface: '#1A1A2E',
  card: '#16213E',
  accent: '#7B5EA7',
  accentLight: '#A78BDA',
  teal: '#4ECDC4',
  coral: '#FF6B6B',
  gold: '#FFD93D',
  text: '#EAEAEA',
  muted: '#8A8A9A',
  border: '#2A2A3E',
  success: '#6BCB77',
  warning: '#FFD93D',
  error: '#FF6B6B',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const severityColor = (s: ActivityLog['severity']) =>
  ({ info: C.teal, success: C.success, warning: C.warning, error: C.error, critical: C.coral }[s] ?? C.muted);

// ─── Small UI atoms ───────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ emoji: string; title: string }> = ({ emoji, title }) => (
  <View style={s.sectionHeader}>
    <Text style={s.sectionEmoji}>{emoji}</Text>
    <Text style={s.sectionTitle}>{title}</Text>
  </View>
);

const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <View style={[s.badge, { backgroundColor: color + '33', borderColor: color }]}>
    <Text style={[s.badgeText, { color }]}>{label}</Text>
  </View>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <Text style={s.empty}>{message}</Text>
);

// ─── Section cards ────────────────────────────────────────────────────────────

const ProfileCard: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
  if (!profile) return <EmptyState message="No profile found." />;
  return (
    <View style={s.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {profile.profile_image_url ? (
          <Image source={{ uri: profile.profile_image_url }} style={s.avatar} />
        ) : (
          <View style={[s.avatar, s.avatarFallback]}>
            <Text style={{ color: C.text, fontSize: 20 }}>
              {(profile.full_name ?? 'U')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{profile.full_name ?? 'Unknown User'}</Text>
          <Text style={s.muted}>{profile.user_email ?? '—'}</Text>
        </View>
        <Badge label={profile.is_premium ? '✦ Premium' : 'Free'} color={profile.is_premium ? C.gold : C.muted} />
      </View>
      <View style={[s.row, { marginTop: 10 }]}>
        <Text style={s.muted}>Member since </Text>
        <Text style={s.muted}>{fmt(profile.created_at)}</Text>
      </View>
    </View>
  );
};

const MoodCard: React.FC<{ entry: MoodEntry | null; insight: AiMoodInsight | null }> = ({
  entry,
  insight,
}) => (
  <View style={s.card}>
    {entry ? (
      <>
        <View style={s.row}>
          <Text style={s.cardTitle}>{entry.feeling ?? 'Unknown feeling'}</Text>
          {entry.intensity_level != null && (
            <Badge label={`Intensity ${entry.intensity_level}/10`} color={C.accentLight} />
          )}
        </View>
        <Text style={[s.muted, { marginTop: 4 }]}>{fmt(entry.created_at)}</Text>
      </>
    ) : (
      <EmptyState message="No mood entries yet." />
    )}

    {insight && (
      <View style={[s.insightBox, { marginTop: 12 }]}>
        <Text style={s.label}>AI Insight</Text>
        <Text style={s.body}>{insight.ai_insights ?? '—'}</Text>
        <View style={[s.row, { marginTop: 8, gap: 10 }]}>
          {insight.stress_level != null && (
            <Badge label={`Stress ${insight.stress_level}/10`} color={C.coral} />
          )}
          {insight.energy_level != null && (
            <Badge label={`Energy ${insight.energy_level}/10`} color={C.teal} />
          )}
        </View>
      </View>
    )}
  </View>
);

const WellnessCard: React.FC<{ entries: WellnessEntry[] }> = ({ entries }) => (
  <View style={s.card}>
    {entries.length === 0 ? (
      <EmptyState message="No wellness entries in the last 7 days." />
    ) : (
      entries.map((e) => (
        <View key={e.date} style={[s.listRow, { borderBottomColor: C.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{e.date}</Text>
            <Text style={s.muted}>{e.mood_emoji ?? '—'}</Text>
          </View>
          <View style={{ gap: 4, alignItems: 'flex-end' }}>
            {e.stress_level != null && (
              <Badge label={`😰 ${e.stress_level}`} color={C.coral} />
            )}
            {e.energy_level != null && (
              <Badge label={`⚡ ${e.energy_level}`} color={C.teal} />
            )}
          </View>
        </View>
      ))
    )}
  </View>
);

const SessionsCard: React.FC<{ sessions: Pick<SessionHistory, 'id' | 'created_at'>[] }> = ({
  sessions,
}) => (
  <View style={s.card}>
    {sessions.length === 0 ? (
      <EmptyState message="No therapy sessions yet." />
    ) : (
      sessions.map((sess) => (
        <View key={sess.id} style={[s.listRow, { borderBottomColor: C.border }]}>
          <Text style={s.body}>Session</Text>
          <Text style={s.muted}>{fmt(sess.created_at)}</Text>
        </View>
      ))
    )}
  </View>
);

const JournalCard: React.FC<{ entries: DailyJournalEntry[] }> = ({ entries }) => (
  <View style={s.card}>
    {entries.length === 0 ? (
      <EmptyState message="No journal entries yet." />
    ) : (
      entries.slice(0, 5).map((e) => (
        <View key={e.id} style={[s.listRow, { borderBottomColor: C.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.body} numberOfLines={2}>{e.content}</Text>
            <Text style={s.muted}>{fmt(e.created_at)}</Text>
          </View>
          {e.locked && <Text style={{ color: C.gold, marginLeft: 8 }}>🔒</Text>}
        </View>
      ))
    )}
  </View>
);

const PlaylistsCard: React.FC<{ playlists: MusicPlaylist[] }> = ({ playlists }) => (
  <View style={s.card}>
    {playlists.length === 0 ? (
      <EmptyState message="No playlists found." />
    ) : (
      playlists.slice(0, 5).map((p) => (
        <View key={p.id} style={[s.listRow, { borderBottomColor: C.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{p.title}</Text>
            {p.artist && <Text style={s.muted}>{p.artist}</Text>}
          </View>
          {p.genre && <Badge label={p.genre} color={C.accentLight} />}
        </View>
      ))
    )}
  </View>
);

const NotificationsCard: React.FC<{ notifications: Notification[] }> = ({ notifications }) => (
  <View style={s.card}>
    {notifications.length === 0 ? (
      <EmptyState message="No important notifications." />
    ) : (
      notifications.map((n) => (
        <View
          key={n.id}
          style={[
            s.listRow,
            { borderBottomColor: C.border, opacity: n.is_read ? 0.55 : 1 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{n.title}</Text>
            <Text style={s.muted}>{n.message}</Text>
          </View>
          {!n.is_read && <View style={s.dot} />}
        </View>
      ))
    )}
  </View>
);

const UpdatesCard: React.FC<{ updates: Update[]; viewedIds: string[] }> = ({
  updates,
  viewedIds,
}) => (
  <View style={s.card}>
    {updates.length === 0 ? (
      <EmptyState message="No active updates." />
    ) : (
      updates.map((u) => (
        <View
          key={u.id}
          style={[
            s.listRow,
            { borderBottomColor: C.border, opacity: viewedIds.includes(u.id) ? 0.55 : 1 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{u.title}</Text>
            <Text style={s.muted} numberOfLines={2}>{u.body}</Text>
          </View>
          {!viewedIds.includes(u.id) && <View style={s.dot} />}
        </View>
      ))
    )}
  </View>
);

const ActivityCard: React.FC<{ logs: ActivityLog[] }> = ({ logs }) => (
  <View style={s.card}>
    {logs.length === 0 ? (
      <EmptyState message="No recent activity." />
    ) : (
      logs.map((l) => (
        <View key={l.id} style={[s.listRow, { borderBottomColor: C.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.body}>{l.event_type}</Text>
            {l.description ? <Text style={s.muted}>{l.description}</Text> : null}
          </View>
          <Badge label={l.severity} color={severityColor(l.severity)} />
        </View>
      ))
    )}
  </View>
);

// ─── Main dashboard ───────────────────────────────────────────────────────────

interface DashboardState {
  profile: UserProfile | null;
  latestMood: MoodEntry | null;
  aiInsight: AiMoodInsight | null;
  wellnessEntries: WellnessEntry[];
  sessions: Pick<SessionHistory, 'id' | 'created_at'>[];
  journals: DailyJournalEntry[];
  playlists: MusicPlaylist[];
  notifications: Notification[];
  updates: Update[];
  viewedUpdateIds: string[];
  activityLogs: ActivityLog[];
}

const INITIAL: DashboardState = {
  profile: null,
  latestMood: null,
  aiInsight: null,
  wellnessEntries: [],
  sessions: [],
  journals: [],
  playlists: [],
  notifications: [],
  updates: [],
  viewedUpdateIds: [],
  activityLogs: [],
};

const CalmiveDashboard: React.FC<{ userId?: string }> = ({
  userId = DEMO_USER_ID,
}) => {
  const [state, setState] = useState<DashboardState>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);

      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const todayStr = today.toISOString().split('T')[0];
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const [
        profile,
        latestMood,
        aiInsight,
        wellnessEntries,
        sessions,
        journals,
        playlists,
        notifications,
        updates,
        viewedUpdateIds,
        activityLogs,
      ] = await Promise.allSettled([
        UserService.getUserProfile(userId),
        MoodEntriesService.getLatestMoodEntry(userId),
        MoodEntriesService.getLatestAiInsight(userId),
        WellnessService.getWellnessEntries(weekAgoStr, todayStr),
        SessionHistoryService.listSessions(userId, 10),
        DailyJournalService.list(userId, 10),
        MusicPlaylistsService.list({ limit: 10 }),
        NotificationService.listImportant(userId, 10),
        UpdatesService.listActive(10),
        UpdatesService.getViewedIds(userId),
        ActivityLogService.listRecent(userId, 10),
      ]);

      const resolve = <T,>(r: PromiseSettledResult<T>, fallback: T): T =>
        r.status === 'fulfilled' ? r.value : fallback;

      setState({
        profile: resolve(profile, null),
        latestMood: resolve(latestMood, null),
        aiInsight: resolve(aiInsight, null),
        wellnessEntries: resolve(wellnessEntries, []),
        sessions: resolve(sessions, []),
        journals: resolve(journals, []),
        playlists: resolve(playlists, []),
        notifications: resolve(notifications, []),
        updates: resolve(updates, []),
        viewedUpdateIds: resolve(viewedUpdateIds, []),
        activityLogs: resolve(activityLogs, []),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll().finally(() => setRefreshing(false));
  }, [fetchAll]);

  if (loading) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator size="large" color={C.accentLight} />
        <Text style={[s.muted, { marginTop: 12 }]}>Loading your data…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={s.center}>
        <Text style={{ color: C.error, fontSize: 16, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={fetchAll}>
          <Text style={{ color: C.text, fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const unreadCount = state.notifications.filter((n) => !n.is_read).length;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.accentLight}
          />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>
              Hello, {state.profile?.full_name?.split(' ')[0] ?? 'there'} 👋
            </Text>
            <Text style={s.muted}>Here's your wellness snapshot</Text>
          </View>
          {unreadCount > 0 && (
            <View style={s.notifBadge}>
              <Text style={{ color: C.text, fontSize: 11, fontWeight: '700' }}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Profile */}
        <SectionTitle emoji="👤" title="Profile" />
        <ProfileCard profile={state.profile} />

        {/* Mood + AI */}
        <SectionTitle emoji="🧠" title="Latest Mood" />
        <MoodCard entry={state.latestMood} insight={state.aiInsight} />

        {/* Wellness */}
        <SectionTitle emoji="📊" title="Wellness (last 7 days)" />
        <WellnessCard entries={state.wellnessEntries} />

        {/* Therapy Sessions */}
        <SectionTitle emoji="💬" title="Therapy Sessions" />
        <SessionsCard sessions={state.sessions} />

        {/* Journal */}
        <SectionTitle emoji="📝" title="Daily Journal" />
        <JournalCard entries={state.journals} />

        {/* Music */}
        <SectionTitle emoji="🎵" title="Music Playlists" />
        <PlaylistsCard playlists={state.playlists} />

        {/* Notifications */}
        <SectionTitle emoji="🔔" title="Notifications" />
        <NotificationsCard notifications={state.notifications} />

        {/* Updates */}
        <SectionTitle emoji="📢" title="Updates" />
        <UpdatesCard updates={state.updates} viewedIds={state.viewedUpdateIds} />

        {/* Activity Log */}
        <SectionTitle emoji="⚡" title="Activity Log" />
        <ActivityCard logs={state.activityLogs} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { color: C.text, fontSize: 22, fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8 },
  sectionEmoji: { fontSize: 18, marginRight: 8 },
  sectionTitle: { color: C.accentLight, fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },

  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },

  cardTitle: { color: C.text, fontSize: 15, fontWeight: '600' },
  body: { color: C.text, fontSize: 14, lineHeight: 20 },
  muted: { color: C.muted, fontSize: 13 },
  label: { color: C.accentLight, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  empty: { color: C.muted, fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 },

  row: { flexDirection: 'row', alignItems: 'center' },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  badge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },

  insightBox: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.accentLight,
  },

  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: {
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accentLight,
    marginLeft: 8,
  },

  notifBadge: {
    backgroundColor: C.coral,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  retryBtn: {
    marginTop: 16,
    backgroundColor: C.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
});

export default CalmiveDashboard;