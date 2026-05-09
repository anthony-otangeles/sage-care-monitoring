import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export interface VitalRowProps {
  label: string;
  icon: string;
  base: string;
  current: string;
  isAbnormal: boolean;
  isCritical?: boolean;
  size?: 'sm' | 'md';
}

function leadingNumber(s: string) {
  const m = s.match(/[-+]?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
}

export function VitalRow({ label, icon, base, current, isAbnormal, isCritical, size = 'md' }: VitalRowProps) {
  const c = useColors();
  const b = leadingNumber(base);
  const v = leadingNumber(current);

  let arrow: 'arrow-right' | 'arrow-up-right' | 'arrow-down-right' = 'arrow-right';
  if (!isNaN(b) && !isNaN(v)) {
    if (v > b) arrow = 'arrow-up-right';
    else if (v < b) arrow = 'arrow-down-right';
  }

  const valueColor = isCritical ? c.error : isAbnormal ? c.warning : c.success;
  const accentColor = isCritical ? c.error : isAbnormal ? c.warning : c.mutedForeground;
  const arrowColor = isCritical ? c.error : isAbnormal ? c.warning : c.placeholder;

  const isSm = size === 'sm';
  const labelSize = isSm ? 13 : 14;
  const valueSize = isSm ? 13 : 14;
  const iconSize = isSm ? 14 : 16;
  const arrowSize = isSm ? 12 : 14;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: isSm ? 8 : 12 }}>
      <Feather name={icon as any} size={iconSize} color={accentColor} />
      <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: labelSize, color: c.foreground }}>
        {label}
      </Text>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.placeholder }}>{base}</Text>
      <Feather name={arrow} size={arrowSize} color={arrowColor} style={{ marginHorizontal: 2 }} />
      <Text style={{
        fontFamily: 'Inter_700Bold', fontSize: valueSize,
        color: valueColor, minWidth: 52, textAlign: 'right',
      }}>
        {current}
      </Text>
    </View>
  );
}
