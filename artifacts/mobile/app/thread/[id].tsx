import React, { useState, useRef, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
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
      </View>

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
        placeholder="Message... type @ to tag a resident"
      />
    </KeyboardAvoidingView>
  );
}
