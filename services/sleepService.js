/**
 * Sleep Service
 * Service layer for sleep tracking functionality
 */

import { getSupabaseClient } from '@/utils/supabaseWellness';

// Fetch public Supabase config with fallback
let cachedConfigPromise;
const fetchPublicConfig = async () => {
  if (!cachedConfigPromise) {
    // Prefer environment variables (Expo)
    const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (envUrl && envKey) {
      cachedConfigPromise = Promise.resolve({ url: envUrl, key: envKey });
    } else {
      // Fallback to Edge Function
      const configUrl = 'https://svmiesxzxshywukikqkt.supabase.co/functions/v1/public-config';

      const tryFetch = async (url) => {
        const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`${res.status} ${text}`);
        }
        return res.json();
      };

      cachedConfigPromise = tryFetch(configUrl)
        .then((json) => ({ url: json.supabaseUrl, key: json.supabaseAnonKey }));
    }
  }
  return cachedConfigPromise;
};

/**
 * Sleep Service - handles all sleep-related API calls
 */
export const SleepService = {
  /**
   * Get all sleep logs for a user
   */
  async getSleepLogs(userId, limit = 30) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .order('sleep_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sleep logs:', error);
      throw error;
    }
  },

  /**
   * Get sleep logs for a date range
   */
  async getSleepLogsByDateRange(userId, startDate, endDate) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('sleep_date', startDate)
        .lte('sleep_date', endDate)
        .order('sleep_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sleep logs by date range:', error);
      throw error;
    }
  },

  /**
   * Create a new sleep log
   */
  async createSleepLog(userId, sleepData) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('sleep_logs')
        .insert({
          user_id: userId,
          source: sleepData.source || 'manual',
          sleep_date: sleepData.sleep_date,
          bedtime: sleepData.bedtime,
          wake_time: sleepData.wake_time,
          sleep_duration: sleepData.sleep_duration,
          sleep_quality: sleepData.sleep_quality,
          sleep_score: sleepData.sleep_score,
          notes: sleepData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating sleep log:', error);
      throw error;
    }
  },

  /**
   * Update an existing sleep log
   */
  async updateSleepLog(logId, updates) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('sleep_logs')
        .update(updates)
        .eq('id', logId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating sleep log:', error);
      throw error;
    }
  },

  /**
   * Delete a sleep log
   */
  async deleteSleepLog(logId) {
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase
        .from('sleep_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting sleep log:', error);
      throw error;
    }
  },

  /**
   * Sync sleep data from Fitbit
   */
  async syncFitbitSleep(userId, date = null) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('🔄 Syncing Fitbit sleep data for user:', userId);

      // Note: We're using Clerk for auth, not Supabase Auth
      // So we just need the Supabase URL and anon key to call the edge function
      // Reuses fetchPublicConfig from supabaseWellness — no duplicate needed
      const { url: supabaseUrl, key: supabaseAnonKey } = await fetchPublicConfig();

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      console.log('📡 Using Supabase URL:', supabaseUrl);

      const response = await fetch(
        `${supabaseUrl}/functions/v1/fitbit-sleep-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify({
            userId,
            date: date || new Date().toISOString().split('T')[0],
          }),
        }
      );

      console.log('📡 Fitbit sync response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to sync Fitbit data';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        console.error('❌ Fitbit sync error:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Fitbit sync successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Error syncing Fitbit sleep:', error);
      throw error;
    }
  },

  /**
   * Check if Fitbit is connected
   */
  async isFitbitConnected(userId) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('fitbit_tokens')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" which is expected if not connected
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking Fitbit connection:', error);
      return false;
    }
  },

  /**
   * Get sleep statistics
   */
  async getSleepStatistics(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const logs = await this.getSleepLogsByDateRange(
        userId,
        startDate.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      if (logs.length === 0) {
        return {
          avgDuration: 0,
          avgQuality: 0,
          avgScore: 0,
          totalLogs: 0,
          consistency: 0,
        };
      }

      const totalDuration = logs.reduce((sum, log) => sum + (log.sleep_duration || 0), 0);
      const totalQuality = logs.reduce((sum, log) => sum + (log.sleep_quality || 0), 0);
      const totalScore = logs.reduce((sum, log) => sum + (log.sleep_score || 0), 0);

      return {
        avgDuration: Number((totalDuration / logs.length).toFixed(2)),
        avgQuality: Number((totalQuality / logs.length).toFixed(2)),
        avgScore: Math.round(totalScore / logs.length),
        totalLogs: logs.length,
        logs,
      };
    } catch (error) {
      console.error('Error getting sleep statistics:', error);
      throw error;
    }
  },
};

export default SleepService;