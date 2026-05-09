import React from 'react';
import { View, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { useColors } from '@/hooks/useColors';

interface AvatarProps {
  source: ImageSourcePropType;
  size?: number;
  presence?: 'online' | 'away' | 'offline';
}

export function Avatar({ source, size = 44, presence }: AvatarProps) {
  const c = useColors();
  const dotSize = Math.max(10, Math.round(size * 0.28));
  const presenceColor =
    presence === 'online' ? c.success :
    presence === 'away' ? c.concern :
    c.placeholder;

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={source}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
      {presence && (
        <View
          style={{
            position: 'absolute', right: -1, bottom: -1,
            width: dotSize, height: dotSize, borderRadius: dotSize / 2,
            backgroundColor: presenceColor,
            borderWidth: 2, borderColor: c.card,
          }}
        />
      )}
    </View>
  );
}
