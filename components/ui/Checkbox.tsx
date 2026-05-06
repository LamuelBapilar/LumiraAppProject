// Checkbox.tsx

import AppIcon from '@/components/ui/AppIcon';
import { cn } from '@/utils/cn';
import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Checkbox ─────────────────────────────────────────────────────────────────
type CheckboxProps = {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'default' | 'lg';
  onChange?: (checked: boolean) => void;
  className?: string;
};

const Checkbox = ({
  checked = false,
  indeterminate = false,
  disabled = false,
  required = false,
  label,
  description,
  error,
  size = 'default',
  onChange,
  className,
}: CheckboxProps) => {
  const isChecked = checked || indeterminate;
  const boxSize   = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const iconSize  = size === 'lg' ? 14 : 12;

  return (
    <View className={cn('flex-row items-start gap-2', className)}>

      {/* ── Checkbox box ────────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
        activeOpacity={0.7}
        className={cn(
          'rounded-sm border items-center justify-center mt-0.5',
          boxSize,
          isChecked    ? 'bg-primary border-primary'  : 'border-primary bg-transparent',
          error        ? 'border-red-500'              : '',
          disabled     ? 'opacity-50'                  : '',
        )}
      >
        {checked && !indeterminate && (
          <AppIcon name="Check" size={iconSize} color="#FFFFFF" />
        )}
        {indeterminate && (
          <AppIcon name="Minus" size={iconSize} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* ── Label / description / error ───────────────────────────────── */}
      {(label || description || error) && (
        <TouchableOpacity
          onPress={() => !disabled && onChange?.(!checked)}
          disabled={disabled}
          activeOpacity={0.7}
          className="flex-1 gap-1"
        >
          {label && (
            <Text
              className={cn(
                'text-sm font-medium font-heading leading-none',
                error   ? 'text-red-500'   : 'text-foreground',
                disabled ? 'opacity-70'    : '',
              )}
            >
              {label}
              {required && <Text className="text-red-500 ml-1"> *</Text>}
            </Text>
          )}

          {description && !error && (
            <Text className="text-sm text-text-secondary font-body">
              {description}
            </Text>
          )}

          {error && (
            <Text className="text-sm text-red-500 font-body">
              {error}
            </Text>
          )}
        </TouchableOpacity>
      )}

    </View>
  );
};

Checkbox.displayName = 'Checkbox';

// ─── CheckboxGroup ────────────────────────────────────────────────────────────
type CheckboxGroupProps = {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
};

const CheckboxGroup = ({
  label,
  description,
  error,
  required = false,
  disabled = false,
  children,
  className,
}: CheckboxGroupProps) => {
  return (
    <View className={cn('gap-3', disabled && 'opacity-50', className)}>

      {label && (
        <Text
          className={cn(
            'text-sm font-medium font-heading',
            error ? 'text-red-500' : 'text-foreground',
          )}
        >
          {label}
          {required && <Text className="text-red-500 ml-1"> *</Text>}
        </Text>
      )}

      {description && !error && (
        <Text className="text-sm text-text-secondary font-body">
          {description}
        </Text>
      )}

      <View className="gap-2">
        {children}
      </View>

      {error && (
        <Text className="text-sm text-red-500 font-body">
          {error}
        </Text>
      )}

    </View>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';

export { Checkbox, CheckboxGroup };
