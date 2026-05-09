import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

export function SageHeader() {
  const c = useColors();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={{ alignItems: 'center', paddingVertical: 8 }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100,
        backgroundColor: c.brandLight, borderWidth: 1, borderColor: c.border,
      }}>
        <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.brand }, dotStyle]} />
        <Text style={{
          fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 0.5,
          color: c.brandText,
        }}>
          SAGE IS LISTENING
        </Text>
      </View>
    </View>
  );
}
