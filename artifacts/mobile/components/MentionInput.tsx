import React, { useMemo, useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { residents } from '@/data/residents';

interface MentionInputProps {
  value: string;
  onChange: (text: string) => void;
  onSend: (text: string) => void;
  onMic?: () => void;
  placeholder?: string;
}

export function MentionInput({ value, onChange, onSend, onMic, placeholder }: MentionInputProps) {
  const c = useColors();
  const inputRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const mentionQuery = useMemo(() => {
    const before = value.slice(0, selection.start);
    // Allow @ + letters and an optional single space + more letters (e.g. "@Mary L")
    const m = before.match(/@([A-Za-z][A-Za-z\-']*(?:\s[A-Za-z\-']*)?)$/);
    return m ? m[1].toLowerCase() : null;
  }, [value, selection]);

  const suggestions = useMemo(() => {
    if (mentionQuery === null) return [];
    return residents
      .filter(r => r.name.toLowerCase().includes(mentionQuery))
      .slice(0, 5);
  }, [mentionQuery]);

  const insertMention = useCallback((name: string) => {
    const before = value.slice(0, selection.start);
    const after = value.slice(selection.start);
    const newBefore = before.replace(
      /@([A-Za-z][A-Za-z\-']*(?:\s[A-Za-z\-']*)?)$/,
      `@${name} `,
    );
    onChange(newBefore + after);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [value, selection, onChange]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
  };

  return (
    <View>
      {suggestions.length > 0 && (
        <View style={{
          backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.divider,
          maxHeight: 220,
        }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {suggestions.map(r => (
              <TouchableOpacity
                key={r.id}
                onPress={() => insertMention(r.name)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingHorizontal: 16, paddingVertical: 10,
                  borderBottomWidth: 1, borderBottomColor: c.divider,
                }}
              >
                <Image source={r.image} style={{ width: 32, height: 32, borderRadius: 16 }} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: c.foreground }}>
                    {r.name}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.mutedForeground }}>
                    Room {r.room} · {r.acuity}
                  </Text>
                </View>
                <Feather name="at-sign" size={14} color={c.brand} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{
        flexDirection: 'row', alignItems: 'flex-end', gap: 8,
        paddingHorizontal: 16, paddingVertical: 10,
        backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.divider,
      }}>
        <View style={{
          flex: 1, backgroundColor: c.muted, borderRadius: 20,
          paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 10 : 6,
          minHeight: 40, justifyContent: 'center',
        }}>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChange}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            placeholder={placeholder || 'Message... type @ to tag a resident'}
            placeholderTextColor={c.placeholder}
            multiline
            style={{
              fontFamily: 'Inter_400Regular', fontSize: 14, color: c.foreground,
              maxHeight: 120, paddingTop: 0, paddingBottom: 0,
              ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
            }}
          />
        </View>
        <TouchableOpacity
          onPress={onMic ?? (() => {})}
          activeOpacity={0.7}
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: c.muted,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Feather name="mic" size={16} color={c.brand} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSend}
          activeOpacity={0.8}
          disabled={!value.trim()}
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: value.trim() ? c.primary : c.borderStrong,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Feather name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* Render a message body with @mentions highlighted. Resident mentions are tappable. */
export function MessageBody({ text, color, mentionColor }: { text: string; color: string; mentionColor: string }) {
  const router = useRouter();
  // Match @ followed by 1-4 capitalized words (allowing apostrophes, hyphens). Stops at lowercase or punctuation.
  const parts = text.split(/(@[A-Z][A-Za-z\-']*(?:\s[A-Z][A-Za-z\-']*){0,3})/g);
  return (
    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, color }}>
      {parts.map((p, i) => {
        if (!p.startsWith('@')) return <Text key={i}>{p}</Text>;
        const mention = p.slice(1).trim().toLowerCase();
        // Resolve by exact match first, then by prefix (e.g. "@Mary Lou" → "Mary Lou Smith"), then by first-name.
        const match =
          residents.find(r => r.name.toLowerCase() === mention) ||
          residents.find(r => r.name.toLowerCase().startsWith(mention + ' ')) ||
          residents.find(r => r.name.toLowerCase().split(' ')[0] === mention);
        if (match) {
          return (
            <Text
              key={i}
              onPress={(e: any) => { e?.stopPropagation?.(); router.push(`/resident/${match.id}`); }}
              style={{ color: mentionColor, fontFamily: 'Inter_600SemiBold', textDecorationLine: 'underline' }}
            >
              @{match.name}
            </Text>
          );
        }
        return <Text key={i} style={{ color: mentionColor, fontFamily: 'Inter_600SemiBold' }}>{p}</Text>;
      })}
    </Text>
  );
}
