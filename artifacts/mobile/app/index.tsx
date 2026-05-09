import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { useColors } from '@/hooks/useColors';
import { residents, Resident, AcuityLevel } from '@/data/residents';
import { StatusChip, StatusVariant } from '@/components/StatusChip';

type Row = { isHeader: true; title: AcuityLevel } | (Resident & { isHeader?: false });

export default function RosterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const grouped: Record<AcuityLevel, Resident[]> = {
    WATCHFUL: residents.filter(r => r.acuity === 'WATCHFUL'),
    MONITORING: residents.filter(r => r.acuity === 'MONITORING'),
    STABLE: residents.filter(r => r.acuity === 'STABLE'),
  };

  const data: Row[] = (['WATCHFUL', 'MONITORING', 'STABLE'] as AcuityLevel[]).flatMap(
    title => [{ isHeader: true as const, title }, ...grouped[title]]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20), paddingBottom: 20 }}>
        <Text style={{ color: colors.foreground, fontSize: 32, fontFamily: 'CormorantGaramond_600SemiBold' }}>Roster</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, idx) => 'isHeader' in item && item.isHeader ? `h-${item.title}` : `r-${(item as Resident).id}-${idx}`}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        renderItem={({ item }) => {
          if ('isHeader' in item && item.isHeader) {
            return (
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.2, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 }}>
                {item.title}
              </Text>
            );
          }
          const r = item as Resident;
          return (
            <Link href={`/resident/${r.id}`} asChild>
              <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.border, gap: 16 }}>
                <Image source={r.image} style={{ width: 48, height: 48, borderRadius: 24 }} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, marginBottom: 4 }}>{r.name}</Text>
                  <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 14 }}>
                    {r.age}{r.sex} • Room {r.room}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  {r.statusChips.map((c, i) => (<StatusChip key={i} variant={c as StatusVariant} label={c} />))}
                  <StatusChip variant={r.acuity} label={r.acuity} />
                </View>
              </TouchableOpacity>
            </Link>
          );
        }}
      />
    </View>
  );
}
