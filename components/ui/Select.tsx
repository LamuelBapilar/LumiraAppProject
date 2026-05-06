// Select.tsx
// Converted from web Select.jsx (Shadcn style) to React Native + NativeWind

import Icon from '@/components/ui/AppIcon';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Commented imports (web-only) ─────────────────────────────────────────────
// import { ChevronDown, Check, Search, X } from 'lucide-react'; // replaced with AppIcon
// <select> hidden native element removed — no form submission in RN
// <div> replaced with View, <button> with TouchableOpacity, <p> with Text

// ─── Types ────────────────────────────────────────────────────────────────────
type Option = {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
};

type SelectProps = {
  className?: string;
  options?: Option[];
  value?: string | number | (string | number)[];
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  description?: string;
  error?: string;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  onChange?: (value: any) => void;
  onOpenChange?: (open: boolean) => void;
};

// ─── Select ───────────────────────────────────────────────────────────────────
const Select = React.forwardRef<View, SelectProps>(({
  className,
  options = [],
  value,
  placeholder = 'Select an option',
  multiple = false,
  disabled = false,
  required = false,
  label,
  description,
  error,
  searchable = false,
  clearable = false,
  loading = false,
  onChange,
  onOpenChange,
}, ref) => {

  const [isOpen, setIsOpen]       = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Filter options based on search ────────────────────────────────────────
  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // ── Get display text for trigger button ───────────────────────────────────
  const getSelectedDisplay = (): string => {
    if (!value) return placeholder;

    if (multiple && Array.isArray(value)) {
      const selected = options.filter(opt => value.includes(opt.value));
      if (selected.length === 0) return placeholder;
      if (selected.length === 1) return selected[0].label;
      return `${selected.length} items selected`;
    }

    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== undefined && value !== '';

  // ── Toggle open/close ─────────────────────────────────────────────────────
  const handleToggle = () => {
    if (disabled) return;
    const next = !isOpen;
    setIsOpen(next);
    onOpenChange?.(next);
    if (!next) setSearchTerm('');
  };

  const handleClose = () => {
    setIsOpen(false);
    onOpenChange?.(false);
    setSearchTerm('');
  };

  // ── Select an option ──────────────────────────────────────────────────────
  const handleOptionSelect = (option: Option) => {
    if (option.disabled) return;

    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const updated = current.includes(option.value)
        ? current.filter(v => v !== option.value)
        : [...current, option.value];
      onChange?.(updated);
    } else {
      onChange?.(option.value);
      handleClose();
    }
  };

  // ── Clear selection ───────────────────────────────────────────────────────
  const handleClear = () => {
    onChange?.(multiple ? [] : '');
  };

  const isSelected = (optionValue: string | number): boolean => {
    if (multiple && Array.isArray(value)) return value.includes(optionValue);
    return value === optionValue;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View ref={ref} className={cn('gap-2', className)}>

      {/* Label */}
      {label && (
        <Text className={cn(
          'text-sm font-medium font-heading',
          error ? 'text-red-500' : 'text-foreground',
          disabled && 'opacity-70',
        )}>
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}

      {/* Trigger button */}
      <TouchableOpacity
        onPress={handleToggle}
        disabled={disabled}
        activeOpacity={0.7}
        className={cn(
          'h-10 w-full flex-row items-center justify-between rounded-md border border-border bg-background px-3',
          error    && 'border-red-500',
          disabled && 'opacity-50',
        )}
      >
        <Text className={cn(
          'text-sm font-body flex-1',
          hasValue ? 'text-foreground' : 'text-text-secondary',
        )}
          numberOfLines={1}
        >
          {getSelectedDisplay()}
        </Text>

        {/* Right side icons */}
        <View className="flex-row items-center gap-1">
          {loading && (
            <ActivityIndicator size="small" color="#A5A88C" />
          )}

          {clearable && hasValue && !loading && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              iconName="X"
              iconSize={12}
              onPress={handleClear}
            />
          )}

          <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
            <Icon name="ChevronDown" size={16} color="#666666" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Dropdown modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable
          className="flex-1 bg-black/20"
          onPress={handleClose}
        >
          <View
            className="absolute left-4 right-4 bg-background border border-border rounded-xl shadow-sm overflow-hidden"
            style={{ top: 120 }} // adjust per screen if needed
            onStartShouldSetResponder={() => true}
          >

            {/* Search input */}
            {searchable && (
              <View className="p-2 border-b border-border">
                <Input
                  placeholder="Search options..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  className="pl-8"
                />
                <View className="absolute left-4 top-4">
                  <Icon name="Search" size={16} color="#666666" />
                </View>
              </View>
            )}

            {/* Options list */}
            <ScrollView
              style={{ maxHeight: 240 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filteredOptions.length === 0 ? (
                <Text className="px-3 py-3 text-sm text-text-secondary font-body">
                  {searchTerm ? 'No options found' : 'No options available'}
                </Text>
              ) : (
                filteredOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleOptionSelect(option)}
                    disabled={option.disabled}
                    activeOpacity={0.7}
                    className={cn(
                      'flex-row items-center px-3 py-3 rounded-sm',
                      isSelected(option.value) ? 'bg-primary' : 'bg-background',
                      option.disabled && 'opacity-50',
                    )}
                  >
                    <Text className={cn(
                      'flex-1 text-sm font-body',
                      isSelected(option.value) ? 'text-white' : 'text-foreground',
                    )}>
                      {option.label}
                    </Text>

                    {/* Description */}
                    {option.description && (
                      <Text className="text-xs text-text-secondary font-body ml-2">
                        {option.description}
                      </Text>
                    )}

                    {/* Check for multi-select */}
                    {multiple && isSelected(option.value) && (
                      <Icon name="Check" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

          </View>
        </Pressable>
      </Modal>

      {/* Description */}
      {description && !error && (
        <Text className="text-sm text-text-secondary font-body">
          {description}
        </Text>
      )}

      {/* Error */}
      {error && (
        <Text className="text-sm text-red-500 font-body">
          {error}
        </Text>
      )}

    </View>
  );
});

Select.displayName = 'Select';

export default Select;