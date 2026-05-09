import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, LayoutAnimation, UIManager } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { residents, Resident } from '@/data/residents';
import { StatusChip, StatusVariant } from '@/components/StatusChip';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SituationScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);

  const priority = residents
    .slice()
    .sort((a, b) => {
      const w = (r: Resident) => (r.statusChips.includes('DECLINING') ? 0 : r.acuity === 'WATCHFUL' ? 1 : r.acuity === 'MONITORING' ? 2 : 3);
      return w(a) - w(b);
    });

  const toggle = (id: string) => {
    if (Platform.OS !== 'web') LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    setOpenId(openId === id ? null : id);
  };

  const declining = residents.filter(r => r.statusChips.includes('DECLINING')).length;
  const watchful = residents.filter(r => r.acuity === 'WATCHFUL').length;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{
        paddingHorizontal: 24,
        paddingTop: insets.top + (Platform.OS === 'web' ? 60 : 16),
        paddingBottom: 16,
        backgroundColor: c.card,
        borderBottomWidth: 1, borderBottomColor: c.divider,
      }}>
        <Text style={{ color: c.foreground, fontSize: 24, fontFamily: 'Inter_700Bold' }}>Situation</Text>
        <Text style={{ color: c.mutedForeground, fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 }}>
          {declining} declining · {watchful} watchful · {residents.length} total
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 24 }}>
        {priority.map(r => {
          const isOpen = openId === r.id;
          return (
            <View
              key={r.id}
              style={{ backgroundColor: c.card, borderRadius: 8, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggle(r.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}
              >
                <Image source={r.image} style={{ width: 44, height: 44, borderRadius: 22 }} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: c.foreground }}>{r.name}</Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.placeholder }}>· Room {r.room}</Text>
                  </View>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.mutedForeground, marginTop: 2 }} numberOfLines={1}>
                    {r.latest}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {r.statusChips.map((s, i) => <StatusChip key={i} variant={s as StatusVariant} label={s} />)}
                  {r.statusChips.length === 0 && <StatusChip variant={r.acuity} label={r.acuity} />}
                </View>
                <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={c.mutedForeground} />
              </TouchableOpacity>

              {isOpen && (
                <Animated.View entering={FadeIn.duration(180)} style={{ padding: 14, paddingTop: 0, gap: 14 }}>
                  <View style={{ height: 1, backgroundColor: c.divider }} />

                  <View>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88, color: c.mutedForeground, marginBottom: 6 }}>
                      SUMMARY
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: c.foreground }}>
                      {r.situation.summary}
                    </Text>
                  </View>

                  {r.situation.concerns.length > 0 && (
                    <View>
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88, color: c.mutedForeground, marginBottom: 8 }}>
                        UNRESOLVED CONCERNS
                      </Text>
                      <View style={{ gap: 6 }}>
                        {r.situation.concerns.map((concern, i) => (
                          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{
                              width: 6, height: 6, borderRadius: 3,
                              backgroundColor: concern.color === 'coral' ? c.warning : concern.color === 'amber' ? c.concern : c.success,
                            }} />
                            <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: c.foreground }}>
                              {concern.title}
                            </Text>
                            <StatusChip variant={concern.status as StatusVariant} label={concern.status} />
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {r.situation.vitals.length > 0 && (
                    <View>
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88, color: c.mutedForeground, marginBottom: 8 }}>
                        VITALS
                      </Text>
                      <View style={{ gap: 6 }}>
                        {r.situation.vitals.map((v, i) => (
                          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Feather name={v.icon as any} size={14} color={v.isAbnormal ? c.warning : c.mutedForeground} />
                            <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: c.foreground }}>{v.label}</Text>
                            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.placeholder }}>{v.base}</Text>
                            <Feather name="arrow-right" size={12} color={c.placeholder} />
                            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: v.isAbnormal ? c.warning : c.success, minWidth: 48, textAlign: 'right' }}>
                              {v.current}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(`/resident/${r.id}`)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                      borderRadius: 6, height: 38, backgroundColor: c.brandLight,
                    }}
                  >
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: c.brandText }}>
                      Open full chart
                    </Text>
                    <Feather name="arrow-right" size={14} color={c.brandText} />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
