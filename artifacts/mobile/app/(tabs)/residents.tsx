import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useColors } from '@/hooks/useColors';
import { residents, Resident, AcuityLevel } from '@/data/residents';
import { StatusChip, StatusVariant } from '@/components/StatusChip';

type Row = { isHeader: true; title: AcuityLevel; count: number } | (Resident & { isHeader?: false });

export default function RostersScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const grouped: Record<AcuityLevel, Resident[]> = {
    WATCHFUL: residents.filter(r => r.acuity === 'WATCHFUL'),
    MONITORING: residents.filter(r => r.acuity === 'MONITORING'),
    STABLE: residents.filter(r => r.acuity === 'STABLE'),
  };

  const data: Row[] = (['WATCHFUL', 'MONITORING', 'STABLE'] as AcuityLevel[]).flatMap(
    title => [{ isHeader: true as const, title, count: grouped[title].length }, ...grouped[title]]
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{
        paddingHorizontal: 24,
        paddingTop: insets.top + (Platform.OS === 'web' ? 60 : 16),
        paddingBottom: 16,
        backgroundColor: c.card,
        borderBottomWidth: 1, borderBottomColor: c.divider,
      }}>
        <Text style={{ color: c.foreground, fontSize: 24, fontFamily: 'Inter_700Bold' }}>Residents</Text>
        <Text style={{ color: c.mutedForeground, fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 }}>
          {residents.length} residents · Day shift
        </Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={item =>
          'isHeader' in item && item.isHeader ? `h-${item.title}` : `r-${(item as Resident).id}`
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          if ('isHeader' in item && item.isHeader) {
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 }}>
                <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88 }}>
                  {item.title}
                </Text>
                <Text style={{ color: c.placeholder, fontFamily: 'Inter_500Medium', fontSize: 11 }}>
                  · {item.count}
                </Text>
              </View>
            );
          }
          const r = item as Resident;
          return (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => router.push(`/resident/${r.id}`)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                marginHorizontal: 16, marginBottom: 8,
                padding: 16, borderRadius: 8,
                backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
              }}
            >
              <Image source={r.image} style={{ width: 44, height: 44, borderRadius: 22 }} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 4 }}>
                  {r.name}
                </Text>
                <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16 }} numberOfLines={2}>
                  {r.latest}
                </Text>
              </View>
              {r.statusChips.length > 0 && (
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {r.statusChips.map((s, i) => <StatusChip key={i} variant={s as StatusVariant} label={s} />)}
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
