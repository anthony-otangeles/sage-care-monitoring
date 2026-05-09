import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Platform, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { MentionInput, MessageBody } from '@/components/MentionInput';

type AIMsg =
  | { id: string; kind: 'briefing' }
  | { id: string; kind: 'text'; from: 'me' | 'sage'; text: string; bullets?: string[]; footer?: string };

const seed: AIMsg[] = [
  { id: 'b1', kind: 'briefing' },
  {
    id: 'm1', kind: 'text', from: 'me',
    text: 'What changed with Mary Lou overnight?',
  },
  {
    id: 'm2', kind: 'text', from: 'sage',
    text: 'Mary Lou demonstrated progressive confusion, worsening transfer dependence, and significantly reduced intake overnight compared to baseline.',
    bullets: [
      'increased lethargy',
      'poor oral intake',
      'delayed responses',
      'increased transfer assistance',
    ],
    footer: 'Trajectory worsened between approximately 1:00 AM and 5:00 AM. Current concern is evolving dehydration with possible UTI-associated delirium.',
  },
  {
    id: 'm3', kind: 'text', from: 'me',
    text: 'Why are you more concerned this morning?',
  },
  {
    id: 'm4', kind: 'text', from: 'sage',
    text: 'Concern increased because multiple deterioration signals converged within a short timeframe.',
    bullets: [
      'cognition worsening above baseline',
      'continued intake decline',
      'increased weakness',
      'functional mobility deterioration',
    ],
    footer: 'These changes increase risk for fall, hospitalization, worsening delirium, and further dehydration progression.',
  },
  {
    id: 'm5', kind: 'text', from: 'me',
    text: 'Has the provider been contacted yet?',
  },
  {
    id: 'm6', kind: 'text', from: 'sage',
    text: 'Not yet. Focused nursing reassessment was completed at 7:18 AM.\n\nCurrent recommendation: notify NP due to persistent cognition decline, poor intake, and increasing weakness despite overnight monitoring.\n\nWould you like me to prepare a provider escalation summary?',
  },
];

interface SuggestedPrompt {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  response: { text: string; bullets?: string[]; footer?: string };
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'p1',
    label: 'Prepare provider summary for Mary Lou',
    icon: 'file-text',
    response: {
      text: 'Preparing NP escalation summary now.',
      bullets: [
        'worsening confusion',
        'intake decline',
        'transfer deterioration',
        'dehydration concern',
        'possible infection-related delirium',
      ],
      footer: 'I will include trajectory evolution, overnight changes, current risks, unresolved concerns, and reassessment findings. Ready for your review in under a minute.',
    },
  },
  {
    id: 'p2',
    label: 'Show unresolved concerns across the facility',
    icon: 'alert-circle',
    response: {
      text: '7 unresolved concerns are open across East and West Hall right now.',
      bullets: [
        '@Mary Lou Smith — UTI / delirium (NEW)',
        '@Mary Lou Smith — tachycardia (MONITORING)',
        '@Beatrice Holloway — atypical chest pain (NEW)',
        '@Eduardo Reyes — poor PO intake (NEW)',
        '@Eduardo Reyes — weight loss (WATCHING)',
        '@Hiroshi Tanaka — elevated blood glucose (TRENDING)',
        '@Walter Jefferson — falls risk (MONITORING)',
      ],
      footer: '3 of these are trending worse since yesterday. Want me to group by acuity?',
    },
  },
  {
    id: 'p3',
    label: 'Which residents are worsening fastest?',
    icon: 'trending-down',
    response: {
      text: 'Three residents show the steepest deterioration trajectory in the last 12 hours.',
      bullets: [
        '@Mary Lou Smith — cognition + intake declining since 1:00 AM',
        '@Beatrice Holloway — chest pain at rest, SpO2 trending down',
        '@Eduardo Reyes — BP softening on new med, intake declining',
      ],
      footer: 'Mary Lou is the most time-sensitive. Beatrice should be reassessed within the hour.',
    },
  },
  {
    id: 'p4',
    label: 'Has nursing reassessed Mary Lou yet?',
    icon: 'check-circle',
    response: {
      text: 'Yes. Sarah Jenkins, RN completed a focused reassessment at 7:18 AM.',
      bullets: [
        'A&O × 1 (down from baseline × 3)',
        'lung sounds clear',
        'temp 100.4°, HR 104, BP 96/58',
        'UA collected, awaiting results',
      ],
      footer: 'No change in trajectory since reassessment. Provider escalation is the recommended next step.',
    },
  },
  {
    id: 'p5',
    label: 'Who is highest hospitalization risk today?',
    icon: 'activity',
    response: {
      text: 'Hospitalization risk ranking based on current trajectory and vitals:',
      bullets: [
        '1. @Mary Lou Smith — sepsis risk if UTI confirmed',
        '2. @Beatrice Holloway — cardiac event cannot be ruled out',
        '3. @Eduardo Reyes — dehydration + medication-related hypotension',
      ],
      footer: 'Mary Lou and Beatrice both meet criteria for provider notification right now.',
    },
  },
  {
    id: 'p6',
    label: 'Which residents had abnormal overnight events?',
    icon: 'moon',
    response: {
      text: 'Overnight (11p–7a) abnormal events:',
      bullets: [
        '@Mary Lou — confusion ↑, temp 100.4°, BP 96/58',
        '@Walter Jefferson — unwitnessed fall, no injury',
        '@Beatrice Holloway — 1 episode chest discomfort 4:12 AM',
        '@Hiroshi Tanaka — fasting BG 185 (baseline 110)',
      ],
      footer: 'No code events. Census stable at 42.',
    },
  },
  {
    id: 'p7',
    label: 'Show active surveillance residents',
    icon: 'eye',
    response: {
      text: '5 residents are under active surveillance this shift.',
      bullets: [
        '@Mary Lou Smith — q2h vitals, neuro checks',
        '@Beatrice Holloway — continuous SpO2, vitals q4h',
        '@Walter Jefferson — post-fall neuro checks q15min × 2h (complete)',
        '@Eduardo Reyes — strict I&O, weights AM',
        '@Hiroshi Tanaka — BG ac/hs, sliding scale active',
      ],
    },
  },
  {
    id: 'p8',
    label: 'What deterioration patterns are emerging?',
    icon: 'git-branch',
    response: {
      text: 'Two emerging unit-level patterns I am watching:',
      bullets: [
        'Hydration-related decline clustered in East Hall (3 residents)',
        'Post-medication-change events in West Hall (Eduardo, 1 other on watch)',
      ],
      footer: 'Recommend reviewing East Hall fluid intake protocols at next huddle.',
    },
  },
];

export default function AIScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<AIMsg[]>(seed);
  const [usedPrompts, setUsedPrompts] = useState<string[]>([]);
  const listRef = useRef<FlatList<AIMsg>>(null);

  const send = (text: string, tailored?: { text: string; bullets?: string[]; footer?: string }) => {
    const userMsg: AIMsg = { id: `u-${Date.now()}`, kind: 'text', from: 'me', text };
    const reply: AIMsg = {
      id: `s-${Date.now()}`,
      kind: 'text',
      from: 'sage',
      text: tailored?.text ?? 'Noted. Pulling that up now.',
      bullets: tailored?.bullets,
      footer: tailored?.footer,
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
      {/* Header */}
      <View style={{
        paddingHorizontal: 20,
        paddingTop: insets.top + (Platform.OS === 'web' ? 60 : 16),
        paddingBottom: 14,
        backgroundColor: c.card,
        borderBottomWidth: 1, borderBottomColor: c.divider,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <View style={{
          width: 38, height: 38, borderRadius: 19,
          backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center',
        }}>
          <Feather name="zap" size={18} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.foreground, fontSize: 17, fontFamily: 'Inter_700Bold' }}>Sage</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.success }} />
            <Text style={{ color: c.mutedForeground, fontSize: 11, fontFamily: 'Inter_500Medium' }}>
              Continuously monitoring 12 residents
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          if (item.kind === 'briefing') return <BriefingCard />;
          return <ChatBubble msg={item} />;
        }}
      />

      {/* Suggested prompts */}
      {remainingPrompts.length > 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={{
            borderTopWidth: 1, borderTopColor: c.divider,
            backgroundColor: c.card,
            paddingTop: 12, paddingBottom: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 10 }}>
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
                  paddingHorizontal: 12, paddingVertical: 9,
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

/* ---------- BRIEFING CARD ---------- */

function BriefingCard() {
  const c = useColors();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={{
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1, borderColor: c.border,
      padding: 18,
      shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    }}>
      {/* Header line */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <View style={{
          width: 22, height: 22, borderRadius: 11,
          backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center',
        }}>
          <Feather name="zap" size={11} color="#FFFFFF" />
        </View>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.8, color: c.mutedForeground }}>
          MORNING BRIEFING
        </Text>
      </View>

      <Text style={{
        fontFamily: 'Inter_700Bold', fontSize: 20, lineHeight: 26, color: c.foreground, marginBottom: 14,
      }}>
        {greeting}, Jamie.
      </Text>

      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, color: c.foreground }}>
        I'm actively monitoring <Text style={{ fontFamily: 'Inter_700Bold' }}>12 residents</Text> across East and West Hall.
      </Text>

      {/* Attention callout */}
      <View style={{
        marginTop: 16,
        backgroundColor: c.muted,
        borderRadius: 12,
        padding: 14,
        borderLeftWidth: 3, borderLeftColor: c.warning,
      }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.8, color: c.warning, marginBottom: 8 }}>
          ELEVATED ATTENTION · 2 RESIDENTS
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: c.foreground }}>
          Highest concern: <Text style={{ fontFamily: 'Inter_700Bold' }}>Mary Lou Smith</Text> — worsening confusion, poor intake, and increased transfer difficulty overnight.
        </Text>

        <View style={{ marginTop: 12, gap: 6 }}>
          {['dehydration progression', 'delirium worsening', 'fall vulnerability'].map(risk => (
            <View key={risk} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c.warning }} />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: c.foreground }}>{risk}</Text>
            </View>
          ))}
        </View>

        <View style={{
          marginTop: 14, paddingTop: 12,
          borderTopWidth: 1, borderTopColor: c.border,
          flexDirection: 'row', alignItems: 'center', gap: 6,
        }}>
          <Feather name="phone-call" size={12} color={c.mutedForeground} />
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: c.mutedForeground }}>
            Provider has not yet been contacted.
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ---------- CHAT BUBBLE ---------- */

function ChatBubble({ msg }: { msg: Extract<AIMsg, { kind: 'text' }> }) {
  const c = useColors();
  const isMe = msg.from === 'me';
  const hasStructure = !!(msg.bullets?.length || msg.footer);

  if (isMe) {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <View style={{
          maxWidth: '82%',
          backgroundColor: c.primary,
          borderRadius: 16,
          borderBottomRightRadius: 4,
          paddingHorizontal: 14, paddingVertical: 10,
        }}>
          <MessageBody text={msg.text} color="#FFFFFF" mentionColor="#FFFFFF" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
      <View style={{
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center',
        marginBottom: 2,
      }}>
        <Feather name="zap" size={12} color="#FFFFFF" />
      </View>
      <View style={{
        flex: 1, maxWidth: '88%',
        backgroundColor: c.card,
        borderWidth: 1, borderColor: c.border,
        borderRadius: 16, borderBottomLeftRadius: 4,
        paddingHorizontal: 14, paddingVertical: 12,
      }}>
        <MessageBody text={msg.text} color={c.foreground} mentionColor={c.brand} />
        {msg.bullets && msg.bullets.length > 0 && (
          <View style={{ marginTop: 10, gap: 6 }}>
            {msg.bullets.map((b, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c.brand, marginTop: 8 }} />
                <View style={{ flex: 1 }}>
                  <MessageBody text={b} color={c.foreground} mentionColor={c.brand} />
                </View>
              </View>
            ))}
          </View>
        )}
        {msg.footer && (
          <View style={{ marginTop: hasStructure ? 12 : 0, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.divider }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: c.mutedForeground }}>
              {msg.footer}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
