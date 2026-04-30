/**
 * supabase.service.ts  –  React Native / Expo version of supabase.js
 *
 * Setup:
 *   npm install @supabase/supabase-js @react-native-async-storage/async-storage
 *
 * Add to your .env (Expo):
 *   EXPO_PUBLIC_SUPABASE_URL=https://svmiesxzxshywukikqkt.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Uncomment for persistent auth sessions in Expo:
// import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MoodEntry {
  entry_id: string;
  user_id: string;
  feeling: string | null;
  intensity_level: number | null;
  voice_note_transcription: string | null;
  daily_factors: string[] | null;
  trigger_identification: string | null;
  quick_notes: string | null;
  created_at: string;
}

export interface AiMoodInsight {
  stress_level: number | null;
  energy_level: number | null;
  ai_insights: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_email: string | null;
  full_name: string | null;
  profile_image_url: string | null;
  is_premium: boolean;
  onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionHistory {
  id: string;
  user_id: string;
  history: Array<{ role: 'user' | 'ai'; text: string; ts: string }>;
  created_at: string;
}

export interface SessionInsight {
  id: string;
  session_id: string;
  user_id: string;
  insight: Record<string, unknown>;
  created_at: string;
}

export interface WellnessEntry {
  date: string;
  mood_emoji: string | null;
  stress_level: number | null;
  energy_level: number | null;
  focus_level: number | null;
  journaled: boolean;
  meditated: boolean;
  notes: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_important: boolean;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Update {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  event_type: string;
  severity: 'info' | 'success' | 'warning' | 'error' | 'critical';
  status: string;
  description: string;
  created_at: string;
}

export interface MusicPlaylist {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  description: string | null;
  created_at: string;
}

export interface DailyJournalEntry {
  id: string;
  user_id: string;
  content: string;
  tags: string[];
  attachments: string[];
  locked: boolean;
  created_at: string;
}

// ─── Singleton client ──────────────────────────────────────────────────────────

const SUPABASE_EDGE = 'https://svmiesxzxshywukikqkt.supabase.co';

let _client: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client.
 * In React Native / Expo, env vars are read synchronously via process.env
 * (expo-constants or react-native-dotenv).
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (_client) return _client;

  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';

  const key =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  if (!url || !key) {
    throw new Error(
      'Supabase config missing.\n' +
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
    );
  }

  _client = createClient(url, key, {
    auth: {
      storageKey: 'calmive-auth',
      // storage: AsyncStorage,   // ← uncomment for persistent sessions
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,  // must be false in React Native
    },
  });

  return _client;
};

// ─── MoodEntriesService ────────────────────────────────────────────────────────

export class MoodEntriesService {
  static async createMoodEntry(
    userId: string,
    entry: Partial<MoodEntry>,
    options: { triggerAI?: boolean } = {}
  ): Promise<MoodEntry> {
    if (!userId) throw new Error('User ID is required');
    const { triggerAI = true } = options;

    const row = {
      user_id: userId,
      feeling: entry.feeling ?? null,
      intensity_level: entry.intensity_level ?? null,
      voice_note_transcription: entry.voice_note_transcription ?? null,
      daily_factors: entry.daily_factors ?? null,
      trigger_identification: entry.trigger_identification ?? null,
      quick_notes: entry.quick_notes ?? null,
    };

    const { data, error } = await getSupabaseClient()
      .from('mood_entries')
      .insert([row])
      .select()
      .single();

    if (error) throw error;

    if (triggerAI) {
      // fire-and-forget
      MoodEntriesService.requestGeminiInsight({ entry_id: data?.entry_id, user_id: userId, ...row })
        .catch(() => {});
    }

    return data as MoodEntry;
  }

  static async requestGeminiInsight(payload: Record<string, unknown>): Promise<unknown> {
    const endpoint = `${SUPABASE_EDGE}/functions/v1/gemini-mood-insight`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Gemini insight failed: ${res.status}`);
    return res.json();
  }

  static async getLatestMoodEntry(userId: string): Promise<MoodEntry | null> {
    if (!userId) return null;
    const { data, error } = await getSupabaseClient()
      .from('mood_entries')
      .select('feeling,intensity_level,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) return null;
    const rows = Array.isArray(data) ? data : [data];
    return (rows[0] as MoodEntry) ?? null;
  }

  static async getLatestMoodEntryId(userId: string): Promise<string | null> {
    if (!userId) return null;
    const { data, error } = await getSupabaseClient()
      .from('mood_entries')
      .select('entry_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) return null;
    const rows = Array.isArray(data) ? data : [data];
    return (rows[0] as MoodEntry)?.entry_id ?? null;
  }

  static async getLatestAiInsight(userId: string): Promise<AiMoodInsight | null> {
    if (!userId) return null;
    const { data, error } = await getSupabaseClient()
      .from('ai_mood_insight')
      .select('stress_level,energy_level,ai_insights,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) return null;
    const rows = Array.isArray(data) ? data : [data];
    return (rows[0] as AiMoodInsight) ?? null;
  }
}

// ─── TherapyChatService ────────────────────────────────────────────────────────

export class TherapyChatService {
  static async getReply({
    messages = [],
    genz = false,
    userId = null,
  }: {
    messages?: Array<{ sender: 'user' | 'ai'; text: string }>;
    genz?: boolean;
    userId?: string | null;
  } = {}): Promise<string> {
    const endpoint = `${SUPABASE_EDGE}/functions/v1/gemini-therapy-chat`;

    const payload = {
      user_id: userId,
      genz: Boolean(genz),
      messages: messages.map((m) => ({
        role: m.sender === 'ai' ? 'ai' : 'user',
        content: String(m.text ?? ''),
      })),
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Therapy chat failed: ${res.status}`);
    const json = await res.json();
    return String(json?.reply ?? '');
  }
}

// ─── WellnessService ───────────────────────────────────────────────────────────

export class WellnessService {
  static async saveWellnessEntry(entryData: WellnessEntry): Promise<WellnessEntry> {
    const { data, error } = await getSupabaseClient()
      .from('wellness_entries')
      .upsert(entryData, { onConflict: 'user_id,date' });

    if (error) throw error;
    return data as unknown as WellnessEntry;
  }

  static async getWellnessEntries(startDate: string, endDate: string): Promise<WellnessEntry[]> {
    const { data, error } = await getSupabaseClient()
      .from('wellness_entries')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return (data ?? []) as WellnessEntry[];
  }

  static async hasPremiumAccess(userId: string): Promise<boolean> {
    const profile = await UserService.getUserProfile(userId);
    return Boolean(profile?.is_premium);
  }
}

// ─── UserService ───────────────────────────────────────────────────────────────

export class UserService {
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await getSupabaseClient()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // row not found
      throw error;
    }

    return data as UserProfile;
  }

  static async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  }

  static async syncClerkUser(clerkUser: {
    id: string;
    primaryEmailAddress?: { emailAddress: string };
    fullName?: string;
    imageUrl?: string;
  }): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('users')
      .upsert(
        [{
          id: clerkUser.id,
          user_email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
          full_name: clerkUser.fullName ?? null,
          profile_image_url: clerkUser.imageUrl ?? null,
          is_premium: false,
          onboarding: false,
          updated_at: new Date().toISOString(),
        }],
        { onConflict: 'id', ignoreDuplicates: false }
      );

    if (error) throw error;
  }

  static async upgradeToPremium(userId: string): Promise<UserProfile> {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .update({ is_premium: true, role: 'premium', updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  }
}

// ─── SessionHistoryService ─────────────────────────────────────────────────────

export class SessionHistoryService {
  static async saveSession(
    userId: string,
    messages: Array<{ role: 'user' | 'ai' | 'assistant'; text: string; ts?: string }>
  ): Promise<SessionHistory> {
    if (!userId) throw new Error('userId required');

    const normalized = messages.map((m) => ({
      role: (m.role === 'assistant' ? 'ai' : m.role) as 'user' | 'ai',
      text: String(m.text || ''),
      ts: m.ts || new Date().toISOString(),
    }));

    const { data, error } = await getSupabaseClient()
      .from('session_history')
      .insert([{ user_id: userId, history: normalized }])
      .select()
      .single();

    if (error) throw error;
    return data as SessionHistory;
  }

  static async listSessions(
    userId: string,
    limit = 20
  ): Promise<Pick<SessionHistory, 'id' | 'created_at'>[]> {
    const { data, error } = await getSupabaseClient()
      .from('session_history')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as Pick<SessionHistory, 'id' | 'created_at'>[];
  }

  static async getSessionById(id: string): Promise<SessionHistory> {
    const { data, error } = await getSupabaseClient()
      .from('session_history')
      .select('id, user_id, history, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as SessionHistory;
  }
}

// ─── SessionInsightsService ────────────────────────────────────────────────────

export class SessionInsightsService {
  static async summarizeAndStore(
    userId: string,
    messages: Array<{ role: string; text: string; ts?: string }>,
    sessionId: string | null = null
  ): Promise<unknown> {
    if (!userId) throw new Error('userId required');

    const res = await fetch(`${SUPABASE_EDGE}/functions/v1/hyper-responder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, session_id: sessionId, messages }),
    });

    if (!res.ok) throw new Error(`Session summarizer failed: ${res.status}`);
    return res.json();
  }

  static async getInsightForSession(
    userId: string,
    sessionId: string
  ): Promise<SessionInsight | null> {
    if (!userId || !sessionId) return null;

    const { data, error } = await getSupabaseClient()
      .from('session_insights')
      .select('id, session_id, user_id, insight, created_at')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return null;
    return (data as SessionInsight) ?? null;
  }
}

// ─── DailyJournalService ───────────────────────────────────────────────────────

export class DailyJournalService {
  private static readonly endpoint = `${SUPABASE_EDGE}/functions/v1/daily-journal`;

  static async list(userId: string, limit = 50): Promise<DailyJournalEntry[]> {
    if (!userId) throw new Error('userId required');
    const url =
      `${this.endpoint}?user_id=${encodeURIComponent(userId)}&limit=${Math.min(200, limit)}`;
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return (json?.data ?? []) as DailyJournalEntry[];
  }

  static async create(
    userId: string,
    entry: { content: string; tags?: string[]; locked?: boolean; passcode?: string }
  ): Promise<DailyJournalEntry> {
    if (!userId) throw new Error('userId required');
    if (!entry.content?.trim()) throw new Error('content is required');

    let passcode_hash: string | null = null;
    if (entry.locked && entry.passcode) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(entry.passcode));
      passcode_hash = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        content: entry.content,
        tags: entry.tags ?? [],
        attachments: [],
        locked: Boolean(entry.locked),
        ...(passcode_hash ? { passcode_hash } : {}),
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    return ((await res.json())?.data) as DailyJournalEntry;
  }

  static async remove(userId: string, id: string): Promise<boolean> {
    if (!userId) throw new Error('userId required');
    const res = await fetch(this.endpoint, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, id }),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  }
}

// ─── MusicPlaylistsService ─────────────────────────────────────────────────────

export class MusicPlaylistsService {
  static async list(options: {
    genre?: string;
    limit?: number;
    search?: string;
  } = {}): Promise<MusicPlaylist[]> {
    const { genre, limit = 50, search } = options;

    let q = getSupabaseClient()
      .from('music_playlists')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(200, limit));

    if (genre) q = q.ilike('genre', genre);
    if (search) {
      q = q.or(
        `title.ilike.%${search}%,artist.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as MusicPlaylist[];
  }
}

// ─── NotificationService ───────────────────────────────────────────────────────

export class NotificationService {
  static async listImportant(userId: string, limit = 20): Promise<Notification[]> {
    if (!userId) return [];
    const { data, error } = await getSupabaseClient()
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_important', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as Notification[];
  }

  static async markRead(notificationId: string, userId: string): Promise<Notification | null> {
    if (!notificationId || !userId) return null;
    const { data, error } = await getSupabaseClient()
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  }

  static async create(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string | null;
  }): Promise<Notification | null> {
    if (!params.userId) return null;
    const { data, error } = await getSupabaseClient()
      .from('notifications')
      .insert([{
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        action_url: params.actionUrl ?? null,
        is_important: true,
        is_read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  }
}

// ─── ActivityLogService ────────────────────────────────────────────────────────

export class ActivityLogService {
  static async listRecent(userId: string, limit = 10): Promise<ActivityLog[]> {
    if (!userId) return [];
    const { data, error } = await getSupabaseClient()
      .from('activity_logs')
      .select('id, event_type, severity, status, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as ActivityLog[];
  }

  static async logEvent(params: {
    userId: string;
    eventType: string;
    severity?: ActivityLog['severity'];
    status?: string;
    description?: string;
    source?: string;
    metadata?: Record<string, unknown>;
    correlationId?: string | null;
  }): Promise<boolean> {
    const {
      userId,
      eventType,
      severity = 'info',
      status = 'succeeded',
      description = '',
      source = 'app',
      metadata = {},
      correlationId = null,
    } = params;

    if (!userId) throw new Error('userId required');
    if (!eventType) throw new Error('eventType required');

    const { error } = await getSupabaseClient()
      .from('activity_logs')
      .insert([{
        user_id: userId,
        event_type: eventType,
        severity,
        status,
        description,
        source,
        metadata,
        correlation_id: correlationId,
      }]);

    if (error) throw error;
    return true;
  }
}

// ─── UpdatesService ────────────────────────────────────────────────────────────

export class UpdatesService {
  static async listActive(limit = 10): Promise<Update[]> {
    const { data, error } = await getSupabaseClient()
      .from('updates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as Update[];
  }

  static async markViewed(updateId: string, userId: string): Promise<unknown> {
    if (!updateId || !userId) return null;
    const client = getSupabaseClient();

    const { data: existing } = await client
      .from('update_views')
      .select('id')
      .eq('update_id', updateId)
      .eq('user_id', userId)
      .single();

    if (existing) return existing;

    const { data, error } = await client
      .from('update_views')
      .insert([{ update_id: updateId, user_id: userId, viewed_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getViewedIds(userId: string): Promise<string[]> {
    if (!userId) return [];
    const { data, error } = await getSupabaseClient()
      .from('update_views')
      .select('update_id')
      .eq('user_id', userId);

    if (error) throw error;
    return ((data ?? []) as Array<{ update_id: string }>).map((v) => v.update_id);
  }
}

// ─── FeedbackService ───────────────────────────────────────────────────────────

export class FeedbackService {
  static async submit(
    userId: string,
    feedbackText: string,
    pageUrl = ''
  ): Promise<unknown> {
    if (!userId) throw new Error('userId required');
    const text = String(feedbackText || '').trim();
    if (!text) throw new Error('feedback text required');

    const { data, error } = await getSupabaseClient()
      .from('user_feedback')
      .insert([{ user_id: userId, feedback_text: text, page_url: pageUrl || null }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ─── TherapySessionUsageService ────────────────────────────────────────────────

export class TherapySessionUsageService {
  static getSessionLimit(isPremium: boolean): number | typeof Infinity {
    return isPremium ? Infinity : 2;
  }

  static async getSessionUsageCount(userId: string): Promise<number> {
    if (!userId) return 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data, error } = await getSupabaseClient()
      .from('session_history')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', monthStart);

    if (error) return 0;
    return data?.length ?? 0;
  }

  static async canStartNewSession(
    userId: string,
    isPremium: boolean
  ): Promise<{ canStart: boolean; usage: number; limit: number | 'unlimited' }> {
    const limit = this.getSessionLimit(isPremium);
    if (limit === Infinity) return { canStart: true, usage: 0, limit: 'unlimited' };

    const usage = await this.getSessionUsageCount(userId);
    return {
      canStart: usage < (limit as number),
      usage,
      limit: limit as number,
    };
  }
}