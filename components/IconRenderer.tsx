import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  iconName: string;
  className?: string;
  size?: number;
}

const IconRenderer: React.FC<IconRendererProps> = ({ iconName, className, size = 16 }) => {
  // @ts-ignore - Dynamic access to Lucide icons
  const IconComponent = LucideIcons[iconName];

  if (!IconComponent) {
    // Fallback icon if name not found
    return <LucideIcons.Sparkles size={size} className={className} />;
  }

  return <IconComponent size={size} className={className} />;
};

export default IconRenderer;