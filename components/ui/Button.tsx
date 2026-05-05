//button.tsx
import Icon from '@/components/ui/AppIcon';
import { cn } from '@/utils/cn';
import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, Text, View } from 'react-native';

// ─── Variant Types ────────────────────────────────────────────────────────────

type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'success'
  | 'warning'
  | 'danger';

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'xs' | 'xl';

// ─── Variant class maps ───────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  default:     'bg-primary-500',
  destructive: 'bg-destructive',
  outline:     'border border-input bg-transparent',
  secondary:   'bg-secondary',
  ghost:       'bg-transparent',
  link:        'bg-transparent',
  success:     'bg-amber-500',
  warning:     'bg-amber-500',
  danger:      'bg-amber-500',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-4',
  sm:      'h-9 px-3 rounded-xl',
  lg:      'h-11 px-8 rounded-xl',
  icon:    'h-10 w-10',
  xs:      'h-8 px-2 rounded-xl',
  xl:      'h-12 px-10 rounded-xl',
};

const textVariantClasses: Record<ButtonVariant, string> = {
  default:     'text-white',
  destructive: 'text-white',
  outline:     'text-foreground',
  secondary:   'text-white',
  ghost:       'text-foreground',
  link:        'text-primary-500 underline',
  success:     'text-white',
  warning:     'text-white',
  danger:      'text-white',
};

const textSizeClasses: Record<ButtonSize, string> = {
  default: 'text-sm',
  sm:      'text-sm',
  lg:      'text-sm',
  icon:    'text-sm',
  xs:      'text-xs',
  xl:      'text-base',
};

// ─── Icon size map ────────────────────────────────────────────────────────────

const iconSizeMap: Record<ButtonSize, number> = {
  xs:      12,
  sm:      14,
  default: 16,
  lg:      18,
  xl:      20,
  icon:    16,
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  className?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconName?: string | null;
  iconPosition?: 'left' | 'right';
  iconSize?: number | null;
  fullWidth?: boolean;
  disabled?: boolean;
}

// ─── Button ───────────────────────────────────────────────────────────────────

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      children,
      loading = false,
      iconName = null,
      iconPosition = 'left',
      iconSize = null,
      fullWidth = false,
      disabled = false,
      onPress,
      ...props
    },
    ref
  ) => {
    const calculatedIconSize = iconSize ?? iconSizeMap[size];
    const isDisabled = disabled || loading;

    const iconColor =
      variant === 'outline' || variant === 'ghost' ? '#333333' : '#FFFFFF';

    const renderIcon = () => {
      if (!iconName) return null;
      return (
        <Icon
          name={iconName}
          size={calculatedIconSize}
          color={iconColor}
        />
      );
    };

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        className={cn(
          'flex-row items-center justify-center rounded-xl',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-50',
          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <ActivityIndicator
            size="small"
            color={iconColor}
            className="mr-2"
          />
        )}

        {/* Left icon */}
        {!loading && iconName && iconPosition === 'left' && (
          <View className={children ? 'mr-2' : ''}>
            {renderIcon()}
          </View>
        )}

        {/* Label */}
        {typeof children === 'string' ? (
          <Text
            className={cn(
              'font-medium',
              textVariantClasses[variant],
              textSizeClasses[size]
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )}

        {/* Right icon */}
        {!loading && iconName && iconPosition === 'right' && (
          <View className={children ? 'ml-2' : ''}>
            {renderIcon()}
          </View>
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

export default Button;