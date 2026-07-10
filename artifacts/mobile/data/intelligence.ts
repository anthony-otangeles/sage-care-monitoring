import type { Resident } from "./residents";

export type IntelligenceSource = "Otangeles Notes+" | "Staff input" | "Provider input";
export type IntelligenceSeverity = "normal" | "watch" | "high" | "critical";
export type IntelligenceUrgency = "urgent" | "high" | "routine";

export interface ResidentSourceEvent {
  id: string;
  residentId: string;
  source: IntelligenceSource;
  type: "vital" | "lab" | "medication" | "order" | "observation" | "incident" | "diagnosis";
  label: string;
  detail: string;
  capturedAt: string;
  severity: IntelligenceSeverity;
}

export interface ResidentDailyInput {
  id: string;
  residentId: string;
  source: Exclude<IntelligenceSource, "Otangeles Notes+">;
  label: string;
  detail: string;
  capturedAt: string;
  severity: IntelligenceSeverity;
}

export interface ResidentIntelligenceOpportunity {
  id: string;
  residentId: string;
  facility: string;
  category: string;
  reason: string;
  changes: string[];
  surfaced: string;
  urgency: IntelligenceUrgency;
  confidence: number;
  recommendedAction: string;
  evidence: ResidentSourceEvent[];
}

interface ResidentIntelligenceInput {
  residents: Resident[];
  facilityForResident: (resident: Resident) => string;
  dailyInputs?: ResidentDailyInput[];
}

export const mockNotesPlusEvents: ResidentSourceEvent[] = [
  {
    id: "notes-ml-temp",
    residentId: "1",
    source: "Otangeles Notes+",
    type: "vital",
    label: "Temperature",
    detail: "100.4 F, up from baseline 98.6 F",
    capturedAt: "Today 04:00",
    severity: "critical",
  },
  {
    id: "notes-ml-hr",
    residentId: "1",
    source: "Otangeles Notes+",
    type: "vital",
    label: "Heart rate",
    detail: "104 bpm, above baseline 88",
    capturedAt: "Today 04:00",
    severity: "high",
  },
  {
    id: "notes-ml-intake",
    residentId: "1",
    source: "Otangeles Notes+",
    type: "observation",
    label: "Meal intake",
    detail: "Breakfast intake documented at 30%",
    capturedAt: "Today 08:15",
    severity: "high",
  },
  {
    id: "notes-ml-ua",
    residentId: "1",
    source: "Otangeles Notes+",
    type: "order",
    label: "UA status",
    detail: "UA/culture not collected yet",
    capturedAt: "Today 08:30",
    severity: "watch",
  },
  {
    id: "notes-wj-fall",
    residentId: "2",
    source: "Otangeles Notes+",
    type: "incident",
    label: "Witnessed fall",
    detail: "Wheelchair transfer fall documented yesterday evening",
    capturedAt: "Yesterday 18:00",
    severity: "high",
  },
  {
    id: "notes-wj-pain",
    residentId: "2",
    source: "Otangeles Notes+",
    type: "observation",
    label: "Hip pain",
    detail: "Left hip pain 4/10 during morning care",
    capturedAt: "Today 07:40",
    severity: "high",
  },
  {
    id: "notes-wj-imaging",
    residentId: "2",
    source: "Otangeles Notes+",
    type: "order",
    label: "Imaging status",
    detail: "Hip x-ray ordered, result pending",
    capturedAt: "Today 08:10",
    severity: "watch",
  },
  {
    id: "notes-ev-abx",
    residentId: "3",
    source: "Otangeles Notes+",
    type: "medication",
    label: "Antibiotic course",
    detail: "Levofloxacin course completed after pneumonia",
    capturedAt: "Yesterday 21:00",
    severity: "watch",
  },
  {
    id: "notes-ev-o2",
    residentId: "3",
    source: "Otangeles Notes+",
    type: "vital",
    label: "SpO2",
    detail: "96% on room air with clear lung sounds",
    capturedAt: "Today 08:00",
    severity: "normal",
  },
  {
    id: "notes-ht-bg-1",
    residentId: "4",
    source: "Otangeles Notes+",
    type: "lab",
    label: "Fasting blood glucose",
    detail: "185 this morning; third consecutive AM above goal",
    capturedAt: "Today 06:30",
    severity: "high",
  },
  {
    id: "notes-ht-diet",
    residentId: "4",
    source: "Otangeles Notes+",
    type: "observation",
    label: "Diet variance",
    detail: "Family-provided cookies documented after dinner",
    capturedAt: "Yesterday 18:45",
    severity: "watch",
  },
];

function residentEvents(residentId: string, dailyInputs: ResidentDailyInput[]) {
  return [
    ...mockNotesPlusEvents.filter((event) => event.residentId === residentId),
    ...dailyInputs.filter((input) => input.residentId === residentId).map((input): ResidentSourceEvent => ({
      ...input,
      type: "observation",
    })),
  ];
}

function hasEvent(events: ResidentSourceEvent[], matcher: (event: ResidentSourceEvent) => boolean) {
  return events.some(matcher);
}

function evidenceFor(events: ResidentSourceEvent[], ids: string[]) {
  return ids
    .map((id) => events.find((event) => event.id === id))
    .filter((event): event is ResidentSourceEvent => Boolean(event));
}

export function buildResidentIntelligence({
  residents,
  facilityForResident,
  dailyInputs = [],
}: ResidentIntelligenceInput): ResidentIntelligenceOpportunity[] {
  const opportunities: ResidentIntelligenceOpportunity[] = [];

  residents.forEach((resident) => {
    const events = residentEvents(resident.id, dailyInputs);
    const facility = facilityForResident(resident);

    if (
      hasEvent(events, (event) => event.id === "notes-ml-temp") &&
      hasEvent(events, (event) => event.id === "notes-ml-intake")
    ) {
      opportunities.push({
        id: `intel-${resident.id}-infection-risk`,
        residentId: resident.id,
        facility,
        category: "Predicted acute change",
        reason: "Infection or delirium risk is rising from vital changes, poor intake, and unresolved UA collection.",
        changes: [
          "temperature and heart rate above baseline",
          "breakfast intake dropped to 30%",
          "UA/culture still unresolved",
        ],
        surfaced: "Now",
        urgency: "urgent",
        confidence: 92,
        recommendedAction: "Provider should review today, order/confirm UA with culture, and set hydration and mental-status follow-up.",
        evidence: evidenceFor(events, ["notes-ml-temp", "notes-ml-hr", "notes-ml-intake", "notes-ml-ua"]),
      });
    }

    if (
      hasEvent(events, (event) => event.id === "notes-wj-fall") &&
      hasEvent(events, (event) => event.id === "notes-wj-pain")
    ) {
      opportunities.push({
        id: `intel-${resident.id}-post-fall`,
        residentId: resident.id,
        facility,
        category: "Post-fall risk",
        reason: "Fall with persistent hip pain and pending imaging needs provider review before mobility is advanced.",
        changes: ["fall documented yesterday", "left hip pain continues", "x-ray result still pending"],
        surfaced: "Now",
        urgency: "high",
        confidence: 86,
        recommendedAction: "Keep fall precautions active, review imaging, and update nursing mobility instructions.",
        evidence: evidenceFor(events, ["notes-wj-fall", "notes-wj-pain", "notes-wj-imaging"]),
      });
    }

    if (
      hasEvent(events, (event) => event.id === "notes-ht-bg-1") &&
      hasEvent(events, (event) => event.id === "notes-ht-diet")
    ) {
      opportunities.push({
        id: `intel-${resident.id}-glycemic-trend`,
        residentId: resident.id,
        facility,
        category: "Trend follow-up",
        reason: "Glucose trend is above goal and appears linked to recent diet variance.",
        changes: ["third elevated fasting BG", "family food intake documented", "teaching may prevent escalation"],
        surfaced: "Now",
        urgency: "routine",
        confidence: 78,
        recommendedAction: "Request diet teaching, monitor fasting BG trend, and consider provider review if values continue above goal.",
        evidence: evidenceFor(events, ["notes-ht-bg-1", "notes-ht-diet"]),
      });
    }

    if (
      hasEvent(events, (event) => event.id === "notes-ev-abx") &&
      hasEvent(events, (event) => event.id === "notes-ev-o2")
    ) {
      opportunities.push({
        id: `intel-${resident.id}-post-antibiotic`,
        residentId: resident.id,
        facility,
        category: "Predicted follow-up",
        reason: "Antibiotic course is complete and respiratory status is stable, so a 72-hour rebound check should be scheduled.",
        changes: ["antibiotics completed", "SpO2 stable on room air", "72-hour reassessment due"],
        surfaced: "Now",
        urgency: "routine",
        confidence: 74,
        recommendedAction: "Schedule a post-antibiotic respiratory reassessment and document rebound symptom check.",
        evidence: evidenceFor(events, ["notes-ev-abx", "notes-ev-o2"]),
      });
    }

    const flaggedDailyInputs = events.filter(
      (event) => event.source !== "Otangeles Notes+" && (event.severity === "high" || event.severity === "critical"),
    );
    if (flaggedDailyInputs.length) {
      const latest = flaggedDailyInputs[0];
      opportunities.push({
        id: `intel-${resident.id}-staff-concern`,
        residentId: resident.id,
        facility,
        category: "Staff concern",
        reason: "Daily care-team input added a concern that should be reconciled with the care plan.",
        changes: [latest.label, latest.detail, `${latest.source} · ${latest.capturedAt}`],
        surfaced: "Now",
        urgency: latest.severity === "critical" ? "urgent" : "high",
        confidence: 82,
        recommendedAction: "Review the staff concern, message the care team if needed, and update the resident plan.",
        evidence: [latest],
      });
    }

    if (!opportunities.some((opportunity) => opportunity.residentId === resident.id)) {
      const abnormalVital = resident.situation.vitals.find((vital) => vital.isAbnormal);
      if (abnormalVital && resident.acuity !== "STABLE") {
        opportunities.push({
          id: `intel-${resident.id}-watch`,
          residentId: resident.id,
          facility,
          category: "Watch list",
          reason: `${resident.name} has an abnormal ${abnormalVital.label.toLowerCase()} and should remain on surveillance.`,
          changes: [`${abnormalVital.label}: ${abnormalVital.current}`, resident.latest],
          surfaced: "Now",
          urgency: resident.acuity === "WATCHFUL" ? "high" : "routine",
          confidence: 68,
          recommendedAction: "Keep surveillance active and add a follow-up if the trend worsens.",
          evidence: [
            {
              id: `resident-${resident.id}-${abnormalVital.label}`,
              residentId: resident.id,
              source: "Otangeles Notes+",
              type: "vital",
              label: abnormalVital.label,
              detail: `${abnormalVital.current} vs baseline ${abnormalVital.base}`,
              capturedAt: "Current chart",
              severity: abnormalVital.isCritical ? "critical" : "watch",
            },
          ],
        });
      }
    }

  });

  const urgencyRank: Record<IntelligenceUrgency, number> = { urgent: 0, high: 1, routine: 2 };
  return opportunities.sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency] || b.confidence - a.confidence);
}
