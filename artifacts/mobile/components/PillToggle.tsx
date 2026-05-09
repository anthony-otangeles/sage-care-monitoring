import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

interface PillToggleProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

export function PillToggle({ value, onValueChange, disabled }: PillToggleProps) {
  const c = useColors();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 180 });
  }, [value, progress]);

  const TRACK_W = 52;
  const TRACK_H = 30;
  const PAD = 3;
  const THUMB = TRACK_H - PAD * 2;
  const TRAVEL = TRACK_W - THUMB - PAD * 2;

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [c.borderStrong, c.brand]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TRAVEL }],
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
    >
      <Animated.View style={[
        {
          width: TRACK_W, height: TRACK_H, borderRadius: TRACK_H / 2,
          padding: PAD, justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        trackStyle,
      ]}>
        <Animated.View style={[
          {
            width: THUMB, height: THUMB, borderRadius: THUMB / 2,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 2,
            shadowOffset: { width: 0, height: 1 },
            elevation: 2,
          },
          thumbStyle,
        ]} />
      </Animated.View>
    </Pressable>
  );
}
