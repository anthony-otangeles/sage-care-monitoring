import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { getResident } from '@/data/residents';
import { TimelineItem } from '@/components/TimelineItem';

export default function TimelineScreen() {
  const { id } = useLocalSearchParams();
  const resident = getResident(id as string);
  const colors = useColors();

  if (!resident) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Resident not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Trajectory</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {resident.name} • Last 24 Hours
        </Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {resident.timeline.map((item, index) => (
          <TimelineItem 
            key={item.id}
            timeAgo={item.timeAgo}
            period={item.period}
            icon={item.icon as any}
            text={item.text}
            interpretation={item.interpretation}
            isLast={index === resident.timeline.length - 1}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  }
});
