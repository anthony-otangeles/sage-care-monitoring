import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

export type StatusVariant = 'DECLINING' | 'WATCHFUL' | 'MONITORING' | 'STABLE' | 'NEUTRAL' | 'NEW' | 'ACTIVE' | 'WATCHING' | 'TRENDING';

interface StatusChipProps {
  variant: StatusVariant;
  label?: string;
}

export function StatusChip({ variant, label }: StatusChipProps) {
  const colors = useColors();

  const getStyles = () => {
    switch (variant) {
      case 'DECLINING':
        return {
          bg: colors.decliningBg,
          text: colors.decliningText,
          dot: colors.decliningText
        };
      case 'WATCHFUL':
        return {
          bg: 'transparent',
          text: colors.watchful,
          dot: colors.watchful,
          border: colors.watchful
        };
      case 'MONITORING':
        return {
          bg: 'transparent',
          text: colors.monitoring,
          dot: colors.monitoring,
          border: colors.monitoring
        };
      case 'STABLE':
        return {
          bg: 'transparent',
          text: colors.stable,
          dot: colors.stable,
          border: colors.stable
        };
      case 'NEW':
      case 'ACTIVE':
        return {
          bg: colors.decliningBg,
          text: colors.decliningText,
        };
      case 'WATCHING':
      case 'TRENDING':
        return {
          bg: 'rgba(201, 137, 47, 0.1)',
          text: colors.monitoring,
        };
      default:
        return {
          bg: colors.muted,
          text: colors.mutedForeground,
        };
    }
  };

  const style = getStyles();
  const isOutline = variant === 'WATCHFUL' || variant === 'MONITORING' || variant === 'STABLE';

  return (
    <View style={[
      styles.container, 
      { backgroundColor: style.bg },
      isOutline && { borderWidth: 1, borderColor: style.border }
    ]}>
      {isOutline && <View style={[styles.dot, { backgroundColor: style.dot }]} />}
      <Text style={[styles.text, { color: style.text }]}>{label || variant}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
  }
});
