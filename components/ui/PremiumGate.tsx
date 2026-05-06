// PremiumGate.tsx
// Converted from web PremiumGate.jsx
// Wraps screens that require premium — redirects to dashboard if not premium

import { useUserSync } from '@/hooks/useUserSync';
import { Redirect } from 'expo-router';
import React from 'react';

// ─── Commented imports (web-only) ─────────────────────────────────────────────
// import { Navigate, useLocation } from 'react-router-dom'; // replaced with expo-router Redirect

// ─── Types ────────────────────────────────────────────────────────────────────
type UserProfile = {
  is_premium: boolean | string | number | null;
  [key: string]: any;
};

type Props = {
  children: React.ReactNode;
};

// ─── PremiumGate ──────────────────────────────────────────────────────────────
const PremiumGate = ({ children }: Props) => {
  const { userProfile } = useUserSync() as { userProfile: UserProfile | null };

  // Mirrors web isPremium check exactly
  const isPremium = Boolean(
    userProfile?.is_premium === true ||
    userProfile?.is_premium === 'true' ||
    userProfile?.is_premium === 1
  );

  if (!isPremium) {
    return <Redirect href="/dashboard-home" />;
  }

  return <>{children}</>;
};

export default PremiumGate;