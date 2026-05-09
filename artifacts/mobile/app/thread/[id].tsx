import React, { useState, useRef, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, KeyboardAvoidingView, Modal, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Avatar } from '@/components/Avatar';
import { MentionInput, MessageBody } from '@/components/MentionInput';
import { getThread, getUser, ThreadMessage, currentUser, users } from '@/data/messages';

export default function ThreadScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const baseThread = useMemo(() => {
    if (id?.startsWith('dm-')) {
      const userId = id.slice(3);
      const user = users.find(u => u.id === userId);
      if (!user) return undefined;
      return {
        id,
        kind: 'dm' as const,
        title: user.name,
        members: ['me', user.id],
        image: user.image,
        lastMessage: '',
        lastTs: 'now',
        unread: 0,
        messages: [] as ThreadMessage[],
      };
    }
    return getThread(id!);
  }, [id]);

  const [messages, setMessages] = useState<ThreadMessage[]>(baseThread?.messages ?? []);
  const [draft, setDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheet, setSheet] = useState<null | 'summary' | 'transcription' | 'insight'>(null);
  const listRef = useRef<FlatList<ThreadMessage>>(null);

  if (!baseThread) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: c.foreground, fontFamily: 'Inter_500Medium' }}>Thread not found</Text>
      </View>
    );
  }

  const isHuddle = baseThread.kind === 'huddle';

  const send = (text: string) => {
    const msg: ThreadMessage = {
      id: `m-${Date.now()}`,
      authorId: 'me',
      text,
      ts: 'now',
    };
    setMessages(prev => [...prev, msg]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {/* Header */}
      <View style={{
        backgroundColor: c.card,
        paddingTop: insets.top + (Platform.OS === 'web' ? 60 : 8),
        paddingBottom: 12, paddingHorizontal: 8,
        borderBottomWidth: 1, borderBottomColor: c.divider,
        flexDirection: 'row', alignItems: 'center', gap: 8,
      }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="arrow-left" size={20} color={c.foreground} />
        </TouchableOpacity>

        {isHuddle ? (
          <View style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center',
          }}>
            <Feather name="users" size={16} color="#FFFFFF" />
          </View>
        ) : (
          <Avatar source={baseThread.image!} size={36} />
        )}

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: c.foreground }} numberOfLines={1}>
            {baseThread.title}
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.mutedForeground, marginTop: 1 }}>
            {isHuddle ? `Huddle · ${baseThread.members.length} members` : 'Direct message'}
          </Text>
        </View>

        <TouchableOpacity hitSlop={6} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="phone" size={18} color={c.foreground} />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={6} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="video" size={18} color={c.foreground} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuOpen(true)} hitSlop={6} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="more-vertical" size={20} color={c.foreground} />
        </TouchableOpacity>
      </View>

      <ThreadMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        hasCalls={messages.some(m => m.kind === 'voice-call' || m.kind === 'video-call')}
        onPick={(k) => { setMenuOpen(false); setTimeout(() => setSheet(k), 80); }}
      />
      <ThreadInsightSheet
        kind={sheet}
        title={baseThread.title}
        onClose={() => setSheet(null)}
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item, index }) => {
          const isMe = item.authorId === 'me';
          const author = isMe ? currentUser : getUser(item.authorId);
          const prev = index > 0 ? messages[index - 1] : undefined;
          const showAuthor = isHuddle && !isMe && prev?.authorId !== item.authorId;

          if (item.kind === 'voice-call' || item.kind === 'video-call') {
            const isVideo = item.kind === 'video-call';
            return (
              <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 4 }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  paddingHorizontal: 12, paddingVertical: 8,
                  backgroundColor: c.muted, borderRadius: 999,
                  borderWidth: 1, borderColor: c.border,
                }}>
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Feather name={isVideo ? 'video' : 'phone'} size={12} color="#FFFFFF" />
                  </View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: c.foreground }}>
                    {isVideo ? 'Video call' : 'Voice call'}
                  </Text>
                  {item.duration && (
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.mutedForeground }}>
                      · {item.duration}
                    </Text>
                  )}
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.placeholder }}>
                    · {item.ts}
                  </Text>
                </View>
              </View>
            );
          }

          return (
            <View style={{ flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8 }}>
              {!isMe && (
                <View style={{ width: 28 }}>
                  {showAuthor && author && <Avatar source={author.image} size={28} />}
                </View>
              )}
              <View style={{ maxWidth: '78%' }}>
                {showAuthor && author && (
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: c.mutedForeground, marginBottom: 2, marginLeft: 6 }}>
                    {author.name}
                  </Text>
                )}
                <View style={{
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
                <Text style={{
                  fontFamily: 'Inter_400Regular', fontSize: 10, color: c.placeholder,
                  marginTop: 2, marginHorizontal: 6,
                  textAlign: isMe ? 'right' : 'left',
                }}>
                  {item.ts}
                </Text>
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
        placeholder="Message... type @ to tag a resident"
      />
    </KeyboardAvoidingView>
  );
}

function ThreadMenu({
  visible, onClose, hasCalls, onPick,
}: { visible: boolean; onClose: () => void; hasCalls: boolean; onPick: (k: 'summary' | 'transcription' | 'insight') => void }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const items: { key: 'summary' | 'transcription' | 'insight'; icon: keyof typeof Feather.glyphMap; label: string; sub: string }[] = [
    { key: 'summary', icon: 'file-text', label: 'View summary', sub: 'TL;DR of the conversation' },
    ...(hasCalls
      ? [{ key: 'transcription' as const, icon: 'mic' as const, label: 'View transcription', sub: 'Voice & video call transcript' }]
      : []),
    { key: 'insight', icon: 'zap', label: 'View insight', sub: 'AI analysis of patterns & action items' },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }}>
        <View style={{
          position: 'absolute',
          top: insets.top + (Platform.OS === 'web' ? 60 : 8) + 50,
          right: 12,
          width: 280,
          backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border,
          overflow: 'hidden',
          shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 16,
          elevation: 8,
        }}>
          {items.map((it, i) => (
            <TouchableOpacity
              key={it.key}
              onPress={() => onPick(it.key)}
              activeOpacity={0.6}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingHorizontal: 14, paddingVertical: 12,
                borderBottomWidth: i === items.length - 1 ? 0 : 1, borderBottomColor: c.divider,
              }}
            >
              <View style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: c.brandLight, alignItems: 'center', justifyContent: 'center',
              }}>
                <Feather name={it.icon} size={15} color={c.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: c.foreground }}>{it.label}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.mutedForeground, marginTop: 1 }}>
                  {it.sub}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

function ThreadInsightSheet({
  kind, title, onClose,
}: { kind: null | 'summary' | 'transcription' | 'insight'; title: string; onClose: () => void }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  if (!kind) return null;

  const data = {
    summary: {
      heading: 'Conversation Summary',
      icon: 'file-text' as const,
      body: `Sarah Jenkins flagged Mary Lou Smith as DECLINING overnight with possible UTI signs. Marcus Lee covered Walter Jefferson's post-fall checks. Vitals were captured for Mary Lou and reassessment is in progress. Dr. Cole approved IV antibiotics and will round at 10:00 AM.`,
      tags: ['UTI workup', 'Mary Lou', 'IV abx approved'],
    },
    transcription: {
      heading: 'Call Transcription',
      icon: 'mic' as const,
      body: `[8:02 AM] Dr. Cole: Morning team — let's prioritize 204B today.\n\n[8:04 AM] Sarah: On it. Mary Lou flagged DECLINING overnight, getting fresh vitals.\n\n[8:06 AM] Marcus: I'll cover Walter's post-fall checks.\n\n[8:14 AM] Sarah: All vitals captured for Mary Lou. Starting reassessment now.`,
      tags: ['Duration 4:32', '4 speakers'],
    },
    insight: {
      heading: 'AI Insight',
      icon: 'zap' as const,
      body: `Two declining residents discussed without a clear delegate for follow-up. Mary Lou's UTI workup is on track, but Walter's post-fall checks have no documented completion timestamp. Recommend assigning a reassessment owner with a 2-hour follow-up window.`,
      tags: ['2 action items', '1 risk flagged'],
    },
  }[kind];

  return (
    <Modal transparent visible={!!kind} animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <Pressable onPress={(e) => e.stopPropagation()} style={{
          backgroundColor: c.card,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 16,
          maxHeight: '80%',
        }}>
          <View style={{ alignItems: 'center', paddingBottom: 8 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.borderStrong }} />
          </View>
          <View style={{ paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center',
            }}>
              <Feather name={data.icon} size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: c.foreground }}>{data.heading}</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.mutedForeground, marginTop: 2 }} numberOfLines={1}>
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Feather name="x" size={20} color={c.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={{ height: 1, backgroundColor: c.divider }} />
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, color: c.foreground }}>
              {data.body}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {data.tags.map((t, i) => (
                <View key={i} style={{
                  paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
                  backgroundColor: c.brandLight,
                }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: c.brandText }}>{t}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
