import { useEffect, useState } from 'react';
import { getSupabaseClient, LogService, UserService } from './supabaseWellness';

// Hardcoded user ID (replaces Clerk's useUser())
const HARDCODED_USER_ID = 'user_3CClVidzX562pYzJPZjhejzmvn7';

// Minimal user shape to mirror what Clerk's useUser() would provide
const STATIC_USER = {
  id: HARDCODED_USER_ID,
  fullName: null,
  firstName: null,
  lastName: null,
  imageUrl: null,
  primaryEmailAddress: null,
  emailAddresses: [],
};

export const useUserSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);

  // Treat the static user as always loaded
  const user = STATIC_USER;
  const isLoaded = true;

  // ─── Initial sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    const syncUser = async () => {
      try {
        setIsSyncing(true);
        setError(null);

        // Try to get existing user profile
        let profile = await UserService.getUserProfile(user.id);

        // If user doesn't exist yet, sync a minimal record
        if (!profile) {
          console.log('User not found, syncing static user...');
          await UserService.syncClerkUserToSupabase(user);
          profile = await UserService.getUserProfile(user.id);
        }

        // Backfill any missing fields if we have static data for them
        const needsBackfill =
          !profile?.full_name || !profile?.profile_image_url || !profile?.user_email;
        if (needsBackfill) {
          try {
            const updated = await UserService.updateUserProfile(user.id, {
              full_name:
                profile?.full_name ||
                user?.fullName ||
                `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
                null,
              profile_image_url: profile?.profile_image_url || user?.imageUrl || null,
              user_email:
                profile?.user_email ||
                user?.primaryEmailAddress?.emailAddress ||
                user?.emailAddresses?.[0]?.emailAddress ||
                null,
            });
            profile = updated || profile;
          } catch (e) {
            console.warn('Non-blocking: failed to backfill profile fields', e);
          }
        }

        setUserProfile(profile);

        // One-time per-session login log (uses a module-level flag since
        // sessionStorage is not available in React Native)
        try {
          if (!_loginLogged) {
            _loginLogged = true;
            await LogService.logEvent({
              userId: user.id,
              eventType: 'login',
              severity: 'success',
              description: 'User signed in',
              metadata: { email: profile?.user_email || null },
            });
          }
        } catch (e) {
          // non-blocking
        }
      } catch (err) {
        console.error('Error syncing user:', err);
        setError(err.message);
      } finally {
        setIsSyncing(false);
      }
    };

    syncUser();
  }, []); // runs once on mount — static user never changes

  // ─── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    let channel;

    (async () => {
      try {
        const client = await getSupabaseClient();
        channel = client
          .channel(`users_profile_changes_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${user.id}`,
            },
            async (payload) => {
              try {
                if (payload?.new) {
                  // Zero-latency update from payload
                  setUserProfile((prev) => ({ ...(prev || {}), ...payload.new }));
                } else {
                  // Fallback fetch if payload lacks the new row
                  const fresh = await UserService.getUserProfile(user.id);
                  if (fresh) setUserProfile(fresh);
                }
              } catch (err) {
                console.error('Error applying realtime user profile update:', err);
              }
            }
          )
          .subscribe((status) => {
            console.log('Realtime subscription status:', status);
          });
      } catch (err) {
        console.error('Error setting up realtime subscription:', err);
      }
    })();

    return () => {
      (async () => {
        try {
          if (channel) {
            const client = await getSupabaseClient();
            client.removeChannel(channel);
          }
        } catch (err) {
          console.error('Error removing realtime channel:', err);
        }
      })();
    };
  }, []); // static user ID — no dependency needed

  // ─── Actions ───────────────────────────────────────────────────────────────

  const updateProfile = async (updates) => {
    try {
      setIsSyncing(true);
      setError(null);
      const updatedProfile = await UserService.updateUserProfile(user.id, updates);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const upgradeToPremium = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      const updatedProfile = await UserService.upgradeToPremium(user.id);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error upgrading to premium:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const checkPremiumAccess = async () => {
    try {
      return await UserService.hasPremiumAccess(user.id);
    } catch (err) {
      console.error('Error checking premium access:', err);
      return false;
    }
  };

  const refreshUserProfile = async () => {
    try {
      setIsSyncing(true);
      const fresh = await UserService.getUserProfile(user.id);
      if (fresh) setUserProfile(fresh);
      return fresh;
    } catch (err) {
      console.error('Error refreshing user profile:', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const forceFetchPremiumStatus = async () => {
    try {
      const profile = await UserService.getUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
        return profile.is_premium;
      }
      return false;
    } catch (err) {
      console.error('Error force fetching premium status:', err);
      return false;
    }
  };

  const testRealtimeConnection = async () => {
    try {
      const client = await getSupabaseClient();
      const testChannel = client
        .channel('test_connection')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Test realtime payload:', payload);
          }
        )
        .subscribe((status) => {
          console.log('Test realtime status:', status);
        });

      // Clean up after 5 seconds
      setTimeout(async () => {
        try {
          const c = await getSupabaseClient();
          c.removeChannel(testChannel);
        } catch (err) {
          console.error('Error cleaning up test channel:', err);
        }
      }, 5000);
    } catch (err) {
      console.error('Error testing realtime:', err);
    }
  };

  return {
    userProfile,
    isSyncing,
    error,
    updateProfile,
    upgradeToPremium,
    checkPremiumAccess,
    refreshUserProfile,
    forceFetchPremiumStatus,
    testRealtimeConnection,
    isLoaded,
  };
};

// Module-level flag — replaces sessionStorage (not available in React Native)
let _loginLogged = false;