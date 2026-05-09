import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useColors } from '@/hooks/useColors';
import { StatusChip, StatusVariant } from './StatusChip';

interface ResidentHeroProps {
  name: string;
  age: number;
  sex: 'M' | 'F';
  room: string;
  statusChips: string[];
  acuity: StatusVariant;
  image: any;
}

export function ResidentHero({ name, age, sex, room, statusChips, acuity, image }: ResidentHeroProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image 
          source={image} 
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>{name}</Text>
          <Text style={[styles.details, { color: colors.mutedForeground }]}>
            {age}{sex} • Room {room}
          </Text>
        </View>
        <View style={styles.chips}>
          {statusChips.map((chip, i) => (
            <StatusChip key={i} variant={chip as StatusVariant} label={chip} />
          ))}
          <StatusChip variant={acuity} label={acuity} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    marginBottom: 4,
  },
  details: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  chips: {
    alignItems: 'flex-end',
    gap: 6,
  }
});
