// @/components/ui/AppIcon.tsx
import * as LucideIcons from 'lucide-react-native';
import { HelpCircle } from 'lucide-react-native';
import React from 'react';

function Icon({
  name,
  size = 24,
  color = "black",
  strokeWidth = 2,
  ...props
}: {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const IconComponent = (LucideIcons as any)?.[name];

  if (!IconComponent) {
    return (
      <HelpCircle
        size={size}
        color="gray"
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

export default Icon;