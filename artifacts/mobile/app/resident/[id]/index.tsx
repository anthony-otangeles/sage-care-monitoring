import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { getResident } from '@/data/residents';
import { ResidentHero } from '@/components/ResidentHero';
import { AcuityPill } from '@/components/AcuityPill';
import { SectionLabel } from '@/components/SectionLabel';
import { ConcernCard } from '@/components/ConcernCard';
import { VitalRow } from '@/components/VitalRow';
import { AccordionItem } from '@/components/AccordionItem';
import { DelegateButton } from '@/components/DelegateButton';
import { StatusVariant } from '@/components/StatusChip';

export default function SituationScreen() {
  const { id } = useLocalSearchParams();
  const resident = getResident(id as string);
  const colors = useColors();

  if (!resident) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Resident not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ResidentHero 
        name={resident.name}
        age={resident.age}
        sex={resident.sex}
        room={resident.room}
        statusChips={resident.statusChips}
        acuity={resident.acuity as StatusVariant}
        image={resident.image}
      />
      
      <View style={styles.pillRow}>
        <AcuityPill label="ACTIVE SURVEILLANCE" active={true} />
        <AcuityPill label="REASSESSMENT PENDING" active={false} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.accentLine, { backgroundColor: colors.accent }]} />
          <Text style={[styles.summaryText, { color: colors.foreground }]}>
            {resident.situation.summary}
          </Text>
          <View style={[styles.memoryRow, { borderTopColor: colors.border }]}>
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text style={[styles.memoryText, { color: colors.mutedForeground }]}>
              <Text style={{ fontFamily: 'Inter_600SemiBold' }}>Memory: </Text>
              {resident.situation.memory}
            </Text>
          </View>
        </View>

        {resident.situation.concerns.length > 0 && (
          <View>
            <SectionLabel>UNRESOLVED CONCERNS</SectionLabel>
            {resident.situation.concerns.map((concern, i) => (
              <ConcernCard 
                key={i}
                title={concern.title}
                status={concern.status}
                color={concern.color}
              />
            ))}
          </View>
        )}

        {resident.situation.vitals.length > 0 && (
          <View>
            <SectionLabel>TRAJECTORY VS BASELINE</SectionLabel>
            <View style={[styles.vitalsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {resident.situation.vitals.map((vital, i) => (
                <React.Fragment key={i}>
                  <VitalRow 
                    label={vital.label}
                    icon={vital.icon}
                    base={vital.base}
                    current={vital.current}
                    isAbnormal={vital.isAbnormal}
                  />
                  {i < resident.situation.vitals.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {resident.situation.clarify.length > 0 && (
          <View>
            <SectionLabel>CLARIFY</SectionLabel>
            {resident.situation.clarify.map((item, i) => (
              <AccordionItem 
                key={i}
                question={item.question}
                answer={item.answer}
                defaultExpanded={i === 0}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <DelegateButton />
    </View>
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
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  summaryCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  summaryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    padding: 16,
    paddingLeft: 20,
  },
  memoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingLeft: 20,
    borderTopWidth: 1,
    gap: 8,
  },
  memoryText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  vitalsCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginLeft: 60,
  }
});
