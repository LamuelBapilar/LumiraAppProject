// Snackbar.tsx
// Converted from web SnackbarProvider.jsx to React Native + NativeWind

import { cn } from '@/utils/cn';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// ─── Commented imports (web-only) ─────────────────────────────────────────────
// fixed div positioning → replaced with absolute View at top of screen
// <button> → TouchableOpacity
// className string maps → NativeWind cn() classes

// ─── Types ────────────────────────────────────────────────────────────────────
type SnackbarVariant = 'success' | 'error' | 'warning' | 'info';

type SnackbarItem = {
  id: string;
  message: string;
  variant: SnackbarVariant;
};

type PushOptions = {
  variant?: SnackbarVariant;
  duration?: number;
};

type SnackbarApi = {
  push: (message: string, options?: PushOptions) => string;
  info:    (message: string, options?: PushOptions) => string;
  success: (message: string, options?: PushOptions) => string;
  warning: (message: string, options?: PushOptions) => string;
  error:   (message: string, options?: PushOptions) => string;
  remove:  (id: string) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const SnackbarContext = createContext<SnackbarApi | null>(null);

export const useSnackbar = (): SnackbarApi | null => useContext(SnackbarContext);

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_DURATION_MS = 4000;

// ─── Variant styles — NativeWind classes ──────────────────────────────────────
const variantStyles: Record<SnackbarVariant, string> = {
  success: 'bg-emerald-50 border border-emerald-200',
  error:   'bg-red-50 border border-red-200',
  warning: 'bg-amber-50 border border-amber-200',
  info:    'bg-blue-50 border border-blue-200',
};

const variantTextStyles: Record<SnackbarVariant, string> = {
  success: 'text-emerald-700',
  error:   'text-red-700',
  warning: 'text-amber-800',
  info:    'text-blue-700',
};

const variantBadgeBg: Record<SnackbarVariant, string> = {
  success: 'bg-emerald-600',
  error:   'bg-red-600',
  warning: 'bg-amber-600',
  info:    'bg-blue-600',
};

const variantBadgeLabel: Record<SnackbarVariant, string> = {
  success: '✓',
  error:   '!',
  warning: '!',
  info:    'i',
};

// ─── SnackbarProvider ─────────────────────────────────────────────────────────
export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [queue, setQueue]   = useState<SnackbarItem[]>([]);
  const timersRef           = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeById = useCallback((id: string) => {
    setQueue(q => q.filter(m => m.id !== id));
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  }, []);

  const push = useCallback((message: string, options: PushOptions = {}): string => {
    const id = Math.random().toString(36).slice(2);
    const { variant = 'info', duration = DEFAULT_DURATION_MS } = options;
    setQueue(q => [...q, { id, message, variant }]);
    const timer = setTimeout(() => removeById(id), duration);
    timersRef.current.set(id, timer);
    return id;
  }, [removeById]);

  const api = useMemo<SnackbarApi>(() => ({
    push,
    info:    (msg, opts) => push(msg, { ...opts, variant: 'info'    }),
    success: (msg, opts) => push(msg, { ...opts, variant: 'success' }),
    warning: (msg, opts) => push(msg, { ...opts, variant: 'warning' }),
    error:   (msg, opts) => push(msg, { ...opts, variant: 'error'   }),
    remove: removeById,
  }), [push, removeById]);

  return (
    <SnackbarContext.Provider value={api}>
      {children}

      {/* ── Toast stack — fixed top-right, mirrors web positioning ────────── */}
      {queue.length > 0 && (
        <View
          style={{ position: 'absolute', top: 60, right: 16, left: 16, zIndex: 70 }}
          pointerEvents="box-none"
        >
          {queue.map(({ id, message, variant }) => (
            <View
              key={id}
              className={cn(
                'rounded-xl px-4 py-3 flex-row items-start gap-3 mb-3',
                variantStyles[variant],
              )}
            >
              {/* Badge icon */}
              <View className={cn('w-5 h-5 rounded-full items-center justify-center mt-0.5', variantBadgeBg[variant])}>
                <Text className="text-white text-xs font-bold">
                  {variantBadgeLabel[variant]}
                </Text>
              </View>

              {/* Message */}
              <Text className={cn('text-sm flex-1 font-body', variantTextStyles[variant])}>
                {message}
              </Text>

              {/* Dismiss button */}
              <TouchableOpacity
                onPress={() => removeById(id)}
                activeOpacity={0.6}
                className="opacity-60"
              >
                <Text className={cn('text-sm font-bold', variantTextStyles[variant])}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;