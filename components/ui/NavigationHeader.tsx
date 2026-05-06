// NavigationHeader.tsx
// Top bar + smart tip banner + modals (notifications, feedback, streak)
// ── Converted to NativeWind (className) ──────────────────────────────────────

import AppIcon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import {
  FeedbackService,
  NotificationService,
  UpdatesService,
  getSupabaseClient,
} from '@/utils/supabaseWellness';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResizeMode, Video } from 'expo-av';
import { usePathname, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Static user (replaces Clerk) ────────────────────────────────────────────
const USER_ID = 'user_3CClVidzX562pYzJPZjhejzmvn7';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavigationHeaderProps {
  onToggleSidebar: () => void;
}

interface SmartTip {
  icon: string;
  text: string;
  cta?: { label: string; href: string };
}

interface Notification {
  id: string;
  title?: string;
  message?: string;
  is_read: boolean;
  type?: string;
  created_at: string;
  action_url?: string;
}

interface Update {
  id: string;
  heading: string;
  description: string;
  created_at: string;
  image_url?: string;
  action_url?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Local asset map (matches image_url values stored in DB) ─────────────────
const LOCAL_IMAGES: Record<string, any> = {
  '/assets/images/lumira/main icon.png':         require('@/assets/images/lumira/main icon.png'),
  '/assets/images/lumira/meditation room.png':   require('@/assets/images/lumira/meditation room.png'),
  '/assets/images/lumira/for sleep tracker.png': require('@/assets/images/lumira/for sleep tracker.png'),
  '/assets/images/lumira/happy.png':             require('@/assets/images/lumira/happy.png'),
};

const resolveImageSource = (url?: string) => {
  if (!url) return null;
  if (LOCAL_IMAGES[url]) return LOCAL_IMAGES[url];
  if (url.startsWith('http://') || url.startsWith('https://')) return { uri: url };
  return null;
};

const formatTimeAgo = (iso: string): string => {
  try {
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
    const days = Math.floor(h / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } catch { return ''; }
};

const typeIcon = (t?: string): { name: string; color: string } => {
  const type = (t || 'info').toLowerCase();
  if (type === 'error')   return { name: 'AlertTriangle', color: '#ef4444' };
  if (type === 'warning') return { name: 'AlertCircle',   color: '#f59e0b' };
  if (type === 'success') return { name: 'CheckCircle2',  color: '#f97316' };
  return { name: 'Bell', color: '#666666' };
};

// ─── NavigationHeader ─────────────────────────────────────────────────────────
const NavigationHeader = ({ onToggleSidebar }: NavigationHeaderProps) => {
  const router   = useRouter();
  const pathname = usePathname();

  // ── Notification state ───────────────────────────────────────────────────
  const [showNotifications, setShowNotifications]         = useState(false);
  const [notifs, setNotifs]                               = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading]                   = useState(false);
  const [updates, setUpdates]                             = useState<Update[]>([]);
  const [updatesLoading, setUpdatesLoading]               = useState(false);
  const [viewedUpdates, setViewedUpdates]                 = useState<string[]>([]);
  const [activeNotificationTab, setActiveNotificationTab] = useState<'updates' | 'personal'>('updates');

  // ── Feedback state ───────────────────────────────────────────────────────
  const [showFeedback, setShowFeedback]       = useState(false);
  const [feedbackText, setFeedbackText]       = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // ── Ambient sound state ──────────────────────────────────────────────────
  const [ambientOn, setAmbientOn] = useState(true);

  // ── Smart tip state ──────────────────────────────────────────────────────
  const [smartTip, setSmartTip]         = useState<SmartTip | null>(null);
  const [showSmartTip, setShowSmartTip] = useState(true);

  // ── Streak state ─────────────────────────────────────────────────────────
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakCount, setStreakCount]         = useState(0);
  const [weekMarks, setWeekMarks]             = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [isColdStreak, setIsColdStreak]       = useState(false);

  // ── Load ambient preference ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem('ambientOn');
        setAmbientOn(v === null ? true : v === 'true');
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('ambientOn', ambientOn ? 'true' : 'false').catch(() => {});
  }, [ambientOn]);

  // ── Smart tip loader ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const sb = await getSupabaseClient();
        const { data } = await sb
          .from('ai_mood_insight')
          .select('stress_level, energy_level, created_at')
          .eq('user_id', USER_ID)
          .order('created_at', { ascending: false })
          .limit(1);

        const row = Array.isArray(data) ? data[0] : data;
        if (!row) { setSmartTip(null); return; }

        const parse = (v: any): number | null => {
          const n = Number(v);
          if (Number.isFinite(n)) return n;
          const s = String(v || '').toLowerCase();
          return s === 'high' ? 9 : s === 'medium' ? 6 : s === 'low' ? 3 : null;
        };

        const stress = parse(row.stress_level);
        const energy = parse(row.energy_level);
        let tip: SmartTip | null = null;

        if (Number.isFinite(stress) && stress! >= 8) {
          tip = { icon: 'AlertTriangle', text: 'High stress detected — try 4‑7‑8 breathing for 2 minutes.', cta: { label: 'Start breathing', href: '/breathing-exercise' } };
        } else if (Number.isFinite(stress) && stress! >= 6) {
          tip = { icon: 'Activity', text: 'Stress rising — take a 3‑minute screen break and hydrate.', cta: { label: 'Take a break', href: '/meditation-room' } };
        } else if (Number.isFinite(energy) && energy! <= 3) {
          tip = { icon: 'Battery', text: 'Low energy — short walk or 2 glasses of water can help boost you.', cta: { label: 'Open Meditation Room', href: '/meditation-room' } };
        } else if (Number.isFinite(energy) && energy! >= 8) {
          tip = { icon: 'Zap', text: 'Great energy — plan one focused task you care about today.', cta: { label: 'Plan task', href: '/analytics-insights' } };
        }

        setSmartTip(tip);
      } catch {}
    })();
  }, []);

  // ── Streak loader ─────────────────────────────────────────────────────────
  const loadStreak = useCallback(async () => {
    try {
      const sb = await getSupabaseClient();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      const { data } = await sb
        .from('activity_logs')
        .select('created_at')
        .eq('user_id', USER_ID)
        .eq('event_type', 'login')
        .gte('created_at', start.toISOString())
        .order('created_at', { ascending: false });

      const byDay = new Set((data || []).map((r: any) => new Date(r.created_at).toISOString().slice(0, 10)));

      let count = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (byDay.has(d.toISOString().slice(0, 10))) count++;
        else break;
      }
      setStreakCount(count);

      const marks: boolean[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        marks.push(byDay.has(d.toISOString().slice(0, 10)));
      }
      setWeekMarks(marks);
      setIsColdStreak(marks[6] === false);
    } catch {}
  }, []);

  useEffect(() => { loadStreak(); }, []);

  // ── Notifications loader ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const list = await NotificationService.listImportant({ userId: USER_ID, limit: 20 });
      setNotifs(Array.isArray(list) ? (list as Notification[]) : []);
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const fetchUpdates = useCallback(async () => {
    try {
      setUpdatesLoading(true);
      const [updatesList, viewed] = await Promise.all([
        UpdatesService.listActive({ limit: 10 }),
        UpdatesService.getViewedUpdates(USER_ID),
      ]);
      setUpdates(Array.isArray(updatesList) ? (updatesList as Update[]) : []);
      setViewedUpdates(Array.isArray(viewed) ? (viewed as string[]) : []);
    } catch (e) {
      console.error('Failed to load updates', e);
    } finally {
      setUpdatesLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); fetchUpdates(); }, []);

  // ── Derived counts ────────────────────────────────────────────────────────
  const unreadCount     = notifs.filter(n => !n.is_read).length;
  const newUpdatesCount = updates.filter(u => !viewedUpdates.includes(u.id)).length;
  const totalNotifCount = unreadCount + newUpdatesCount;

  // ── Auto-switch tab ───────────────────────────────────────────────────────
  useEffect(() => {
    if (unreadCount > 0 && newUpdatesCount === 0) setActiveNotificationTab('personal');
    else if (newUpdatesCount > 0) setActiveNotificationTab('updates');
  }, [unreadCount, newUpdatesCount]);

  // ── Feedback submit ───────────────────────────────────────────────────────
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Empty', 'Please write something before submitting.');
      return;
    }
    try {
      setFeedbackLoading(true);
      await FeedbackService.submitFeedback(USER_ID, feedbackText, pathname);
      setShowFeedback(false);
      setFeedbackText('');
      Alert.alert('Thanks!', 'Your feedback has been submitted.');
    } catch (e) {
      console.error('Feedback error:', e);
      Alert.alert('Error', 'Failed to send feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // ── Mark all notifications read ───────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      const unread = notifs.filter(n => !n.is_read);
      await Promise.all(unread.map(n => NotificationService.markRead(n.id, USER_ID)));
      await fetchNotifications();
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <View className="h-16 bg-background border-b border-border flex-row items-center justify-between px-4 mt-7 elevation-4 shadow-sm">

        {/* Left — hamburger + logo */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={onToggleSidebar}
            className="w-9 h-9 items-center justify-center rounded-[10px]"
            activeOpacity={0.7}
          >
            <AppIcon name="Menu" size={22} color="#374151" />
          </TouchableOpacity>

          <AppImage
            source={require('@/assets/images/lumira/main logo.png')}
            className="w-[100px] h-[60px]"
            resizeMode="contain"
          />
        </View>

        {/* Right — action icons */}
        <View className="flex-row items-center gap-0.5">

          {/* Streak */}
          <TouchableOpacity
            onPress={() => { loadStreak(); setShowStreakModal(true); }}
            className="w-9 h-9 items-center justify-center rounded-[10px]"
            activeOpacity={0.7}
          >
            {isColdStreak
              ? <AppIcon name="Snowflake" size={20} color="#0ea5e9" />
              : <AppImage source={require('@/assets/images/lumira/fire.png')} className="w-8 h-8" resizeMode="contain" />
            }
          </TouchableOpacity>

          {/* History */}
          <TouchableOpacity
            onPress={() => router.push('/history' as any)}
            className="w-9 h-9 items-center justify-center rounded-[10px]"
            activeOpacity={0.7}
          >
            <AppIcon name="History" size={18} color="#374151" />
          </TouchableOpacity>

          {/* Feedback */}
          <TouchableOpacity
            onPress={() => setShowFeedback(true)}
            className="w-9 h-9 items-center justify-center rounded-[10px]"
            activeOpacity={0.7}
          >
            <AppIcon name="ThumbsUp" size={18} color="#374151" />
          </TouchableOpacity>

          {/* Ambient sound */}
          <TouchableOpacity
            onPress={() => setAmbientOn(v => !v)}
            className="w-9 h-9 items-center justify-center rounded-[10px]"
            activeOpacity={0.7}
          >
            <AppIcon
              name="Music"
              size={18}
              color={ambientOn ? '#A5A88C' : '#374151'}
            />
          </TouchableOpacity>

          {/* Notifications bell + badge */}
          <TouchableOpacity
            onPress={() => {
              setShowNotifications(true);
              fetchNotifications();
              fetchUpdates();
            }}
            className="w-9 h-9 items-center justify-center rounded-[10px]"
            activeOpacity={0.7}
          >
            <View>
              <AppIcon name="Bell" size={18} color="#374151" />
              {totalNotifCount > 0 && (
                <View className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-foreground items-center justify-center px-[3px]">
                  <Text className="text-background text-[9px] font-bold">
                    {totalNotifCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* User avatar */}
          <TouchableOpacity
            className="w-8 h-8 rounded-full bg-primary-200 items-center justify-center ml-1"
            activeOpacity={0.7}
          >
            <Text className="text-primary text-xs font-bold font-heading">
              JD
            </Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* ── Smart Tip Bar ────────────────────────────────────────────────── */}
      {showSmartTip && smartTip && (
        <View className="px-4 py-2.5 bg-primary-200 border-b border-border flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-2 gap-1.5">
            <AppIcon name={smartTip.icon} size={16} color="#A5A88C" />
            <Text className="text-xs text-foreground flex-1 font-body">
              {smartTip.text}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {smartTip.cta && (
              <TouchableOpacity
                onPress={() => router.push(smartTip.cta!.href as any)}
                className="bg-primary px-2.5 py-[5px] rounded-organic-sm"
                activeOpacity={0.7}
              >
                <Text className="text-white text-[11px] font-heading font-semibold">
                  {smartTip.cta.label}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowSmartTip(false)} activeOpacity={0.7}>
              <Text className="text-[11px] text-text-secondary font-body">Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Notifications Modal ──────────────────────────────────────────── */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable
          className="flex-1 bg-black/30"
          onPress={() => setShowNotifications(false)}
        >
          <View className="absolute top-[70px] right-4 left-4 max-h-[480px] bg-background rounded-[20px] overflow-hidden elevation-10 shadow-lg">

            {/* Header */}
            <View className="px-4 py-3 border-b border-border">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-foreground font-heading">
                  Notifications
                </Text>
                <TouchableOpacity
                  onPress={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className={`px-2.5 py-[5px] rounded-organic-sm border border-border ${unreadCount === 0 ? 'opacity-40' : 'opacity-100'}`}
                  activeOpacity={0.7}
                >
                  <Text className="text-[11px] text-text-secondary font-body">
                    Mark all read
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View className="flex-row bg-surface rounded-xl p-1">
                {(['updates', 'personal'] as const).map(tab => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveNotificationTab(tab)}
                    className={`flex-1 py-2 rounded-[10px] items-center ${activeNotificationTab === tab ? 'bg-background' : 'bg-transparent'}`}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-xs font-heading font-medium ${activeNotificationTab === tab ? 'text-foreground' : 'text-text-secondary'}`}>
                      {tab === 'updates'
                        ? `Updates${newUpdatesCount > 0 ? ` (${newUpdatesCount})` : ''}`
                        : `Personal${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 p-3">
              {activeNotificationTab === 'updates' ? (
                updatesLoading
                  ? <Text className="text-sm text-text-secondary p-4 text-center">Loading updates…</Text>
                  : updates.length === 0
                  ? <Text className="text-sm text-text-secondary py-6 text-center">No updates available</Text>
                  : updates.map(update => {
                    const isNew = !viewedUpdates.includes(update.id);
                    return (
                      <TouchableOpacity
                        key={update.id}
                        onPress={async () => {
                          if (isNew) {
                            try {
                              await UpdatesService.markUpdateViewed(update.id, USER_ID);
                              await fetchUpdates();
                            } catch {}
                          }
                          if (update.action_url) router.push(update.action_url as any);
                        }}
                        className={`p-3.5 rounded-xl border mb-2.5 flex-row items-center gap-3 ${isNew ? 'border-gray-300 bg-surface' : 'border-border bg-background'}`}
                        activeOpacity={0.7}
                      >
                        {resolveImageSource(update.image_url) && (
                          <AppImage
                            source={resolveImageSource(update.image_url)!}
                            className="w-14 h-14 rounded-xl"
                            resizeMode="cover"
                          />
                        )}
                        <View className="flex-1">
                          <View className="flex-row items-start justify-between mb-1">
                            <Text className="font-semibold text-[13px] text-foreground flex-1 mr-2 font-heading">
                              {update.heading}
                            </Text>
                            <View className="flex-row items-center gap-1.5">
                              {isNew && (
                                <View className="w-2 h-2 rounded-full bg-primary" />
                              )}
                              <Text className="text-[11px] text-text-secondary font-body">
                                {formatTimeAgo(update.created_at)}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-[13px] text-text-secondary font-body" numberOfLines={2}>
                            {update.description}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
              ) : (
                notifLoading
                  ? <Text className="text-sm text-text-secondary p-4 text-center">Loading notifications…</Text>
                  : notifs.length === 0
                  ? <Text className="text-sm text-text-secondary py-6 text-center">No personal notifications</Text>
                  : notifs.map(n => {
                    const ico = typeIcon(n.type);
                    return (
                      <TouchableOpacity
                        key={n.id}
                        onPress={async () => {
                          try {
                            await NotificationService.markRead(n.id, USER_ID);
                            fetchNotifications();
                          } catch {}
                          if (n.action_url) router.push(n.action_url as any);
                        }}
                        className={`p-3.5 rounded-xl border mb-2.5 ${n.is_read ? 'border-border bg-background' : 'border-gray-300 bg-surface'}`}
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-start">
                          <View className="w-10 h-10 rounded-[10px] bg-surface items-center justify-center mr-3">
                            <AppIcon name={ico.name} size={18} color={ico.color} />
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center justify-between mb-1">
                              <Text
                                className="font-semibold text-[13px] text-foreground flex-1 mr-2 font-heading"
                                numberOfLines={1}
                              >
                                {n.title || 'Notification'}
                              </Text>
                              <View className="flex-row items-center gap-1.5">
                                {!n.is_read && (
                                  <View className="w-2 h-2 rounded-full bg-foreground" />
                                )}
                                <Text className="text-[11px] text-text-secondary font-body">
                                  {formatTimeAgo(n.created_at)}
                                </Text>
                              </View>
                            </View>
                            <Text className="text-[13px] text-text-secondary font-body" numberOfLines={2}>
                              {n.message}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* ── Feedback Modal ───────────────────────────────────────────────── */}
      <Modal
        visible={showFeedback}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFeedback(false)}
      >
        <Pressable
          className="flex-1 bg-transparent justify-end"
          onPress={() => setShowFeedback(false)}
        >
          <View
            className="bg-background rounded-tl-[24px] rounded-tr-[24px] p-6"
            onStartShouldSetResponder={() => true}
          >
            <Text className="text-[15px] font-semibold text-foreground mb-3 font-heading">
              Send feedback
            </Text>
            <TextInput
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="What do you think about Lumira? Share your thoughts…"
              placeholderTextColor="#666666"
              multiline
              numberOfLines={4}
              className="h-[100px] border border-border rounded-xl p-3 text-sm text-foreground font-body bg-surface mb-4"
              style={{ textAlignVertical: 'top' }}
            />
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => { setShowFeedback(false); setFeedbackText(''); }}
                className="px-5 py-2.5 rounded-full border border-border"
                activeOpacity={0.7}
              >
                <Text className="text-sm text-foreground font-heading">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitFeedback}
                disabled={feedbackLoading}
                className={`px-5 py-2.5 rounded-full bg-primary ${feedbackLoading ? 'opacity-60' : 'opacity-100'}`}
                activeOpacity={0.7}
              >
                <Text className="text-sm text-white font-semibold font-heading">
                  {feedbackLoading ? 'Sending…' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ── Streak Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={showStreakModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStreakModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center p-4"
          onPress={() => setShowStreakModal(false)}
        >
          <View
            className="w-full max-w-[360px] bg-background rounded-[24px] p-6"
            onStartShouldSetResponder={() => true}
          >
            {/* Streak count */}
            <View className="items-center mb-5">
              <Video
                source={require('@/assets/images/lumira/animation.mp4')}
                style={{ width: 160, height: 160 }}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping
                isMuted
                useNativeControls={false}
              />
              <Text className="text-5xl font-extrabold text-primary leading-[56px] font-heading">
                {Math.max(0, streakCount)}
              </Text>
              <Text className="text-base font-medium text-primary font-heading">
                days streak
              </Text>
            </View>

            {/* Week day labels */}
            <View className="flex-row justify-between mb-2 px-1">
              {['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'].map((d, i) => (
                <Text key={i} className="text-[11px] text-text-secondary font-semibold w-8 text-center font-body">
                  {d}
                </Text>
              ))}
            </View>

            {/* Week marks */}
            <View className="flex-row justify-between px-1 mb-6">
              {weekMarks.map((m, i) => (
                <View
                  key={i}
                  className={`w-8 h-8 rounded-full items-center justify-center ${m ? 'bg-primary' : 'bg-[#e0f2fe]'}`}
                >
                  {m
                    ? <Text className="text-white text-sm">✓</Text>
                    : <AppIcon name="Snowflake" size={14} color="#0ea5e9" />
                  }
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={() => setShowStreakModal(false)}
              className="bg-blue-600 rounded-full py-3 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm font-heading">
                I'M COMMITTED
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default NavigationHeader;