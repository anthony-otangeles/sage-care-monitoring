import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface AcuityPillProps {
  label: string;
  active?: boolean;
}

export function AcuityPill({ label, active }: AcuityPillProps) {
  const colors = useColors();

  return (
    <TouchableOpacity 
      style={[
        styles.pill, 
        { 
          backgroundColor: active ? colors.foreground : 'transparent',
        }
      ]}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.text, 
        { 
          color: active ? colors.background : colors.mutedForeground,
        }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  }
});
