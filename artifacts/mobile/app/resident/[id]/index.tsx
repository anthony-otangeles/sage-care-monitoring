import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, Platform, KeyboardAvoidingView, Modal, Pressable, LayoutAnimation, UIManager } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, FadeIn, FadeOut } from 'react-native-reanimated';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const easeAnimation = () => {
  if (Platform.OS !== 'web') {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
  }
};
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { getResident, CareStep } from '@/data/residents';
import { StatusChip, StatusVariant } from '@/components/StatusChip';
import { SageHeader } from '@/components/SageHeader';
import { VitalRow } from '@/components/VitalRow';

type Tab = 'situation' | 'talk' | 'timeline';

export default function ResidentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const resident = getResident(id as string);
  const [tab, setTab] = useState<Tab>('situation');
  const [careSteps, setCareSteps] = useState(() => resident?.careSteps);
  const [assignedNurse, setAssignedNurse] = useState<{ name: string; time: string } | null>(null);

  const handleSetTab = useCallback((next: Tab) => {
    easeAnimation();
    setTab(next);
  }, []);

  const handleDelegate = useCallback((nurseName: string) => {
    easeAnimation();
    setCareSteps(() => ({
      surveillance: 'done',
      reassessment: 'active',
      provider: 'pending',
    }));
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setAssignedNurse({ name: nurseName, time });
  }, []);

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

        {/* Profile — full width */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 }}>
          <Image source={resident.image} style={{ width: 56, height: 56, borderRadius: 28 }} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 28 }}>{resident.name}</Text>
            <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 }}>
              {resident.codeStatus} · {resident.age}{resident.sex} · Room {resident.room}
            </Text>
          </View>
        </View>

        {/* Chips row between profile and tabs */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 24, paddingBottom: 12 }}>
          {resident.statusChips.map((s, i) => (
            <StatusChip key={i} variant={s as StatusVariant} label={s} />
          ))}
          <StatusChip variant={resident.acuity} label={resident.acuity} />
        </View>

        {/* Segmented tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 4 }}>
          {([
            { key: 'situation', icon: 'activity' },
            { key: 'talk', icon: 'message-circle' },
            { key: 'timeline', icon: 'clock' },
          ] as { key: Tab; icon: keyof typeof Feather.glyphMap }[]).map(({ key, icon }) => {
            const active = key === tab;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handleSetTab(key)}
                activeOpacity={0.7}
                style={{
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                  paddingVertical: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: active ? c.brand : 'transparent',
                }}
              >
                <Feather name={icon} size={14} color={active ? c.brand : c.mutedForeground} />
                <Text style={{
                  fontFamily: active ? 'Inter_700Bold' : 'Inter_500Medium',
                  fontSize: 14, lineHeight: 16,
                  color: active ? c.foreground : c.mutedForeground,
                  textTransform: 'capitalize',
                }}>
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Tab content with smooth fade */}
      <View style={{ flex: 1 }}>
        <Animated.View key={tab} entering={FadeIn.duration(180)} style={{ flex: 1 }}>
          {tab === 'situation' && (
            <SituationTab resident={resident} careSteps={careSteps!} assignedNurse={assignedNurse} onDelegate={handleDelegate} />
          )}
          {tab === 'talk' && <TalkTab resident={resident} insetsBottom={insets.bottom} />}
          {tab === 'timeline' && <TimelineTab resident={resident} />}
        </Animated.View>
      </View>
    </View>
  );
}

/* ---------- CARE STEPPER ---------- */

function CareStepper({
  steps, assignedNurse,
}: {
  steps: { surveillance: CareStep; reassessment: CareStep; provider: CareStep };
  assignedNurse?: { name: string; time: string } | null;
}) {
  const c = useColors();
  const items: { label: string; state: CareStep }[] = [
    { label: steps.surveillance === 'done' ? 'Surveillance Complete' : 'Active Surveillance', state: steps.surveillance },
    { label: steps.reassessment === 'active' ? 'Reassessment In Progress' : steps.reassessment === 'done' ? 'Reassessment Complete' : 'Reassessment Pending', state: steps.reassessment },
    { label: 'Provider Notified', state: steps.provider },
  ];

  const colorFor = (s: CareStep) =>
    s === 'done' ? c.success : s === 'active' ? c.brand : c.borderStrong;
  const bgFor = (s: CareStep) =>
    s === 'done' ? c.success : s === 'active' ? c.brand : c.card;
  const textFor = (s: CareStep) =>
    s === 'pending' ? c.placeholder : c.foreground;

  return (
    <View style={{ backgroundColor: c.card, borderRadius: 8, borderWidth: 1, borderColor: c.border, padding: 16 }}>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88, color: c.mutedForeground, marginBottom: 16 }}>
        CARE STATUS
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {items.map((item, i) => (
          <React.Fragment key={item.label}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                borderWidth: 2, borderColor: colorFor(item.state),
                backgroundColor: bgFor(item.state),
                alignItems: 'center', justifyContent: 'center',
              }}>
                {item.state === 'done' ? (
                  <Feather name="check" size={14} color="#FFFFFF" />
                ) : item.state === 'active' ? (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' }} />
                ) : (
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: c.placeholder }}>{i + 1}</Text>
                )}
              </View>
              <Text
                style={{
                  marginTop: 8, textAlign: 'center',
                  fontFamily: item.state === 'active' ? 'Inter_700Bold' : 'Inter_500Medium',
                  fontSize: 11, lineHeight: 14,
                  color: textFor(item.state),
                  paddingHorizontal: 2,
                }}
              >
                {item.label}
              </Text>
            </View>
            {i < items.length - 1 && (
              <View style={{
                height: 2, flex: 0.6, marginTop: 13,
                backgroundColor: items[i + 1].state !== 'pending' ? c.success : c.divider,
              }} />
            )}
          </React.Fragment>
        ))}
      </View>

      {assignedNurse && (
        <View style={{
          marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: c.divider,
          flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <View style={{
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: c.brandLight, alignItems: 'center', justifyContent: 'center',
          }}>
            <Feather name="user-check" size={13} color={c.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: c.foreground }}>
              {assignedNurse.name}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.mutedForeground, marginTop: 2 }}>
              Assigned at {assignedNurse.time} · will notify provider when reassessment completes
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

/* ---------- SITUATION ---------- */

function SituationTab({
  resident, careSteps, assignedNurse, onDelegate,
}: {
  resident: NonNullable<ReturnType<typeof getResident>>;
  careSteps: { surveillance: CareStep; reassessment: CareStep; provider: CareStep };
  assignedNurse: { name: string; time: string } | null;
  onDelegate: (nurseName: string) => void;
}) {
  const c = useColors();
  const [open, setOpen] = useState<number | null>(null);
  const [delegateOpen, setDelegateOpen] = useState(false);
  const chargeNurse = 'Sarah Jenkins, RN';
  const provider = 'Dr. Hannah Cole';

  const handleConfirmDelegate = () => {
    setDelegateOpen(false);
    setTimeout(() => onDelegate(chargeNurse), 220);
  };

  const handleToggleClarify = (i: number) => {
    easeAnimation();
    setOpen(open === i ? null : i);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 28 }}>
      {/* Care steps */}
      <CareStepper steps={careSteps} assignedNurse={assignedNurse} />

      {/* Summary + Memory combined */}
      <View style={{ backgroundColor: c.card, borderRadius: 8, borderWidth: 1, borderColor: c.border, padding: 16 }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88, color: c.mutedForeground, marginBottom: 8 }}>
          SUMMARY
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, color: c.foreground }}>
          {resident.situation.summary}
        </Text>

        <View style={{ height: 1, backgroundColor: c.divider, marginVertical: 16 }} />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Feather name="info" size={14} color={c.brand} style={{ marginTop: 3 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88, color: c.brandText, marginBottom: 4 }}>
              MEMORY
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: c.mutedForeground }}>
              {resident.situation.memory}
            </Text>
          </View>
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
                padding: 14,
                borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.divider,
              }}>
                <VitalRow {...v} />
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
                    onPress={() => handleToggleClarify(i)}
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
        onPress={() => setDelegateOpen(true)}
        style={{
          backgroundColor: c.primary, borderRadius: 4, height: 44,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 4,
        }}
      >
        <Feather name="send" size={16} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 14 }}>Delegate Actions</Text>
      </TouchableOpacity>

      <DelegateModal
        visible={delegateOpen}
        residentName={resident.name}
        provider={provider}
        onClose={() => setDelegateOpen(false)}
        onConfirm={handleConfirmDelegate}
      />
    </ScrollView>
  );
}

/* ---------- DELEGATE MODAL ---------- */

function DelegateModal({
  visible, residentName, provider, onClose, onConfirm,
}: { visible: boolean; residentName: string; provider: string; onClose: () => void; onConfirm: () => void }) {
  const c = useColors();
  const firstName = residentName.split(' ')[0];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          style={{ width: '100%', maxWidth: 380 }}
        >
          <View
            style={{
              backgroundColor: c.card, borderRadius: 16, padding: 24,
              shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            {/* Close */}
            <TouchableOpacity
              onPress={onClose}
              hitSlop={8}
              style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
            >
              <Feather name="x" size={18} color={c.mutedForeground} />
            </TouchableOpacity>

            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: c.foreground, marginBottom: 12 }}>
              Delegate Reassessment
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, color: c.mutedForeground, marginBottom: 20 }}>
              Sage will message the charge nurse to perform a focused reassessment and notify the on-call provider.
            </Text>

            <View style={{ backgroundColor: c.background, borderRadius: 8, padding: 16, gap: 12, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: c.mutedForeground, width: 64 }}>Charge:</Text>
                <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: c.foreground }}>
                  Sarah Jenkins, RN
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: c.mutedForeground, width: 64 }}>Provider:</Text>
                <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: c.foreground }}>
                  {provider}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: c.mutedForeground, width: 64 }}>Task:</Text>
                <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: c.foreground, lineHeight: 19 }}>
                  Focus on mental status, lung sounds, and fresh vitals for {firstName}.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.85}
              style={{
                backgroundColor: c.primary, borderRadius: 8, height: 48,
                alignItems: 'center', justifyContent: 'center', marginBottom: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15 }}>
                Confirm Delegation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
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
