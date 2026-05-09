import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Platform, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { MentionInput, MessageBody } from '@/components/MentionInput';

interface AIMsg {
  id: string;
  from: 'me' | 'sage';
  text: string;
}

const seed: AIMsg[] = [
  { id: 's1', from: 'sage', text: "Hi Jamie — I'm watching all 12 residents. Ask me anything, tap a suggestion below, or use @ to focus on a specific resident." },
];

interface SuggestedPrompt {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  response: string;
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'p1',
    label: "Who's declining right now?",
    icon: 'trending-down',
    response: "3 residents are trending down this shift:\n\n• @Mary Lou Smith (204B) — confusion ↑ overnight, temp 100.4°, BP 96/58. High suspicion UTI / delirium.\n• @Beatrice Holloway (208) — atypical chest pain at rest, SpO2 dropped to 94%.\n• @Eduardo Reyes — poor PO intake, weight loss, BP 118/68 on new med.\n\nWant me to draft delegation actions for any of them?",
  },
  {
    id: 'p2',
    label: 'Summarize overnight changes',
    icon: 'moon',
    response: "Overnight summary (11p–7a):\n\n• 2 residents flagged DECLINING (@Mary Lou, @Beatrice).\n• 1 fall — @Walter Jefferson, no injury, neuro checks q15min × 2hr completed.\n• 4 PRN doses given (3 pain, 1 anxiety).\n• Night CNA noted strong urine odor in @Mary Lou — UA collected.\n• No code events. Census stable at 42.",
  },
  {
    id: 'p3',
    label: 'Who needs provider notification?',
    icon: 'phone-call',
    response: "2 residents meet provider-notification criteria:\n\n• @Mary Lou Smith — SBAR drafted for Dr. Cole (UTI w/ delirium, hypotension). Ready to send.\n• @Beatrice Holloway — chest pain + SpO2 ↓. Recommend cardiology page.\n\nShould I send the SBAR for Mary Lou now?",
  },
  {
    id: 'p4',
    label: 'Falls risk across the unit',
    icon: 'alert-triangle',
    response: "Unit falls risk snapshot:\n\n• 5 residents on high falls precautions.\n• @Walter Jefferson — 1 fall in last 24h (no injury).\n• @Otis Brown — gait unsteady, PT consult pending.\n• Bed/chair alarms active for 4 residents.\n• Last unit fall huddle: 6 days ago — recommend scheduling this week.",
  },
  {
    id: 'p5',
    label: 'Draft handoff for night shift',
    icon: 'file-text',
    response: "Night shift handoff draft:\n\n**Watchful (3):** @Mary Lou (UTI workup, awaiting UA), @Beatrice (chest pain, monitor SpO2 q2h), @Eduardo (encourage PO, weights AM).\n\n**Stable but watch:** @Walter (post-fall neuro checks complete, continue q-shift), @Otis (gait, no ambulation w/o assist).\n\n**Pending orders:** IV abx for Mary Lou, cardiology page for Beatrice.\n\nWant me to send this to the charge nurse?",
  },
  {
    id: 'p6',
    label: 'Medication concerns today',
    icon: 'package',
    response: "Medication watch list:\n\n• @Eduardo Reyes — new BP med started 5d ago, BP now 118/68. Consider hold + reassess.\n• @Hiroshi Tanaka — fasting BG 185 (baseline 110). Sliding scale used 2× this week.\n• 3 residents due for medication reconciliation this week.\n\nI can flag these for the pharmacist if you'd like.",
  },
];

export default function AIScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<AIMsg[]>(seed);
  const [usedPrompts, setUsedPrompts] = useState<string[]>([]);
  const listRef = useRef<FlatList<AIMsg>>(null);

  const send = (text: string, tailoredReply?: string) => {
    const userMsg: AIMsg = { id: `u-${Date.now()}`, from: 'me', text };
    const reply: AIMsg = {
      id: `s-${Date.now()}`,
      from: 'sage',
      text: tailoredReply ?? 'Got it — pulling that up now.',
    };
    setMessages(prev => [...prev, userMsg, reply]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const handlePromptTap = (p: SuggestedPrompt) => {
    setUsedPrompts(prev => [...prev, p.id]);
    send(p.label, p.response);
  };

  const remainingPrompts = SUGGESTED_PROMPTS.filter(p => !usedPrompts.includes(p.id));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={{
        paddingHorizontal: 24,
        paddingTop: insets.top + (Platform.OS === 'web' ? 60 : 16),
        paddingBottom: 16,
        backgroundColor: c.card,
        borderBottomWidth: 1, borderBottomColor: c.divider,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <View style={{
          width: 36, height: 36, borderRadius: 18,
          backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center',
        }}>
          <Feather name="zap" size={18} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.foreground, fontSize: 18, fontFamily: 'Inter_700Bold' }}>Ask Sage</Text>
          <Text style={{ color: c.mutedForeground, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
            Tag any resident with @
          </Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMe = item.from === 'me';
          return (
            <View style={{ flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <View style={{
                maxWidth: '82%',
                backgroundColor: isMe ? c.primary : c.card,
                borderWidth: isMe ? 0 : 1, borderColor: c.border,
                borderRadius: 16,
                borderBottomRightRadius: isMe ? 4 : 16,
                borderBottomLeftRadius: isMe ? 16 : 4,
                paddingHorizontal: 14, paddingVertical: 10,
              }}>
                <MessageBody
                  text={item.text}
                  color={isMe ? '#FFFFFF' : c.foreground}
                  mentionColor={isMe ? '#FFFFFF' : c.brand}
                />
              </View>
            </View>
          );
        }}
      />

      {remainingPrompts.length > 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={{
            borderTopWidth: 1, borderTopColor: c.divider,
            backgroundColor: c.card,
            paddingTop: 10, paddingBottom: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 8 }}>
            <Feather name="zap" size={11} color={c.brand} />
            <Text style={{
              fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.8,
              color: c.mutedForeground,
            }}>
              SUGGESTED FOR YOU
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {remainingPrompts.map(p => (
              <TouchableOpacity
                key={p.id}
                onPress={() => handlePromptTap(p)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  paddingHorizontal: 12, paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: c.brandLight,
                  borderWidth: 1, borderColor: c.border,
                }}
              >
                <Feather name={p.icon} size={12} color={c.brand} />
                <Text style={{
                  fontFamily: 'Inter_600SemiBold', fontSize: 12, color: c.brandText,
                }}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <MentionInput
        value={draft}
        onChange={setDraft}
        onSend={send}
        onMic={() => {}}
        placeholder="Ask Sage anything... @ to tag"
      />
    </KeyboardAvoidingView>
  );
}
