import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Tabs, useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { SageHeader } from '@/components/SageHeader';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={[
      styles.tabBar, 
      { 
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom || 20,
        height: (Platform.OS === 'web' ? 84 : 64) + insets.bottom
      }
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const iconName = options.tabBarIconName || 'circle';
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            if (route.name === 'roster') {
              router.navigate('/');
            } else {
              navigation.navigate(route.name);
            }
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={[
              styles.iconWrapper, 
              isFocused && { borderColor: colors.border, borderWidth: 1 }
            ]}>
              <Feather 
                name={iconName} 
                size={20} 
                color={isFocused ? colors.foreground : colors.mutedForeground} 
              />
            </View>
            <Text style={[
              styles.tabLabel, 
              { color: isFocused ? colors.foreground : colors.mutedForeground }
            ]}>
              {options.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ResidentLayout() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }}>
        <SageHeader />
      </View>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Situation',
            // @ts-ignore
            tabBarIconName: 'activity',
          }}
        />
        <Tabs.Screen
          name="talk"
          options={{
            title: 'Talk',
            // @ts-ignore
            tabBarIconName: 'message-square',
          }}
        />
        <Tabs.Screen
          name="timeline"
          options={{
            title: 'Timeline',
            // @ts-ignore
            tabBarIconName: 'clock',
          }}
        />
        <Tabs.Screen
          name="handoff"
          options={{
            title: 'Handoff',
            // @ts-ignore
            tabBarIconName: 'user-plus',
          }}
        />
        <Tabs.Screen
          name="roster"
          options={{
            title: 'Roster',
            // @ts-ignore
            tabBarIconName: 'users',
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  }
});
