import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { getResident } from '@/data/residents';
import { ChatBubble } from '@/components/ChatBubble';

export default function TalkScreen() {
  const { id } = useLocalSearchParams();
  const resident = getResident(id as string);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState(resident?.talk || []);
  const [inputText, setInputText] = useState('');
  const listRef = useRef<FlatList<any>>(null);

  if (!resident) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Resident not found</Text>
      </View>
    );
  }

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user' as const,
      text: inputText.trim()
    };
    
    setMessages([userMsg, ...messages]);
    setInputText('');
    
    // Simulate Sage response
    setTimeout(() => {
      const sageMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'sage' as const,
        text: "I've noted that. Is there anything else you'd like me to track or add to the handoff?"
      };
      setMessages(prev => [sageMsg, ...prev]);
    }, 1000);
  };

  const renderItem = ({ item }: { item: typeof messages[0] }) => (
    <ChatBubble sender={item.sender} text={item.text} />
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Text style={[styles.contextLabel, { color: colors.mutedForeground }]}>
          CONTEXT: {resident.name.toUpperCase()}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        inverted
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
      />

      <View style={[styles.inputContainer, { paddingBottom: 16 }]}>
        <View style={styles.suggestions}>
          <TouchableOpacity style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chipText, { color: colors.foreground }]}>Yes, draft the update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chipText, { color: colors.foreground }]}>What was her last BP?</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Ask Sage..."
            placeholderTextColor={colors.mutedForeground}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="mic" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: inputText.trim() ? colors.primary : colors.muted }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Feather name="arrow-up" size={20} color={inputText.trim() ? colors.primaryForeground : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  contextLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
  },
  listContent: {
    paddingVertical: 16,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  suggestions: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    maxHeight: 100,
    minHeight: 36,
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  }
});
