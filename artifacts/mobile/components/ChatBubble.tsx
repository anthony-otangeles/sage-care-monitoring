import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface ChatBubbleProps {
  sender: 'sage' | 'user';
  text: string;
}

export function ChatBubble({ sender, text }: ChatBubbleProps) {
  const colors = useColors();
  const isSage = sender === 'sage';

  return (
    <View style={[styles.container, isSage ? styles.sageContainer : styles.userContainer]}>
      {isSage ? (
        <View style={[styles.sageBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sageText, { color: colors.cardForeground }]}>{text}</Text>
        </View>
      ) : (
        <View style={[styles.userBubble, { backgroundColor: colors.primary }]}>
          <Text style={[styles.userText, { color: colors.primaryForeground }]}>{text}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sageContainer: {
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  sageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  userBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
    borderTopRightRadius: 4,
  },
  sageText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  }
});
