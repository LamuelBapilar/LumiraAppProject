// meditationService.ts
// React Native version of MeditationService
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import { getSupabaseClient } from './supabaseWellness';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Meditation {
  id?: string;
  title?: string;
  description?: string;
  cover_image_url?: string;
  category?: string;
  is_premium?: boolean;
  speaker?: string;
  session_count?: number;
  duration_minutes?: number;
  difficulty_level?: string;
  is_featured?: boolean;
  course_id?: string | null;
  tags?: string[];
  instructor?: string;
  created_at?: string;
}

export interface Course {
  id?: string;
  title?: string;
  description?: string;
  cover_image_url?: string;
  category?: string;
  is_premium?: boolean;
  speaker?: string;
  session_count?: number;
  difficulty_level?: string;
  created_at?: string;
  meditation_course_sessions?: { count: number }[];
}

export interface MeditationSession {
  id?: string;
  user_id?: string;
  meditation_id?: string;
  duration_minutes?: number;
  completed?: boolean;
  completed_at?: string;
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  totalHours: number;
  currentStreak: number;
  averageSessionLength: number;
}

export interface ShareResult {
  shared?: boolean;
  copied?: boolean;
  url?: string;
}

export interface ToggleFavoriteResult {
  favorited: boolean;
  data?: unknown;
}

interface GetCoursesOptions {
  category?: string | null;
  level?: string | null;
  search?: string;
  limit?: number;
}

interface GetSessionsByCourseOptions {
  limit?: number;
}

interface GetMeditationsOptions {
  category?: string | null;
  duration?: string | null;
  level?: string | null;
  search?: string;
  tags?: string[];
  limit?: number;
  featured?: boolean;
  userFavorites?: boolean;
  userId?: string | null;
  onlyStandalone?: boolean;
}

type SharePlatform = 'native' | 'clipboard' | 'twitter' | 'facebook';

// ─── Service ──────────────────────────────────────────────────────────────────

export class MeditationService {

  // ── Get all meditation courses ─────────────────────────────────────────────
  static async getCourses({
    category = null,
    level = null,
    search = '',
    limit = 50,
  }: GetCoursesOptions = {}): Promise<Course[]> {
    try {
      const client = await getSupabaseClient();
      let q = client
        .from('meditation_courses')
        .select('*, meditation_course_sessions(count)')
        .order('is_premium', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: false })
        .limit(Math.max(1, Math.min(200, limit)));

      if (category) q = q.eq('category', category);
      if (level) q = q.eq('difficulty_level', level);
      if (search) q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

      const { data, error } = await q;
      if (error) throw error;

      return (data || []).map((c: Course) => ({
        ...c,
        session_count:
          Array.isArray(c.meditation_course_sessions) &&
          c.meditation_course_sessions[0]?.count != null
            ? c.meditation_course_sessions[0].count
            : 0,
      }));
    } catch (error) {
      console.error('Error fetching meditation courses:', error);
      throw error;
    }
  }

  // ── Get sessions by course ─────────────────────────────────────────────────
  static async getSessionsByCourse(
    courseId: string,
    { limit = 200 }: GetSessionsByCourseOptions = {}
  ): Promise<Meditation[]> {
    try {
      if (!courseId) throw new Error('courseId is required');
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('meditation_course_sessions')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(Math.max(1, Math.min(500, limit)));

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching course sessions:', error);
      throw error;
    }
  }

  // ── Get single course by ID ────────────────────────────────────────────────
  static async getCourse(id: string): Promise<Course> {
    try {
      if (!id) throw new Error('id is required');
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('meditation_courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  // ── Get meditations with filtering ────────────────────────────────────────
  static async getMeditations({
    category = null,
    duration = null,
    level = null,
    search = '',
    tags = [],
    limit = 50,
    featured = false,
    userFavorites = false,
    userId = null,
    onlyStandalone = false,
  }: GetMeditationsOptions = {}): Promise<Meditation[]> {
    try {
      const client = await getSupabaseClient();

      let query = client
        .from('meditations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(Math.max(1, Math.min(200, limit)));

      if (onlyStandalone) query = query.is('course_id', null);
      if (category) query = query.eq('category', category);
      if (level) query = query.eq('difficulty_level', level);
      if (featured) query = query.eq('is_featured', true);

      if (duration) {
        const [min, max] = duration.split('-').map(Number);
        if (min && max) query = query.gte('duration_minutes', min).lte('duration_minutes', max);
        else if (min) query = query.gte('duration_minutes', min);
      }

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%,instructor.ilike.%${search}%,tags.cs.{${search}}`
        );
      }

      if (Array.isArray(tags) && tags.length > 0) {
        for (const t of tags) {
          const safe = String(t).trim();
          if (safe) query = query.contains('tags', [safe]);
        }
      }

      if (userFavorites && userId) {
        query = client
          .from('meditations')
          .select('*, meditation_favorites!inner(user_id)')
          .eq('meditation_favorites.user_id', userId)
          .order('created_at', { ascending: false })
          .limit(Math.max(1, Math.min(200, limit)));

        if (category) query = query.eq('category', category);
        if (level) query = query.eq('difficulty_level', level);
        if (featured) query = query.eq('is_featured', true);
        if (onlyStandalone) query = query.is('course_id', null);

        if (duration) {
          const [min, max] = duration.split('-').map(Number);
          if (min && max) query = query.gte('duration_minutes', min).lte('duration_minutes', max);
          else if (min) query = query.gte('duration_minutes', min);
        }

        if (search) {
          query = query.or(
            `title.ilike.%${search}%,description.ilike.%${search}%,instructor.ilike.%${search}%,tags.cs.{${search}}`
          );
        }

        if (Array.isArray(tags) && tags.length > 0) {
          for (const t of tags) {
            const safe = String(t).trim();
            if (safe) query = query.contains('tags', [safe]);
          }
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching meditations:', error);
      throw error;
    }
  }

  // ── Get single meditation by ID ────────────────────────────────────────────
  static async getMeditation(id: string): Promise<Meditation> {
    try {
      const client = await getSupabaseClient();

      let { data, error } = await client
        .from('meditation_course_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        try {
          if (!data.cover_image_url && data.course_id) {
            const { data: course } = await client
              .from('meditation_courses')
              .select('cover_image_url')
              .eq('id', data.course_id)
              .single();
            if (course?.cover_image_url) {
              data.cover_image_url = course.cover_image_url;
            }
          }
        } catch (_) {}
        return data;
      }

      const result = await client
        .from('meditations')
        .select('*')
        .eq('id', id)
        .single();

      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      console.error('Error fetching meditation:', error);
      throw error;
    }
  }

  // ── Track meditation session ───────────────────────────────────────────────
  static async trackMeditationSession(
    userId: string,
    meditationId: string,
    duration: number,
    completed = true
  ): Promise<MeditationSession> {
    try {
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('meditation_sessions')
        .insert({
          user_id: userId,
          meditation_id: meditationId,
          duration_minutes: duration,
          completed,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tracking meditation session:', error);
      throw error;
    }
  }

  // ── Toggle favorite ────────────────────────────────────────────────────────
  static async toggleFavorite(
    userId: string,
    meditationId: string
  ): Promise<ToggleFavoriteResult> {
    try {
      const client = await getSupabaseClient();

      const { data: existing } = await client
        .from('meditation_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('meditation_id', meditationId)
        .single();

      if (existing) {
        const { error } = await client
          .from('meditation_favorites')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        return { favorited: false };
      } else {
        const { data, error } = await client
          .from('meditation_favorites')
          .insert({ user_id: userId, meditation_id: meditationId })
          .select()
          .single();

        if (error) throw error;
        return { favorited: true, data };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  // ── Get user stats ─────────────────────────────────────────────────────────
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const client = await getSupabaseClient();

      const { data: sessions } = await client
        .from('meditation_sessions')
        .select('duration_minutes, completed, completed_at')
        .eq('user_id', userId)
        .eq('completed', true);

      const totalSessions: number = sessions?.length || 0;
      const totalMinutes: number =
        sessions?.reduce(
          (sum: number, s: MeditationSession) => sum + (s.duration_minutes || 0), 0
        ) || 0;

      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentSessions: MeditationSession[] =
        sessions?.filter((s: MeditationSession) =>
          new Date(s.completed_at ?? '') >= thirtyDaysAgo
        ) || [];

      const sessionsByDate: Record<string, boolean> = {};
      recentSessions.forEach((s: MeditationSession) => {
        const date = new Date(s.completed_at ?? '').toDateString();
        sessionsByDate[date] = true;
      });

      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        if (sessionsByDate[checkDate.toDateString()]) {
          streak++;
        } else {
          break;
        }
      }

      return {
        totalSessions,
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        currentStreak: streak,
        averageSessionLength:
          totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // ── Share meditation ───────────────────────────────────────────────────────
  static async shareMeditation(
    meditationId: string,
    platform: SharePlatform = 'native'
  ): Promise<ShareResult> {
    try {
      const meditation = await this.getMeditation(meditationId);
      const shareUrl = `https://yourapp.com/meditation/${meditationId}`;

      if (platform === 'native') {
        await Share.share({
          title: meditation?.title ?? 'Meditation',
          message: `${meditation?.description ?? ''}\n\n${shareUrl}`,
          url: shareUrl,
        });
        return { shared: true, url: shareUrl };
      }

      if (platform === 'clipboard') {
        await Clipboard.setStringAsync(shareUrl);
        return { copied: true, url: shareUrl };
      }

      const { Linking } = await import('react-native');

      if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          meditation?.title ?? ''
        )}&url=${encodeURIComponent(shareUrl)}`;
        await Linking.openURL(twitterUrl);
        return { shared: true, url: shareUrl };
      }

      if (platform === 'facebook') {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        await Linking.openURL(facebookUrl);
        return { shared: true, url: shareUrl };
      }

      return { shared: false };
    } catch (error) {
      console.error('Error sharing meditation:', error);
      throw error;
    }
  }
}