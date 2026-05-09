import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';

export type StatusVariant =
  | 'DECLINING' | 'WATCHFUL' | 'MONITORING' | 'STABLE'
  | 'NEW' | 'ACTIVE' | 'WATCHING' | 'TRENDING'
  | 'TO DO' | 'FOR REVIEW' | 'FOR SIGNING' | 'SIGNED' | 'DONE' | 'PENDING';

interface StatusChipProps {
  variant: StatusVariant;
  label?: string;
  style?: 'pill' | 'tag';
}

export function StatusChip({ variant, label, style = 'pill' }: StatusChipProps) {
  const c = useColors();

  const map: Record<string, { bg: string; fg: string; border?: string }> = {
    DECLINING: { bg: c.coralTint, fg: c.error, border: c.error },
    WATCHFUL: { bg: c.coralTint, fg: c.warning, border: c.warning },
    MONITORING: { bg: c.goldTint, fg: c.goldText, border: c.concern },
    STABLE: { bg: c.mintTint, fg: c.success, border: c.success },
    NEW: { bg: c.coralTint, fg: c.coralText, border: c.warning },
    ACTIVE: { bg: c.coralTint, fg: c.coralText, border: c.warning },
    WATCHING: { bg: c.goldTint, fg: c.goldText, border: c.concern },
    TRENDING: { bg: c.goldTint, fg: c.goldText, border: c.concern },
    'TO DO': { bg: c.success, fg: '#FFFFFF' },
    'FOR REVIEW': { bg: c.warning, fg: '#FFFFFF' },
    'FOR SIGNING': { bg: c.concern, fg: '#FFFFFF' },
    SIGNED: { bg: c.error, fg: '#FFFFFF' },
    DONE: { bg: c.info, fg: '#FFFFFF' },
    PENDING: { bg: c.concern, fg: '#FFFFFF' },
  };

  const s = map[variant] || { bg: c.muted, fg: c.mutedForeground };
  const isTag = style === 'tag';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: isTag ? 3 : 4,
        borderRadius: isTag ? 4 : 5,
        backgroundColor: s.bg,
        borderWidth: isTag && s.border ? 1 : 0,
        borderColor: s.border,
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: isTag ? 12 : 10,
          lineHeight: isTag ? 15 : 12,
          letterSpacing: isTag ? 0.2 : 0.4,
          color: s.fg,
          textTransform: isTag ? 'none' : 'uppercase',
        }}
      >
        {label || variant}
      </Text>
    </View>
  );
}
