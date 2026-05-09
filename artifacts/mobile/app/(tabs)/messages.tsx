import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, LayoutAnimation, UIManager } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Avatar } from '@/components/Avatar';
import { threads, users, getUser, Thread, User } from '@/data/messages';
import { MessageBody } from '@/components/MentionInput';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Tab = 'threads' | 'new';

export default function MessagesScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('threads');

  const switchTab = (next: Tab) => {
    if (Platform.OS !== 'web') LayoutAnimation.configureNext(LayoutAnimation.create(180, 'easeInEaseOut', 'opacity'));
    setTab(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{
        paddingHorizontal: 24,
        paddingTop: insets.top + (Platform.OS === 'web' ? 60 : 16),
        paddingBottom: 12,
        backgroundColor: c.card,
        borderBottomWidth: 1, borderBottomColor: c.divider,
      }}>
        <Text style={{ color: c.foreground, fontSize: 24, fontFamily: 'Inter_700Bold' }}>Messages</Text>

        <View style={{ flexDirection: 'row', marginTop: 16, gap: 4 }}>
          {(['threads', 'new'] as Tab[]).map(t => {
            const active = t === tab;
            const label = t === 'threads' ? 'Threads' : 'New';
            return (
              <TouchableOpacity
                key={t}
                onPress={() => switchTab(t)}
                activeOpacity={0.7}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 10,
                  borderBottomWidth: 2, borderBottomColor: active ? c.brand : 'transparent',
                }}
              >
                <Text style={{
                  fontFamily: active ? 'Inter_700Bold' : 'Inter_500Medium',
                  fontSize: 14,
                  color: active ? c.foreground : c.mutedForeground,
                }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Animated.View key={tab} entering={FadeIn.duration(180)} style={{ flex: 1 }}>
        {tab === 'threads' ? <ThreadsList /> : <NewList />}
      </Animated.View>
    </View>
  );
}

function ThreadsList() {
  const c = useColors();
  const router = useRouter();

  const renderItem = ({ item }: { item: Thread }) => {
    const isHuddle = item.kind === 'huddle';
    const memberAvatars = isHuddle
      ? item.members.slice(0, 3).map(id => getUser(id)?.image).filter(Boolean)
      : [];

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => router.push(`/thread/${item.id}`)}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          paddingHorizontal: 16, paddingVertical: 14,
          backgroundColor: c.card,
          borderBottomWidth: 1, borderBottomColor: c.divider,
        }}
      >
        {isHuddle ? (
          <View style={{ width: 48, height: 48, position: 'relative' }}>
            <View style={{
              width: 32, height: 32, borderRadius: 16, position: 'absolute', top: 0, left: 0,
              backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center',
              borderWidth: 2, borderColor: c.card,
            }}>
              <Feather name="users" size={14} color="#FFFFFF" />
            </View>
            {memberAvatars[0] && (
              <View style={{ position: 'absolute', bottom: 0, right: 0, borderRadius: 16, borderWidth: 2, borderColor: c.card }}>
                <Avatar source={memberAvatars[0]!} size={28} />
              </View>
            )}
          </View>
        ) : (
          <Avatar source={item.image!} size={48} />
        )}

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {isHuddle && (
              <View style={{
                paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
                backgroundColor: c.brandLight,
              }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 9, color: c.brandText, letterSpacing: 0.4 }}>
                  HUDDLE
                </Text>
              </View>
            )}
            <Text style={{ flex: 1, fontFamily: 'Inter_700Bold', fontSize: 15, color: c.foreground }} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.placeholder }}>
              {item.lastTs}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <MessageBody text={item.lastMessage} color={c.mutedForeground} mentionColor={c.brand} />
            </View>
            {item.unread > 0 && (
              <View style={{
                minWidth: 20, height: 20, borderRadius: 10,
                paddingHorizontal: 6,
                backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 11 }}>
                  {item.unread}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={threads}
      keyExtractor={t => t.id}
      renderItem={renderItem}
    />
  );
}

function NewList() {
  const c = useColors();
  const router = useRouter();

  const sorted = users.slice().sort((a, b) => {
    const order = { online: 0, away: 1, offline: 2 };
    return order[a.presence] - order[b.presence];
  });

  const renderItem = ({ item }: { item: User }) => {
    const presenceLabel =
      item.presence === 'online' ? 'Online' :
      item.presence === 'away' ? `Away · ${item.lastSeen ?? ''}` :
      `Offline · ${item.lastSeen ?? ''}`;

    return (
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: c.card,
        borderBottomWidth: 1, borderBottomColor: c.divider,
      }}>
        <Avatar source={item.image} size={44} presence={item.presence} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: c.foreground }} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.mutedForeground, marginTop: 2 }} numberOfLines={1}>
            {item.role} · {presenceLabel}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <ActionButton icon="message-circle" onPress={() => router.push(`/thread/dm-${item.id}`)} color={c.brand} bg={c.brandLight} />
          <ActionButton icon="phone" onPress={() => {}} color={c.success} bg={c.mintTint} />
          <ActionButton icon="video" onPress={() => {}} color={c.info} bg={c.lavenderTint} />
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={sorted}
      keyExtractor={u => u.id}
      ListHeaderComponent={
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88, color: c.mutedForeground }}>
            START A NEW CONVERSATION
          </Text>
        </View>
      }
      renderItem={renderItem}
    />
  );
}

function ActionButton({ icon, onPress, color, bg }: { icon: keyof typeof Feather.glyphMap; onPress: () => void; color: string; bg: string }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: bg, alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Feather name={icon} size={16} color={color} />
    </TouchableOpacity>
  );
}
