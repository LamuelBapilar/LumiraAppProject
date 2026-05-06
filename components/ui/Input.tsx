// Input.tsx

import { cn } from '@/utils/cn';
import React from 'react';
import {
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';
import { Checkbox } from './Checkbox';

// ─── Types ────────────────────────────────────────────────────────────────────
type InputType = 'text' | 'password' | 'email' | 'number' | 'checkbox' | 'radio';

type InputProps = Omit<TextInputProps, 'ref'> & {
  type?: InputType;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  isDisabled?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = React.forwardRef<TextInput, InputProps>(({
  className,
  type = 'text',
  label,
  description,
  error,
  required = false,
  checked,
  onCheckedChange,
  isDisabled = false,
  ...props
}, ref) => {

  // ── Checkbox type ──────────────────────────────────────────────────────────
  if (type === 'checkbox') {
    return (
      <Checkbox
        checked={checked}
        onChange={onCheckedChange}
        disabled={isDisabled}
        label={label}
        description={description}
        error={error}
        required={required}
        className={className}
      />
    );
  }

  // ── Radio type ─────────────────────────────────────────────────────────────
  if (type === 'radio') {
    return (
      <TouchableOpacity
        onPress={() => !isDisabled && onCheckedChange?.(true)}
        activeOpacity={0.7}
        className={cn(
          'w-4 h-4 rounded-full border border-primary items-center justify-center',
          isDisabled && 'opacity-50',
          className,
        )}
      >
        {checked && (
          <View className="w-2 h-2 rounded-full bg-primary" />
        )}
      </TouchableOpacity>
    );
  }

  // ── Text / email / password / number ──────────────────────────────────────
  return (
    <View className="gap-2">

      {label && (
        <Text
          className={cn(
            'text-sm font-medium font-heading leading-none',
            error      ? 'text-red-500' : 'text-foreground',
            isDisabled && 'opacity-70',
          )}
        >
          {label}
          {required && <Text className="text-red-500 ml-1"> *</Text>}
        </Text>
      )}

      <TextInput
        ref={ref}
        editable={!isDisabled}
        secureTextEntry={type === 'password'}
        keyboardType={
          type === 'email'  ? 'email-address' :
          type === 'number' ? 'numeric'        :
          'default'
        }
        placeholderTextColor="#9CA3AF"
        className={cn(
          'h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground font-body',
          error      && 'border-red-500',
          isDisabled && 'opacity-50',
          className,
        )}
        {...props}
      />

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

    </View>
  );
});

Input.displayName = 'Input';

export default Input;