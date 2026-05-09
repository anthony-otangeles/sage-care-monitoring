import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface AccordionItemProps {
  question: string;
  answer: string;
  defaultExpanded?: boolean;
}

export function AccordionItem({ question, answer, defaultExpanded = false }: AccordionItemProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 180 : 0);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    rotation.value = withTiming(expanded ? 0 : 180, { duration: 300 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={toggle}
        activeOpacity={0.7}
      >
        <Text style={[styles.question, { color: colors.foreground }]}>{question}</Text>
        <Animated.View style={chevronStyle}>
          <Feather name="chevron-down" size={20} color={colors.mutedForeground} />
        </Animated.View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.content}>
          <Text style={[styles.answer, { color: colors.mutedForeground }]}>{answer}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  question: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    flex: 1,
    paddingRight: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
  }
});
