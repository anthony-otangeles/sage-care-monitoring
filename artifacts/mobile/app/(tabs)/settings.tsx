import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Avatar } from '@/components/Avatar';
import { PillToggle } from '@/components/PillToggle';
import { currentUser } from '@/data/messages';

export default function SettingsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [twoFA, setTwoFA] = React.useState(false);
  const [pushOn, setPushOn] = React.useState(true);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      window.confirm('Sign out of SAGE?');
      return;
    }
    Alert.alert('Sign out', 'Sign out of SAGE?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive' },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{
        paddingHorizontal: 24,
        paddingTop: insets.top + (Platform.OS === 'web' ? 60 : 16),
        paddingBottom: 16,
        backgroundColor: c.card,
        borderBottomWidth: 1, borderBottomColor: c.divider,
      }}>
        <Text style={{ color: c.foreground, fontSize: 24, fontFamily: 'Inter_700Bold' }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 24 }}>
        {/* Profile */}
        <View style={{
          backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border,
          padding: 20, alignItems: 'center', gap: 12,
        }}>
          <Avatar source={currentUser.image} size={80} presence={currentUser.presence} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: c.foreground }}>
              {currentUser.name}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: c.mutedForeground, marginTop: 4 }}>
              {currentUser.role} · 2 East
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6,
              borderWidth: 1, borderColor: c.border, marginTop: 4,
              flexDirection: 'row', alignItems: 'center', gap: 6,
            }}
          >
            <Feather name="edit-2" size={12} color={c.foreground} />
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: c.foreground }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Section title="ACCOUNT">
          <Row icon="lock" label="Change Password" onPress={() => {}} />
          <Row
            icon="shield"
            label="Two-Factor Authentication"
            subtitle={twoFA ? 'Enabled · Authenticator app' : 'Add an extra layer of security'}
            right={<PillToggle value={twoFA} onValueChange={setTwoFA} />}
          />
          <Row icon="user" label="Personal Info" onPress={() => {}} />
          <Row icon="briefcase" label="License & Credentials" onPress={() => {}} isLast />
        </Section>

        <Section title="PREFERENCES">
          <Row
            icon="bell"
            label="Push Notifications"
            right={<PillToggle value={pushOn} onValueChange={setPushOn} />}
          />
          <Row icon="moon" label="Appearance" subtitle="System" onPress={() => {}} />
          <Row icon="globe" label="Language" subtitle="English (US)" onPress={() => {}} isLast />
        </Section>

        <Section title="SUPPORT">
          <Row icon="help-circle" label="Help Center" onPress={() => {}} />
          <Row icon="file-text" label="Terms & Privacy" onPress={() => {}} isLast />
        </Section>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            paddingVertical: 14, borderRadius: 8,
            backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
          }}
        >
          <Feather name="log-out" size={16} color={c.error} />
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: c.error }}>
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 11, color: c.placeholder }}>
          SAGE · v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View>
      <Text style={{
        fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.88,
        color: c.mutedForeground, marginBottom: 8, paddingHorizontal: 4,
      }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border,
        overflow: 'hidden',
      }}>
        {children}
      </View>
    </View>
  );
}

function Row({
  icon, label, subtitle, right, onPress, isLast,
}: {
  icon: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}) {
  const c = useColors();
  const Touchable: any = onPress ? TouchableOpacity : View;

  return (
    <Touchable
      activeOpacity={0.6}
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1, borderBottomColor: c.divider,
      }}
    >
      <View style={{
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: c.brandLight, alignItems: 'center', justifyContent: 'center',
      }}>
        <Feather name={icon} size={15} color={c.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: c.foreground }}>{label}</Text>
        {subtitle && (
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: c.mutedForeground, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right ?? (onPress && <Feather name="chevron-right" size={18} color={c.placeholder} />)}
    </Touchable>
  );
}
