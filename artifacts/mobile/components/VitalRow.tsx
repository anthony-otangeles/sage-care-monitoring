import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface VitalRowProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  base: string;
  current: string;
  isAbnormal: boolean;
}

export function VitalRow({ label, icon, base, current, isAbnormal }: VitalRowProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
          <Feather name={icon} size={16} color={colors.foreground} />
        </View>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      </View>
      
      <View style={styles.right}>
        <Text style={[styles.baseText, { color: colors.mutedForeground }]}>BASE: {base}</Text>
        <Feather name="arrow-right" size={14} color={colors.mutedForeground} style={styles.arrow} />
        <Text style={[
          styles.currentText, 
          { color: isAbnormal ? colors.accent : colors.foreground }
        ]}>
          {current}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  baseText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  arrow: {
    marginHorizontal: 6,
  },
  currentText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  }
});
