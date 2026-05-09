import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { StatusChip, StatusVariant } from './StatusChip';

interface ConcernCardProps {
  title: string;
  status: string;
  color: 'coral' | 'amber' | 'green';
}

export function ConcernCard({ title, status, color }: ConcernCardProps) {
  const colors = useColors();
  
  const getDotColor = () => {
    switch (color) {
      case 'coral': return colors.watchful;
      case 'amber': return colors.monitoring;
      case 'green': return colors.stable;
      default: return colors.mutedForeground;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: getDotColor() }]} />
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      </View>
      <StatusChip variant={status as StatusVariant} label={status} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  }
});
