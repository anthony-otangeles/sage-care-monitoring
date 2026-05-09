import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Platform, KeyboardAvoidingView } from 'react-native';
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
  { id: 's1', from: 'sage', text: "Hi Jamie — I'm watching all 12 residents. Ask me anything, and use @ to focus on a specific resident." },
  { id: 's2', from: 'me', text: 'Which residents need attention right now?' },
  { id: 's3', from: 'sage', text: '3 residents are flagged: @Mary Lou (possible UTI), @Beatrice (atypical chest pain), and @Eduardo (poor PO intake + weight loss). Would you like a deeper look at any of them?' },
];

export default function AIScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<AIMsg[]>(seed);
  const listRef = useRef<FlatList<AIMsg>>(null);

  const send = (text: string) => {
    const userMsg: AIMsg = { id: `u-${Date.now()}`, from: 'me', text };
    const reply: AIMsg = {
      id: `s-${Date.now()}`,
      from: 'sage',
      text: 'Got it — pulling that up now.',
    };
    setMessages(prev => [...prev, userMsg, reply]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

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
