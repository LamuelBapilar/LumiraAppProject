/**
 * supabaseWellness.js
 *
 * React Native / Expo — merged wellness services.
 * Includes: fetchPublicConfig, getSupabaseClient,
 *           MoodEntriesService, TherapyChatService, WellnessRealtime,
 *           UserService, LogService, FeedbackService,
 *           NotificationService, UpdatesService
 *
 * Env vars (set in .env):
 *   EXPO_PUBLIC_SUPABASE_URL
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';

// ─── Config ───────────────────────────────────────────────────────────────────

const EDGE_BASE       = 'https://svmiesxzxshywukikqkt.supabase.co';
const EDGE_CONFIG_URL = `${EDGE_BASE}/functions/v1/public-config`;

// ─── fetchPublicConfig ────────────────────────────────────────────────────────

/** @type {Promise<{url: string, key: string}> | null} */
let cachedConfig = null;

/**
 * Resolves Supabase URL + anon key.
 *
 * Priority:
 *  1. EXPO_PUBLIC_* env vars  (zero network cost)
 *  2. Bare SUPABASE_* env vars
 *  3. Remote Edge Function fallback
 *
 * Result is cached — subsequent calls cost nothing.
 *
 * @returns {Promise<{url: string, key: string}>}
 */
export const fetchPublicConfig = () => {
  if (cachedConfig) return cachedConfig;

  cachedConfig = (async () => {
    // ── 1 & 2. Env vars ──────────────────────────────────────────────────────
    const envUrl =
      process.env.EXPO_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      '';

    const envKey =
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '';

    if (envUrl && envKey) {
      return { url: envUrl, key: envKey };
    }

    // ── 3. Remote Edge Function fallback ─────────────────────────────────────
    const res = await fetch(EDGE_CONFIG_URL, {
      method:  'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`fetchPublicConfig failed: ${res.status} – ${text}`);
    }

    const json = await res.json();
    const url  = json?.supabaseUrl     ?? '';
    const key  = json?.supabaseAnonKey ?? '';

    if (!url || !key) {
      throw new Error(
        'fetchPublicConfig: Edge Function returned empty url or key.\n' +
          JSON.stringify(json),
      );
    }

    return { url, key };
  })();

  // Clear cache on failure so the next call retries cleanly
  cachedConfig.catch(() => { cachedConfig = null; });

  return cachedConfig;
};

// ─── getSupabaseClient ────────────────────────────────────────────────────────

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let _client = null;

/**
 * Returns a singleton Supabase client, initialising it via fetchPublicConfig
 * on the first call.
 *
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>}
 */
export const getSupabaseClient = async () => {
  if (_client) return _client;

  const { url, key } = await fetchPublicConfig();

  _client = createClient(url, key, {
    auth: {
      storageKey:        'calmive-auth',
      autoRefreshToken:  true,
      persistSession:    true,
      detectSessionInUrl: false, // must be false in React Native
    },
  });

  return _client;
};

// ─── MoodEntriesService ───────────────────────────────────────────────────────

export class MoodEntriesService {
  /**
   * Create a mood entry row in public.mood_entries.
   *
   * @param {string} userId - Clerk user ID
   * @param {{
   *   feeling?: string,
   *   intensity_level?: number,
   *   voice_note_transcription?: string,
   *   daily_factors?: string[],
   *   trigger_identification?: string,
   *   quick_notes?: string
   * }} entry
   * @param {{ triggerAI?: boolean }} options
   * @returns {Promise<object>}
   */
  static async createMoodEntry(userId, entry, options = {}) {
    if (!userId) throw new Error('User ID is required to create mood entry');
    const { triggerAI = true } = options;

    const row = {
      user_id:                  userId,
      feeling:                  entry.feeling                  ?? null,
      intensity_level:          entry.intensity_level          ?? null,
      voice_note_transcription: entry.voice_note_transcription ?? null,
      daily_factors:            entry.daily_factors            ?? null,
      trigger_identification:   entry.trigger_identification   ?? null,
      quick_notes:              entry.quick_notes              ?? null,
    };

    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('mood_entries')
      .insert([row])
      .select()
      .single();

    if (error) throw error;

    if (triggerAI) {
      MoodEntriesService.requestGeminiInsight({
        entry_id:                 data?.entry_id,
        user_id:                  userId,
        feeling:                  row.feeling,
        intensity_level:          row.intensity_level,
        voice_note_transcription: row.voice_note_transcription,
        quick_notes:              row.quick_notes,
        daily_factors:            row.daily_factors,
        trigger_identification:   row.trigger_identification,
      }).catch(() => {});
    }

    return data;
  }

  /**
   * Call the Gemini mood insight Edge Function.
   *
   * @param {object} payload
   * @returns {Promise<object>}
   */
  static async requestGeminiInsight(payload) {
    const endpoint =
      process.env.EXPO_PUBLIC_GEMINI_MOOD_INSIGHT_URL ||
      `${EDGE_BASE}/functions/v1/gemini-mood-insight`;

    const res = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini function failed: ${res.status} ${text}`);
    }

    return res.json();
  }

  /**
   * Fetch the most recent mood entry for a user.
   * Returns null if none exists.
   *
   * @param {string} userId
   * @returns {Promise<{feeling: string, intensity_level: number, created_at: string} | null>}
   */
  static async getLatestMoodEntry(userId) {
    if (!userId) throw new Error('User ID is required to fetch latest mood entry');

    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('mood_entries')
      .select('feeling,intensity_level,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase error getLatestMoodEntry:', error);
      return null;
    }

    return Array.isArray(data) ? (data[0] ?? null) : (data ?? null);
  }

  /**
   * Fetch only the latest entry_id for a user.
   *
   * @param {string} userId
   * @returns {Promise<string | null>}
   */
  static async getLatestMoodEntryId(userId) {
    if (!userId) throw new Error('User ID is required to fetch latest mood entry id');

    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('mood_entries')
      .select('entry_id,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) return null;
    const row = Array.isArray(data) ? data[0] : data;
    return row?.entry_id ?? null;
  }

  /**
   * Fetch the latest AI insight for a user.
   *
   * @param {string} userId
   * @returns {Promise<{stress_level: number, energy_level: number, ai_insights: string, created_at: string} | null>}
   */
  static async getLatestAiInsight(userId) {
    if (!userId) throw new Error('User ID is required to fetch latest AI insight');

    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('ai_mood_insight')
      .select('stress_level,energy_level,ai_insights,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest AI insight:', error);
      return null;
    }

    return Array.isArray(data) ? (data[0] ?? null) : (data ?? null);
  }
}

// ─── TherapyChatService ───────────────────────────────────────────────────────

export class TherapyChatService {
  /**
   * Request a chat reply from the Gemini therapy Edge Function.
   *
   * @param {{
   *   messages?: Array<{sender: 'user'|'ai', text: string}>,
   *   genz?: boolean,
   *   userId?: string | null
   * }} params
   * @returns {Promise<string>} reply text
   */
  static async getReply({ messages = [], genz = false, userId = null } = {}) {
    const endpoint =
      process.env.EXPO_PUBLIC_GEMINI_THERAPY_CHAT_URL ||
      `${EDGE_BASE}/functions/v1/gemini-therapy-chat`;

    const payload = {
      user_id:  userId,
      genz:     Boolean(genz),
      messages: messages.map((m) => ({
        role:    m.sender === 'ai' ? 'ai' : 'user',
        content: String(m.text ?? ''),
      })),
    };

    const res = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Therapy chat failed: ${res.status} ${text}`);
    }

    const json = await res.json();
    return String(json?.reply ?? '');
  }
}

// ─── WellnessRealtime ─────────────────────────────────────────────────────────

export class WellnessRealtime {
  /**
   * Subscribe to real-time changes on wellness_entries.
   *
   * @param {(payload: object) => void} callback
   * @returns {Promise<import('@supabase/supabase-js').RealtimeChannel>}
   */
  static async subscribeToWellnessEntries(callback) {
    const client = await getSupabaseClient();
    return client
      .channel('wellness_entries_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wellness_entries' },
        callback,
      )
      .subscribe();
  }

  /**
   * Subscribe to real-time changes on wellness_insights.
   *
   * @param {(payload: object) => void} callback
   * @returns {Promise<import('@supabase/supabase-js').RealtimeChannel>}
   */
  static async subscribeToWellnessInsights(callback) {
    const client = await getSupabaseClient();
    return client
      .channel('wellness_insights_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wellness_insights' },
        callback,
      )
      .subscribe();
  }
}

// ─── UserService ──────────────────────────────────────────────────────────────

export class UserService {
  /**
   * Sync a Clerk user object to the Supabase users table.
   *
   * @param {object} clerkUser
   * @returns {Promise<any>}
   */
  static async syncClerkUserToSupabase(clerkUser) {
    const { id } = clerkUser || {};

    const email =
      clerkUser?.primary_email_address?.email_address ||
      clerkUser?.primaryEmailAddress?.emailAddress    ||
      clerkUser?.email_addresses?.[0]?.email_address  ||
      clerkUser?.emailAddresses?.[0]?.emailAddress    ||
      null;

    const fullName =
      clerkUser?.full_name ||
      clerkUser?.fullName  ||
      [
        clerkUser?.first_name || clerkUser?.firstName || '',
        clerkUser?.last_name  || clerkUser?.lastName  || '',
      ]
        .filter(Boolean)
        .join(' ') ||
      null;

    const imageUrl =
      clerkUser?.profile_image_url || clerkUser?.imageUrl || null;

    if (!id) throw new Error('Clerk user ID is required');

    const userData = {
      id,
      user_email:        email,
      full_name:         fullName,
      profile_image_url: imageUrl,
      is_premium:        false,
      onboarding:        false,
      updated_at:        new Date().toISOString(),
    };

    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .upsert([userData], { onConflict: 'id', ignoreDuplicates: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a user profile from Supabase by user ID.
   *
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async getUserProfile(userId) {
    if (!userId) throw new Error('User ID is required');

    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      if (error.message?.includes('JWT') || error.message?.includes('invalid'))
        throw new Error('Invalid API key. Please check your EXPO_PUBLIC_SUPABASE_ANON_KEY.');
      if (error.message?.includes('fetch'))
        throw new Error('Network error. Please check your internet connection.');
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a user profile.
   *
   * @param {string} userId
   * @param {object} updates
   * @returns {Promise<object>}
   */
  static async updateUserProfile(userId, updates) {
    if (!userId) throw new Error('User ID is required');

    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check if a user has premium access.
   *
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  static async hasPremiumAccess(userId) {
    try {
      const profile = await this.getUserProfile(userId);
      return profile?.is_premium || false;
    } catch (error) {
      console.error('Error checking premium access:', error);
      return false;
    }
  }

  /**
   * Upgrade a user to premium.
   *
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async upgradeToPremium(userId) {
    if (!userId) throw new Error('User ID is required');

    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .update({
        is_premium: true,
        role:       'premium',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Link Stripe session to Clerk user.
   *
   * @param {string} clerkUserId
   * @param {{ customerId?: string }} stripeData
   * @returns {Promise<object>}
   */
  static async linkStripeSession(clerkUserId, stripeData) {
    if (!clerkUserId) throw new Error('Clerk user ID is required');

    const updates = {
      is_premium: true,
      updated_at: new Date().toISOString(),
    };
    if (stripeData.customerId) updates.stripe_customer_id = stripeData.customerId;

    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .update(updates)
      .eq('id', clerkUserId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user by Stripe customer ID.
   *
   * @param {string} stripeCustomerId
   * @returns {Promise<object|null>}
   */
  static async getUserByStripeCustomerId(stripeCustomerId) {
    try {
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('stripe_customer_id', stripeCustomerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch {
      return null;
    }
  }
}

// ─── LogService ───────────────────────────────────────────────────────────────

export class LogService {
  /**
   * Write an activity log entry.
   *
   * @param {{
   *   userId: string,
   *   eventType: string,
   *   severity?: 'info'|'success'|'warning'|'error'|'critical',
   *   status?: string,
   *   description?: string,
   *   source?: string,
   *   metadata?: Record<string, any>,
   *   correlationId?: string|null
   * }} params
   * @returns {Promise<boolean>}
   */
  static async logEvent(params) {
    const {
      userId,
      eventType,
      severity      = 'info',
      status        = 'succeeded',
      description   = '',
      source        = 'app',
      metadata      = {},
      correlationId = null,
    } = params || {};

    if (!userId)    throw new Error('userId required for logEvent');
    if (!eventType) throw new Error('eventType required for logEvent');

    const client = await getSupabaseClient();
    const { error } = await client.from('activity_logs').insert([{
      user_id:        userId,
      event_type:     eventType,
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

// ─── FeedbackService ──────────────────────────────────────────────────────────

export class FeedbackService {
  /**
   * Store user feedback in public.user_feedback.
   * Matches web schema: user_id (text), feedback_text (text), page_url (text)
   *
   * @param {string} userId
   * @param {string} feedbackText
   * @param {string} pageUrl - current route/screen name, defaults to ''
   * @returns {Promise<object>}
   */
  static async submitFeedback(userId, feedbackText, pageUrl = '') {
    if (!userId) throw new Error('userId required');
    const text = String(feedbackText || '').trim();
    if (!text) throw new Error('feedback text required');

    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('user_feedback')
      .insert([{
        user_id:       userId,
        feedback_text: text,
        page_url:      pageUrl || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ─── NotificationService ──────────────────────────────────────────────────────

export class NotificationService {
  /**
   * List important notifications for a user.
   *
   * @param {{ userId: string, limit?: number }} params
   * @returns {Promise<object[]>}
   */
  static async listImportant({ userId, limit = 20 } = {}) {
    if (!userId) return [];
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_important', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  /**
   * Mark a notification as read.
   *
   * @param {string} notificationId
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async markRead(notificationId, userId) {
    if (!notificationId || !userId) return null;
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Create a notification for a user.
   *
   * @param {{ userId: string, type: string, title: string, message: string, actionUrl?: string|null }} params
   * @returns {Promise<object|null>}
   */
  static async createUserNotification({ userId, type, title, message, actionUrl = null }) {
    if (!userId) return null;
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('notifications')
      .insert([{
        user_id:      userId,
        type,
        title,
        message,
        action_url:   actionUrl,
        is_important: true,
        is_read:      false,
        created_at:   new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// ─── UpdatesService ───────────────────────────────────────────────────────────

export class UpdatesService {
  /**
   * List active global updates.
   *
   * @param {{ limit?: number }} params
   * @returns {Promise<object[]>}
   */
  static async listActive({ limit = 10 } = {}) {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('updates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  /**
   * Mark an update as viewed by a user.
   * No-ops silently if already viewed.
   *
   * @param {string} updateId
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async markUpdateViewed(updateId, userId) {
    if (!updateId || !userId) return null;
    const client = await getSupabaseClient();

    // Skip if already viewed
    const { data: existing } = await client
      .from('update_views')
      .select('id')
      .eq('update_id', updateId)
      .eq('user_id', userId)
      .single();

    if (existing) return existing;

    const { data, error } = await client
      .from('update_views')
      .insert([{
        update_id: updateId,
        user_id:   userId,
        viewed_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get list of update IDs already viewed by a user.
   *
   * @param {string} userId
   * @returns {Promise<string[]>}
   */
  static async getViewedUpdates(userId) {
    if (!userId) return [];
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('update_views')
      .select('update_id')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((v) => v.update_id);
  }
}