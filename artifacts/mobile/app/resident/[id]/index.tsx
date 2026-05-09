import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { getResident } from '@/data/residents';
import { StatusChip, StatusVariant } from '@/components/StatusChip';
import { SageHeader } from '@/components/SageHeader';

type Tab = 'situation' | 'talk' | 'timeline';

export default function ResidentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const resident = getResident(id as string);
  const [tab, setTab] = useState<Tab>('situation');

  if (!resident) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: c.foreground, fontFamily: 'Inter_500Medium' }}>Resident not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Sticky top: SAGE pill + Profile + Tabs */}
      <View style={{
        backgroundColor: c.card,
        paddingTop: insets.top + (Platform.OS === 'web' ? 60 : 8),
        borderBottomWidth: 1, borderBottomColor: c.divider,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="arrow-left" size={20} color={c.foreground} />
          </TouchableOpacity>
          <SageHeader />
          <View style={{ width: 32 }} />
        </View>

        {/* Profile */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
          <Image source={resident.image} style={{ width: 56, height: 56, borderRadius: 28 }} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 28 }}>{resident.name}</Text>
            <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 }}>
              MRN 0034-{resident.id.padStart(3, '0')} · {resident.age}{resident.sex} · Room {resident.room}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {resident.statusChips.map((s, i) => <StatusChip key={i} variant={s as StatusVariant} label={s} />)}
            <StatusChip variant={resident.acuity} label={resident.acuity} style="tag" />
          </View>
        </View>

        {/* Segmented tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 4 }}>
          {(['situation', 'talk', 'timeline'] as Tab[]).map(t => {
            const active = t === tab;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                activeOpacity={0.7}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: active ? c.brand : 'transparent',
                }}
              >
                <Text style={{
                  fontFamily: active ? 'Inter_700Bold' : 'Inter_500Medium',
                  fontSize: 14, lineHeight: 16,
                  color: active ? c.foreground : c.mutedForeground,
                  textTransform: 'capitalize',
                }}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {tab === 'situation' && <SituationTab resident={resident} />}
        {tab === 'talk' && <TalkTab resident={resident} insetsBottom={insets.bottom} />}
        {tab === 'timeline' && <TimelineTab resident={resident} />}
      </View>
    </View>
  );
}

/* ---------- SITUATION ---------- */

function SituationTab({ resident }: { resident: ReturnType<typeof getResident> & {} }) {
  const c = useColors();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>
      {/* Summary card */}
      <View style={{ backgroundColor: c.card, borderRadius: 8, borderWidth: 1, borderColor: c.border, padding: 16 }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88, color: c.mutedForeground, marginBottom: 8 }}>
          SUMMARY
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, color: c.foreground }}>
          {resident.situation.summary}
        </Text>
      </View>

      {/* Memory card */}
      <View style={{ backgroundColor: c.brandLight, borderRadius: 8, padding: 16, flexDirection: 'row', gap: 12 }}>
        <Feather name="info" size={16} color={c.brand} style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: c.brandText, marginBottom: 4 }}>
            Memory
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: c.brandText }}>
            {resident.situation.memory}
          </Text>
        </View>
      </View>

      {/* Concerns */}
      {resident.situation.concerns.length > 0 && (
        <View>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88, color: c.mutedForeground, marginBottom: 12, paddingHorizontal: 4 }}>
            UNRESOLVED CONCERNS
          </Text>
          <View style={{ gap: 8 }}>
            {resident.situation.concerns.map((concern, i) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: c.card, borderRadius: 8, borderWidth: 1, borderColor: c.border,
                padding: 14, gap: 12,
              }}>
                <View style={{
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: concern.color === 'coral' ? c.warning : concern.color === 'amber' ? c.concern : c.success,
                }} />
                <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: c.foreground }}>{concern.title}</Text>
                <StatusChip variant={concern.status as StatusVariant} label={concern.status} />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Vitals */}
      {resident.situation.vitals.length > 0 && (
        <View>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88, color: c.mutedForeground, marginBottom: 12, paddingHorizontal: 4 }}>
            VITALS · TRAJECTORY VS BASELINE
          </Text>
          <View style={{ backgroundColor: c.card, borderRadius: 8, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
            {resident.situation.vitals.map((v, i) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
                borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.divider,
              }}>
                <Feather name={v.icon as any} size={16} color={v.isAbnormal ? c.warning : c.mutedForeground} />
                <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: c.foreground }}>{v.label}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.placeholder }}>baseline {v.base}</Text>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: v.isAbnormal ? c.warning : c.success, minWidth: 56, textAlign: 'right' }}>
                  {v.current}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Clarify */}
      {resident.situation.clarify.length > 0 && (
        <View>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88, color: c.mutedForeground, marginBottom: 12, paddingHorizontal: 4 }}>
            CLARIFY
          </Text>
          <View style={{ gap: 8 }}>
            {resident.situation.clarify.map((q, i) => {
              const isOpen = open === i;
              return (
                <View key={i} style={{ backgroundColor: c.card, borderRadius: 8, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setOpen(isOpen ? null : i)}
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 }}
                  >
                    <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: c.foreground }}>{q.question}</Text>
                    <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={c.mutedForeground} />
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: c.divider, paddingTop: 12 }}>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: c.mutedForeground }}>{q.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Delegate Actions CTA */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={{
          backgroundColor: c.primary, borderRadius: 4, height: 40,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 8,
        }}
      >
        <Feather name="send" size={16} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 14 }}>Delegate Actions</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------- TALK ---------- */

function TalkTab({ resident, insetsBottom }: { resident: ReturnType<typeof getResident> & {}; insetsBottom: number }) {
  const c = useColors();
  // Inverted list renders index 0 at the bottom; reverse so newest appears last (visually bottom).
  const [messages, setMessages] = useState(() => [...resident.talk].reverse());
  const [input, setInput] = useState('');
  const [showJump, setShowJump] = useState(false);
  const listRef = useRef<FlatList<any>>(null);

  const scrollToLatest = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: `u-${Date.now()}`, sender: 'user' as const, text };
    setMessages(prev => [userMsg, ...prev]);
    setInput('');
    requestAnimationFrame(scrollToLatest);
    setTimeout(() => {
      const sageMsg = {
        id: `s-${Date.now()}`,
        sender: 'sage' as const,
        text: "I've noted that. Anything else you want me to add to the handoff?",
      };
      setMessages(prev => [sageMsg, ...prev]);
      requestAnimationFrame(scrollToLatest);
    }, 600);
  }, [input, scrollToLatest]);

  const onScroll = useCallback((e: any) => {
    // Inverted list: top of content (newest) = offset 0; scrolled up means offset > threshold
    setShowJump(e.nativeEvent.contentOffset.y > 120);
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        inverted
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';
          return (
            <View style={{
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              maxWidth: '82%',
              backgroundColor: isUser ? c.brand : c.card,
              borderColor: isUser ? c.brand : c.border,
              borderWidth: isUser ? 0 : 1,
              borderRadius: 12,
              paddingHorizontal: 14, paddingVertical: 10,
            }}>
              <Text style={{
                fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20,
                color: isUser ? '#FFFFFF' : c.foreground,
              }}>
                {item.text}
              </Text>
            </View>
          );
        }}
      />

      {showJump && (
        <TouchableOpacity
          onPress={scrollToLatest}
          activeOpacity={0.85}
          style={{
            position: 'absolute', alignSelf: 'center', bottom: 96,
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: c.card, borderWidth: 1, borderColor: c.borderStrong,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <Feather name="chevron-down" size={20} color={c.foreground} />
        </TouchableOpacity>
      )}

      {/* Input — sticky bottom */}
      <View style={{
        borderTopWidth: 1, borderTopColor: c.divider,
        backgroundColor: c.card,
        paddingHorizontal: 16, paddingTop: 12,
        paddingBottom: 12 + insetsBottom,
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
          borderRadius: 5, paddingHorizontal: 12, minHeight: 48,
        }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask Sage..."
            placeholderTextColor={c.placeholder}
            multiline
            style={{
              flex: 1, paddingVertical: 12,
              fontFamily: 'Inter_400Regular', fontSize: 14,
              color: c.foreground,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
            }}
          />
          <TouchableOpacity hitSlop={8}>
            <Feather name="mic" size={18} color={c.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!input.trim()}
            onPress={send}
            style={{
              width: 32, height: 32, borderRadius: 4,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: input.trim() ? c.primary : c.border,
            }}
          >
            <Feather name="send" size={16} color={input.trim() ? '#FFFFFF' : c.placeholder} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ---------- TIMELINE ---------- */

function TimelineTab({ resident }: { resident: ReturnType<typeof getResident> & {} }) {
  const c = useColors();

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={{
        fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88,
        color: c.mutedForeground, marginBottom: 16, paddingHorizontal: 4,
      }}>
        LAST 24 HOURS
      </Text>

      <View style={{ position: 'relative' }}>
        {/* Vertical line */}
        <View style={{
          position: 'absolute', left: 19, top: 8, bottom: 8,
          width: 2, backgroundColor: c.divider,
        }} />

        {resident.timeline.map((evt, i) => (
          <View key={evt.id} style={{ flexDirection: 'row', gap: 16, marginBottom: i === resident.timeline.length - 1 ? 0 : 24 }}>
            {/* Dot icon */}
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: c.card, borderWidth: 2, borderColor: c.borderStrong,
              alignItems: 'center', justifyContent: 'center',
              zIndex: 1,
            }}>
              <Feather name={evt.icon as any} size={16} color={c.mutedForeground} />
            </View>

            {/* Content */}
            <View style={{ flex: 1, paddingTop: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Text style={{
                  fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.66,
                  color: c.mutedForeground,
                }}>
                  {evt.timeAgo}
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: c.placeholder }}>· {evt.period}</Text>
              </View>
              <View style={{
                backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
                borderRadius: 8, padding: 14,
              }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, color: c.foreground }}>
                  {evt.text}
                </Text>
                {evt.interpretation && (
                  <View style={{
                    marginTop: 10, padding: 10, borderRadius: 6,
                    backgroundColor: c.brandLight, flexDirection: 'row', gap: 8,
                  }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: c.brandText }}>Sage:</Text>
                    <Text style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, color: c.brandText }}>
                      {evt.interpretation}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
