import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  
  return (
    <Text style={[styles.label, { color: colors.mutedForeground }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 24,
    paddingHorizontal: 16,
  }
});
