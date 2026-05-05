// @/components/ui/AppImage
import React, { useState } from 'react';
import { ImageProps, Image as RNImage } from 'react-native';

const FALLBACK = require('@/assets/images/lumira/sad.png');

interface Props extends ImageProps {
  className?: string;
}

function Image({ source, className = "", resizeMode = 'cover', ...props }: Props) {
  const [hasError, setHasError] = useState<boolean>(false);

  return (
    <RNImage
      source={hasError ? FALLBACK : source}
      className={className}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}

export default Image;