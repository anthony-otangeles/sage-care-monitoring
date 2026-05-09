import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface TimelineItemProps {
  timeAgo: string;
  period: string;
  icon: keyof typeof Feather.glyphMap;
  text: string;
  interpretation?: string;
  isLast?: boolean;
}

export function TimelineItem({ timeAgo, period, icon, text, interpretation, isLast }: TimelineItemProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Text style={[styles.timeAgo, { color: colors.mutedForeground }]}>{timeAgo}</Text>
        <View style={styles.nodeContainer}>
          <View style={[styles.line, { backgroundColor: isLast ? 'transparent' : colors.border }]} />
          <View style={[styles.node, { backgroundColor: colors.border, borderColor: colors.background }]} />
        </View>
      </View>
      
      <View style={styles.rightCol}>
        <View style={[styles.periodChip, { backgroundColor: colors.muted }]}>
          <Text style={[styles.periodText, { color: colors.mutedForeground }]}>{period}</Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
              <Feather name={icon} size={16} color={colors.foreground} />
            </View>
            <Text style={[styles.text, { color: colors.foreground }]}>{text}</Text>
          </View>
          
          {interpretation && (
            <View style={[styles.interpretationCard, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.sageLabel, { color: colors.foreground }]}>Sage:</Text>
              <Text style={[styles.interpretationText, { color: colors.secondaryForeground }]}>{interpretation}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  leftCol: {
    width: 100,
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  timeAgo: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'right',
  },
  nodeContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 16,
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    top: 6,
    bottom: 0,
    width: 2,
  },
  node: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginTop: 4,
  },
  rightCol: {
    flex: 1,
    paddingBottom: 32,
  },
  periodChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  periodText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  interpretationCard: {
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  sageLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  interpretationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  }
});
