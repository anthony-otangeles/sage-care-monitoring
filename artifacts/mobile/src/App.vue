<script setup lang="ts">
import { computed, nextTick, ref, watch, type Component } from "vue";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Coffee,
  Edit3,
  Eye,
  FileText,
  GitBranch,
  Globe,
  Heart,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  MessageCircle,
  MessageSquarePlus,
  Mic,
  Moon,
  MoreVertical,
  Phone,
  Search,
  Send,
  Signature,
  Settings,
  Shield,
  Smile,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Trash2,
  Undo2,
  Upload,
  User as UserIcon,
  UserCheck,
  Users,
  Video,
  X,
  Zap,
} from "lucide-vue-next";

import colors from "../constants/colors";
import AppSelect from "./components/AppSelect.vue";
import {
  buildResidentIntelligence,
  mockNotesPlusEvents,
  type IntelligenceSource,
  type IntelligenceUrgency,
  type ResidentDailyInput,
  type ResidentSourceEvent,
} from "../data/intelligence";
import {
  residents,
  type AcuityLevel,
  type CareStep,
  type Resident,
} from "../data/residents";
import {
  currentUser as donUser,
  getUser,
  threads,
  users,
  type Thread,
  type ThreadMessage,
  type User as CareUser,
} from "../data/messages";

type RoleKey = "don" | "provider" | "cna";
type ViewName =
  | "situation"
  | "residents"
  | "ai"
  | "messages"
  | "settings"
  | "provider-home"
  | "provider-residents"
  | "provider-sage"
  | "provider-collaboration"
  | "provider-visit"
  | "provider-review"
  | "provider-profile"
  | "cna-home"
  | "cna-debrief"
  | "cna-residents"
  | "cna-messages"
  | "cna-profile";
type ResidentTab = "situation" | "talk" | "timeline" | "notes";
type ResidentContextTab = "updates" | "actions" | "orders";
type SituationAccordionKey = "facility-focus" | "requested-actions" | "facility-intelligence" | "current-watches";
type ProviderHomeAccordionKey = "review-decide" | "facility-intelligence" | "assigned-actions" | "clinical-attention";
type VisitNoteMode = "text" | "voice";
type ProviderEncounterStatus =
  | "scheduled"
  | "provider-in-progress"
  | "scribe-in-progress"
  | "needs-review"
  | "revision"
  | "submitted-to-billing";
type ProviderVisitSyncStatus = "pending" | "synced";
type EncounterSectionKind = "paragraphs" | "bullets" | "grid";
type RevisionThreadStatus = "open" | "addressed";
type SignatureMethod = "draw" | "type" | "upload";
type MessageTab = "rooms" | "people";
type ScheduleView = "list" | "calendar";
type ScheduleDraftType = "huddle" | "follow-up" | "clinical-order";
type ScheduleStaffRole = RoleKey | "staff";
type MessageStartMode = "message" | "voice-call" | "video-call";
type ThreadUtilityMode = "summary" | "insight" | "transcription";
type ActionTargetRole = "provider" | "cna";
type ActionPriority = "Stat" | "High" | "Routine";
type SelectOption = { value: string; label: string };
type NotificationTarget =
  | { type: "resident"; residentId: string }
  | { type: "encounter"; encounterId: string; residentId: string }
  | { type: "schedule"; item: ResidentScheduleItem }
  | { type: "action"; action: ActionRequest }
  | { type: "escalation"; residentId: string };
type ActionStatus = "open" | "in-progress" | "completed" | "flagged";
type ActionStatusUpdateTarget = Extract<ActionStatus, "completed" | "flagged">;
type EscalationStatus = "sent-to-hospital" | "requested-review";
type HuddleStatus = "scheduled" | "started" | "completed";
type ScheduleFollowUpStatus = "scheduled" | "completed";
type ClinicalOrderStatus = "ordered" | "in-progress" | "completed" | "flagged" | "cancelled";
type ClinicalOrderType =
  | "Lab"
  | "Imaging"
  | "Medication Change"
  | "Vitals / Monitoring"
  | "Consult / Therapy"
  | "Wound Care"
  | "Other";
type ProviderNoteSource = "typed" | "voice";
type CnaDebriefStatus = "not-started" | "recording" | "captured" | "flagged";
type Facility =
  | "Brickyard Healthcare – Elkhart Care Center"
  | "Brickyard Healthcare – Merrillville Care Center"
  | "Casa of Hobart"
  | "Niles Care Center";
type FacilitySelection = "all" | Facility;
type VisitType =
  | "30-Day Follow Up"
  | "60-Day Follow Up"
  | "Acute"
  | "Admission - Telemed"
  | "Advanced Care Planning (ACP)"
  | "Annual Wellness Visit"
  | "Chronic Pain Management"
  | "Discharge"
  | "Follow-Up"
  | "GDR (Gradual Dose Reduction) Visit"
  | "History and Physical"
  | "Lab"
  | "Others"
  | "PM&R (Physical Medicine & Rehabilitation) Up"
  | "Psychiatry"
  | "Psychiatry Follow Up"
  | "Remote Patient Monitoring (RPM) - Enrollment"
  | "Remote Patient Monitoring (RPM) - Follow-Up"
  | "Telehealth"
  | "Telehealth - Asynchronous"
  | "Telemed - Fall Assessment"
  | "Transitional Care Management"
  | "Transitional Care Management - Telemed"
  | "Wound Care";
type ProfileModalKey =
  | "profile"
  | "assignments"
  | "change-password"
  | "two-factor"
  | "sessions"
  | "credentials"
  | "preferences"
  | "workspace"
  | "feature";

interface RoleProfile {
  key: RoleKey;
  label: string;
  name: string;
  role: string;
  facility: string;
  description: string;
  image: string;
  icon: Component;
  defaultView: ViewName;
  metricLabel: string;
  metricValue: string;
}

interface NavItem {
  key: ViewName;
  label: string;
  icon: Component;
}

interface ProfileFeature {
  id: string;
  label: string;
  detail: string;
  status: string;
  icon: Component;
}

interface ProviderOpportunity {
  id: string;
  residentId: string;
  resident: Resident;
  visitType: VisitType;
  category: string;
  facility: Facility;
  reason: string;
  changes: string[];
  surfaced: string;
  urgency: IntelligenceUrgency;
  confidence: number;
  recommendedAction: string;
  evidence: ResidentSourceEvent[];
}

interface FacilityIntelligenceSummary {
  facility: Facility;
  total: number;
  urgent: number;
  high: number;
  routine: number;
  openActions: number;
  notesPlusEvents: number;
  staffInputs: number;
  providerInputs: number;
  residentsCovered: number;
  totalResidents: number;
  readinessScore: number;
  inputGaps: string[];
  sources: IntelligenceSource[];
  topOpportunity: ProviderOpportunity | null;
}

interface ResidentProfileEvidenceGroup {
  source: string;
  items: string[];
}

interface CnaAssignment {
  id: string;
  resident: Resident;
  facility: Facility;
  reminder: string;
  watchFor: string;
  care: string;
  status: "pending" | "captured" | "escalated";
}

interface EncounterDraft {
  id: string;
  residentId: string;
  visitType: VisitType;
  body: string;
  instructions: string;
  destination: "Otangeles Notes+";
  status: "draft" | "ready";
}

interface ProviderNote {
  id: string;
  residentId: string;
  residentName: string;
  title: string;
  body: string;
  source: ProviderNoteSource;
  createdAt: string;
  status: "note" | "draft-created" | "ready-for-ehr";
  encounterDraft?: EncounterDraft;
}

interface EncounterContentItem {
  label?: string;
  text: string;
}

interface RevisionComment {
  id: string;
  authorId: string;
  authorName: string;
  role: "provider" | "scribe";
  body: string;
  createdAt: string;
}

interface RevisionThread {
  id: string;
  status: RevisionThreadStatus;
  comments: RevisionComment[];
}

interface EncounterSection {
  id: string;
  title: string;
  kind: EncounterSectionKind;
  content: EncounterContentItem[];
  verified: boolean;
  revisionThreads: RevisionThread[];
  revisedAt?: string;
}

interface ProviderSignature {
  method: SignatureMethod;
  typedName?: string;
  dataUrl?: string;
  savedAt: string;
}

interface EncounterSignatureSnapshot extends ProviderSignature {
  providerId: string;
  providerName: string;
  signedAt: string;
}

interface ProviderVisit {
  id: string;
  residentId: string;
  residentName: string;
  providerUserId: string;
  providerName: string;
  visitType: VisitType;
  scheduledDate: string;
  scheduledTime: string;
  clinicalPriority: "Urgent" | "High" | "Routine";
  visitReason: string;
  baselineChange: string;
  supportingEvidence: string[];
  startedAt: string;
  startedAtMs: number;
  endedAt?: string;
  textNote: string;
  voiceTranscript: string;
  orderIds: string[];
  status: ProviderEncounterStatus;
  notesPlusSyncStatus: ProviderVisitSyncStatus;
  notesPlusSyncedAt?: string;
  assignedScribe?: string;
  documentTitle: string;
  sections: EncounterSection[];
  signedSignature?: EncounterSignatureSnapshot;
}

interface EncounterModalDraft {
  residentName: string;
  visitType: VisitType;
  notes: string;
}

interface StartEncounterModalDraft {
  visitType: VisitType;
}

interface CnaDebriefEntry {
  assignmentId: string;
  residentId: string;
  status: CnaDebriefStatus;
  transcript: string;
  flaggedConcern: string;
  capturedAt?: string;
}

interface ProfileState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  systemRole: string;
  assignedFacilities: Facility[];
  defaultFacility: FacilitySelection;
  time24Hour: boolean;
  twoFactorEnabled: boolean;
  pushEnabled: boolean;
  appearance: "System" | "Light" | "Dark";
  language: "English (US)" | "Spanish";
  passwordUpdatedAt: string;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current?: boolean;
}

interface ActionRequest {
  id: string;
  residentId: string;
  residentName: string;
  facility: Facility;
  priority: ActionPriority;
  assignedRole: ActionTargetRole;
  assignedUserId: string;
  actionType: string;
  instructions: string;
  dueTime: string;
  status: ActionStatus;
  sourceScreen: string;
  linkedThreadId?: string;
  sourceOpportunityId?: string;
  statusNote?: string;
  statusChangedById?: string;
  statusChangedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface HospitalEscalation {
  id: string;
  residentId: string;
  residentName: string;
  facility: Facility;
  urgency: ActionPriority;
  destination: string;
  reason: string;
  notes: string;
  followUpTime: string;
  status: EscalationStatus;
  createdByRole: RoleKey;
  linkedThreadId?: string;
  createdAt: string;
}

interface ScheduledHuddle {
  id: string;
  residentId: string;
  residentName: string;
  facility: Facility;
  eventType: string;
  primaryOwnerId: string;
  taggedUserIds: string[];
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  scheduledFor: string;
  duration: string;
  participantIds: string[];
  callMode: Exclude<MessageStartMode, "message">;
  agenda: string;
  status: HuddleStatus;
  threadId: string;
  createdAt: string;
}

interface ScheduleFollowUp {
  id: string;
  residentId: string;
  residentName: string;
  facility: Facility;
  eventType: string;
  primaryOwnerId: string;
  taggedUserIds: string[];
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  details: string;
  status: ScheduleFollowUpStatus;
  createdAt: string;
}

interface ClinicalOrder {
  id: string;
  residentId: string;
  residentName: string;
  facility: Facility;
  eventType: string;
  primaryOwnerId: string;
  taggedUserIds: string[];
  orderType: ClinicalOrderType;
  priority: ActionPriority;
  requestedDate: string;
  requestedTime: string;
  indication: string;
  details: string;
  instructions: string;
  destination: "Otangeles Notes+";
  status: ClinicalOrderStatus;
  linkedThreadId?: string;
  statusChangedAt?: string;
  statusChangedById?: string;
  createdAt: string;
}

interface ResidentScheduleItem {
  id: string;
  kind: "huddle" | "follow-up" | "order" | "escalation" | "action";
  residentId: string;
  residentName: string;
  facility: Facility;
  eventType: string;
  primaryOwnerId: string;
  taggedUserIds: string[];
  title: string;
  detail: string;
  dateKey: string;
  time: string;
  timeLabel: string;
  tone: string;
  threadId?: string;
}

type CareUpdateKind = "debrief" | "provider-note" | "order" | "action" | "escalation" | "huddle" | "follow-up";

interface CareUpdate {
  id: string;
  kind: CareUpdateKind;
  label: string;
  title: string;
  body: string;
  meta: string;
  status: string;
  tone: string;
  sortOrder: number;
}

type ResidentTimelineKind =
  | "signal"
  | "debrief"
  | "provider-note"
  | "order"
  | "action"
  | "escalation"
  | "huddle"
  | "follow-up"
  | "visit";

interface ResidentTimelineEvent {
  id: string;
  kind: ResidentTimelineKind;
  sourceId?: string;
  threadId?: string;
  timeAgo: string;
  period: string;
  icon: string;
  title: string;
  text: string;
  interpretation?: string;
  status?: string;
  tone?: string;
  sortOrder: number;
}

type FocusItemKind = "prediction" | "action" | "order" | "debrief" | "escalation" | "huddle";
type FocusItemAction = "review-resident" | "create-action" | "review-action" | "open-debrief" | "open-schedule";

interface FocusItem {
  id: string;
  kind: FocusItemKind;
  title: string;
  residentId?: string;
  residentName?: string;
  facility?: Facility;
  body: string;
  meta: string;
  status: string;
  tone: string;
  rank: number;
  primaryAction: FocusItemAction;
  primaryLabel: string;
  secondaryAction?: FocusItemAction;
  secondaryLabel?: string;
  sourceId?: string;
}

interface MonthCalendarCell {
  id: string;
  dateKey: string;
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
  items: ResidentScheduleItem[];
}

interface ScheduleDraft {
  type: ScheduleDraftType;
  eventType: string;
  residentId: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  details: string;
  participantIds: string[];
  primaryOwnerId: string;
  taggedUserIds: string[];
  callMode: Exclude<MessageStartMode, "message">;
  orderType: ClinicalOrderType;
  priority: ActionPriority;
  indication: string;
  orderDetails: string;
  instructions: string;
}

interface TaggedMessageContext {
  opportunityId: string;
  residentId: string;
  recipientIds: string[];
  body: string;
}

interface ActionDraft {
  residentId: string;
  assignedRole: ActionTargetRole;
  assignedUserId: string;
  actionType: string;
  priority: ActionPriority;
  dueTime: string;
  instructions: string;
  createThread: boolean;
  sourceOpportunityId?: string;
}

type AiMessage =
  | { id: string; kind: "briefing" }
  | {
      id: string;
      kind: "text";
      from: "me" | "sage";
      text: string;
      bullets?: string[];
      footer?: string;
    };

interface SuggestedPrompt {
  id: string;
  label: string;
  icon: Component;
  response: {
    text: string;
    bullets?: string[];
    footer?: string;
  };
}

interface HeaderNotification {
  id: string;
  tone: string;
  title: string;
  detail: string;
  meta: string;
  icon: Component;
  target: NotificationTarget;
  unread?: boolean;
}

const theme = colors.light;

const providerUser = getUser("u4") ?? donUser;
const cnaUser = getUser("u3") ?? donUser;

const facilities: Facility[] = [
  "Brickyard Healthcare – Elkhart Care Center",
  "Brickyard Healthcare – Merrillville Care Center",
  "Casa of Hobart",
  "Niles Care Center",
];

// TODO(NOTES_PLUS): Replace this mock print masthead with the facility demographics received with encounter documents.
const facilityDocumentDetails: Record<Facility, { address: string; phone: string; fax: string }> = {
  "Brickyard Healthcare – Elkhart Care Center": {
    address: "1001 W Hively Avenue, Elkhart, IN 46517",
    phone: "(574) 555-0142",
    fax: "(574) 555-0143",
  },
  "Brickyard Healthcare – Merrillville Care Center": {
    address: "8800 Virginia Place, Merrillville, IN 46410",
    phone: "(219) 555-0164",
    fax: "(219) 555-0165",
  },
  "Casa of Hobart": {
    address: "4410 W 49th Avenue, Hobart, IN 46342",
    phone: "(219) 555-0172",
    fax: "(219) 555-0173",
  },
  "Niles Care Center": {
    address: "1200 Niles-Buchanan Road, Niles, MI 49120",
    phone: "(269) 555-0182",
    fax: "(269) 555-0183",
  },
};

function selectOption(value: string, label = value): SelectOption {
  return { value, label };
}

const defaultLoginUserIds: Record<RoleKey, string> = {
  don: "u8",
  provider: "u4",
  cna: "u3",
};

function normalizeSystemRole(role: string) {
  return /^(medical provider|medical doctor)$/i.test(role) ? "Physician" : role;
}

function splitProfileName(name: string) {
  const withoutHonorific = name.trim().replace(/^Dr\.\s+/i, "");
  const parts = withoutHonorific.split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function careUserById(userId: string) {
  return users.find((user) => user.id === userId) ?? (userId === donUser.id ? donUser : null);
}

function staffLoginRole(user: CareUser): ScheduleStaffRole {
  if (user.loginRole) {
    return user.loginRole;
  }
  if (/don|director of nursing/i.test(user.role)) {
    return "don";
  }
  if (/attending|medical director|doctor|provider|np|nurse practitioner|physician assistant|pa-c/i.test(user.role)) {
    return "provider";
  }
  if (/cna/i.test(user.role)) {
    return "cna";
  }
  return "staff";
}

function userAssignedFacilities(user: CareUser | null, role: RoleKey) {
  const allowed = (user?.assignedFacilities ?? []).filter((facility): facility is Facility =>
    facilities.includes(facility as Facility),
  );
  if (allowed.length) {
    return allowed;
  }
  if (role === "cna") {
    return [facilities[0], facilities[1]];
  }
  return [...facilities];
}

function userDefaultFacility(user: CareUser | null, role: RoleKey): FacilitySelection {
  if (role !== "cna" && user?.defaultFacility === "all") {
    return "all";
  }
  const assigned = userAssignedFacilities(user, role);
  const savedDefault = user?.defaultFacility;
  return assigned.includes(savedDefault as Facility) ? (savedDefault as Facility) : role === "cna" ? assigned[0] : "all";
}

const visitTypes: VisitType[] = [
  "30-Day Follow Up",
  "60-Day Follow Up",
  "Acute",
  "Admission - Telemed",
  "Advanced Care Planning (ACP)",
  "Annual Wellness Visit",
  "Chronic Pain Management",
  "Discharge",
  "Follow-Up",
  "GDR (Gradual Dose Reduction) Visit",
  "History and Physical",
  "Lab",
  "Others",
  "PM&R (Physical Medicine & Rehabilitation) Up",
  "Psychiatry",
  "Psychiatry Follow Up",
  "Remote Patient Monitoring (RPM) - Enrollment",
  "Remote Patient Monitoring (RPM) - Follow-Up",
  "Telehealth",
  "Telehealth - Asynchronous",
  "Telemed - Fall Assessment",
  "Transitional Care Management",
  "Transitional Care Management - Telemed",
  "Wound Care",
];

const clinicalOrderTypes: ClinicalOrderType[] = [
  "Lab",
  "Imaging",
  "Medication Change",
  "Vitals / Monitoring",
  "Consult / Therapy",
  "Wound Care",
  "Other",
];

const scheduleEventTypes: Record<ScheduleDraftType, string[]> = {
  huddle: [
    "Care Huddle",
    "Provider Consult",
    "Family Update",
    "Shift Handoff",
    "Fall Review",
    "Behavior / Pain Review",
  ],
  "follow-up": [
    "Vitals Check",
    "Lab Follow-up",
    "Intake / Hydration Check",
    "Wound Check",
    "Medication Response",
    "Therapy Follow-up",
    "Other Follow-up",
  ],
  "clinical-order": clinicalOrderTypes,
};

const calendarWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const residentFacilityMap = Object.fromEntries(
  residents.map((resident, index) => [resident.id, facilities[index % facilities.length]]),
) as Record<string, Facility>;

function residentFacility(resident: Resident) {
  return residentFacilityMap[resident.id] ?? facilities[0];
}

const roleProfiles: Record<RoleKey, RoleProfile> = {
  don: {
    key: "don",
    label: "DON",
    name: donUser.name,
    role: donUser.role,
    facility: "All Facilities",
    description: "Facility-wide clinical oversight, escalation, and team coordination.",
    image: donUser.image,
    icon: UserCheck,
    defaultView: "situation",
    metricLabel: "active watches",
    metricValue: "7",
  },
  provider: {
    key: "provider",
    label: "Provider",
    name: providerUser.name,
    role: "Physician",
    facility: "All Facilities",
    description: "Patient-centered clinical attention queue, notes, and documentation review.",
    image: providerUser.image,
    icon: Briefcase,
    defaultView: "provider-home",
    metricLabel: "attention opportunities",
    metricValue: "23",
  },
  cna: {
    key: "cna",
    label: "CNA",
    name: cnaUser.name,
    role: "Certified Nursing Assistant",
    facility: facilities[0],
    description: "Simple shift support and resident-by-resident debrief capture.",
    image: cnaUser.image,
    icon: Coffee,
    defaultView: "cna-home",
    metricLabel: "assigned residents",
    metricValue: "8",
  },
};

function profileStateFromStaff(user: CareUser | null, role: RoleKey): ProfileState {
  const profile = roleProfiles[role];
  const fallbackName = user?.name ?? profile.name;
  const { firstName, lastName } = splitProfileName(fallbackName);
  return {
    firstName,
    lastName,
    email:
      user?.email ??
      `${fallbackName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.+|\.+$/g, "")}@sagecare.local`,
    phone: role === "provider" ? "(219) 555-0128" : role === "cna" ? "(219) 555-0146" : "(219) 555-0184",
    systemRole: normalizeSystemRole(profile.role),
    assignedFacilities: userAssignedFacilities(user, role),
    defaultFacility: userDefaultFacility(user, role),
    time24Hour: true,
    twoFactorEnabled: false,
    pushEnabled: true,
    appearance: "System",
    language: "English (US)",
    passwordUpdatedAt: "Never updated in mock",
  };
}

const roleNavItems: Record<RoleKey, NavItem[]> = {
  don: [
    { key: "situation", label: "Situation", icon: Activity },
    { key: "residents", label: "Residents", icon: Users },
    { key: "ai", label: "Sage", icon: Zap },
    { key: "messages", label: "Messages", icon: MessageCircle },
    { key: "settings", label: "Settings", icon: Settings },
  ],
  provider: [
    { key: "provider-home", label: "Home", icon: Activity },
    { key: "provider-residents", label: "Residents", icon: Users },
    { key: "provider-sage", label: "Sage", icon: Zap },
    { key: "provider-collaboration", label: "Messages", icon: MessageCircle },
    { key: "provider-profile", label: "Settings", icon: Settings },
  ],
  cna: [
    { key: "cna-home", label: "My Shift", icon: Clock },
    { key: "cna-debrief", label: "Debrief", icon: FileText },
    { key: "cna-residents", label: "Residents", icon: Users },
    { key: "cna-messages", label: "Messages", icon: MessageCircle },
    { key: "cna-profile", label: "Settings", icon: Settings },
  ],
};

const roleProfileFeatures: Record<RoleKey, ProfileFeature[]> = {
  don: [
    {
      id: "don-situation",
      label: "Situation Command Center",
      detail: "Facility-wide watch list, escalations, and risk changes",
      status: "On",
      icon: Activity,
    },
    {
      id: "don-messages",
      label: "Care Team Messaging",
      detail: "Huddles, direct messages, and nurse handoffs",
      status: "On",
      icon: MessageCircle,
    },
    {
      id: "don-escalations",
      label: "Escalation Rules",
      detail: "DON notification thresholds and routing preferences",
      status: "Review",
      icon: Shield,
    },
  ],
  provider: [
    {
      id: "provider-notes",
      label: "Resident Notes",
      detail: "Typed and voice notes with Otangeles Notes+ encounter drafts",
      status: "On",
      icon: FileText,
    },
    {
      id: "provider-voice",
      label: "Voice Transcription",
      detail: "Mock recording capture for provider observations",
      status: "Mock",
      icon: Mic,
    },
    {
      id: "provider-queue",
      label: "Clinical Attention Queue",
      detail: "Cross-facility residents requiring medical review",
      status: "On",
      icon: Activity,
    },
  ],
  cna: [
    {
      id: "cna-debrief",
      label: "Shift Debrief",
      detail: "Multi-resident recording queue and end-of-shift summary",
      status: "On",
      icon: FileText,
    },
    {
      id: "cna-reminders",
      label: "Resident Reminders",
      detail: "Care preferences, watch items, and recent changes",
      status: "On",
      icon: Bell,
    },
    {
      id: "cna-messages",
      label: "Team Messages",
      detail: "Charge nurse, unit manager, and DON communication",
      status: "On",
      icon: MessageCircle,
    },
  ],
};

const baseResidentTabs: Array<{ key: ResidentTab; label: string; icon: Component }> = [
  { key: "situation", label: "Situation", icon: Activity },
  { key: "talk", label: "Talk", icon: MessageCircle },
  { key: "timeline", label: "Timeline", icon: Clock },
  { key: "notes", label: "Notes", icon: FileText },
];

const iconMap: Record<string, Component> = {
  activity: Activity,
  "alert-circle": AlertCircle,
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle,
  coffee: Coffee,
  eye: Eye,
  "file-text": FileText,
  "git-branch": GitBranch,
  heart: Heart,
  moon: Moon,
  smile: Smile,
  thermometer: Thermometer,
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
  users: Users,
  clock: Clock,
};

const priorityResidents = residents
  .filter(
    (resident) =>
      resident.statusChips.includes("DECLINING") ||
      (resident.acuity === "WATCHFUL" && resident.situation.concerns.length > 0),
  )
  .sort((a, b) => {
    const rank = (resident: Resident) =>
      resident.statusChips.includes("DECLINING") ? 0 : 1;
    return rank(a) - rank(b);
  });

const providerNotes = [
  "Continue current treatment for stable respiratory residents.",
  "Order UA and culture if Mary Lou remains febrile after reassessment.",
  "Review Walter's x-ray result before noon rounds.",
];

const initialProviderNotes: ProviderNote[] = [
  {
    id: "pn-1",
    residentId: "1",
    residentName: "Mary Lou Smith",
    title: "Possible UTI with delirium",
    body:
      "Resident demonstrates acute confusion, poor intake, low-grade fever, tachycardia, and urine odor reported overnight. Request UA/culture and close hydration monitoring.",
    source: "voice",
    createdAt: "8:44 AM",
    status: "note",
  },
  {
    id: "pn-2",
    residentId: "2",
    residentName: "Walter Jefferson",
    title: "Post-fall review",
    body:
      "Continue post-fall monitoring. Hip pain is present without shortening or rotation. Await x-ray result before changing mobility plan.",
    source: "typed",
    createdAt: "7:58 AM",
    status: "draft-created",
    encounterDraft: {
      id: "enc-2",
      residentId: "2",
      visitType: "Telemed - Fall Assessment",
      body:
        "Continue post-fall monitoring. Hip pain is present without shortening or rotation. Await x-ray result before changing mobility plan.",
      instructions: "Review imaging results and update nursing if pain increases.",
      destination: "Otangeles Notes+",
      status: "draft",
    },
  },
];

// TODO(NOTES_PLUS): Replace this reference-aligned mock document with the structured encounter sections received from Otangeles Notes+.
function encounterSectionsForResident(resident: Resident): EncounterSection[] {
  const primaryConcern = resident.situation.concerns[0]?.title ?? resident.latest;
  const secondaryConcern = resident.situation.concerns[1]?.title ?? "Ongoing clinical monitoring";
  const primaryConcernLower = primaryConcern.toLowerCase();
  const currentVital = (label: string, fallback: string) =>
    resident.situation.vitals.find((vital) => vital.label === label)?.current ?? fallback;
  const primaryDiagnosis = primaryConcernLower.includes("uti")
    ? "R41.0 - Disorientation, unspecified"
    : primaryConcernLower.includes("fall")
      ? "W19.XXXA - Unspecified fall, initial encounter"
      : primaryConcernLower.includes("pain")
        ? "R52 - Pain, unspecified"
        : "R69 - Illness, unspecified";

  return [
    {
      id: "code-status",
      title: "Code Status",
      kind: "bullets",
      content: [
        { text: resident.codeStatus },
        {
          text:
            resident.codeStatus === "Full Code"
              ? "All life-sustaining measures are permitted, including CPR, intubation, defibrillation, and advanced life support."
              : `Current documented directive: ${resident.codeStatus}. Follow facility policy and the resident's active advance-directive record.`,
        },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "chief-complaint",
      title: "Chief Complaint",
      kind: "paragraphs",
      content: [
        { label: "Medical necessity", text: "Patient Request" },
        { label: "Reason for visit", text: primaryConcern },
        { text: resident.situation.summary },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "history-present-illness",
      title: "History of Present Illness",
      kind: "paragraphs",
      content: [
        {
          text: `${resident.name} is a ${resident.age}-year-old ${resident.sex === "F" ? "female" : "male"} resident who presents for ${primaryConcernLower}. Symptoms represent a change from the resident's documented baseline and were reported by facility staff during the current monitoring period.`,
        },
        { label: "Current symptoms", text: resident.latest },
        { label: "Clinical context", text: resident.situation.summary },
        { label: "Relevant history", text: resident.situation.memory },
        { label: "Severity", text: "Mild to moderate; requires provider assessment and continued facility monitoring." },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "medical-history",
      title: "Past Medical History",
      kind: "bullets",
      content: [
        { text: "Type 2 diabetes mellitus" },
        { text: "Hypertension" },
        { text: primaryConcern },
        { text: secondaryConcern },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "past-surgical-history",
      title: "Past Surgical History",
      kind: "bullets",
      content: [
        { text: "No Prior Surgeries" },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "social-history",
      title: "Social History",
      kind: "grid",
      content: [
        { label: "Alcohol Use", text: "Unknown" },
        { label: "Drugs / Substance Use", text: "Unknown" },
        { label: "Tobacco / Nicotine Use", text: "Unknown" },
        { label: "Drinking Type", text: "Unknown" },
        { label: "Marital Status", text: "Unknown" },
        { label: "Sexual Activity", text: "Not currently sexually active" },
        { label: "Sex at Birth", text: resident.sex === "F" ? "Female" : "Male" },
        { label: "Residence", text: "Skilled nursing facility" },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "family-history",
      title: "Family History",
      kind: "grid",
      content: [
        { label: "Father", text: "Condition: Stroke · Deceased: Yes · Age of onset: 70" },
        { label: "Mother", text: "Condition: Heart Disease · Deceased: Yes · Age of onset: 60" },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "immunizations",
      title: "Immunizations",
      kind: "grid",
      content: [
        { label: "Document Vaccines", text: "Present" },
        { label: "Influenza", text: "10/12/2025" },
        { label: "Pneumococcal", text: "Documented in facility record" },
        { label: "COVID-19", text: "Primary series documented" },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "vital-signs",
      title: "Vital Signs",
      kind: "grid",
      content: [
        { label: "Blood Pressure", text: currentVital("Blood Pressure", "119/78 mmHg") },
        { label: "Pain Scale", text: "0/10" },
        { label: "Heart Rate", text: `${currentVital("Heart Rate", "68")} bpm` },
        { label: "Blood Glucose", text: "145 mg/dL" },
        { label: "Respiratory Rate", text: "21 /min" },
        { label: "Weight", text: "170 lb" },
        { label: "Temperature", text: currentVital("Temperature", "98.9 °F") },
        { label: "Height", text: "68 in" },
        { label: "Oxygen Saturation", text: currentVital("SpO2", "96%") },
        { label: "Calculated BMI", text: "25.8 kg/m²" },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "allergies",
      title: "Allergies",
      kind: "bullets",
      content: [
        { label: "Reported", text: "Metformin" },
        { label: "Reaction", text: "Diarrhea" },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "medications",
      title: "Medications",
      kind: "paragraphs",
      content: [
        { text: "Medication reviewed. No medication changes made during this encounter." },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "review-of-systems",
      title: "Review of Systems",
      kind: "grid",
      content: [
        { label: "General", text: "Patient denies excessive daytime sleepiness, fever, weight gain, malaise, fatigue, low energy, and weight loss unless documented in the HPI." },
        { label: "Eyes", text: "Patient denies discharge, eye pain, photophobia, itching, eye redness, and visual disturbance." },
        { label: "Ears, Nose, Mouth / Throat", text: "Patient denies ear pain, hearing change, rhinorrhea, sore throat, and difficulty swallowing." },
        { label: "Cardiovascular", text: "Patient denies chest pain, palpitations, temperature changes to distal extremities, tightness, and swelling." },
        { label: "Respiratory", text: "Patient denies cough, dyspnea, hemoptysis, orthopnea, and wheezing." },
        { label: "Gastrointestinal", text: "Patient denies abdominal pain, constipation, diarrhea, nausea, and vomiting." },
        { label: "Genitourinary", text: primaryConcernLower.includes("uti") ? "Reports: Urinary change documented by facility staff · Patient denies flank pain and gross hematuria." : "Patient denies dysuria, frequency, urgency, and hematuria." },
        { label: "Musculoskeletal", text: "Patient denies joint pain, limited range of motion, muscle weakness, and joint swelling unless otherwise documented." },
        { label: "Skin", text: "Patient denies changes in hair or nails, scaling, bruising, ulcers, rash, and changes in skin color." },
        { label: "Neurologic", text: `Reports: ${resident.latest} · Patient denies seizure, tremor, and syncope.` },
        { label: "Psychiatric", text: "Patient denies depressed mood, memory loss, anxiety, hallucinations, and suicidal ideation unless otherwise documented." },
        { label: "Endocrine", text: "Patient denies heat or cold intolerance, loss of hair, increased thirst, and increased urination." },
        { label: "Hematologic / Lymphatic", text: "Patient denies anemia, easy bruising, bleeding, and enlarged lymph nodes." },
        { label: "Allergy / Immunology", text: "Patient denies environmental allergies, hives, and recurrent infections." },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "physical-exam",
      title: "Physical Exam",
      kind: "grid",
      content: [
        { label: "General", text: "Awake: Yes · Alert: Yes · Engaged: Yes" },
        { label: "Ears, Nose, Mouth / Throat", text: "Voice appearance: Normal · External ear appearance: Normal · Hearing adequate to conversation" },
        { label: "Eyes", text: "Conjunctiva normal · Extraocular movements intact · Pupils equal, round, and reactive" },
        { label: "Neck", text: "Trachea midline · Range of motion normal · No visible masses" },
        { label: "Cardiovascular", text: "Rate normal · Rhythm regular · Peripheral pulses present · Edema absent" },
        { label: "Respiratory", text: "Effort normal · Breath sounds normal · Respiratory distress absent" },
        { label: "Gastrointestinal", text: "Bowel sounds normal · Abdomen soft · Tenderness absent · Distention absent" },
        { label: "Genitourinary", text: "Flank tenderness absent · Urinary catheter absent" },
        { label: "Musculoskeletal", text: "Posture normal · Range of motion preserved · Focal swelling absent" },
        { label: "Skin", text: "Texture normal · Warm · Rash absent · Ulceration absent" },
        { label: "Neurologic", text: "Mental status interpreted against baseline · Tremor absent · Focal deficit absent" },
        { label: "Psychiatric", text: "Cooperative · Mood normal · Affect appropriate · Behavior normal" },
        { label: "Hematologic", text: "Bruising absent · Active bleeding absent" },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "assessment-plan",
      title: "Assessment & Plan",
      kind: "paragraphs",
      content: [
        { label: "Medical Decision Making", text: `${primaryConcern} was addressed during this follow-up encounter. The available facility history, current symptoms, vital signs, medication record, and nursing observations were reviewed. The resident remains appropriate for continued facility management with close monitoring and escalation for material change.` },
        { label: primaryDiagnosis, text: `Status: Active · Plan: Evaluate and monitor ${primaryConcernLower}; correlate with pending results and nursing observations.` },
        { label: "I10 - Hypertension", text: "Status: Chronic, stable · Continue current antihypertensive regimen and ordered blood-pressure monitoring." },
        { label: "E11.9 - Type 2 diabetes mellitus without complications", text: "Status: Chronic, stable · Continue current diabetic plan, glucose monitoring, and facility diet." },
        { label: "Follow-up", text: "Reassess after pending results or sooner for worsening symptoms, abnormal vital signs, or additional change from baseline." },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "notes",
      title: "Notes",
      kind: "paragraphs",
      content: [
        { text: "No provider text or voice note has been captured in SAGE for this encounter." },
      ],
      verified: false,
      revisionThreads: [],
    },
    {
      id: "cpt-codes",
      title: "CPT Codes",
      kind: "bullets",
      content: [
        { text: "99308 - Subsequent nursing facility care" },
      ],
      verified: false,
      revisionThreads: [],
    },
  ];
}

function syncProviderNoteIntoEncounterDocument(encounter: ProviderVisit) {
  // TODO(NOTES_PLUS): Preserve the provider note source when the ended encounter payload is embedded into the remote Notes section.
  const notesSection = encounter.sections.find((section) => section.id === "notes");
  if (!notesSection) {
    return;
  }

  const providerNotes: EncounterContentItem[] = [];
  if (encounter.textNote.trim()) {
    providerNotes.push({ label: "Provider Text Note", text: encounter.textNote.trim() });
  }
  if (encounter.voiceTranscript.trim()) {
    providerNotes.push({ label: "Provider Voice Note Transcript", text: encounter.voiceTranscript.trim() });
  }

  notesSection.content = providerNotes.length
      ? providerNotes
      : [{ text: "No provider text or voice note has been captured in SAGE for this encounter." }];
}

function splitEncounterDetail(text: string) {
  return text
    .split(" · ")
    .map((detail) => detail.trim())
    .filter(Boolean);
}

function mockEncounterPriority(resident: Resident): ProviderVisit["clinicalPriority"] {
  if (
    resident.statusChips.includes("DECLINING") ||
    resident.situation.vitals.some((vital) => vital.isCritical)
  ) {
    return "Urgent";
  }
  if (
    resident.acuity === "WATCHFUL" ||
    resident.situation.vitals.some((vital) => vital.isAbnormal)
  ) {
    return "High";
  }
  return "Routine";
}

function mockEncounterVisitType(resident: Resident): VisitType {
  const context = `${resident.latest} ${resident.situation.summary}`.toLowerCase();
  if (context.includes("fall")) {
    return "Telemed - Fall Assessment";
  }
  if (context.includes("wound")) {
    return "Wound Care";
  }
  if (context.includes("pain")) {
    return "Chronic Pain Management";
  }
  return "Acute";
}

function mockEncounterEvidence(resident: Resident) {
  return [
    ...resident.situation.concerns.map((concern) => `${concern.title}: ${concern.status}`),
    ...resident.situation.vitals
      .filter((vital) => vital.isAbnormal)
      .map((vital) => `${vital.label}: ${vital.current} vs baseline ${vital.base}`),
  ];
}

function seededEncounter(
  id: string,
  resident: Resident,
  status: ProviderEncounterStatus,
  visitType: VisitType,
  scheduledTime: string,
): ProviderVisit {
  const now = Date.now();
  const textNote = status === "scheduled" ? "" : resident.situation.summary;
  const encounter: ProviderVisit = {
    id,
    residentId: resident.id,
    residentName: resident.name,
    providerUserId: providerUser.id,
    providerName: providerUser.name,
    visitType,
    scheduledDate: todayDateKey(),
    scheduledTime,
    clinicalPriority: mockEncounterPriority(resident),
    visitReason: resident.situation.concerns[0]?.title ?? resident.latest,
    baselineChange: resident.latest,
    supportingEvidence: mockEncounterEvidence(resident),
    startedAt: status === "scheduled" ? "" : scheduledTime,
    startedAtMs: now - 2 * 60 * 60 * 1000,
    endedAt: status === "scheduled" || status === "provider-in-progress" ? undefined : scheduledTime,
    textNote,
    voiceTranscript: "",
    orderIds: [],
    status,
    notesPlusSyncStatus: status === "scheduled" || status === "provider-in-progress" ? "pending" : "synced",
    notesPlusSyncedAt: status === "scheduled" || status === "provider-in-progress" ? undefined : scheduledTime,
    assignedScribe: status === "scheduled" || status === "provider-in-progress" ? undefined : "Mark Rivera, Scribe",
    documentTitle: "Progress Notes",
    sections: encounterSectionsForResident(resident),
  };
  syncProviderNoteIntoEncounterDocument(encounter);
  return encounter;
}

const needsReviewEncounter = seededEncounter("enc-needs-review", residents[0], "needs-review", "Acute", "8:40 AM");
const revisionEncounter = seededEncounter("enc-revision", residents[1], "revision", "Telemed - Fall Assessment", "9:10 AM");
const revisionAssessmentPlanSection = revisionEncounter.sections.find(
  (section) => section.id === "assessment-plan",
);
if (revisionAssessmentPlanSection) {
  revisionAssessmentPlanSection.revisionThreads = [
    {
      id: "revision-walter-plan",
      status: "open",
      comments: [
        {
          id: "revision-walter-plan-root",
          authorId: providerUser.id,
          authorName: providerUser.name,
          role: "provider",
          body: "Please clarify the mobility restriction and include the pending hip x-ray follow-up plan.",
          createdAt: "10:18 AM",
        },
      ],
    },
  ];
}

const submittedEncounter = seededEncounter("enc-submitted", residents[2], "submitted-to-billing", "Follow-Up", "7:45 AM");
submittedEncounter.sections.forEach((section) => { section.verified = true; });
submittedEncounter.signedSignature = {
  method: "type",
  typedName: providerUser.name,
  savedAt: "Yesterday, 4:12 PM",
  providerId: providerUser.id,
  providerName: providerUser.name,
  signedAt: "Yesterday, 4:12 PM",
};

const downstreamMockResidentIds = new Set([
  needsReviewEncounter.residentId,
  revisionEncounter.residentId,
  submittedEncounter.residentId,
  residents[3].id,
]);
const mockDailyVisitResidents = priorityResidents
  .filter((resident) => !downstreamMockResidentIds.has(resident.id))
  .slice(0, 4);
const mockDailyVisitTimes = ["8:15 AM", "9:00 AM", "10:30 AM", "11:15 AM"];

const initialProviderVisits: ProviderVisit[] = [
  needsReviewEncounter,
  revisionEncounter,
  submittedEncounter,
  seededEncounter("enc-scribe-progress", residents[3], "scribe-in-progress", "30-Day Follow Up", "10:00 AM"),
  ...mockDailyVisitResidents.map((resident, index) =>
    seededEncounter(
      `enc-scheduled-${index + 1}`,
      resident,
      "scheduled",
      mockEncounterVisitType(resident),
      mockDailyVisitTimes[index] ?? "1:00 PM",
    ),
  ),
];

const cnaAssignments: CnaAssignment[] = [
  {
    id: "ca-1",
    resident: residents[0],
    facility: residentFacility(residents[0]),
    reminder: "Feeding assistance",
    watchFor: "Intake, confusion, urine odor",
    care: "Breakfast, hygiene, transfer assist",
    status: "escalated",
  },
  {
    id: "ca-2",
    resident: residents[1],
    facility: residentFacility(residents[1]),
    reminder: "Two-person transfer",
    watchFor: "Hip pain, transfer difficulty",
    care: "AM care, repositioning, comfort checks",
    status: "pending",
  },
  {
    id: "ca-3",
    resident: residents[2],
    facility: residentFacility(residents[2]),
    reminder: "Prefers Spanish music",
    watchFor: "Cough, appetite, energy",
    care: "Bathing, ambulation support",
    status: "captured",
  },
  {
    id: "ca-4",
    resident: residents[3],
    facility: residentFacility(residents[3]),
    reminder: "Diabetic snacks only",
    watchFor: "Evening snack requests",
    care: "Meal setup, activity escort",
    status: "pending",
  },
  {
    id: "ca-5",
    resident: residents[4],
    facility: residentFacility(residents[4]),
    reminder: "Classic-car magazines",
    watchFor: "Activity tolerance, mood",
    care: "Exercise escort, lunch setup",
    status: "captured",
  },
  {
    id: "ca-6",
    resident: residents[5],
    facility: residentFacility(residents[5]),
    reminder: "Uses hearing amplifier",
    watchFor: "Meal intake, dizziness",
    care: "Morning hygiene, ambulation",
    status: "pending",
  },
  {
    id: "ca-7",
    resident: residents[6],
    facility: residentFacility(residents[6]),
    reminder: "Likes quiet room after lunch",
    watchFor: "Pain with transfers",
    care: "Repositioning, hydration rounds",
    status: "pending",
  },
  {
    id: "ca-8",
    resident: residents[7],
    facility: residentFacility(residents[7]),
    reminder: "Family calls after breakfast",
    watchFor: "Shortness of breath, fatigue",
    care: "AM care, vitals cueing",
    status: "pending",
  },
];

const cnaHistory = [
  { id: "ch-1", shift: "Yesterday PM", summary: "6 resident observations captured, 2 routed to nursing." },
  { id: "ch-2", shift: "Monday AM", summary: "Bathing refusals and intake concerns summarized." },
];

const providerActionTypes = [
  "Review resident",
  "Place/update orders",
  "Evaluate acute change",
  "Create encounter note",
  "Review labs/imaging",
];

const cnaActionTypes = [
  "Collect vitals",
  "Observe intake",
  "Check pain/behavior",
  "Complete resident debrief",
  "Recheck safety/fall concern",
  "Report change",
];

const providerRecipientIds = users
  .filter((user) => /attending|medical director|doctor|provider|np|nurse practitioner|physician assistant|pa-c/i.test(user.role))
  .map((user) => user.id);

const cnaRecipientIds = users
  .filter((user) => /cna/i.test(user.role))
  .map((user) => user.id);

const clinicalRecipientIds = users
  .filter((user) => !/resident|patient/i.test(user.role))
  .map((user) => user.id);

const initialActionRequests: ActionRequest[] = [
  {
    id: "ar-1",
    residentId: residents[0].id,
    residentName: residents[0].name,
    facility: residentFacility(residents[0]),
    priority: "Stat",
    assignedRole: "provider",
    assignedUserId: providerRecipientIds[0] ?? "u4",
    actionType: "Evaluate acute change",
    instructions: "Review worsening confusion, fever trend, intake decline, and UA status. Provide next orders or encounter plan.",
    dueTime: "Now",
    status: "open",
    sourceScreen: "DON Situation",
    linkedThreadId: "t1",
    createdAt: "7:48 AM",
    updatedAt: "7:48 AM",
  },
  {
    id: "ar-2",
    residentId: residents[0].id,
    residentName: residents[0].name,
    facility: residentFacility(residents[0]),
    priority: "High",
    assignedRole: "cna",
    assignedUserId: cnaRecipientIds[0] ?? "u3",
    actionType: "Observe intake",
    instructions: "Track breakfast and fluid intake, note confusion, urine odor, and transfer tolerance during AM care.",
    dueTime: "By 10:00 AM",
    status: "in-progress",
    sourceScreen: "DON Situation",
    linkedThreadId: "t1",
    createdAt: "7:55 AM",
    updatedAt: "8:14 AM",
  },
  {
    id: "ar-3",
    residentId: residents[1].id,
    residentName: residents[1].name,
    facility: residentFacility(residents[1]),
    priority: "High",
    assignedRole: "provider",
    assignedUserId: providerRecipientIds[0] ?? "u4",
    actionType: "Review labs/imaging",
    instructions: "Review pending hip x-ray result and advise nursing on mobility restrictions after post-fall checks.",
    dueTime: "Before noon",
    status: "open",
    sourceScreen: "Provider Queue",
    createdAt: "8:10 AM",
    updatedAt: "8:10 AM",
  },
];

const initialHospitalEscalations: HospitalEscalation[] = [
  {
    id: "he-1",
    residentId: residents[1].id,
    residentName: residents[1].name,
    facility: residentFacility(residents[1]),
    urgency: "High",
    destination: "Local Emergency Department",
    reason: "Post-fall hip pain with imaging concern and transfer decline.",
    notes: "Care team to confirm transport readiness and family notification status.",
    followUpTime: "Today 11:15 AM",
    status: "sent-to-hospital",
    createdByRole: "don",
    linkedThreadId: "t4",
    createdAt: "8:18 AM",
  },
];

const initialScheduledHuddles: ScheduledHuddle[] = [
  {
    id: "sh-1",
    residentId: residents[0].id,
    residentName: residents[0].name,
    facility: residentFacility(residents[0]),
    eventType: "Care Huddle",
    primaryOwnerId: "u4",
    taggedUserIds: ["u1", "u7"],
    title: "Acute-change care huddle",
    scheduledDate: todayDateKey(),
    scheduledTime: "10:30",
    scheduledFor: "Today 10:30 AM",
    duration: "20 min",
    participantIds: ["u1", "u4", "u7"],
    callMode: "video-call",
    agenda: "Review confusion, intake decline, UA status, and next provider orders.",
    status: "scheduled",
    threadId: "t1",
    createdAt: "8:05 AM",
  },
  {
    id: "sh-2",
    residentId: residents[1].id,
    residentName: residents[1].name,
    facility: residentFacility(residents[1]),
    eventType: "Fall Review",
    primaryOwnerId: "u7",
    taggedUserIds: ["u1", "u2"],
    title: "Post-fall follow-up huddle",
    scheduledDate: todayDateKey(),
    scheduledTime: "13:00",
    scheduledFor: "Today 1:00 PM",
    duration: "15 min",
    participantIds: ["u1", "u2", "u7"],
    callMode: "voice-call",
    agenda: "Align on x-ray status, transfer safety, and mobility restrictions.",
    status: "scheduled",
    threadId: "t4",
    createdAt: "7:40 AM",
  },
];

const initialScheduleFollowUps: ScheduleFollowUp[] = [
  {
    id: "fu-1",
    residentId: residents[0].id,
    residentName: residents[0].name,
    facility: residentFacility(residents[0]),
    eventType: "Lab Follow-up",
    primaryOwnerId: "u1",
    taggedUserIds: ["u4", "u3"],
    title: "Hydration and UA result follow-up",
    scheduledDate: todayDateKey(),
    scheduledTime: "15:30",
    details: "Confirm intake trend, UA status, and whether provider orders changed.",
    status: "scheduled",
    createdAt: "8:30 AM",
  },
  {
    id: "fu-2",
    residentId: residents[3].id,
    residentName: residents[3].name,
    facility: residentFacility(residents[3]),
    eventType: "Vitals Check",
    primaryOwnerId: "u9",
    taggedUserIds: ["u1"],
    title: "Blood sugar trend review",
    scheduledDate: offsetDateKey(1),
    scheduledTime: "09:00",
    details: "Review fasting BG after dietary reminders and family teaching.",
    status: "scheduled",
    createdAt: "Yesterday",
  },
];

const initialClinicalOrders: ClinicalOrder[] = [
  {
    id: "co-1",
    residentId: residents[0].id,
    residentName: residents[0].name,
    facility: residentFacility(residents[0]),
    eventType: "Lab",
    primaryOwnerId: "u4",
    taggedUserIds: ["u1"],
    orderType: "Lab",
    priority: "Stat",
    requestedDate: todayDateKey(),
    requestedTime: "10:00",
    indication: "Acute confusion, low-grade fever, tachycardia, and urine odor reported.",
    details: "UA with culture and sensitivity if indicated.",
    instructions: "Route result to provider and notify nursing if fever or mental status worsens.",
    destination: "Otangeles Notes+",
    status: "ordered",
    linkedThreadId: "t1",
    createdAt: "8:44 AM",
  },
  {
    id: "co-2",
    residentId: residents[1].id,
    residentName: residents[1].name,
    facility: residentFacility(residents[1]),
    eventType: "Imaging",
    primaryOwnerId: "u7",
    taggedUserIds: ["u2"],
    orderType: "Imaging",
    priority: "High",
    requestedDate: todayDateKey(),
    requestedTime: "11:30",
    indication: "Post-fall hip pain and transfer difficulty.",
    details: "Review hip x-ray result and confirm mobility restrictions.",
    instructions: "Update nursing plan after imaging review.",
    destination: "Otangeles Notes+",
    status: "in-progress",
    linkedThreadId: "t4",
    createdAt: "8:10 AM",
  },
];

const initialProfileStates: Record<RoleKey, ProfileState> = {
  don: profileStateFromStaff(careUserById(defaultLoginUserIds.don), "don"),
  provider: profileStateFromStaff(careUserById(defaultLoginUserIds.provider), "provider"),
  cna: profileStateFromStaff(careUserById(defaultLoginUserIds.cna), "cna"),
};

const initialActiveSessions: Record<RoleKey, ActiveSession[]> = {
  don: [
    { id: "don-session-1", device: "Chrome on Desktop", location: "Elkhart, IN", lastActive: "Current", current: true },
    { id: "don-session-2", device: "Safari on iPad", location: "Merrillville, IN", lastActive: "Yesterday" },
  ],
  provider: [
    { id: "provider-session-1", device: "Chrome on Desktop", location: "Hobart, IN", lastActive: "Current", current: true },
    { id: "provider-session-2", device: "iPhone", location: "Niles, MI", lastActive: "2 hours ago" },
  ],
  cna: [
    { id: "cna-session-1", device: "Chrome on Workstation", location: "Elkhart, IN", lastActive: "Current", current: true },
  ],
};

const activeView = ref<ViewName>("situation");
const selectedRole = ref<RoleKey>("don");
const selectedLoginUserIds = ref<Record<RoleKey, string>>({ ...defaultLoginUserIds });
const selectedFacility = ref<FacilitySelection>(initialProfileStates.don.defaultFacility);
const isAuthenticated = ref(false);
const activeSituationId = ref<string | null>(priorityResidents[0]?.id ?? null);
const selectedResidentId = ref<string | null>(null);
const residentTab = ref<ResidentTab>("situation");
const residentContextTab = ref<ResidentContextTab>("updates");
const openSituationAccordion = ref<SituationAccordionKey>("facility-focus");
const openProviderHomeAccordion = ref<ProviderHomeAccordionKey>("review-decide");
const residentChat = ref<Resident["talk"]>([]);
const residentDraft = ref("");
const openClarify = ref<number | null>(null);
const showDelegate = ref(false);
const assignedNurse = ref<{ name: string; time: string } | null>(null);
const workingCareSteps = ref<Resident["careSteps"] | null>(null);

const messageTab = ref<MessageTab>("rooms");
const selectedUserIds = ref<string[]>([]);
const selectedThreadId = ref<string | null>(null);
const createdThreads = ref<Thread[]>([]);
const threadMessages = ref<ThreadMessage[]>([]);
const threadDraft = ref("");
const threadMenuOpen = ref(false);
const threadRenameModalOpen = ref(false);
const threadRenameDraft = ref("");
const threadUtilityModal = ref<ThreadUtilityMode | null>(null);
const threadUtilityMessageId = ref<string | null>(null);
const messageSearchOpen = ref(false);
const messageSearchQuery = ref("");
const residentSearchOpen = ref(false);
const residentSearchQuery = ref("");
const providerResidentSearchOpen = ref(false);
const providerResidentSearchQuery = ref("");
const cnaResidentSearchOpen = ref(false);
const cnaResidentSearchQuery = ref("");
const scheduleView = ref<ScheduleView>("list");
const providerNoteDraft = ref("");
const providerNotesState = ref<ProviderNote[]>([...initialProviderNotes]);

const ENCOUNTER_STORAGE_KEY = "sage.mock.encounters.v4";
const SIGNATURE_STORAGE_KEY = "sage.mock.provider-signatures.v1";

function cloneInitialProviderVisits() {
  return structuredClone(initialProviderVisits);
}

function loadPersistedProviderVisits() {
  if (typeof window === "undefined") {
    return cloneInitialProviderVisits();
  }
  try {
    const raw = window.localStorage.getItem(ENCOUNTER_STORAGE_KEY);
    if (!raw) {
      return cloneInitialProviderVisits();
    }
    const parsed = JSON.parse(raw) as { version?: number; visits?: ProviderVisit[] };
    if (parsed.version !== 4 || !Array.isArray(parsed.visits)) {
      return cloneInitialProviderVisits();
    }
    return parsed.visits;
  } catch {
    return cloneInitialProviderVisits();
  }
}

function loadPersistedProviderSignatures() {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as { version?: number; signatures?: Record<string, ProviderSignature> };
    return parsed.version === 1 && parsed.signatures && typeof parsed.signatures === "object"
      ? parsed.signatures
      : {};
  } catch {
    return {};
  }
}

const providerVisitsState = ref<ProviderVisit[]>(
  loadPersistedProviderVisits(),
);
const providerSignatures = ref<Record<string, ProviderSignature>>(loadPersistedProviderSignatures());
const activeVisitId = ref<string | null>(null);
const activeReviewVisitId = ref<string | null>(null);
const visitNoteMode = ref<VisitNoteMode>("text");
const visitRecordingActive = ref(false);
const visitRecordingSeconds = ref(0);
const visitElapsedSeconds = ref(0);
const visitStopConfirmOpen = ref(false);
const startEncounterResidentId = ref<string | null>(null);
const startEncounterDraft = ref<StartEncounterModalDraft>({
  visitType: "Follow-Up",
});
const expandedProviderNoteId = ref<string | null>(null);
const encounterModalNoteId = ref<string | null>(null);
const encounterModalDraft = ref<EncounterModalDraft>({
  residentName: "",
  visitType: "Follow-Up",
  notes: "",
});
const deleteProviderNoteId = ref<string | null>(null);
const providerRecordingActive = ref(false);
const providerRecordingSeconds = ref(0);
const providerTranscript = ref("");
const revisionModalSectionId = ref<string | null>(null);
const revisionModalThreadId = ref<string | null>(null);
const revisionModalText = ref("");
const revisionReplyDrafts = ref<Record<string, string>>({});
const signatureSetupPromptOpen = ref(false);
const signEncounterConfirmOpen = ref(false);
const signatureMode = ref<SignatureMethod>("draw");
const signatureTypedName = ref("");
const signatureUploadPreview = ref("");
const signatureCanvas = ref<HTMLCanvasElement | null>(null);
const signatureCanvasDirty = ref(false);
const signatureDrawing = ref(false);
const signatureError = ref("");
const signatureSavedMessage = ref("");

const selectedCnaAssignmentId = ref(cnaAssignments[0]?.id ?? "");
const cnaDebriefDraft = ref("");
const cnaRecordingActive = ref(false);
const cnaRecordingSeconds = ref(0);
const cnaDebriefs = ref<CnaDebriefEntry[]>(
  cnaAssignments.map((assignment) => ({
    assignmentId: assignment.id,
    residentId: assignment.resident.id,
    status: "not-started",
    transcript: "",
    flaggedConcern: "",
  })),
);

let providerRecordingTimer: number | null = null;
let cnaRecordingTimer: number | null = null;
let visitRecordingTimer: number | null = null;
let visitElapsedTimer: number | null = null;

const profileStates = ref<Record<RoleKey, ProfileState>>({
  don: { ...initialProfileStates.don, assignedFacilities: [...initialProfileStates.don.assignedFacilities] },
  provider: { ...initialProfileStates.provider, assignedFacilities: [...initialProfileStates.provider.assignedFacilities] },
  cna: { ...initialProfileStates.cna, assignedFacilities: [...initialProfileStates.cna.assignedFacilities] },
});
const activeSessions = ref<Record<RoleKey, ActiveSession[]>>({
  don: [...initialActiveSessions.don],
  provider: [...initialActiveSessions.provider],
  cna: [...initialActiveSessions.cna],
});
const profileModal = ref<ProfileModalKey | null>(null);
const selectedFeatureId = ref("");
const showSignOutModal = ref(false);
const profileMenuOpen = ref(false);
const notificationMenuOpen = ref(false);
const readNotificationIds = ref<string[]>([]);
const residentActionMenuOpen = ref(false);
const passwordDraft = ref({ current: "", next: "", confirm: "" });
const profileChangesAppliedAt = ref<Record<RoleKey, string>>({
  don: "Not applied this session",
  provider: "Not applied this session",
  cna: "Not applied this session",
});
const activeSettingsPanel = ref<ProfileModalKey>("profile");
const actionRequests = ref<ActionRequest[]>(initialActionRequests.map((action) => ({ ...action })));
const hospitalEscalations = ref<HospitalEscalation[]>(
  initialHospitalEscalations.map((escalation) => ({ ...escalation })),
);
const scheduledHuddles = ref<ScheduledHuddle[]>(
  initialScheduledHuddles.map((huddle) => ({
    ...huddle,
    participantIds: [...huddle.participantIds],
  })),
);
const scheduleFollowUps = ref<ScheduleFollowUp[]>(
  initialScheduleFollowUps.map((followUp) => ({ ...followUp })),
);
const clinicalOrders = ref<ClinicalOrder[]>(
  initialClinicalOrders.map((order) => ({ ...order })),
);

watch(
  providerVisitsState,
  (visits) => {
    try {
      window.localStorage.setItem(ENCOUNTER_STORAGE_KEY, JSON.stringify({ version: 4, visits }));
    } catch {
      // Local persistence is best-effort in this frontend-only prototype.
    }
  },
  { deep: true },
);

watch(
  providerSignatures,
  (signatures) => {
    try {
      window.localStorage.setItem(SIGNATURE_STORAGE_KEY, JSON.stringify({ version: 1, signatures }));
    } catch {
      signatureError.value = "The signature could not be saved in this browser. Try a smaller image.";
    }
  },
  { deep: true },
);

function fetchDailyEncountersFromNotesPlus() {
  // TODO(NOTES_PLUS): Replace the local encounter fixtures with the provider's Daily Visit List API response.
  return providerVisitsState.value.filter((encounter) => encounter.scheduledDate === todayDateKey());
}

function syncEndedEncounterToNotesPlus(encounter: ProviderVisit) {
  // TODO(NOTES_PLUS): POST the provider's text/voice note and linked orders, then use the returned Encounter identifier.
  encounter.notesPlusSyncStatus = "synced";
  encounter.notesPlusSyncedAt = currentTimeLabel();
}

function receiveEncounterStatusFromNotesPlus(encounter: ProviderVisit, status: ProviderEncounterStatus) {
  // TODO(NOTES_PLUS): Replace this mock transition with inbound webhook/polling updates from Otangeles Notes+.
  encounter.status = status;
}

function returnEncounterRevisionToNotesPlus(encounter: ProviderVisit) {
  // TODO(NOTES_PLUS): Send open section revision threads and update the remote Encounter to Revision.
  receiveEncounterStatusFromNotesPlus(encounter, "revision");
}

function submitSignedEncounterToNotesPlus(encounter: ProviderVisit) {
  // TODO(NOTES_PLUS): Send the signed document snapshot and update the remote Encounter to Submitted to Billing.
  receiveEncounterStatusFromNotesPlus(encounter, "submitted-to-billing");
}

function scheduledVisitTypeForOpportunityCategory(category: string): VisitType {
  const normalized = category.toLowerCase();
  if (normalized.includes("acute") || normalized.includes("staff concern")) {
    return "Acute";
  }
  if (normalized.includes("fall")) {
    return "Telemed - Fall Assessment";
  }
  if (normalized.includes("post-antibiotic") || normalized.includes("follow-up") || normalized.includes("trend")) {
    return "Follow-Up";
  }
  return "Follow-Up";
}

const residentDailyInputs = computed<ResidentDailyInput[]>(() => [
  ...cnaDebriefs.value
    .filter((entry) => entry.transcript.trim())
    .map((entry) => ({
      id: `daily-cna-${entry.assignmentId}`,
      residentId: entry.residentId,
      source: "Staff input" as const,
      label: "CNA debrief",
      detail: entry.flaggedConcern ? `${entry.transcript} ${entry.flaggedConcern}` : entry.transcript,
      capturedAt: entry.capturedAt ?? "Current shift",
      severity: entry.status === "flagged" ? "high" as const : "watch" as const,
    })),
  ...providerNotesState.value.map((note) => ({
    id: `daily-note-${note.id}`,
    residentId: note.residentId,
    source: "Provider input" as const,
    label: note.source === "voice" ? "Provider voice note" : "Provider note",
    detail: note.body,
    capturedAt: note.createdAt,
    severity: "watch" as const,
  })),
  ...clinicalOrders.value.map((order) => ({
    id: `daily-order-${order.id}`,
    residentId: order.residentId,
    source: "Provider input" as const,
    label: `${order.orderType} order`,
    detail: `${order.details}${order.instructions ? ` ${order.instructions}` : ""}`,
    capturedAt: formatDateTimeLabel(order.requestedDate, order.requestedTime),
    severity: order.status === "flagged" ? "high" as const : "watch" as const,
  })),
  ...actionRequests.value
    .filter((action) => action.statusNote?.trim() || action.status === "flagged")
    .map((action) => ({
      id: `daily-action-${action.id}`,
      residentId: action.residentId,
      source: action.assignedRole === "provider" ? "Provider input" as const : "Staff input" as const,
      label: `${action.actionType} ${actionStatusLabel(action.status)}`,
      detail: action.statusNote?.trim() || action.instructions,
      capturedAt: action.statusChangedAt ?? action.updatedAt,
      severity: action.status === "flagged" ? "high" as const : "normal" as const,
    })),
]);
const providerOpportunities = computed<ProviderOpportunity[]>(() =>
  buildResidentIntelligence({
    residents,
    facilityForResident: residentFacility,
    dailyInputs: residentDailyInputs.value,
  })
    .map((opportunity) => {
      const resident = residents.find((entry) => entry.id === opportunity.residentId);
      return resident
        ? {
            ...opportunity,
            resident,
            visitType: scheduledVisitTypeForOpportunityCategory(opportunity.category),
            facility: opportunity.facility as Facility,
          }
        : null;
    })
    .filter((opportunity): opportunity is ProviderOpportunity => Boolean(opportunity)),
);
const taggedMessageContext = ref<TaggedMessageContext | null>(null);
const actionModalSource = ref<string | null>(null);
const actionDraft = ref<ActionDraft>({
  residentId: residents[0]?.id ?? "",
  assignedRole: "provider",
  assignedUserId: providerRecipientIds[0] ?? "u4",
  actionType: providerActionTypes[0],
  priority: "High",
  dueTime: "Now",
  instructions: "",
  createThread: true,
  sourceOpportunityId: undefined,
});
const actionStatusDraft = ref({
  actionId: "",
  status: "completed" as ActionStatusUpdateTarget,
  note: "",
});
const expandedSections = ref<Record<string, boolean>>({});
const escalationModalResidentId = ref<string | null>(null);
const escalationDraft = ref({
  urgency: "High" as ActionPriority,
  destination: "Local Emergency Department",
  reason: "",
  notes: "",
  followUpTime: "Today 1:00 PM",
  notifyTeam: true,
});
const activeScheduleMonth = ref(startOfMonth(new Date()));
const selectedScheduleDateKey = ref<string | null>(null);
const scheduleModalOpen = ref(false);
const editingClinicalOrderId = ref<string | null>(null);
const scheduleResidentSearchQuery = ref("");
const scheduleStaffSearchQuery = ref("");
const scheduleDraft = ref<ScheduleDraft>({
  type: "huddle",
  eventType: scheduleEventTypes.huddle[0],
  residentId: residents[0]?.id ?? "",
  title: "",
  date: todayDateKey(),
  time: "14:00",
  duration: "20 min",
  details: "",
  participantIds: [],
  primaryOwnerId: defaultLoginUserIds.don,
  taggedUserIds: [],
  callMode: "video-call",
  orderType: "Lab",
  priority: "High",
  indication: "",
  orderDetails: "",
  instructions: "",
});

function loginUsersForRole(role: RoleKey) {
  return users.filter((user) => staffLoginRole(user) === role);
}

const loginStaffOptions = computed(() => loginUsersForRole(selectedRole.value));
const selectedLoginUserIdModel = computed({
  get: () => selectedLoginUserIds.value[selectedRole.value],
  set: (userId: string) => setSelectedLoginUser(userId),
});
const activeStaffUser = computed(
  () =>
    careUserById(selectedLoginUserIds.value[selectedRole.value]) ??
    loginStaffOptions.value[0] ??
    providerUser,
);
const activeRoleMetric = computed(() => {
  if (selectedRole.value === "provider") {
    return {
      metricValue: String(filteredProviderOpportunities.value.length),
      metricLabel: "generated opportunities",
    };
  }
  if (selectedRole.value === "cna") {
    return {
      metricValue: String(filteredCnaAssignments.value.length),
      metricLabel: "assigned residents",
    };
  }
  return {
    metricValue: String(filteredPriorityResidents.value.length),
    metricLabel: "active watches",
  };
});
const activeRole = computed<RoleProfile>(() => ({
  ...roleProfiles[selectedRole.value],
  ...activeRoleMetric.value,
  name: activeStaffUser.value.name,
  role: normalizeSystemRole(activeStaffUser.value.role),
  image: activeStaffUser.value.image,
}));
const activeProfile = computed(() => profileStates.value[selectedRole.value]);
const navItems = computed(() => roleNavItems[selectedRole.value]);
const appUser = computed(() => activeRole.value);
const facilityOptions = computed<FacilitySelection[]>(() => {
  const assigned = activeProfile.value.assignedFacilities.length
    ? activeProfile.value.assignedFacilities
    : [facilities[0]];
  return selectedRole.value === "cna" ? assigned : ["all", ...assigned];
});
const defaultFacilityLabel = computed(() =>
  activeProfile.value.defaultFacility === "all" ? "All Facilities" : activeProfile.value.defaultFacility,
);
const filteredResidents = computed(() =>
  residents.filter(
    (resident) => selectedFacility.value === "all" || residentFacility(resident) === selectedFacility.value,
  ),
);
const searchedResidents = computed(() =>
  filteredResidents.value.filter((resident) => residentMatchesSearch(resident, residentSearchQuery.value)),
);
const filteredPriorityResidents = computed(() =>
  priorityResidents.filter(
    (resident) => selectedFacility.value === "all" || residentFacility(resident) === selectedFacility.value,
  ),
);
const filteredProviderOpportunities = computed(() =>
  providerOpportunities.value.filter(
    (opportunity) => selectedFacility.value === "all" || opportunity.facility === selectedFacility.value,
  ),
);
const facilityIntelligenceSummaries = computed<FacilityIntelligenceSummary[]>(() =>
  facilities
    .filter((facility) => activeProfile.value.assignedFacilities.includes(facility))
    .map((facility) => {
      const facilityResidents = residents.filter((resident) => residentFacility(resident) === facility);
      const facilityResidentIds = new Set(facilityResidents.map((resident) => resident.id));
      const notesPlusEvents = mockNotesPlusEvents.filter((event) => facilityResidentIds.has(event.residentId));
      const dailyInputs = residentDailyInputs.value.filter((input) => facilityResidentIds.has(input.residentId));
      const staffInputs = dailyInputs.filter((input) => input.source === "Staff input");
      const providerInputs = dailyInputs.filter((input) => input.source === "Provider input");
      const coveredResidentIds = new Set([
        ...notesPlusEvents.map((event) => event.residentId),
        ...dailyInputs.map((input) => input.residentId),
      ]);
      const opportunities = providerOpportunities.value.filter((opportunity) => opportunity.facility === facility);
      const readinessScore = facilityResidents.length
        ? Math.round((coveredResidentIds.size / facilityResidents.length) * 100)
        : 0;
      const unassignedHighRisk = opportunities.filter(
        (opportunity) =>
          (opportunity.urgency === "urgent" || opportunity.urgency === "high") &&
          !actionByOpportunityId.value.has(opportunity.id),
      ).length;
      const inputGaps = [
        ...(readinessScore < 35 ? ["Otangeles Notes+ source coverage is thin for this facility"] : []),
        ...(staffInputs.length === 0 ? ["No CNA/staff inputs captured yet"] : []),
        ...(providerInputs.length === 0 ? ["No provider inputs captured yet"] : []),
        ...(unassignedHighRisk ? [`${unassignedHighRisk} high-risk prediction${unassignedHighRisk === 1 ? "" : "s"} still need assigned action`] : []),
      ];
      const sourceSet = new Set<IntelligenceSource>();
      opportunities.forEach((opportunity) => {
        opportunity.evidence.forEach((event) => sourceSet.add(event.source));
      });
      dailyInputs.forEach((input) => sourceSet.add(input.source));

      return {
        facility,
        total: opportunities.length,
        urgent: opportunities.filter((opportunity) => opportunity.urgency === "urgent").length,
        high: opportunities.filter((opportunity) => opportunity.urgency === "high").length,
        routine: opportunities.filter((opportunity) => opportunity.urgency === "routine").length,
        openActions: actionRequests.value.filter(
          (action) => action.facility === facility && action.status !== "completed",
        ).length,
        notesPlusEvents: notesPlusEvents.length,
        staffInputs: staffInputs.length,
        providerInputs: providerInputs.length,
        residentsCovered: coveredResidentIds.size,
        totalResidents: facilityResidents.length,
        readinessScore,
        inputGaps,
        sources: [...sourceSet],
        topOpportunity: opportunities[0] ?? null,
      };
    })
    .filter((summary) => summary.total > 0 || summary.openActions > 0)
    .sort((a, b) => b.urgent - a.urgent || b.high - a.high || b.total - a.total),
);
const filteredFacilityIntelligenceSummaries = computed(() =>
  facilityIntelligenceSummaries.value.filter(
    (summary) => selectedFacility.value === "all" || summary.facility === selectedFacility.value,
  ),
);
const actionByOpportunityId = computed(() => {
  const map = new Map<string, ActionRequest>();
  actionRequests.value.forEach((action) => {
    if (action.sourceOpportunityId && !map.has(action.sourceOpportunityId)) {
      map.set(action.sourceOpportunityId, action);
    }
  });
  return map;
});
const filteredProviderNotes = computed(() =>
  providerNotesState.value.filter((note) => {
    const resident = residents.find((entry) => entry.id === note.residentId);
    return !resident || selectedFacility.value === "all" || residentFacility(resident) === selectedFacility.value;
  }),
);
const activeProviderVisit = computed(() =>
  activeVisitId.value
    ? providerVisitsState.value.find((visit) => visit.id === activeVisitId.value) ?? null
    : null,
);
const activeReviewEncounter = computed(() =>
  activeReviewVisitId.value
    ? providerVisitsState.value.find((visit) => visit.id === activeReviewVisitId.value) ?? null
    : null,
);
const activeReviewResident = computed(() =>
  activeReviewEncounter.value
    ? residents.find((resident) => resident.id === activeReviewEncounter.value?.residentId) ?? null
    : null,
);
const activeReviewOpenThreads = computed(() =>
  activeReviewEncounter.value?.sections.flatMap((section) =>
    section.revisionThreads.filter((thread) => thread.status === "open"),
  ) ?? [],
);
const activeReviewHasOpenRevisions = computed(() => activeReviewOpenThreads.value.length > 0);
const activeReviewAllVerified = computed(() =>
  Boolean(activeReviewEncounter.value?.sections.length) &&
  activeReviewEncounter.value!.sections.every((section) => section.verified),
);
const currentProviderSignature = computed(() => providerSignatures.value[activeStaffUser.value.id] ?? null);
function encounterHasClinicalVisitMerit(encounter: ProviderVisit) {
  return providerOpportunities.value.some(
    (opportunity) => opportunity.residentId === encounter.residentId,
  );
}
function encounterTimeSortValue(time: string) {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") {
    hours += 12;
  }
  return hours * 60 + Number(match[2]);
}
const dailyProviderEncounters = computed(() =>
  fetchDailyEncountersFromNotesPlus()
    .filter((encounter) =>
      encounter.scheduledDate === todayDateKey() &&
      (encounter.status === "scheduled" || encounter.status === "provider-in-progress") &&
      encounter.providerUserId === activeStaffUser.value.id &&
      encounterHasClinicalVisitMerit(encounter),
    )
    .filter((encounter) => {
      const resident = residents.find((entry) => entry.id === encounter.residentId);
      return !resident || selectedFacility.value === "all" || residentFacility(resident) === selectedFacility.value;
    })
    .slice()
    .sort((a, b) => encounterTimeSortValue(a.scheduledTime) - encounterTimeSortValue(b.scheduledTime)),
);
const revisionModalSection = computed(() =>
  revisionModalSectionId.value
    ? activeReviewEncounter.value?.sections.find((section) => section.id === revisionModalSectionId.value) ?? null
    : null,
);
const activeVisitResident = computed(() =>
  activeProviderVisit.value
    ? residents.find((resident) => resident.id === activeProviderVisit.value?.residentId) ?? null
    : null,
);
const activeVisitOrders = computed(() => {
  const visit = activeProviderVisit.value;
  if (!visit) {
    return [];
  }
  return visit.orderIds
    .map((orderId) => clinicalOrders.value.find((order) => order.id === orderId) ?? null)
    .filter((order): order is ClinicalOrder => Boolean(order));
});
const visitElapsedLabel = computed(() => {
  const seconds = visitElapsedSeconds.value;
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
});
const selectedResidentVisits = computed(() =>
  selectedResident.value
    ? providerVisitsState.value
        .filter((visit) => visit.residentId === selectedResident.value?.id)
        .slice()
        .sort((a, b) => b.startedAtMs - a.startedAtMs)
    : [],
);
const providerOpportunityByResidentId = computed(() => {
  const map = new Map<string, ProviderOpportunity>();
  filteredProviderOpportunities.value.forEach((opportunity) => {
    map.set(opportunity.resident.id, opportunity);
  });
  return map;
});
const searchedProviderResidents = computed(() =>
  filteredResidents.value.filter((resident) =>
    residentMatchesSearch(resident, providerResidentSearchQuery.value),
  ),
);
const filteredCnaAssignments = computed(() =>
  cnaAssignments.filter(
    (assignment) => selectedFacility.value === "all" || assignment.facility === selectedFacility.value,
  ),
);
const searchedCnaAssignments = computed(() =>
  filteredCnaAssignments.value.filter((assignment) =>
    residentMatchesSearch(assignment.resident, cnaResidentSearchQuery.value) ||
    assignment.reminder.toLowerCase().includes(cnaResidentSearchQuery.value.trim().toLowerCase()) ||
    assignment.watchFor.toLowerCase().includes(cnaResidentSearchQuery.value.trim().toLowerCase()) ||
    assignment.care.toLowerCase().includes(cnaResidentSearchQuery.value.trim().toLowerCase()),
  ),
);
const filteredCnaDebriefs = computed(() => {
  const visibleAssignmentIds = new Set(filteredCnaAssignments.value.map((assignment) => assignment.id));
  return cnaDebriefs.value.filter((entry) => visibleAssignmentIds.has(entry.assignmentId));
});
const filteredActionRequests = computed(() =>
  actionRequests.value.filter(
    (action) => selectedFacility.value === "all" || action.facility === selectedFacility.value,
  ),
);
const openActionRequests = computed(() =>
  filteredActionRequests.value.filter((action) => action.status !== "completed"),
);
const providerActionRequests = computed(() =>
  filteredActionRequests.value.filter((action) => action.assignedRole === "provider"),
);
const cnaActionRequests = computed(() =>
  filteredActionRequests.value.filter((action) => action.assignedRole === "cna"),
);
const selectedResidentActions = computed(() =>
  selectedResident.value
    ? actionRequests.value.filter((action) => action.residentId === selectedResident.value?.id)
    : [],
);
const selectedResidentOpenActionCount = computed(() =>
  selectedResidentActions.value.filter((action) => action.status !== "completed").length,
);
const visibleScheduleItems = computed(() => scheduleItemsForRole(selectedRole.value));
const visibleScheduleMonthItems = computed(() => {
  const year = activeScheduleMonth.value.getFullYear();
  const month = activeScheduleMonth.value.getMonth();
  return visibleScheduleItems.value.filter((item) => {
    const itemDate = dateFromKey(item.dateKey);
    return itemDate.getFullYear() === year && itemDate.getMonth() === month;
  });
});
const scheduleMonthLabel = computed(() =>
  activeScheduleMonth.value.toLocaleDateString([], { month: "long", year: "numeric" }),
);
const scheduleMonthCells = computed(() =>
  buildScheduleMonthCells(visibleScheduleItems.value, activeScheduleMonth.value),
);
const selectedScheduleDayItems = computed(() =>
  selectedScheduleDateKey.value
    ? visibleScheduleItems.value.filter((item) => item.dateKey === selectedScheduleDateKey.value)
    : [],
);
const scheduleEventTypeOptions = computed(() => scheduleEventTypes[scheduleDraft.value.type]);
const selectedResidentScheduleItems = computed(() =>
  selectedResident.value
    ? visibleScheduleItems.value.filter((item) => item.residentId === selectedResident.value?.id)
    : [],
);
const selectedResidentCareUpdates = computed(() =>
  selectedResident.value ? careUpdatesForResident(selectedResident.value.id).slice(0, 8) : [],
);
const selectedResidentTimelineEvents = computed(() =>
  selectedResident.value ? timelineEventsForResident(selectedResident.value) : [],
);
const donFocusItems = computed(() =>
  sortFocusItems([
    ...filteredFacilityIntelligenceSummaries.value
      .filter((summary) => summary.topOpportunity)
      .map((summary) => focusItemFromOpportunity(summary.topOpportunity!, {
        id: `facility-${summary.facility}`,
        title: `${summary.facility}: ${summary.topOpportunity!.resident.name}`,
        meta: `${summary.urgent} urgent · ${summary.high} high · ${summary.openActions} open actions`,
        rankBoost: 10,
      })),
    ...openActionRequests.value.map((action) => focusItemFromAction(action, "Review chart")),
    ...hospitalEscalations.value
      .filter((escalation) => selectedFacility.value === "all" || escalation.facility === selectedFacility.value)
      .map(focusItemFromEscalation),
  ]).slice(0, 6),
);
const providerFocusItems = computed(() =>
  sortFocusItems([
    ...filteredProviderOpportunities.value.map((opportunity) =>
      focusItemFromOpportunity(opportunity, { reviewActionLabel: "Review action" }),
    ),
    ...providerActionRequests.value
      .filter((action) => action.status !== "completed" && !action.sourceOpportunityId)
      .map((action) => focusItemFromAction(action, "Review")),
    ...clinicalOrders.value
      .filter((order) => order.status !== "completed" && order.status !== "cancelled")
      .filter((order) => selectedFacility.value === "all" || order.facility === selectedFacility.value)
      .map(focusItemFromOrder),
  ]).slice(0, 7),
);
const cnaFocusItems = computed(() =>
  sortFocusItems([
    ...cnaActionRequests.value
      .filter((action) => action.status !== "completed")
      .map((action) => focusItemFromAction(action, "View")),
    ...filteredCnaDebriefs.value
      .filter((entry) => entry.status !== "captured")
      .map(focusItemFromDebrief)
      .filter((item): item is FocusItem => Boolean(item)),
  ]).slice(0, 6),
);
const selectedResidentHasUrgentCareUpdates = computed(() =>
  selectedResidentCareUpdates.value.some((update) => update.tone === "danger" || update.status.toLowerCase().includes("flagged")),
);
const selectedResidentHasUrgentWork = computed(() =>
  selectedResidentActions.value.some((action) => action.status === "flagged" || action.priority === "Stat"),
);
const selectedResidentHasUrgentOrders = computed(() =>
  selectedResidentScheduleItems.value.some(
    (item) =>
      item.kind === "escalation" ||
      item.tone === "Stat" ||
      (item.kind === "order" && orderStatusForScheduleItem(item) === "flagged"),
  ),
);
const selectedResidentHasAbnormalVitals = computed(() =>
  Boolean(selectedResident.value?.situation.vitals.some((vital) => vital.isAbnormal)),
);
const scheduleResidentOptions = computed(() => {
  if (selectedRole.value === "cna") {
    return filteredCnaAssignments.value.map((assignment) => assignment.resident);
  }
  return filteredResidents.value;
});
const searchedScheduleResidentOptions = computed(() =>
  scheduleResidentOptions.value.filter(
    (resident) =>
      resident.id !== scheduleDraft.value.residentId &&
      residentMatchesSearch(resident, scheduleResidentSearchQuery.value),
  ),
);
const scheduleStaffOptions = computed(() => users);
const searchedScheduleStaffOptions = computed(() =>
  scheduleStaffOptions.value.filter((user) => staffMatchesSearch(user, scheduleStaffSearchQuery.value)),
);
const escalationModalResident = computed(() =>
  escalationModalResidentId.value
    ? residents.find((resident) => resident.id === escalationModalResidentId.value) ?? null
    : null,
);
const scheduleModalResident = computed(() =>
  residents.find((resident) => resident.id === scheduleDraft.value.residentId) ??
  scheduleResidentOptions.value[0] ??
  null,
);
const scheduleDraftCanSave = computed(() => {
  if (
    !scheduleDraft.value.residentId ||
    !scheduleDraft.value.title.trim() ||
    !scheduleDraft.value.date ||
    !scheduleDraft.value.eventType.trim() ||
    !scheduleDraft.value.primaryOwnerId
  ) {
    return false;
  }
  if (scheduleDraft.value.type === "huddle") {
    return Boolean(scheduleDraft.value.time);
  }
  if (scheduleDraft.value.type === "clinical-order") {
    return (
      selectedRole.value === "provider" &&
      Boolean(scheduleDraft.value.indication.trim()) &&
      Boolean(scheduleDraft.value.orderDetails.trim())
    );
  }
  return Boolean(scheduleDraft.value.details.trim());
});
const scheduleModalCopy = computed(() => {
  if (scheduleDraft.value.type === "clinical-order") {
    return {
      title: editingClinicalOrderId.value ? "Edit Clinical Order" : "New Clinical Order",
      description: "Add a provider order to the resident's shared care plan.",
    };
  }
  if (scheduleDraft.value.type === "follow-up") {
    return {
      title: "New Follow-up",
      description: "Schedule a resident follow-up reminder for the care team.",
    };
  }
  return {
    title: "Schedule Huddle",
    description: "Send a quick care-team invite into this resident's room.",
  };
});
const residentTabs = computed(() =>
  selectedRole.value === "provider"
    ? baseResidentTabs.map((tab) => (tab.key === "notes" ? { ...tab, label: "Encounter" } : tab))
    : baseResidentTabs.filter((tab) => tab.key !== "notes"),
);
const isMessagesView = computed(() =>
  ["messages", "provider-collaboration", "cna-messages"].includes(activeView.value),
);
const isProfileView = computed(() =>
  ["settings", "provider-profile", "cna-profile"].includes(activeView.value),
);
const messageHeader = computed(() => {
  if (selectedRole.value === "provider") {
    return {
      title: "Messages",
      subtitle: "Resident rooms, care-team huddles, and staff conversations",
    };
  }
  if (selectedRole.value === "cna") {
    return {
      title: "Messages",
      subtitle: "Resident rooms, charge nurse updates, and team communication",
    };
  }
  return {
    title: "Messages",
    subtitle: "Resident care-team rooms and staff conversations",
  };
});
const profileHeader = computed(() => "Settings");
const activeProfileDisplayName = computed(() =>
  [activeProfile.value.firstName, activeProfile.value.lastName].filter(Boolean).join(" ").trim(),
);
const otangelesAccount = computed(() => ({
  status: "Connected",
  workspace: "Otangeles Notes+",
  connectedAs: activeProfile.value.email,
  practiceAdmin: "Mara Whitlock",
  adminRole: "Practice Admin",
  adminContact: "mara.whitlock@otangelesnotes.local",
  syncScope: "Encounter drafts, clinical orders, huddle summaries, and escalation notes",
}));
const profileMenuRoleLabel = computed(() => {
  if (selectedRole.value === "provider") {
    if (/medical doctor|doctor|attending|medical director/i.test(activeStaffUser.value.role)) {
      return "Physician";
    }
    if (/nurse practitioner|np/i.test(activeStaffUser.value.role)) {
      return "Nurse Practitioner";
    }
    return activeStaffUser.value.role;
  }
  return activeProfile.value.systemRole;
});
const profileFeatures = computed(() => roleProfileFeatures[selectedRole.value]);
const selectedFeature = computed(
  () => profileFeatures.value.find((feature) => feature.id === selectedFeatureId.value) ?? profileFeatures.value[0],
);
const selectedResidentNotes = computed(() =>
  selectedResident.value
    ? providerNotesState.value.filter((note) => note.residentId === selectedResident.value?.id)
    : [],
);
const encounterModalNote = computed(() =>
  encounterModalNoteId.value
    ? providerNotesState.value.find((note) => note.id === encounterModalNoteId.value) ?? null
    : null,
);
const startEncounterResident = computed(() =>
  startEncounterResidentId.value
    ? residents.find((resident) => resident.id === startEncounterResidentId.value) ?? null
    : null,
);
const deleteProviderNoteTarget = computed(() =>
  deleteProviderNoteId.value
    ? providerNotesState.value.find((note) => note.id === deleteProviderNoteId.value) ?? null
    : null,
);
const currentDebriefAssignment = computed(
  () =>
    filteredCnaAssignments.value.find((assignment) => assignment.id === selectedCnaAssignmentId.value) ??
    filteredCnaAssignments.value[0] ??
    null,
);
const currentCnaDebrief = computed(
  () =>
    cnaDebriefs.value.find(
      (entry) => entry.assignmentId === currentDebriefAssignment.value?.id,
    ) ?? null,
);
const currentCnaActions = computed(() =>
  currentDebriefAssignment.value
    ? cnaActionRequests.value.filter((action) => action.residentId === currentDebriefAssignment.value?.resident.id)
    : [],
);
const capturedDebriefCount = computed(
  () => filteredCnaDebriefs.value.filter((entry) => entry.status === "captured" || entry.status === "flagged").length,
);
const allCnaDebriefsComplete = computed(
  () => filteredCnaAssignments.value.length > 0 && capturedDebriefCount.value === filteredCnaAssignments.value.length,
);

const activeSituationResident = computed(
  () =>
    filteredPriorityResidents.value.find((resident) => resident.id === activeSituationId.value) ??
    filteredPriorityResidents.value[0],
);

const selectedResident = computed(() =>
  selectedResidentId.value
    ? residents.find((resident) => resident.id === selectedResidentId.value) ?? null
    : null,
);
const selectedResidentOpportunity = computed(() =>
  selectedResident.value
    ? providerOpportunities.value.find((opportunity) => opportunity.resident.id === selectedResident.value?.id) ?? null
    : null,
);
const selectedResidentEvidenceGroups = computed<ResidentProfileEvidenceGroup[]>(() =>
  selectedResident.value
    ? residentProfileEvidenceGroups(selectedResident.value, selectedResidentOpportunity.value)
    : [],
);
const selectedResidentEvidenceSourceSummary = computed(() =>
  selectedResidentEvidenceGroups.value.length
    ? selectedResidentEvidenceGroups.value.map((group) => group.source).join(" + ")
    : "No source evidence",
);

const decliningCount = computed(
  () =>
    filteredPriorityResidents.value.filter((resident) =>
      resident.statusChips.includes("DECLINING"),
    ).length,
);
const watchfulCount = computed(() => filteredPriorityResidents.value.length - decliningCount.value);

const groupedResidents = computed(() =>
  (["WATCHFUL", "MONITORING", "STABLE"] as AcuityLevel[]).map((level) => ({
    level,
    residents: searchedResidents.value.filter((resident) => resident.acuity === level),
  })),
);

const groupedProviderResidents = computed(() =>
  (["WATCHFUL", "MONITORING", "STABLE"] as AcuityLevel[]).map((level) => ({
    level,
    residents: searchedProviderResidents.value.filter((resident) => resident.acuity === level),
  })),
);

const visibleThreads = computed(() =>
  [
    ...createdThreads.value,
    ...threads.filter((thread) => !createdThreads.value.some((created) => created.id === thread.id)),
  ].filter((thread) => validThreadForCurrentUser(thread)),
);

const residentRoomThreads = computed(() => {
  const existingRooms = new Map(
    visibleThreads.value
      .filter((thread) => thread.purpose === "resident-room" && Boolean(threadResident(thread)))
      .map((thread) => [thread.residentId, thread]),
  );

  return residents
    .filter((resident) => residentVisibleForRole(selectedRole.value, resident.id, residentFacility(resident)))
    .map((resident) => existingRooms.get(resident.id) ?? residentRoomTemplate(resident))
    .sort((a, b) => threadDisplayTitle(a).localeCompare(threadDisplayTitle(b)));
});

const searchedResidentRoomThreads = computed(() =>
  residentRoomThreads.value.filter((thread) => threadMatchesSearch(thread, messageSearchQuery.value)),
);

const peopleThreads = computed(() =>
  visibleThreads.value.filter((thread) => thread.purpose !== "resident-room"),
);

const searchedPeopleThreads = computed(() =>
  peopleThreads.value.filter((thread) => threadMatchesSearch(thread, messageSearchQuery.value)),
);

const messageNavUnreadCount = computed(() =>
  visibleThreads.value.reduce((total, thread) => total + thread.unread, 0),
);

const roleRelevantOpenActions = computed(() => {
  if (selectedRole.value === "provider") {
    return providerActionRequests.value.filter((action) => action.status !== "completed");
  }
  if (selectedRole.value === "cna") {
    return cnaActionRequests.value.filter((action) => action.status !== "completed");
  }
  return openActionRequests.value;
});

const roleVisibleEscalations = computed(() =>
  hospitalEscalations.value.filter(
    (escalation) => selectedFacility.value === "all" || escalation.facility === selectedFacility.value,
  ),
);

const headerNotifications = computed<HeaderNotification[]>(() => {
  const readIds = new Set(readNotificationIds.value);
  const openActions = roleRelevantOpenActions.value.slice(0, 3).map((action) => {
    const id = `action-${action.id}`;
    return {
      id,
      tone: action.priority === "Stat" ? "danger" : action.priority === "High" ? "warning" : "neutral",
      title: action.actionType,
      detail: `${action.residentName} · ${action.instructions}`,
      meta: action.dueTime,
      icon: action.status === "flagged" ? AlertTriangle : CheckCircle,
      target: { type: "action", action } as NotificationTarget,
      unread: !readIds.has(id),
    };
  });

  const todaysSchedule = visibleScheduleItems.value
    .filter((item) => item.dateKey === todayDateKey())
    .slice(0, 3)
    .map((item) => {
      const id = `schedule-${item.kind}-${item.id}`;
      return {
        id,
        tone: scheduleItemTone(item),
        title: item.title,
        detail: item.detail,
        meta: item.time,
        icon: item.kind === "huddle" ? Users : item.kind === "escalation" ? AlertTriangle : CalendarDays,
        target: { type: "schedule", item } as NotificationTarget,
        unread: !readIds.has(id),
      };
    });

  const providerAlerts =
    selectedRole.value === "provider"
      ? filteredProviderOpportunities.value.slice(0, 2).map((opportunity) => {
          const id = `opportunity-${opportunity.id}`;
          return {
            id,
            tone: opportunity.urgency === "urgent" ? "danger" : opportunity.urgency === "high" ? "warning" : "neutral",
            title: opportunity.resident.name,
            detail: opportunity.reason,
            meta: opportunity.category,
            icon: Activity,
            target: { type: "resident", residentId: opportunity.resident.id } as NotificationTarget,
            unread: !readIds.has(id),
          };
        })
      : [];

  const encounterReviewAlerts =
    selectedRole.value === "provider"
      ? providerVisitsState.value
          .filter(
            (encounter) =>
              encounter.providerUserId === activeStaffUser.value.id && encounter.status === "needs-review",
          )
          .slice(0, 3)
          .map((encounter) => {
            const id = `encounter-review-${encounter.id}`;
            return {
              id,
              tone: "warning",
              title: `${encounter.residentName} is ready for review`,
              detail: `${encounter.visitType} encounter completed by ${encounter.assignedScribe ?? "the assigned scribe"}.`,
              meta: "Needs Review",
              icon: FileText,
              target: {
                type: "encounter",
                encounterId: encounter.id,
                residentId: encounter.residentId,
              } as NotificationTarget,
              unread: !readIds.has(id),
            };
          })
      : [];

  const escalationAlerts =
    selectedRole.value === "don"
      ? roleVisibleEscalations.value.slice(0, 2).map((escalation) => {
          const id = `escalation-${escalation.id}`;
          return {
            id,
            tone: escalation.urgency === "Stat" ? "danger" : "warning",
            title: escalation.residentName,
            detail: escalation.reason,
            meta: escalation.status.replaceAll("-", " "),
            icon: AlertTriangle,
            target: { type: "escalation", residentId: escalation.residentId } as NotificationTarget,
            unread: !readIds.has(id),
          };
        })
      : [];

  return [...encounterReviewAlerts, ...providerAlerts, ...escalationAlerts, ...openActions, ...todaysSchedule].slice(0, 8);
});

const headerNotificationCount = computed(() => headerNotifications.value.filter((notification) => notification.unread).length);

function isMessagesNavView(view: ViewName) {
  return view === "messages" || view === "provider-collaboration" || view === "cna-messages";
}

function navBadgeCount(view: ViewName) {
  return isMessagesNavView(view) ? messageNavUnreadCount.value : 0;
}

const selectedThread = computed<Thread | null>(() => {
  if (!selectedThreadId.value) {
    return null;
  }

  const existingThread = visibleThreads.value.find((entry) => entry.id === selectedThreadId.value);
  if (existingThread) {
    return { ...existingThread, messages: threadMessages.value };
  }

  if (selectedThreadId.value.startsWith("dm-")) {
    const userId = selectedThreadId.value.slice(3);
    const user = users.find((entry) => entry.id === userId);
    if (!user) {
      return null;
    }

    return {
      id: selectedThreadId.value,
      kind: "dm",
      title: user.name,
      members: uniqueIds([activeStaffUser.value.id, user.id]),
      purpose: "direct",
      lastMessage: "",
      lastTs: "now",
      unread: 0,
      messages: threadMessages.value,
    };
  }

  return null;
});

function normalizeActorId(userId: string) {
  return userId === "me" ? defaultLoginUserIds.don : userId;
}

function isCurrentUser(authorId: string) {
  return normalizeActorId(authorId) === activeStaffUser.value.id;
}

function directThreadPeer(thread: Thread) {
  if (thread.kind !== "dm") {
    return null;
  }
  return thread.members
    .map((member) => normalizeActorId(member))
    .find((member) => member !== activeStaffUser.value.id) ?? null;
}

function threadResident(thread: Thread) {
  return thread.residentId
    ? residents.find((resident) => resident.id === thread.residentId) ?? null
    : null;
}

function threadDisplayTitle(thread: Thread) {
  const resident = threadResident(thread);
  if (resident && thread.purpose === "resident-room") {
    return `${resident.name} Care Team`;
  }
  if (thread.kind === "dm") {
    const peerId = directThreadPeer(thread);
    return peerId ? userName(peerId) : thread.title;
  }
  return thread.title;
}

function threadSubtitle(thread: Thread) {
  const resident = threadResident(thread);
  if (resident) {
    return `Room ${resident.room} · ${resident.latest}`;
  }
  if (thread.kind === "dm") {
    const peerId = directThreadPeer(thread);
    return peerId ? `${normalizeSystemRole(userRoleLabel(peerId))} · Direct message` : "Direct message";
  }
  return `${thread.members.length} members · Staff group`;
}

function threadParticipantSummary(thread: Thread) {
  const members = thread.members
    .map((member) => normalizeActorId(member))
    .filter((member, index, list) => list.indexOf(member) === index);
  const otherMembers = members.filter((member) => member !== activeStaffUser.value.id);
  const names = otherMembers.slice(0, 3).map((member) => userName(member));
  const extra = Math.max(0, otherMembers.length - names.length);
  return extra ? `${names.join(", ")} +${extra}` : names.join(", ");
}

function threadMatchesSearch(thread: Thread, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const resident = threadResident(thread);
  if (resident && residentMatchesSearch(resident, query)) {
    return true;
  }

  const memberDetails = thread.members.map((member) => {
    const userId = normalizeActorId(member);
    return `${userName(userId)} ${userRoleLabel(userId)}`;
  });

  return [
    threadDisplayTitle(thread),
    threadSubtitle(thread),
    threadParticipantSummary(thread),
    thread.lastMessage,
    ...memberDetails,
    ...thread.messages.map((message) => `${authorName(message.authorId)} ${message.text}`),
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function threadSearchMessagePreview(thread: Thread, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return null;
  }

  const matchingMessage = [...thread.messages]
    .reverse()
    .find((message) =>
      `${authorName(message.authorId)} ${message.text} ${message.ts}`.toLowerCase().includes(query),
    );

  return matchingMessage
    ? `Message match · ${authorName(matchingMessage.authorId)}: ${matchingMessage.text}`
    : null;
}

const threadUtilityResident = computed(() => {
  const thread = selectedThread.value;
  return thread ? threadResident(thread) : null;
});

const threadUtilityParticipantNames = computed(() => {
  const thread = selectedThread.value;
  if (!thread) {
    return [];
  }
  return thread.members
    .map((member) => normalizeActorId(member))
    .filter((member, index, list) => list.indexOf(member) === index)
    .map((member) => userName(member));
});

const threadUtilityLatestMessages = computed(() =>
  threadMessages.value.filter((message) => !message.kind).slice(-4),
);

const threadUtilityCallMessage = computed(() => {
  if (threadUtilityMessageId.value) {
    return threadMessages.value.find((message) => message.id === threadUtilityMessageId.value) ?? null;
  }
  return threadMessages.value.filter((message) => message.kind === "voice-call" || message.kind === "video-call").slice(-1)[0] ?? null;
});

const threadUtilityTitle = computed(() => {
  if (threadUtilityModal.value === "summary") {
    return "Thread Summary";
  }
  if (threadUtilityModal.value === "insight") {
    return "Thread Insight";
  }
  return "Call Transcription";
});

const threadUtilityIntro = computed(() => {
  const thread = selectedThread.value;
  if (!thread) {
    return "";
  }
  if (threadUtilityModal.value === "summary") {
    return `Current summary for ${threadDisplayTitle(thread)} based on the latest visible messages.`;
  }
  if (threadUtilityModal.value === "insight") {
    return `Care-team signal detected from ${threadDisplayTitle(thread)} and resident context.`;
  }
  const call = threadUtilityCallMessage.value;
  return call
    ? `${call.kind === "video-call" ? "Video" : "Voice"} call captured at ${call.ts}${call.duration ? ` for ${call.duration}` : ""}.`
    : "No call transcription is available for this thread yet.";
});

const threadSummaryPoints = computed(() => {
  const thread = selectedThread.value;
  if (!thread) {
    return [];
  }
  const resident = threadResident(thread);
  const latest = threadUtilityLatestMessages.value[threadUtilityLatestMessages.value.length - 1];
  const calls = threadMessages.value.filter((message) => message.kind === "voice-call" || message.kind === "video-call");
  return [
    `${threadDisplayTitle(thread)} includes ${thread.members.length} member${thread.members.length === 1 ? "" : "s"}${threadParticipantSummary(thread) ? `: ${threadParticipantSummary(thread)}` : ""}.`,
    resident
      ? `Resident context: Room ${resident.room}; ${resident.latest}.`
      : `Conversation context: ${thread.kind === "huddle" ? "staff group" : "direct message"}.`,
    latest ? `Latest written update: ${latest.text}` : "No written updates have been posted yet.",
    calls.length
      ? `${calls.length} call session${calls.length === 1 ? "" : "s"} logged in this thread.`
      : "No voice or video calls logged in this thread yet.",
  ];
});

const threadInsightPoints = computed(() => {
  const thread = selectedThread.value;
  if (!thread) {
    return [];
  }
  const resident = threadResident(thread);
  if (!resident) {
    return [
      "Most useful next step: convert the latest staff decision into an assigned action if ownership is unclear.",
      `Participants active in this thread: ${threadUtilityParticipantNames.value.join(", ") || "care team"}.`,
      "Keep care-team decisions in the group thread so follow-up is easier to audit.",
    ];
  }
  const abnormalVitals = resident.situation.vitals.filter((vital) => vital.isAbnormal || vital.isCritical);
  const focus = residentRoomFocus(resident);
  return [
    `${resident.name}'s active focus is ${focus}.`,
    abnormalVitals.length
      ? `Vitals needing visibility: ${abnormalVitals.map((vital) => `${vital.label} ${vital.current}`).join(", ")}.`
      : "Vitals are not currently flagged as abnormal.",
    resident.situation.concerns.length
      ? `Open concern status: ${resident.situation.concerns.map((concern) => `${concern.title} ${concern.status}`).join(", ")}.`
      : "No unresolved concern is listed for this resident right now.",
    `Recommended next step: keep updates in Room ${resident.room}'s care-team thread and confirm any provider-facing decision before shift handoff.`,
  ];
});

const threadTranscriptionLines = computed(() => {
  const call = threadUtilityCallMessage.value;
  const thread = selectedThread.value;
  if (!call || !thread) {
    return [];
  }
  const resident = threadResident(thread);
  const focus = resident ? residentRoomFocus(resident) : threadDisplayTitle(thread);
  return [
    `${authorName(call.authorId)} opened the ${call.kind === "video-call" ? "video" : "voice"} call at ${call.ts}.`,
    resident
      ? `Team reviewed ${resident.name} in Room ${resident.room}: ${resident.latest}.`
      : `Team reviewed the latest updates in ${threadDisplayTitle(thread)}.`,
    `Primary discussion point: ${focus}.`,
    resident
      ? `Follow-up: document changes in the resident room and route decisions to Otangeles Notes+ when provider orders are finalized.`
      : "Follow-up: capture owners for any decision that needs action after the call.",
  ];
});

function canRenameThread(thread: Thread) {
  return (
    thread.kind === "huddle" &&
    (thread.purpose === "resident-room" || thread.purpose === "staff-group")
  );
}

function validThreadForCurrentUser(thread: Thread) {
  const memberIds = thread.members.map((member) => normalizeActorId(member));
  const resident = threadResident(thread);
  if (resident) {
    return residentVisibleForRole(selectedRole.value, resident.id, residentFacility(resident));
  }
  if (thread.kind === "dm") {
    return memberIds.includes(activeStaffUser.value.id) && Boolean(directThreadPeer(thread));
  }
  return memberIds.includes(activeStaffUser.value.id);
}

function residentRoomThreadId(resident: Resident) {
  return (
    visibleThreads.value.find(
      (thread) => thread.purpose === "resident-room" && thread.residentId === resident.id,
    )?.id ?? `resident-thread-${resident.id}`
  );
}

function residentRoomCareTeamIds(resident: Resident) {
  const index = Number.parseInt(resident.id, 10) || 0;
  return {
    provider: providerRecipientIds[index % Math.max(providerRecipientIds.length, 1)] ?? providerRecipientIds[0] ?? "u4",
    charge: index % 2 === 0 ? "u2" : "u1",
    cna: index % 3 === 0 ? "u11" : "u3",
  };
}

function residentRoomMemberIds(resident: Resident) {
  const team = residentRoomCareTeamIds(resident);
  return uniqueIds([
    activeStaffUser.value.id,
    team.provider,
    team.charge,
    team.cna,
    "u15",
  ]);
}

function residentRoomFocus(resident: Resident) {
  return resident.situation.concerns[0]?.title ?? resident.latest;
}

function residentRoomVitalSummary(resident: Resident) {
  const vital = resident.situation.vitals.find((entry) => entry.isCritical || entry.isAbnormal) ?? resident.situation.vitals[0];
  if (!vital) {
    return "Vitals are at baseline";
  }
  return `${vital.label} ${vital.current}${vital.base ? `, baseline ${vital.base}` : ""}`;
}

function residentRoomConversation(resident: Resident): ThreadMessage[] {
  const team = residentRoomCareTeamIds(resident);
  const summarySentence = resident.situation.summary.split(".")[0] || resident.latest;
  const focus = residentRoomFocus(resident);
  const plan =
    resident.situation.concerns.length > 0
      ? `Plan: keep watching ${focus.toLowerCase()}, document response to care, and escalate if vitals or mentation change.`
      : "Plan: continue routine monitoring, document ADL response, and post any change from baseline here.";

  return [
    {
      id: `room-${resident.id}-m1`,
      authorId: team.charge,
      text: `Room ${resident.room} check-in: ${resident.latest}. Keeping this room current for nursing, provider, and scheduling updates.`,
      ts: "7:12 AM",
    },
    {
      id: `room-${resident.id}-m2`,
      authorId: team.cna,
      text: `Morning care update: ${summarySentence}. I will add intake, mobility, and comfort changes after the next round.`,
      ts: "7:28 AM",
    },
    {
      id: `room-${resident.id}-m3`,
      authorId: team.provider,
      text: `${residentRoomVitalSummary(resident)}. Please keep the trend visible here before the next provider review.`,
      ts: "7:46 AM",
    },
    {
      id: `room-${resident.id}-m4`,
      authorId: activeStaffUser.value.id,
      text: plan,
      ts: "8:05 AM",
    },
  ];
}

function residentRoomTemplate(resident: Resident): Thread {
  const messages = residentRoomConversation(resident);
  const lastMessage = messages[messages.length - 1];
  return {
    id: residentRoomThreadId(resident),
    kind: "huddle",
    purpose: "resident-room",
    residentId: resident.id,
    title: `${resident.name} Care Team`,
    members: residentRoomMemberIds(resident),
    lastMessage: `${authorName(lastMessage.authorId)}: ${lastMessage.text}`,
    lastTs: lastMessage.ts,
    unread: 0,
    messages,
  };
}

function residentRoomFor(resident: Resident) {
  const existingThread = visibleThreads.value.find(
    (thread) => thread.purpose === "resident-room" && thread.residentId === resident.id,
  );
  if (existingThread) {
    return existingThread;
  }

  const thread = residentRoomTemplate(resident);
  createLocalThread(thread);
  return thread;
}

const sortedUsers = computed(() => {
  const order = { online: 0, away: 1, offline: 2 };
  return users
    .filter((user) => user.id !== activeStaffUser.value.id)
    .slice()
    .sort((a, b) => order[a.presence] - order[b.presence]);
});
const searchedMessageUsers = computed(() =>
  sortedUsers.value.filter((user) => staffMatchesSearch(user, messageSearchQuery.value)),
);
const clinicalRecipients = computed(() =>
  users.filter((user) => clinicalRecipientIds.includes(user.id) && user.id !== activeStaffUser.value.id),
);
const taggedMessageOpportunity = computed(() =>
  taggedMessageContext.value
    ? providerOpportunities.value.find((opportunity) => opportunity.id === taggedMessageContext.value?.opportunityId) ?? null
    : null,
);
const taggedMessageResident = computed(() =>
  taggedMessageContext.value
    ? residents.find((resident) => resident.id === taggedMessageContext.value?.residentId) ?? null
    : null,
);
const actionModalResident = computed(() =>
  residents.find((resident) => resident.id === actionDraft.value.residentId) ?? filteredResidents.value[0] ?? residents[0],
);
const actionAssigneeOptions = computed(() =>
  actionDraft.value.assignedRole === "provider"
    ? users.filter((user) => providerRecipientIds.includes(user.id))
    : users.filter((user) => cnaRecipientIds.includes(user.id)),
);
const actionTypeOptions = computed(() =>
  actionDraft.value.assignedRole === "provider" ? providerActionTypes : cnaActionTypes,
);
const actionStatusModalAction = computed(() =>
  actionStatusDraft.value.actionId
    ? actionRequests.value.find((action) => action.id === actionStatusDraft.value.actionId) ?? null
    : null,
);
const actionStatusModalCopy = computed(() => {
  if (actionStatusDraft.value.status === "flagged") {
    return {
      title: "Report concern",
      description: "Share what needs nurse or provider review before this action is closed.",
      noteLabel: "What needs review?",
      placeholder: "Example: Resident refused care, pain increased, transfer felt unsafe...",
      submitLabel: "Report concern",
    };
  }

  return {
    title: "Complete care action",
    description: "Confirm the care action was completed and add context for the team if helpful.",
    noteLabel: "Add a quick note",
    placeholder: "Example: Fluids encouraged and tolerated, resident comfortable after repositioning...",
    submitLabel: "Complete care",
  };
});
const actionStatusCanSubmit = computed(
  () => actionStatusDraft.value.status === "completed" || Boolean(actionStatusDraft.value.note.trim()),
);

const roleSelectOptions = computed<SelectOption[]>(() =>
  Object.values(roleProfiles).map((role) => selectOption(role.key, role.label)),
);
const loginStaffSelectOptions = computed<SelectOption[]>(() =>
  loginStaffOptions.value.map((user) => selectOption(user.id, `${user.name} · ${normalizeSystemRole(user.role)}`)),
);
const facilitySelectOptions = computed<SelectOption[]>(() =>
  facilityOptions.value.map((facility) => selectOption(facility, facilityOptionLabel(facility))),
);
const roleFacilitySelectOptions = computed<SelectOption[]>(() =>
  roleFacilityOptions(selectedRole.value).map((facility) => selectOption(facility, facilityOptionLabel(facility))),
);
const visitTypeSelectOptions = computed<SelectOption[]>(() =>
  visitTypes.map((visitType) => selectOption(visitType)),
);
const appearanceSelectOptions: SelectOption[] = ["System", "Light", "Dark"].map((value) => selectOption(value));
const languageSelectOptions: SelectOption[] = ["English (US)", "Spanish"].map((value) => selectOption(value));
const prioritySelectOptions: SelectOption[] = ["Stat", "High", "Routine"].map((value) => selectOption(value));
const scheduleTypeSelectOptions = computed<SelectOption[]>(() => [
  selectOption("huddle", "Huddle"),
  selectOption("follow-up", "Follow-up"),
  ...(selectedRole.value === "provider" ? [selectOption("clinical-order", "Clinical Order")] : []),
]);
const scheduleEventSelectOptions = computed<SelectOption[]>(() =>
  scheduleEventTypeOptions.value.map((eventType) => selectOption(eventType)),
);
const callModeSelectOptions: SelectOption[] = [
  selectOption("voice-call", "Voice call"),
  selectOption("video-call", "Video call"),
];
const actionResidentSelectOptions = computed<SelectOption[]>(() =>
  filteredResidents.value.map((resident) => selectOption(resident.id, `${resident.name} · Room ${resident.room}`)),
);
const actionRoleSelectOptions: SelectOption[] = [
  selectOption("provider", "Provider"),
  selectOption("cna", "CNA"),
];
const actionAssigneeSelectOptions = computed<SelectOption[]>(() =>
  actionAssigneeOptions.value.map((user) => selectOption(user.id, `${user.name} · ${normalizeSystemRole(user.role)}`)),
);
const actionTypeSelectOptions = computed<SelectOption[]>(() =>
  actionTypeOptions.value.map((actionType) => selectOption(actionType)),
);

const aiSeed: AiMessage[] = [
  { id: "b1", kind: "briefing" },
  {
    id: "m1",
    kind: "text",
    from: "me",
    text: "What changed with Mary Lou overnight?",
  },
  {
    id: "m2",
    kind: "text",
    from: "sage",
    text: "Mary Lou demonstrated progressive confusion, worsening transfer dependence, and significantly reduced intake overnight compared to baseline.",
    bullets: [
      "increased lethargy",
      "poor oral intake",
      "delayed responses",
      "increased transfer assistance",
    ],
    footer:
      "Trajectory worsened between approximately 1:00 AM and 5:00 AM. Current concern is evolving dehydration with possible UTI-associated delirium.",
  },
  {
    id: "m3",
    kind: "text",
    from: "me",
    text: "Has the provider been contacted yet?",
  },
  {
    id: "m4",
    kind: "text",
    from: "sage",
    text: "Not yet. Focused nursing reassessment was completed at 7:18 AM.",
    bullets: [
      "temp 100.4, HR 104, BP 96/58",
      "UA collected, awaiting results",
      "provider escalation recommended",
    ],
    footer: "Would you like me to prepare a provider escalation summary?",
  },
];

const suggestedPrompts: SuggestedPrompt[] = [
  {
    id: "p1",
    label: "Prepare provider summary for Mary Lou",
    icon: FileText,
    response: {
      text: "Preparing NP escalation summary now.",
      bullets: [
        "worsening confusion",
        "intake decline",
        "transfer deterioration",
        "dehydration concern",
        "possible infection-related delirium",
      ],
      footer:
        "I will include trajectory evolution, overnight changes, current risks, unresolved concerns, and reassessment findings.",
    },
  },
  {
    id: "p2",
    label: "Show unresolved concerns across the facility",
    icon: AlertCircle,
    response: {
      text: "7 unresolved concerns are open across East and West Hall right now.",
      bullets: [
        "@Mary Lou Smith - UTI / delirium",
        "@Mary Lou Smith - tachycardia",
        "@Beatrice Holloway - atypical chest pain",
        "@Eduardo Salinas - poor PO intake",
        "@Walter Jefferson - falls risk",
      ],
      footer: "3 of these are trending worse since yesterday.",
    },
  },
  {
    id: "p3",
    label: "Which residents are worsening fastest?",
    icon: TrendingDown,
    response: {
      text: "Three residents show the steepest deterioration trajectory in the last 12 hours.",
      bullets: [
        "@Mary Lou Smith - cognition and intake declining",
        "@Beatrice Holloway - chest pain at rest",
        "@Eduardo Salinas - intake declining with softer BP",
      ],
      footer: "Mary Lou is the most time-sensitive.",
    },
  },
  {
    id: "p4",
    label: "Show active surveillance residents",
    icon: Eye,
    response: {
      text: "5 residents are under active surveillance this shift.",
      bullets: [
        "@Mary Lou Smith - q2h vitals, neuro checks",
        "@Walter Jefferson - post-fall monitoring",
        "@Hiroshi Tanaka - BG ac/hs",
        "@Solomon Kapoor - post-op day 3",
      ],
    },
  },
];

const aiMessages = ref<AiMessage[]>(aiSeed);
const usedPrompts = ref<string[]>([]);
const aiDraft = ref("");

const remainingPrompts = computed(() =>
  suggestedPrompts.filter((prompt) => !usedPrompts.value.includes(prompt.id)),
);
const providerSageMessages = computed(() =>
  aiMessages.value.filter((message) => message.kind !== "briefing"),
);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
});

function facilityOptionLabel(facility: FacilitySelection) {
  return facility === "all" ? "All Facilities" : facility;
}

function residentMatchesSearch(resident: Resident, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  return [
    resident.name,
    resident.room,
    residentFacility(resident),
    resident.acuity,
    resident.codeStatus,
    resident.latest,
    resident.situation.summary,
    resident.statusChips.join(" "),
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function staffMatchesSearch(user: CareUser, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  return [
    user.name,
    user.role,
    user.department,
    user.specialization,
    user.assignedFacilities?.join(" "),
    user.presence,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function roleFacilityOptions(role: RoleKey): FacilitySelection[] {
  const assigned = profileStates.value[role].assignedFacilities.length
    ? profileStates.value[role].assignedFacilities
    : [facilities[0]];
  return role === "cna" ? [...assigned] : ["all", ...assigned];
}

function defaultFacilityForRole(role: RoleKey) {
  const options = roleFacilityOptions(role);
  const preferred = profileStates.value[role].defaultFacility;
  return options.includes(preferred) ? preferred : options[0];
}

function syncProfileFromLoginUser(role: RoleKey) {
  const user = careUserById(selectedLoginUserIds.value[role]);
  profileStates.value[role] = profileStateFromStaff(user, role);
}

function ensureLoginUserForRole(role: RoleKey) {
  const options = loginUsersForRole(role);
  if (!options.some((user) => user.id === selectedLoginUserIds.value[role])) {
    selectedLoginUserIds.value[role] = options[0]?.id ?? defaultLoginUserIds[role];
  }
}

function setSelectedLoginUser(userId: string) {
  const validUser = loginStaffOptions.value.find((user) => user.id === userId) ?? loginStaffOptions.value[0];
  if (!validUser) {
    return;
  }
  selectedLoginUserIds.value[selectedRole.value] = validUser.id;
  syncProfileFromLoginUser(selectedRole.value);
  selectedFacility.value = defaultFacilityForRole(selectedRole.value);
}

function setSelectedFacility(facility: FacilitySelection | string) {
  closeFloatingMenus();
  const options = facilityOptions.value;
  const next = options.includes(facility as FacilitySelection)
    ? (facility as FacilitySelection)
    : options[0];
  selectedFacility.value = next;

  if (
    selectedResident.value &&
    next !== "all" &&
    residentFacility(selectedResident.value) !== next
  ) {
    closeResident();
  }

  const nextPriority =
    priorityResidents.find(
      (resident) => next === "all" || residentFacility(resident) === next,
    ) ?? null;
  activeSituationId.value = nextPriority?.id ?? null;

  const nextAssignment = cnaAssignments.find(
    (assignment) => next === "all" || assignment.facility === next,
  );
  selectedCnaAssignmentId.value = nextAssignment?.id ?? "";
}

function setDefaultFacility(facility: FacilitySelection | string) {
  const options = roleFacilityOptions(selectedRole.value);
  const next = options.includes(facility as FacilitySelection)
    ? (facility as FacilitySelection)
    : options[0];
  activeProfile.value.defaultFacility = next;
  setSelectedFacility(next);
}

function toggleAssignedFacility(facility: Facility) {
  const assigned = activeProfile.value.assignedFacilities;
  if (assigned.includes(facility)) {
    if (assigned.length === 1) {
      return;
    }
    activeProfile.value.assignedFacilities = assigned.filter((item) => item !== facility);
  } else {
    activeProfile.value.assignedFacilities = [...assigned, facility];
  }

  if (!roleFacilityOptions(selectedRole.value).includes(selectedFacility.value)) {
    setSelectedFacility(defaultFacilityForRole(selectedRole.value));
  }
  if (!roleFacilityOptions(selectedRole.value).includes(activeProfile.value.defaultFacility)) {
    activeProfile.value.defaultFacility = roleFacilityOptions(selectedRole.value)[0];
  }
}

function openProfileModal(key: ProfileModalKey, featureId = "") {
  selectedFeatureId.value = featureId;
  profileModal.value = key;
}

function openSettingsPanel(key: ProfileModalKey, featureId = "") {
  selectedFeatureId.value = featureId;
  activeSettingsPanel.value = key;
}

function closeProfileModal() {
  profileModal.value = null;
  passwordDraft.value = { current: "", next: "", confirm: "" };
}

function updatePassword() {
  if (!passwordDraft.value.next || passwordDraft.value.next !== passwordDraft.value.confirm) {
    return;
  }
  activeProfile.value.passwordUpdatedAt = currentTimeLabel();
  passwordDraft.value = { current: "", next: "", confirm: "" };
}

function applyProfileChanges() {
  profileChangesAppliedAt.value[selectedRole.value] = currentTimeLabel();
}

function revokeSession(sessionId: string) {
  activeSessions.value[selectedRole.value] = activeSessions.value[selectedRole.value].filter(
    (session) => session.id !== sessionId || session.current,
  );
}

function openExternalResource(label: string) {
  window.open(`https://otangelesnotes.example/${label.toLowerCase().replaceAll(" ", "-")}`, "_blank");
}

function userName(userId: string) {
  const normalizedUserId = normalizeActorId(userId);
  if (normalizedUserId === activeStaffUser.value.id) {
    return activeStaffUser.value.name;
  }
  return getUser(normalizedUserId)?.name ?? careUserById(normalizedUserId)?.name ?? "Care team";
}

function actionAssigneeName(action: ActionRequest) {
  return userName(action.assignedUserId);
}

function actionStatusLabel(status: ActionStatus) {
  return status.replace("-", " ");
}

function actionCareUpdateBody(action: ActionRequest) {
  const statusNote = action.statusNote?.trim();
  if (!statusNote) {
    return action.instructions;
  }

  const noteLabel = action.status === "flagged" ? "Concern reported" : "Latest update";
  return `${action.instructions} ${noteLabel}: ${statusNote}`;
}

function actionCareUpdateMeta(action: ActionRequest) {
  const changedBy = action.statusChangedById ? ` by ${userName(action.statusChangedById)}` : "";
  return `${actionAssigneeName(action)} · ${action.dueTime} · Updated ${action.statusChangedAt ?? action.updatedAt}${changedBy}`;
}

function focusRankForPriority(priority: string) {
  const normalized = priority.toLowerCase();
  if (normalized.includes("stat") || normalized.includes("urgent") || normalized.includes("danger")) {
    return 100;
  }
  if (normalized.includes("high") || normalized.includes("flagged") || normalized.includes("declining")) {
    return 80;
  }
  if (normalized.includes("open") || normalized.includes("progress") || normalized.includes("watch")) {
    return 60;
  }
  return 40;
}

function focusRankForOpportunity(opportunity: ProviderOpportunity) {
  return focusRankForPriority(opportunity.urgency) + Math.round(opportunity.confidence / 10);
}

function sortFocusItems(items: FocusItem[]) {
  return items
    .slice()
    .sort((a, b) => b.rank - a.rank || a.title.localeCompare(b.title));
}

function focusItemFromOpportunity(
  opportunity: ProviderOpportunity,
  options: {
    id?: string;
    title?: string;
    meta?: string;
    rankBoost?: number;
    includeSecondaryAction?: boolean;
    reviewActionLabel?: string;
  } = {},
): FocusItem {
  const linkedAction = actionForOpportunity(opportunity);
  const includeSecondaryAction = options.includeSecondaryAction ?? true;
  const showSecondaryAction = includeSecondaryAction && !linkedAction;
  return {
    id: options.id ?? `prediction-${opportunity.id}`,
    kind: "prediction",
    title: options.title ?? `${opportunity.resident.name} · ${opportunity.category}`,
    residentId: opportunity.resident.id,
    residentName: opportunity.resident.name,
    facility: opportunity.facility,
    body: opportunity.reason,
    meta: options.meta ?? `${opportunity.confidence}% confidence · ${opportunitySourceSummary(opportunity)}`,
    status: opportunityActionStatusLabel(opportunity),
    tone: opportunity.urgency,
    rank: focusRankForOpportunity(opportunity) + (options.rankBoost ?? 0),
    primaryAction: linkedAction ? "review-action" : "create-action",
    primaryLabel: linkedAction ? options.reviewActionLabel ?? "Review action" : "Assign action",
    secondaryAction: showSecondaryAction ? "review-resident" : undefined,
    secondaryLabel: showSecondaryAction ? "Review chart" : undefined,
    sourceId: opportunity.id,
  };
}

function focusItemFromAction(action: ActionRequest, primaryLabel: string): FocusItem {
  return {
    id: `action-${action.id}`,
    kind: "action",
    title: `${action.residentName} · ${action.actionType}`,
    residentId: action.residentId,
    residentName: action.residentName,
    facility: action.facility,
    body: action.instructions,
    meta: `${actionAssigneeName(action)} · ${action.priority} · ${action.dueTime}`,
    status: action.status.replace("-", " "),
    tone: action.status === "flagged" ? "danger" : action.priority,
    rank: focusRankForPriority(action.status === "flagged" ? "flagged" : action.priority),
    primaryAction: "review-resident",
    primaryLabel,
    sourceId: action.id,
  };
}

function focusItemFromOrder(order: ClinicalOrder): FocusItem {
  return {
    id: `order-${order.id}`,
    kind: "order",
    title: `${order.residentName} · ${order.orderType} order`,
    residentId: order.residentId,
    residentName: order.residentName,
    facility: order.facility,
    body: order.details,
    meta: formatDateTimeLabel(order.requestedDate, order.requestedTime),
    status: order.status.replaceAll("-", " "),
    tone: statusTone(order.status),
    rank: focusRankForPriority(order.status === "flagged" ? "flagged" : order.priority),
    primaryAction: "open-schedule",
    primaryLabel: selectedRole.value === "provider" ? "Review order" : "Review chart",
    secondaryAction: selectedRole.value === "provider" ? "review-resident" : undefined,
    secondaryLabel: selectedRole.value === "provider" ? "Review chart" : undefined,
    sourceId: order.id,
  };
}

function focusItemFromDebrief(entry: CnaDebriefEntry): FocusItem | null {
  const assignment = cnaAssignments.find((item) => item.id === entry.assignmentId);
  if (!assignment) {
    return null;
  }
  return {
    id: `debrief-${entry.assignmentId}`,
    kind: "debrief",
    title: `${assignment.resident.name} · Debrief needed`,
    residentId: assignment.resident.id,
    residentName: assignment.resident.name,
    facility: assignment.facility,
    body: entry.flaggedConcern || assignment.watchFor,
    meta: `Room ${assignment.resident.room} · ${assignment.care}`,
    status: cnaStatusLabel(entry.status),
    tone: entry.status === "flagged" ? "danger" : "warning",
    rank: entry.status === "flagged" ? 90 : 55,
    primaryAction: "open-debrief",
    primaryLabel: entry.status === "flagged" ? "Review debrief" : "Start debrief",
    secondaryAction: "review-resident",
    secondaryLabel: "View chart",
    sourceId: entry.assignmentId,
  };
}

function focusItemFromEscalation(escalation: HospitalEscalation): FocusItem {
  return {
    id: `escalation-${escalation.id}`,
    kind: "escalation",
    title: `${escalation.residentName} · ${escalation.destination}`,
    residentId: escalation.residentId,
    residentName: escalation.residentName,
    facility: escalation.facility,
    body: escalation.reason,
    meta: `${escalation.createdAt} · ${escalation.followUpTime}`,
    status: escalation.status.replaceAll("-", " "),
    tone: "danger",
    rank: focusRankForPriority(escalation.urgency) + 5,
    primaryAction: "review-resident",
    primaryLabel: "Review chart",
    sourceId: escalation.id,
  };
}

function userRoleLabel(userId: string) {
  const normalizedUserId = normalizeActorId(userId);
  if (normalizedUserId === activeStaffUser.value.id) {
    return activeStaffUser.value.role;
  }
  return getUser(normalizedUserId)?.role ?? careUserById(normalizedUserId)?.role ?? "Care team";
}

function taggedStaffNames(userIds: string[]) {
  return userIds.map((id) => userName(id)).filter(Boolean).join(", ");
}

function assignmentSummary(primaryOwnerId: string, taggedUserIds: string[] = []) {
  const tagged = taggedStaffNames(taggedUserIds);
  return tagged ? `Owner: ${userName(primaryOwnerId)} · Tagged: ${tagged}` : `Owner: ${userName(primaryOwnerId)}`;
}

function huddleInviteSummary(primaryOwnerId: string, taggedUserIds: string[] = []) {
  const tagged = taggedStaffNames(taggedUserIds);
  return tagged ? `Organizer: ${userName(primaryOwnerId)} · Invitees: ${tagged}` : `Organizer: ${userName(primaryOwnerId)}`;
}

function residentTag(resident: Resident) {
  return `@${resident.name}`;
}

function huddleThreadMentionsResident(thread: Thread, resident: Resident) {
  const haystack = [
    thread.title,
    thread.lastMessage,
    ...thread.messages.map((message) => message.text),
  ]
    .join(" ")
    .toLowerCase();
  const residentName = resident.name.toLowerCase();
  return haystack.includes(residentName) || haystack.includes(residentTag(resident).toLowerCase());
}

function uniqueThreadList(threadList: Thread[]) {
  const seen = new Set<string>();
  return threadList.filter((thread) => {
    if (seen.has(thread.id)) {
      return false;
    }
    seen.add(thread.id);
    return true;
  });
}

function opportunitySourceSummary(opportunity: ProviderOpportunity) {
  const sources = [...new Set(opportunity.evidence.map((event) => event.source))] as IntelligenceSource[];
  return sources.join(" + ");
}

function facilitySummarySourceText(summary: FacilityIntelligenceSummary) {
  return summary.sources.length ? summary.sources.join(" + ") : "No source evidence";
}

function facilityReadinessLabel(summary: FacilityIntelligenceSummary) {
  if (summary.readinessScore >= 70) {
    return "ready";
  }
  if (summary.readinessScore >= 35) {
    return "partial";
  }
  return "limited";
}

function facilitySourceCoverageText(summary: FacilityIntelligenceSummary) {
  return `${summary.readinessScore}% source coverage · ${summary.residentsCovered}/${summary.totalResidents} residents`;
}

function facilitySourceMixText(summary: FacilityIntelligenceSummary) {
  return `Otangeles Notes+ ${summary.notesPlusEvents} · Staff ${summary.staffInputs} · Provider ${summary.providerInputs}`;
}

function facilityInputGapText(summary: FacilityIntelligenceSummary) {
  return summary.inputGaps.length ? summary.inputGaps.join(" · ") : "Source coverage sufficient for active predictions";
}

function actionForOpportunity(opportunity: ProviderOpportunity) {
  return actionByOpportunityId.value.get(opportunity.id) ?? null;
}

function opportunityActionStatusLabel(opportunity: ProviderOpportunity) {
  const action = actionForOpportunity(opportunity);
  if (!action) {
    return "No action assigned";
  }
  return `Action ${actionStatusLabel(action.status)}`;
}

function reviewOpportunityAction(opportunity: ProviderOpportunity) {
  const action = actionForOpportunity(opportunity);
  if (action) {
    reviewActionResident(action);
  }
}

function opportunityEvidenceGroups(opportunity: ProviderOpportunity) {
  const groups: Array<{ source: IntelligenceSource; events: ResidentSourceEvent[] }> = [];
  opportunity.evidence.forEach((event) => {
    const group = groups.find((entry) => entry.source === event.source);
    if (group) {
      group.events.push(event);
      return;
    }
    groups.push({ source: event.source, events: [event] });
  });
  return groups;
}

function opportunityEvidenceItemText(event: ResidentSourceEvent) {
  return `${event.capturedAt}: ${event.label} - ${event.detail}`;
}

function opportunityEvidenceText(event: ResidentSourceEvent) {
  return `${event.source} · ${opportunityEvidenceItemText(event)}`;
}

function residentProfileEvidenceGroups(
  resident: Resident,
  opportunity: ProviderOpportunity | null,
): ResidentProfileEvidenceGroup[] {
  if (opportunity) {
    return opportunityEvidenceGroups(opportunity).map((group) => ({
      source: group.source,
      items: group.events.map((event) => opportunityEvidenceItemText(event)),
    }));
  }

  return [
    {
      source: "Resident chart",
      items: [
        `Current summary - ${resident.situation.summary}`,
        `Clinical memory - ${resident.situation.memory}`,
        `Latest status - ${resident.latest}`,
      ],
    },
    {
      source: "Vitals",
      items: resident.situation.vitals.map(
        (vital) => `${vital.label}: ${vital.current} vs baseline ${vital.base}`,
      ),
    },
    {
      source: "Unresolved concerns",
      items: resident.situation.concerns.map(
        (concern) => `${concern.title} - ${concern.status}`,
      ),
    },
  ].filter((group) => group.items.length);
}

function actionResident(action: ActionRequest) {
  return residents.find((resident) => resident.id === action.residentId) ?? null;
}

function reviewActionResident(action: ActionRequest) {
  const resident = actionResident(action);
  if (resident) {
    openResident(resident);
  }
}

function assignImmediateActionFromRequest(action: ActionRequest) {
  const resident = actionResident(action);
  if (resident) {
    openActionRequestModal(resident, "DON Situation", action.assignedRole);
  }
}

function actionSourceResidentFromThread() {
  const resident = selectedThread.value ? threadResident(selectedThread.value) : null;
  if (resident) {
    return resident;
  }
  const text = threadMessages.value.map((message) => message.text).join(" ");
  return residents.find((resident) => text.includes(resident.name)) ?? activeSituationResident.value ?? filteredResidents.value[0];
}

function createLocalThread(thread: Thread) {
  createdThreads.value = [
    thread,
    ...createdThreads.value.filter((entry) => entry.id !== thread.id),
  ];
}

function appendThreadMessage(threadId: string, message: ThreadMessage) {
  const created = createdThreads.value.find((thread) => thread.id === threadId);
  if (created) {
    created.messages = [...created.messages, message];
    created.lastMessage = message.text;
    created.lastTs = message.ts;
  } else {
    const seeded = threads.find((thread) => thread.id === threadId);
    if (seeded) {
      createLocalThread({
        ...seeded,
        messages: [...seeded.messages, message],
        lastMessage: message.text,
        lastTs: message.ts,
      });
    }
  }

  if (selectedThreadId.value === threadId) {
    threadMessages.value.push(message);
  }
}

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

function roleMessagesView(): ViewName {
  if (selectedRole.value === "provider") {
    return "provider-collaboration";
  }
  if (selectedRole.value === "cna") {
    return "cna-messages";
  }
  return "messages";
}

function canDirectlyEscalate() {
  return selectedRole.value === "don" || selectedRole.value === "provider";
}

function defaultHuddleParticipantIds() {
  if (selectedRole.value === "provider") {
    return uniqueIds([activeStaffUser.value.id, "u1", "u2", "u3"]);
  }
  return uniqueIds([activeStaffUser.value.id, providerRecipientIds[0] ?? "u4", "u1", "u2"]);
}

function huddleParticipantNames(participantIds: string[]) {
  return participantIds
    .map((id) => userName(id))
    .filter(Boolean)
    .join(", ");
}

function scheduleParticipantIds() {
  return uniqueIds([scheduleDraft.value.primaryOwnerId, ...scheduleDraft.value.taggedUserIds]);
}

function residentVisibleForRole(role: RoleKey, residentId: string, facility: Facility) {
  if (selectedFacility.value !== "all" && selectedFacility.value !== facility) {
    return false;
  }
  if (role === "cna") {
    return cnaAssignments.some((assignment) => assignment.resident.id === residentId);
  }
  return activeProfile.value.assignedFacilities.includes(facility);
}

function scheduleItemsForRole(role: RoleKey): ResidentScheduleItem[] {
  const huddleItems = scheduledHuddles.value.map((huddle): ResidentScheduleItem => ({
    id: huddle.id,
    kind: "huddle",
    residentId: huddle.residentId,
    residentName: huddle.residentName,
    facility: huddle.facility,
    eventType: huddle.eventType,
    primaryOwnerId: huddle.primaryOwnerId,
    taggedUserIds: [...huddle.taggedUserIds],
    title: huddle.title,
    detail: `${huddle.eventType} · ${huddle.residentName} · ${huddle.duration} · ${huddleInviteSummary(huddle.primaryOwnerId, huddle.taggedUserIds)}`,
    dateKey: huddle.scheduledDate || scheduleDateKeyFromText(huddle.scheduledFor),
    time: formatDateTimeLabel(huddle.scheduledDate || scheduleDateKeyFromText(huddle.scheduledFor), huddle.scheduledTime),
    timeLabel: huddle.scheduledTime ? formatTimeInput(huddle.scheduledTime) : scheduleTimeLabelFromText(huddle.scheduledFor),
    tone: huddle.status,
    threadId: huddle.threadId,
  }));

  const followUpItems = scheduleFollowUps.value.map((followUp): ResidentScheduleItem => ({
    id: followUp.id,
    kind: "follow-up",
    residentId: followUp.residentId,
    residentName: followUp.residentName,
    facility: followUp.facility,
    eventType: followUp.eventType,
    primaryOwnerId: followUp.primaryOwnerId,
    taggedUserIds: [...followUp.taggedUserIds],
    title: followUp.title,
    detail: `${followUp.eventType} · ${followUp.residentName} · ${assignmentSummary(followUp.primaryOwnerId, followUp.taggedUserIds)} · ${followUp.details}`,
    dateKey: followUp.scheduledDate,
    time: formatDateTimeLabel(followUp.scheduledDate, followUp.scheduledTime),
    timeLabel: formatTimeInput(followUp.scheduledTime),
    tone: followUp.status,
  }));

  const orderItems = clinicalOrders.value.map((order): ResidentScheduleItem => ({
    id: order.id,
    kind: "order",
    residentId: order.residentId,
    residentName: order.residentName,
    facility: order.facility,
    eventType: order.eventType,
    primaryOwnerId: order.primaryOwnerId,
    taggedUserIds: [...order.taggedUserIds],
    title: `${order.orderType} order`,
    detail: `${order.eventType} · ${order.residentName} · ${assignmentSummary(order.primaryOwnerId, order.taggedUserIds)} · ${order.indication || order.details}`,
    dateKey: order.requestedDate,
    time: formatDateTimeLabel(order.requestedDate, order.requestedTime),
    timeLabel: formatTimeInput(order.requestedTime),
    tone: order.status,
    threadId: order.linkedThreadId,
  }));

  const escalationItems = hospitalEscalations.value
    .filter((escalation) => escalation.followUpTime.trim())
    .map((escalation): ResidentScheduleItem => ({
      id: escalation.id,
      kind: "escalation",
      residentId: escalation.residentId,
      residentName: escalation.residentName,
      facility: escalation.facility,
      eventType: "Escalation Follow-up",
      primaryOwnerId: providerRecipientIds[0] ?? activeStaffUser.value.id,
      taggedUserIds: [],
      title: "Hospital transfer follow-up",
      detail: `${escalation.residentName} · ${escalation.destination} · ${escalation.reason}`,
      dateKey: scheduleDateKeyFromText(escalation.followUpTime),
      time: escalation.followUpTime,
      timeLabel: scheduleTimeLabelFromText(escalation.followUpTime),
      tone: escalation.urgency,
      threadId: escalation.linkedThreadId,
    }));

  const actionItems = actionRequests.value
    .filter((action) => action.status !== "completed")
    .filter((action) => role === "don" || action.assignedRole === role)
    .map((action): ResidentScheduleItem => ({
      id: action.id,
      kind: "action",
      residentId: action.residentId,
      residentName: action.residentName,
      facility: action.facility,
      eventType: action.actionType,
      primaryOwnerId: action.assignedUserId,
      taggedUserIds: [],
      title: action.actionType,
      detail: `${action.residentName} · ${actionAssigneeName(action)} · ${action.instructions}`,
      dateKey: scheduleDateKeyFromText(action.dueTime),
      time: action.dueTime,
      timeLabel: scheduleTimeLabelFromText(action.dueTime),
      tone: action.priority,
      threadId: action.linkedThreadId,
    }));

  return [...huddleItems, ...followUpItems, ...orderItems, ...escalationItems, ...actionItems]
    .filter((item) => residentVisibleForRole(role, item.residentId, item.facility))
    .sort((a, b) => `${a.dateKey} ${a.timeLabel}`.localeCompare(`${b.dateKey} ${b.timeLabel}`));
}

function careUpdateBodyForProviderNote(note: ProviderNote) {
  if (selectedRole.value === "cna") {
    return `Provider note shared for care context: ${note.body}`;
  }
  return note.body;
}

function timelineSummary(text: string, maxLength = 168) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= maxLength) {
    return clean;
  }

  const sentenceMatches = clean.match(/[^.!?]+[.!?]+/g);
  const summary = sentenceMatches?.slice(0, 2).join(" ").trim() || clean.slice(0, maxLength).trim();
  return summary.length > maxLength ? `${summary.slice(0, maxLength - 3).trim()}...` : summary;
}

function minutesFromTimeText(label: string) {
  const match = label.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const meridiem = match[3].toLowerCase();
  if (meridiem === "pm" && hour < 12) {
    hour += 12;
  }
  if (meridiem === "am" && hour === 12) {
    hour = 0;
  }
  return hour * 60 + minute;
}

function timelineSortFromLabel(label: string, fallback: number) {
  const normalized = label.toLowerCase();
  if (normalized.includes("now")) {
    return 400000;
  }

  const minuteAgoMatch = normalized.match(/(\d+)\s*min/);
  if (minuteAgoMatch) {
    return 390000 - Number(minuteAgoMatch[1]);
  }

  const hourAgoMatch = normalized.match(/(\d+)\s*hour/);
  if (hourAgoMatch) {
    return 390000 - Number(hourAgoMatch[1]) * 60;
  }

  const timeMinutes = minutesFromTimeText(label);
  if (timeMinutes !== null) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const elapsedMinutes = Math.max(0, currentMinutes - timeMinutes);
    return 380000 - elapsedMinutes;
  }

  if (normalized.includes("yesterday")) {
    return 100000 + fallback;
  }

  return fallback;
}

function timelineEventFromStaticResidentEvent(
  event: Resident["timeline"][number],
  index: number,
): ResidentTimelineEvent {
  return {
    id: `resident-${event.id}`,
    kind: "signal",
    timeAgo: event.timeAgo,
    period: event.period,
    icon: event.icon,
    title: "Resident signal",
    text: event.text,
    interpretation: event.interpretation,
    tone: statusTone(event.period),
    sortOrder: timelineSortFromLabel(event.timeAgo, 50000 - index),
  };
}

function timelineEventsForResident(resident: Resident) {
  const events: ResidentTimelineEvent[] = resident.timeline.map((event, index) =>
    timelineEventFromStaticResidentEvent(event, index),
  );

  cnaDebriefs.value.forEach((entry, index) => {
    if (entry.residentId !== resident.id || !entry.transcript.trim()) {
      return;
    }
    const assignment = cnaAssignments.find((item) => item.id === entry.assignmentId);
    const capturedAt = entry.capturedAt ?? "Current shift";
    events.push({
      id: `timeline-debrief-${entry.assignmentId}`,
      kind: "debrief",
      sourceId: entry.assignmentId,
      timeAgo: capturedAt,
      period: "CNA debrief",
      icon: "file-text",
      title: `${assignment?.resident.name ?? resident.name} shift debrief`,
      text: `CNA debrief summary: ${timelineSummary(entry.transcript)}`,
      interpretation: entry.flaggedConcern || undefined,
      status: cnaStatusLabel(entry.status),
      tone: entry.status === "flagged" ? "danger" : "success",
      sortOrder: timelineSortFromLabel(capturedAt, 360000 - index),
    });
  });

  providerNotesState.value.forEach((note, index) => {
    if (note.residentId !== resident.id) {
      return;
    }
    events.push({
      id: `timeline-note-${note.id}`,
      kind: "provider-note",
      sourceId: note.id,
      timeAgo: note.createdAt,
      period: "Provider note",
      icon: "file-text",
      title: note.title,
      text: `Provider ${providerNoteSourceLabel(note.source).toLowerCase()} summary: ${timelineSummary(note.body)}`,
      interpretation: note.encounterDraft
        ? `Encounter draft created for ${note.encounterDraft.destination}: ${timelineSummary(note.encounterDraft.body, 120)}`
        : undefined,
      status: note.status.replaceAll("-", " "),
      tone: statusTone(note.status),
      sortOrder: timelineSortFromLabel(note.createdAt, 350000 - index),
    });
  });

  providerVisitsState.value.forEach((visit, index) => {
    if (visit.residentId !== resident.id) {
      return;
    }
    const summary = visit.textNote.trim() || visit.voiceTranscript.trim();
    const sourceLabel = visitSourceLabel(visit);
    const orderCount = visit.orderIds.length;
    events.push({
      id: `timeline-visit-${visit.id}`,
      kind: "visit",
      sourceId: visit.id,
      timeAgo: visit.endedAt ?? visit.startedAt,
      period: "Provider encounter",
      icon: "file-text",
      title: `${visit.visitType} encounter`,
      text: `${visit.providerName} · ${sourceLabel}. ${summary ? timelineSummary(summary) : "Encounter note in progress."}`,
      interpretation: orderCount
        ? `${visitOrderSummary(visit)} linked to this encounter.`
        : undefined,
      status: providerVisitStatusLabel(visit),
      tone: statusTone(providerVisitStatusLabel(visit)),
      sortOrder: timelineSortFromLabel(visit.endedAt ?? visit.startedAt, 345000 - index),
    });
  });

  clinicalOrders.value.forEach((order, index) => {
    if (order.residentId !== resident.id) {
      return;
    }
    const eventTime = order.statusChangedAt ?? order.createdAt;
    events.push({
      id: `timeline-order-${order.id}`,
      kind: "order",
      sourceId: order.id,
      threadId: order.linkedThreadId,
      timeAgo: eventTime,
      period: "Provider order",
      icon: "file-text",
      title: `${order.orderType} order`,
      text: `Order ${order.status.replaceAll("-", " ")}: ${timelineSummary(`${order.details} ${order.instructions}`)}`,
      interpretation: order.indication ? `Indication: ${timelineSummary(order.indication, 120)}` : undefined,
      status: order.status.replaceAll("-", " "),
      tone: statusTone(order.status),
      sortOrder: timelineSortFromLabel(eventTime, 340000 - index),
    });
  });

  actionRequests.value.forEach((action, index) => {
    if (action.residentId !== resident.id) {
      return;
    }
    const eventTime = action.statusChangedAt ?? action.updatedAt ?? action.createdAt;
    events.push({
      id: `timeline-action-${action.id}`,
      kind: "action",
      sourceId: action.id,
      threadId: action.linkedThreadId,
      timeAgo: eventTime,
      period: "Shared action",
      icon: action.status === "flagged" ? "alert-triangle" : "check-circle",
      title: action.actionType,
      text: `Action ${actionStatusLabel(action.status)} for ${actionAssigneeName(action)}: ${timelineSummary(action.instructions)}`,
      interpretation: action.statusNote
        ? `${action.status === "flagged" ? "Concern" : "Update"}: ${timelineSummary(action.statusNote, 120)}`
        : undefined,
      status: actionStatusLabel(action.status),
      tone: statusTone(action.status),
      sortOrder: timelineSortFromLabel(eventTime, 330000 - index),
    });
  });

  hospitalEscalations.value.forEach((escalation, index) => {
    if (escalation.residentId !== resident.id) {
      return;
    }
    events.push({
      id: `timeline-escalation-${escalation.id}`,
      kind: "escalation",
      sourceId: escalation.id,
      threadId: escalation.linkedThreadId,
      timeAgo: escalation.createdAt,
      period: "Escalation",
      icon: "alert-triangle",
      title: escalation.destination,
      text: `Escalation ${escalation.status.replaceAll("-", " ")}: ${timelineSummary(escalation.reason)}`,
      interpretation: escalation.notes ? timelineSummary(escalation.notes, 120) : undefined,
      status: escalation.status.replaceAll("-", " "),
      tone: "danger",
      sortOrder: timelineSortFromLabel(escalation.createdAt, 320000 - index),
    });
  });

  scheduledHuddles.value.forEach((huddle, index) => {
    if (huddle.residentId !== resident.id) {
      return;
    }
    events.push({
      id: `timeline-huddle-${huddle.id}`,
      kind: "huddle",
      sourceId: huddle.id,
      threadId: huddle.threadId,
      timeAgo: huddle.createdAt,
      period: "Care huddle",
      icon: "users",
      title: huddle.title,
      text: `Huddle ${huddle.status}: ${timelineSummary(huddle.agenda)}`,
      interpretation: `${huddle.scheduledFor} · ${huddleInviteSummary(huddle.primaryOwnerId, huddle.taggedUserIds)}`,
      status: huddle.status,
      tone: statusTone(huddle.status),
      sortOrder: timelineSortFromLabel(huddle.createdAt, 310000 - index),
    });
  });

  scheduleFollowUps.value.forEach((followUp, index) => {
    if (followUp.residentId !== resident.id) {
      return;
    }
    events.push({
      id: `timeline-followup-${followUp.id}`,
      kind: "follow-up",
      sourceId: followUp.id,
      timeAgo: followUp.createdAt,
      period: "Follow-up",
      icon: "clock",
      title: followUp.title,
      text: `Follow-up ${followUp.status}: ${timelineSummary(followUp.details)}`,
      interpretation: `${formatDateTimeLabel(followUp.scheduledDate, followUp.scheduledTime)} · ${assignmentSummary(followUp.primaryOwnerId, followUp.taggedUserIds)}`,
      status: followUp.status,
      tone: statusTone(followUp.status),
      sortOrder: timelineSortFromLabel(followUp.createdAt, 300000 - index),
    });
  });

  return events.sort((a, b) => b.sortOrder - a.sortOrder);
}

function careUpdatesForResident(residentId: string) {
  const updates: CareUpdate[] = [];

  cnaDebriefs.value.forEach((entry, index) => {
    if (entry.residentId !== residentId || !entry.transcript.trim()) {
      return;
    }
    const assignment = cnaAssignments.find((item) => item.id === entry.assignmentId);
    updates.push({
      id: `debrief-${entry.assignmentId}`,
      kind: "debrief",
      label: "CNA Debrief",
      title: `${assignment?.resident.name ?? "Resident"} shift debrief`,
      body: entry.transcript,
      meta: `${entry.capturedAt ?? "Captured"} · ${assignment?.watchFor ?? "Shared observation"}`,
      status: cnaStatusLabel(entry.status),
      tone: entry.status === "flagged" ? "danger" : "success",
      sortOrder: 10000 - index,
    });
  });

  providerNotesState.value.forEach((note, index) => {
    if (note.residentId !== residentId) {
      return;
    }
    updates.push({
      id: `note-${note.id}`,
      kind: "provider-note",
      label: "Provider Note",
      title: note.title,
      body: careUpdateBodyForProviderNote(note),
      meta: `${providerNoteSourceLabel(note.source)} · ${note.createdAt}`,
      status: note.source === "voice" ? "voice note" : "shared note",
      tone: "success",
      sortOrder: 9000 - index,
    });
  });

  clinicalOrders.value.forEach((order, index) => {
    if (order.residentId !== residentId) {
      return;
    }
    updates.push({
      id: `order-${order.id}`,
      kind: "order",
      label: "Order Update",
      title: `${order.orderType} order placed`,
      body: `${order.eventType} was added to Orders & Follow-ups.`,
      meta: `${formatDateTimeLabel(order.requestedDate, order.requestedTime)} · ${assignmentSummary(order.primaryOwnerId, order.taggedUserIds)}`,
      status: order.status.replaceAll("-", " "),
      tone: statusTone(order.status),
      sortOrder: 8000 - index,
    });
  });

  actionRequests.value.forEach((action, index) => {
    if (action.residentId !== residentId) {
      return;
    }
    updates.push({
      id: `action-${action.id}`,
      kind: "action",
      label: "Action Update",
      title: `${action.actionType} assigned`,
      body: `${actionAssigneeName(action)} owns this in Shared Actions.`,
      meta: `${action.updatedAt} · ${action.dueTime}`,
      status: actionStatusLabel(action.status),
      tone: statusTone(action.status),
      sortOrder: 7000 - index,
    });
  });

  hospitalEscalations.value.forEach((escalation, index) => {
    if (escalation.residentId !== residentId) {
      return;
    }
    updates.push({
      id: `escalation-${escalation.id}`,
      kind: "escalation",
      label: "Escalation",
      title: escalation.destination,
      body: `${escalation.reason}${escalation.notes ? ` ${escalation.notes}` : ""}`,
      meta: `${escalation.createdAt} · ${escalation.followUpTime || "No follow-up time"}`,
      status: escalation.status.replaceAll("-", " "),
      tone: "danger",
      sortOrder: 6000 - index,
    });
  });

  scheduledHuddles.value.forEach((huddle, index) => {
    if (huddle.residentId !== residentId) {
      return;
    }
    updates.push({
      id: `huddle-${huddle.id}`,
      kind: "huddle",
      label: "Huddle Update",
      title: `${huddle.eventType} huddle scheduled`,
      body: "Care-team huddle added to Orders & Follow-ups.",
      meta: `${huddle.scheduledFor} · ${huddleInviteSummary(huddle.primaryOwnerId, huddle.taggedUserIds)}`,
      status: huddle.status,
      tone: statusTone(huddle.status),
      sortOrder: 5000 - index,
    });
  });

  scheduleFollowUps.value.forEach((followUp, index) => {
    if (followUp.residentId !== residentId) {
      return;
    }
    updates.push({
      id: `followup-${followUp.id}`,
      kind: "follow-up",
      label: "Follow-up Update",
      title: `${followUp.eventType} follow-up scheduled`,
      body: "Follow-up task added to Orders & Follow-ups.",
      meta: `${formatDateTimeLabel(followUp.scheduledDate, followUp.scheduledTime)} · ${assignmentSummary(followUp.primaryOwnerId, followUp.taggedUserIds)}`,
      status: followUp.status,
      tone: statusTone(followUp.status),
      sortOrder: 4000 - index,
    });
  });

  return updates.sort((a, b) => b.sortOrder - a.sortOrder);
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function dateKeyFromDate(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function todayDateKey() {
  return dateKeyFromDate(new Date());
}

function offsetDateKey(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return dateKeyFromDate(date);
}

function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateLabel(dateKey: string) {
  if (dateKey === todayDateKey()) {
    return "Today";
  }
  if (dateKey === offsetDateKey(1)) {
    return "Tomorrow";
  }
  return dateFromKey(dateKey).toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatDocumentDate(dateKey: string) {
  return dateFromKey(dateKey).toLocaleDateString([], {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function mockResidentDateOfBirth(resident: Resident) {
  // TODO(NOTES_PLUS): Replace this derived mock DOB with the resident demographic value received with the encounter.
  const birthYear = new Date().getFullYear() - resident.age;
  return new Date(birthYear, 0, 15).toLocaleDateString([], {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function formatTimeInput(time: string) {
  if (!time) {
    return "All day";
  }
  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString([], {
    hour: activeProfile.value.time24Hour ? "2-digit" : "numeric",
    minute: "2-digit",
    hour12: !activeProfile.value.time24Hour,
  });
}

function formatDateTimeLabel(dateKey: string, time: string) {
  return `${formatDateLabel(dateKey)} ${formatTimeInput(time)}`;
}

function scheduleDateKeyFromText(text: string) {
  const lowerTime = text.toLowerCase();
  if (lowerTime.includes("tomorrow")) {
    return offsetDateKey(1);
  }
  if (
    lowerTime.includes("today") ||
    lowerTime.includes("now") ||
    lowerTime.includes("before") ||
    lowerTime.startsWith("by ")
  ) {
    return todayDateKey();
  }

  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const matchedWeekdayIndex = weekdays.findIndex((weekday) => lowerTime.includes(weekday));
  if (matchedWeekdayIndex >= 0) {
    const date = new Date();
    const currentWeekdayIndex = date.getDay();
    const offset = (matchedWeekdayIndex - currentWeekdayIndex + 7) % 7;
    date.setDate(date.getDate() + offset);
    return dateKeyFromDate(date);
  }

  return todayDateKey();
}

function scheduleTimeLabelFromText(text: string) {
  return text
    .replace(/^today\s*/i, "")
    .replace(/^tomorrow\s*/i, "")
    .trim() || text;
}

function buildScheduleMonthCells(items: ResidentScheduleItem[], monthDate: Date): MonthCalendarCell[] {
  const monthStart = startOfMonth(monthDate);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const itemMap = new Map<string, ResidentScheduleItem[]>();
  items.forEach((item) => {
    itemMap.set(item.dateKey, [...(itemMap.get(item.dateKey) ?? []), item]);
  });

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = dateKeyFromDate(date);
    return {
      id: `schedule-day-${key}`,
      dateKey: key,
      dayNumber: date.getDate(),
      inMonth: date.getMonth() === monthStart.getMonth(),
      isToday: key === todayDateKey(),
      items: itemMap.get(key) ?? [],
    };
  });
}

function changeScheduleMonth(offset: number) {
  activeScheduleMonth.value = new Date(
    activeScheduleMonth.value.getFullYear(),
    activeScheduleMonth.value.getMonth() + offset,
    1,
  );
  selectedScheduleDateKey.value = null;
}

function selectScheduleDay(dateKey: string) {
  selectedScheduleDateKey.value = dateKey;
}

function closeScheduleDayModal() {
  selectedScheduleDateKey.value = null;
}

function openScheduleThread(threadId: string) {
  const thread = visibleThreads.value.find((entry) => entry.id === threadId);
  if (!thread) {
    return;
  }
  setView(roleMessagesView());
  messageTab.value = "rooms";
  openThread(thread);
}

function defaultScheduleResidentId(resident?: Resident | null) {
  return resident?.id ?? selectedResident.value?.id ?? scheduleResidentOptions.value[0]?.id ?? residents[0]?.id ?? "";
}

function defaultScheduleEventType(type: ScheduleDraftType) {
  return scheduleEventTypes[type][0] ?? "Care Event";
}

function defaultScheduleOwnerId(type: ScheduleDraftType) {
  if (type === "clinical-order") {
    return providerRecipientIds.includes(activeStaffUser.value.id)
      ? activeStaffUser.value.id
      : providerRecipientIds[0] ?? activeStaffUser.value.id;
  }
  return activeStaffUser.value.id;
}

function scheduleTitleForType(type: ScheduleDraftType, resident: Resident | null, eventType = defaultScheduleEventType(type)) {
  if (type === "clinical-order") {
    return resident ? `${resident.name} ${eventType} order` : `${eventType} order`;
  }
  if (type === "follow-up") {
    return resident ? `${resident.name} ${eventType}` : eventType;
  }
  return resident ? `${resident.name} ${eventType}` : eventType;
}

function resetScheduleDraft(
  type: ScheduleDraftType = "huddle",
  resident?: Resident | null,
  dateKey = todayDateKey(),
) {
  const residentId = defaultScheduleResidentId(resident);
  const draftResident = residents.find((entry) => entry.id === residentId) ?? resident ?? null;
  const safeType = type === "clinical-order" && selectedRole.value !== "provider" ? "follow-up" : type;
  const eventType = defaultScheduleEventType(safeType);
  const primaryOwnerId = defaultScheduleOwnerId(safeType);
  scheduleDraft.value = {
    type: safeType,
    eventType,
    residentId,
    title: scheduleTitleForType(safeType, draftResident, eventType),
    date: dateKey,
    time: safeType === "clinical-order" ? "10:00" : "14:00",
    duration: safeType === "huddle" ? "20 min" : "15 min",
    details:
      safeType === "follow-up" && draftResident
        ? `Follow up on ${draftResident.name}'s current status and open care-team concerns.`
        : "",
    participantIds: safeType === "huddle" ? defaultHuddleParticipantIds() : [],
    primaryOwnerId,
    taggedUserIds: safeType === "huddle" ? defaultHuddleParticipantIds().filter((id) => id !== primaryOwnerId) : [],
    callMode: "video-call",
    orderType: safeType === "clinical-order" && clinicalOrderTypes.includes(eventType as ClinicalOrderType) ? (eventType as ClinicalOrderType) : "Lab",
    priority: "High",
    indication: draftResident?.situation.summary ?? "",
    orderDetails: "",
    instructions: "Route result and status updates to Otangeles Notes+.",
  };
  scheduleResidentSearchQuery.value = draftResident?.name ?? "";
  scheduleStaffSearchQuery.value = "";
  editingClinicalOrderId.value = null;
}

function openScheduleModal(
  type: ScheduleDraftType = "huddle",
  resident?: Resident | null,
  dateKey = todayDateKey(),
) {
  resetScheduleDraft(type, resident, dateKey);
  scheduleModalOpen.value = true;
}

function openScheduleModalForDate(dateKey: string) {
  selectedScheduleDateKey.value = null;
  openScheduleModal("huddle", null, dateKey);
}

function closeScheduleModal() {
  scheduleModalOpen.value = false;
  editingClinicalOrderId.value = null;
}

function setScheduleType(nextType: string) {
  const resident = residents.find((entry) => entry.id === scheduleDraft.value.residentId) ?? null;
  resetScheduleDraft(nextType as ScheduleDraftType, resident, scheduleDraft.value.date || todayDateKey());
}

function setScheduleEventType(eventType: string) {
  scheduleDraft.value.eventType = eventType;
  if (scheduleDraft.value.type === "clinical-order" && clinicalOrderTypes.includes(eventType as ClinicalOrderType)) {
    scheduleDraft.value.orderType = eventType as ClinicalOrderType;
  }
  scheduleDraft.value.title = scheduleTitleForType(scheduleDraft.value.type, scheduleModalResident.value, eventType);
}

function selectScheduleResident(resident: Resident) {
  scheduleDraft.value.residentId = resident.id;
  scheduleResidentSearchQuery.value = resident.name;
  scheduleDraft.value.title = scheduleTitleForType(scheduleDraft.value.type, resident, scheduleDraft.value.eventType);
}

function setSchedulePrimaryOwner(userId: string) {
  scheduleDraft.value.primaryOwnerId = userId;
  scheduleDraft.value.taggedUserIds = scheduleDraft.value.taggedUserIds.filter((id) => id !== userId);
}

function toggleScheduleTaggedUser(userId: string) {
  if (userId === scheduleDraft.value.primaryOwnerId) {
    return;
  }
  scheduleDraft.value.taggedUserIds = scheduleDraft.value.taggedUserIds.includes(userId)
    ? scheduleDraft.value.taggedUserIds.filter((id) => id !== userId)
    : [...scheduleDraft.value.taggedUserIds, userId];
}

function toggleScheduleParticipant(userId: string) {
  toggleScheduleTaggedUser(userId);
}

function createScheduleFollowUp() {
  const resident = scheduleModalResident.value;
  if (!resident || !scheduleDraft.value.details.trim()) {
    return;
  }
  const followUp: ScheduleFollowUp = {
    id: `fu-${Date.now()}`,
    residentId: resident.id,
    residentName: resident.name,
    facility: residentFacility(resident),
    eventType: scheduleDraft.value.eventType,
    primaryOwnerId: scheduleDraft.value.primaryOwnerId,
    taggedUserIds: [...scheduleDraft.value.taggedUserIds],
    title: scheduleDraft.value.title.trim(),
    scheduledDate: scheduleDraft.value.date,
    scheduledTime: scheduleDraft.value.time,
    details: scheduleDraft.value.details.trim(),
    status: "scheduled",
    createdAt: currentTimeLabel(),
  };
  scheduleFollowUps.value = [followUp, ...scheduleFollowUps.value];
}

function createOrderContextThread(order: ClinicalOrder) {
  const recipientIds = uniqueIds([order.primaryOwnerId, ...order.taggedUserIds, "u1", "u2"]);
  const resident = residents.find((entry) => entry.id === order.residentId) ?? residents[0];
  const thread = ensureResidentCoordinationThread(resident, recipientIds);
  const text = `Provider order placed: ${residentTag(resident)} - ${order.eventType}. ${order.indication}`;
  appendThreadMessage(thread.id, {
    id: `m-${Date.now()}`,
    authorId: activeStaffUser.value.id,
    text,
    ts: "now",
  });
  appendThreadMessage(thread.id, {
    id: `m-${Date.now()}-details`,
    authorId: activeStaffUser.value.id,
    text: `${assignmentSummary(order.primaryOwnerId, order.taggedUserIds)}. Details: ${order.details}. Instructions: ${order.instructions}`,
    ts: "now",
  });
  return thread.id;
}

function saveClinicalOrderDraft() {
  const resident = scheduleModalResident.value;
  if (!resident || selectedRole.value !== "provider") {
    return;
  }
  const existingOrder = editingClinicalOrderId.value
    ? clinicalOrders.value.find((order) => order.id === editingClinicalOrderId.value)
    : null;

  if (existingOrder) {
    existingOrder.residentId = resident.id;
    existingOrder.residentName = resident.name;
    existingOrder.facility = residentFacility(resident);
    existingOrder.eventType = scheduleDraft.value.eventType;
    existingOrder.primaryOwnerId = scheduleDraft.value.primaryOwnerId;
    existingOrder.taggedUserIds = [...scheduleDraft.value.taggedUserIds];
    existingOrder.orderType = scheduleDraft.value.orderType;
    existingOrder.priority = scheduleDraft.value.priority;
    existingOrder.requestedDate = scheduleDraft.value.date;
    existingOrder.requestedTime = scheduleDraft.value.time;
    existingOrder.indication = scheduleDraft.value.indication.trim();
    existingOrder.details = scheduleDraft.value.orderDetails.trim();
    existingOrder.instructions = scheduleDraft.value.instructions.trim();
    linkOrderToActiveVisit(existingOrder.id);
    return;
  }

  const order: ClinicalOrder = {
    id: `co-${Date.now()}`,
    residentId: resident.id,
    residentName: resident.name,
    facility: residentFacility(resident),
    eventType: scheduleDraft.value.eventType,
    primaryOwnerId: scheduleDraft.value.primaryOwnerId,
    taggedUserIds: [...scheduleDraft.value.taggedUserIds],
    orderType: scheduleDraft.value.orderType,
    priority: scheduleDraft.value.priority,
    requestedDate: scheduleDraft.value.date,
    requestedTime: scheduleDraft.value.time,
    indication: scheduleDraft.value.indication.trim(),
    details: scheduleDraft.value.orderDetails.trim(),
    instructions: scheduleDraft.value.instructions.trim(),
    destination: "Otangeles Notes+",
    status: "ordered",
    createdAt: currentTimeLabel(),
  };
  order.linkedThreadId = createOrderContextThread(order);
  clinicalOrders.value = [order, ...clinicalOrders.value];
  linkOrderToActiveVisit(order.id);
}

function saveScheduleDraft(startNow = false) {
  if (!scheduleDraftCanSave.value) {
    return;
  }
  if (scheduleDraft.value.type === "follow-up") {
    createScheduleFollowUp();
    closeScheduleModal();
    return;
  }
  if (scheduleDraft.value.type === "clinical-order") {
    saveClinicalOrderDraft();
    closeScheduleModal();
    return;
  }
  saveScheduledHuddleFromScheduleDraft(startNow);
}

function openEscalationModal(resident: Resident) {
  escalationModalResidentId.value = resident.id;
  escalationDraft.value = {
    urgency: selectedRole.value === "cna" ? "High" : "Stat",
    destination: "Local Emergency Department",
    reason: resident.situation.concerns[0]?.title ?? resident.latest,
    notes: "",
    followUpTime: "Today 1:00 PM",
    notifyTeam: true,
  };
}

function closeEscalationModal() {
  escalationModalResidentId.value = null;
}

function createHospitalEscalationThread(escalation: HospitalEscalation, resident: Resident) {
  const recipientIds = uniqueIds([providerRecipientIds[0] ?? "u4", providerRecipientIds[1] ?? "", "u1", "u2"]);
  const thread = ensureResidentCoordinationThread(resident, recipientIds);
  const text = `Hospital transfer escalation initiated: ${residentTag(resident)} - ${escalation.reason}. Destination: ${escalation.destination}.`;
  appendThreadMessage(thread.id, {
    id: `m-${Date.now()}`,
    authorId: activeStaffUser.value.id,
    text,
    ts: "now",
  });
  appendThreadMessage(thread.id, {
    id: `m-${Date.now()}-followup`,
    authorId: activeStaffUser.value.id,
    text: `Follow-up scheduled: ${escalation.followUpTime || "Not set"}. Notes: ${escalation.notes || "No additional notes."}`,
    ts: "now",
  });
  return thread.id;
}

function submitEscalation() {
  const resident = escalationModalResident.value;
  if (!resident || !escalationDraft.value.reason.trim()) {
    return;
  }

  const now = currentTimeLabel();
  if (!canDirectlyEscalate()) {
    const action: ActionRequest = {
      id: `ar-${Date.now()}`,
      residentId: resident.id,
      residentName: resident.name,
      facility: residentFacility(resident),
      priority: escalationDraft.value.urgency,
      assignedRole: "provider",
      assignedUserId: providerRecipientIds[0] ?? "u4",
      actionType: "Evaluate acute change",
      instructions: `CNA requested escalation review for possible hospital transfer. ${escalationDraft.value.reason.trim()} ${escalationDraft.value.notes.trim()}`.trim(),
      dueTime: "Now",
      status: "open",
      sourceScreen: "Resident Profile",
      createdAt: now,
      updatedAt: now,
    };
    if (escalationDraft.value.notifyTeam) {
      action.linkedThreadId = createActionThread(action);
    }
    actionRequests.value = [action, ...actionRequests.value];
    closeEscalationModal();
    return;
  }

  const escalation: HospitalEscalation = {
    id: `he-${Date.now()}`,
    residentId: resident.id,
    residentName: resident.name,
    facility: residentFacility(resident),
    urgency: escalationDraft.value.urgency,
    destination: escalationDraft.value.destination.trim() || "Local Emergency Department",
    reason: escalationDraft.value.reason.trim(),
    notes: escalationDraft.value.notes.trim(),
    followUpTime: escalationDraft.value.followUpTime.trim(),
    status: "sent-to-hospital",
    createdByRole: selectedRole.value,
    createdAt: now,
  };
  if (escalationDraft.value.notifyTeam) {
    escalation.linkedThreadId = createHospitalEscalationThread(escalation, resident);
  }
  hospitalEscalations.value = [escalation, ...hospitalEscalations.value];
  closeEscalationModal();
}

function openHuddleModal(resident: Resident) {
  openScheduleModal("huddle", resident);
}

function residentCoordinationThreadId(resident: Resident) {
  return residentRoomThreadId(resident);
}

function ensureResidentCoordinationThread(resident: Resident, participantIds: string[]) {
  const existingThread = residentRoomFor(resident);
  const members = uniqueIds([
    activeStaffUser.value.id,
    ...existingThread.members.map((member) => normalizeActorId(member)),
    ...participantIds,
  ]);
  const thread: Thread = {
    ...existingThread,
    kind: "huddle",
    purpose: "resident-room",
    residentId: resident.id,
    title: `${resident.name} Care Team`,
    members,
  };
  createLocalThread(thread);
  return thread;
}

function prepareExistingHuddleThread(thread: Thread, participantIds: string[]) {
  const members = uniqueIds([
    activeStaffUser.value.id,
    ...thread.members.map((member) => normalizeActorId(member)),
    ...participantIds,
  ]);
  const updatedThread: Thread = {
    ...thread,
    kind: "huddle",
    purpose: thread.purpose ?? "staff-group",
    members,
  };
  createLocalThread(updatedThread);
  return updatedThread;
}

function createScheduledHuddleThread(huddle: ScheduledHuddle, startNow: boolean) {
  const resident = residents.find((entry) => entry.id === huddle.residentId) ?? residents[0];
  const thread = ensureResidentCoordinationThread(resident, huddle.participantIds);
  const invitees = taggedStaffNames(huddle.taggedUserIds);
  const message = `${userName(huddle.primaryOwnerId)} scheduled a ${huddle.eventType.toLowerCase()} for ${resident.name} at ${huddle.scheduledFor}. ${
    invitees ? `Invitees: ${invitees}. ` : ""
  }Purpose: ${huddle.agenda}`;
  appendThreadMessage(thread.id, {
    id: `huddle-${huddle.id}`,
    authorId: activeStaffUser.value.id,
    text: message,
    ts: "now",
  });
  if (startNow) {
    appendThreadMessage(thread.id, callMessage(huddle.callMode));
  }
  return visibleThreads.value.find((entry) => entry.id === thread.id) ?? thread;
}

function saveScheduledHuddleFromScheduleDraft(startNow = false) {
  const resident = scheduleModalResident.value;
  if (!resident || !scheduleDraft.value.primaryOwnerId) {
    return;
  }

  const stamp = Date.now();
  const participantIds = scheduleParticipantIds();
  const threadId = residentCoordinationThreadId(resident);
  const huddle: ScheduledHuddle = {
    id: `sh-${stamp}`,
    residentId: resident.id,
    residentName: resident.name,
    facility: residentFacility(resident),
    eventType: scheduleDraft.value.eventType,
    primaryOwnerId: scheduleDraft.value.primaryOwnerId,
    taggedUserIds: [...scheduleDraft.value.taggedUserIds],
    title: scheduleDraft.value.title.trim(),
    scheduledDate: scheduleDraft.value.date,
    scheduledTime: scheduleDraft.value.time,
    scheduledFor: formatDateTimeLabel(scheduleDraft.value.date, scheduleDraft.value.time),
    duration: scheduleDraft.value.duration.trim() || "20 min",
    participantIds,
    callMode: scheduleDraft.value.callMode,
    agenda: scheduleDraft.value.details.trim() || `Discuss ${resident.name}'s current status and next care-team actions.`,
    status: startNow ? "started" : "scheduled",
    threadId,
    createdAt: currentTimeLabel(),
  };
  const thread = createScheduledHuddleThread(huddle, startNow);
  scheduledHuddles.value = [huddle, ...scheduledHuddles.value];
  closeScheduleModal();

  if (startNow) {
    setView(roleMessagesView());
    messageTab.value = "rooms";
    openThread(thread);
  }
}

function openClinicalOrderDraft(order: ClinicalOrder) {
  if (selectedRole.value !== "provider") {
    return;
  }
  scheduleDraft.value = {
    type: "clinical-order",
    eventType: order.eventType,
    residentId: order.residentId,
    title: `${order.residentName} ${order.eventType} order`,
    date: order.requestedDate,
    time: order.requestedTime,
    duration: "15 min",
    details: "",
    participantIds: [],
    primaryOwnerId: order.primaryOwnerId,
    taggedUserIds: [...order.taggedUserIds],
    callMode: "video-call",
    orderType: order.orderType,
    priority: order.priority,
    indication: order.indication,
    orderDetails: order.details,
    instructions: order.instructions,
  };
  editingClinicalOrderId.value = order.id;
  scheduleModalOpen.value = true;
}

function orderForScheduleItem(item: ResidentScheduleItem) {
  return clinicalOrders.value.find((order) => order.id === item.id) ?? null;
}

function orderStatusForScheduleItem(item: ResidentScheduleItem) {
  return orderForScheduleItem(item)?.status ?? "ordered";
}

function openClinicalOrderFromScheduleItem(item: ResidentScheduleItem) {
  const order = orderForScheduleItem(item);
  if (order) {
    openClinicalOrderDraft(order);
  }
}

function updateClinicalOrderFromScheduleItem(item: ResidentScheduleItem, status: ClinicalOrderStatus) {
  const order = orderForScheduleItem(item);
  if (order) {
    updateClinicalOrderStatus(order, status);
  }
}

function actionForTimelineEvent(event: ResidentTimelineEvent) {
  return event.kind === "action" && event.sourceId
    ? actionRequests.value.find((action) => action.id === event.sourceId) ?? null
    : null;
}

function orderForTimelineEvent(event: ResidentTimelineEvent) {
  return event.kind === "order" && event.sourceId
    ? clinicalOrders.value.find((order) => order.id === event.sourceId) ?? null
    : null;
}

function canManageTimelineAction(event: ResidentTimelineEvent) {
  const action = actionForTimelineEvent(event);
  return Boolean(
    action &&
      ((selectedRole.value === "provider" && action.assignedRole === "provider") ||
        (selectedRole.value === "cna" && action.assignedRole === "cna")),
  );
}

function timelineActionCompleteLabel(event: ResidentTimelineEvent) {
  const action = actionForTimelineEvent(event);
  return action ? actionCompleteLabel(action) : "Done";
}

function timelineActionFlagLabel(event: ResidentTimelineEvent) {
  const action = actionForTimelineEvent(event);
  return action ? actionFlagLabel(action) : "Flag";
}

function handleTimelineActionStatusSelection(event: ResidentTimelineEvent, status: ActionStatusUpdateTarget) {
  const action = actionForTimelineEvent(event);
  if (action) {
    handleActionStatusSelection(action, status);
  }
}

function timelineOrderStatus(event: ResidentTimelineEvent) {
  return orderForTimelineEvent(event)?.status ?? "ordered";
}

function updateTimelineClinicalOrderStatus(event: ResidentTimelineEvent, status: ClinicalOrderStatus) {
  const order = orderForTimelineEvent(event);
  if (order) {
    updateClinicalOrderStatus(order, status);
  }
}

function openTimelineClinicalOrder(event: ResidentTimelineEvent) {
  const order = orderForTimelineEvent(event);
  if (order) {
    openClinicalOrderDraft(order);
  }
}

function openTimelineThread(event: ResidentTimelineEvent) {
  if (event.threadId) {
    openScheduleThread(event.threadId);
  }
}

function timelineEventHasActions(event: ResidentTimelineEvent) {
  return (
    canManageTimelineAction(event) ||
    event.kind === "order" ||
    Boolean(event.threadId && event.kind !== "action")
  );
}

function openScheduleItem(item: ResidentScheduleItem) {
  if (item.kind === "order") {
    const order = orderForScheduleItem(item);
    if (order && selectedRole.value === "provider") {
      openClinicalOrderDraft(order);
      return;
    }
  }
  openResident(item.residentId);
}

function isSectionExpanded(key: string, defaultOpen = false) {
  return expandedSections.value[key] ?? defaultOpen;
}

function toggleSection(key: string, defaultOpen = false) {
  expandedSections.value[key] = !isSectionExpanded(key, defaultOpen);
}

function setSituationAccordion(key: SituationAccordionKey) {
  openSituationAccordion.value = key;
}

function setProviderHomeAccordion(key: ProviderHomeAccordionKey) {
  openProviderHomeAccordion.value = key;
}

function residentSectionKey(section: string) {
  return selectedResident.value ? `resident-${selectedResident.value.id}-${section}` : `resident-${section}`;
}

function focusItemOpportunity(item: FocusItem) {
  return item.sourceId
    ? providerOpportunities.value.find((opportunity) => opportunity.id === item.sourceId) ?? null
    : null;
}

function focusItemAction(item: FocusItem) {
  return item.sourceId
    ? actionRequests.value.find((action) => action.id === item.sourceId) ?? null
    : null;
}

function handleFocusItemAction(item: FocusItem, action = item.primaryAction) {
  if (action === "create-action") {
    const opportunity = focusItemOpportunity(item);
    if (opportunity) {
      openActionRequestFromOpportunity(opportunity, `${activeRole.value.label} Focus`);
    }
    return;
  }

  if (action === "review-action") {
    const opportunity = focusItemOpportunity(item);
    if (opportunity) {
      reviewOpportunityAction(opportunity);
      return;
    }
    const actionRequest = focusItemAction(item);
    if (actionRequest) {
      reviewActionResident(actionRequest);
    }
    return;
  }

  if (action === "open-debrief") {
    if (item.sourceId) {
      selectedCnaAssignmentId.value = item.sourceId;
    }
    activeView.value = "cna-debrief";
    selectedResidentId.value = null;
    return;
  }

  if (action === "open-schedule") {
    const scheduleItem = item.sourceId
      ? visibleScheduleItems.value.find((entry) => entry.id === item.sourceId)
      : null;
    if (scheduleItem) {
      openScheduleItem(scheduleItem);
      return;
    }
  }

  if (item.residentId) {
    openResident(item.residentId);
  }
}

function requestOrderReview(resident: Resident) {
  const now = currentTimeLabel();
  const action: ActionRequest = {
    id: `ar-${Date.now()}`,
    residentId: resident.id,
    residentName: resident.name,
    facility: residentFacility(resident),
    priority: "High",
    assignedRole: "provider",
    assignedUserId: providerRecipientIds[0] ?? "u4",
    actionType: "Place/update orders",
    instructions: `Review whether ${resident.name} needs labs, medication changes, monitoring, or other clinical orders. Context: ${resident.situation.summary}`,
    dueTime: "Now",
    status: "open",
    sourceScreen: "Resident Profile",
    createdAt: now,
    updatedAt: now,
  };
  action.linkedThreadId = createActionThread(action);
  actionRequests.value = [action, ...actionRequests.value];
}

function openOrderAction(resident: Resident) {
  if (selectedRole.value === "provider") {
    openScheduleModal("clinical-order", resident);
    return;
  }
  requestOrderReview(resident);
}

function updateClinicalOrderStatus(order: ClinicalOrder, status: ClinicalOrderStatus) {
  const now = currentTimeLabel();
  order.status = status;
  order.statusChangedAt = now;
  order.statusChangedById = activeStaffUser.value.id;
  if (order.linkedThreadId) {
    appendThreadMessage(order.linkedThreadId, {
      id: `order-status-${Date.now()}`,
      authorId: activeStaffUser.value.id,
      text: `${order.residentName} ${order.orderType} order marked ${status.replaceAll("-", " ")} in the shared care plan.`,
      ts: now,
    });
  }
}

function openTaggedMessageModal(opportunity: ProviderOpportunity) {
  const defaultRecipient = providerRecipientIds.find((id) => id !== activeStaffUser.value.id) ?? clinicalRecipients.value[0]?.id ?? "";
  taggedMessageContext.value = {
    opportunityId: opportunity.id,
    residentId: opportunity.resident.id,
    recipientIds: defaultRecipient ? [defaultRecipient] : [],
    body: `${residentTag(opportunity.resident)} - ${opportunity.reason}`,
  };
}

function closeTaggedMessageModal() {
  taggedMessageContext.value = null;
}

function toggleTaggedMessageRecipient(userId: string) {
  if (!taggedMessageContext.value) {
    return;
  }
  taggedMessageContext.value.recipientIds = taggedMessageContext.value.recipientIds.includes(userId)
    ? taggedMessageContext.value.recipientIds.filter((id) => id !== userId)
    : [...taggedMessageContext.value.recipientIds, userId];
}

function sendTaggedCareMessage() {
  const context = taggedMessageContext.value;
  const resident = taggedMessageResident.value;
  const opportunity = taggedMessageOpportunity.value;
  if (!context || !resident || context.recipientIds.length === 0) {
    return;
  }

  const recipientIds = uniqueIds(context.recipientIds);
  const body = context.body.trim() || `${residentTag(resident)} - please review.`;
  const thread = ensureResidentCoordinationThread(resident, recipientIds);
  appendThreadMessage(thread.id, {
    id: `m-${Date.now()}`,
    authorId: activeStaffUser.value.id,
    text: body,
    ts: "now",
  });
  appendThreadMessage(thread.id, {
    id: `m-${Date.now()}-context`,
    authorId: activeStaffUser.value.id,
    text: `Context: ${opportunity?.category ?? "Resident update"} · ${opportunity?.changes.join("; ") ?? resident.latest}`,
    ts: "now",
  });
  taggedMessageContext.value = null;
  setView(roleMessagesView());
  messageTab.value = "rooms";
  openThread(thread);
}

function resetActionDraft(resident: Resident, sourceScreen: string, assignedRole: ActionTargetRole = "provider") {
  actionModalSource.value = sourceScreen;
  actionDraft.value = {
    residentId: resident.id,
    assignedRole,
    assignedUserId:
      assignedRole === "provider"
        ? providerRecipientIds[0] ?? "u4"
        : cnaRecipientIds[0] ?? "u3",
    actionType: assignedRole === "provider" ? providerActionTypes[0] : cnaActionTypes[0],
    priority: assignedRole === "provider" ? "High" : "Routine",
    dueTime: assignedRole === "provider" ? "Now" : "By end of shift",
    instructions:
      assignedRole === "provider"
        ? `Review ${resident.name}'s current change and document the next clinical decision.`
        : `Capture direct observation for ${resident.name} and report anything unusual.`,
    createThread: true,
    sourceOpportunityId: undefined,
  };
}

function openActionRequestModal(resident: Resident, sourceScreen: string, assignedRole: ActionTargetRole = "provider") {
  resetActionDraft(resident, sourceScreen, assignedRole);
}

function actionTypeForOpportunity(opportunity: ProviderOpportunity) {
  const category = opportunity.category.toLowerCase();
  if (category.includes("acute")) {
    return "Evaluate acute change";
  }
  if (category.includes("fall")) {
    return "Review labs/imaging";
  }
  if (category.includes("follow-up") || category.includes("trend")) {
    return "Review resident";
  }
  return providerActionTypes[0];
}

function priorityForOpportunity(opportunity: ProviderOpportunity): ActionPriority {
  if (opportunity.urgency === "urgent") {
    return "Stat";
  }
  if (opportunity.urgency === "high") {
    return "High";
  }
  return "Routine";
}

function dueTimeForOpportunity(opportunity: ProviderOpportunity) {
  if (opportunity.urgency === "urgent") {
    return "Now";
  }
  if (opportunity.urgency === "high") {
    return "Before end of shift";
  }
  return "Today";
}

function openActionRequestFromOpportunity(opportunity: ProviderOpportunity, sourceScreen = "Sage Prediction") {
  resetActionDraft(opportunity.resident, sourceScreen, "provider");
  actionDraft.value = {
    ...actionDraft.value,
    assignedUserId: providerRecipientIds[0] ?? "u4",
    actionType: actionTypeForOpportunity(opportunity),
    priority: priorityForOpportunity(opportunity),
    dueTime: dueTimeForOpportunity(opportunity),
    instructions: `${opportunity.recommendedAction} Evidence: ${opportunity.evidence
      .slice(0, 3)
      .map((event) => `${event.label} - ${event.detail}`)
      .join("; ")}.`,
    createThread: true,
    sourceOpportunityId: opportunity.id,
  };
}

function openActionRequestFromThread() {
  const resident = actionSourceResidentFromThread();
  if (resident) {
    openActionRequestModal(resident, "Messages", "provider");
  }
  threadMenuOpen.value = false;
}

function closeActionRequestModal() {
  actionModalSource.value = null;
}

function setActionAssignedRole(role: ActionTargetRole) {
  actionDraft.value.assignedRole = role;
  actionDraft.value.assignedUserId = role === "provider" ? providerRecipientIds[0] ?? "u4" : cnaRecipientIds[0] ?? "u3";
  actionDraft.value.actionType = role === "provider" ? providerActionTypes[0] : cnaActionTypes[0];
}

function createActionThread(action: ActionRequest) {
  const recipient = getUser(action.assignedUserId);
  const resident = actionResident(action) ?? residents[0];
  const thread = ensureResidentCoordinationThread(resident, [action.assignedUserId]);
  appendThreadMessage(thread.id, {
    id: `m-${Date.now()}`,
    authorId: activeStaffUser.value.id,
    text: `${action.priority} action for ${recipient?.name ?? "care team"}: @${action.residentName} - ${action.instructions}`,
    ts: "now",
  });
  return thread.id;
}

function createActionRequest() {
  const resident = actionModalResident.value;
  if (!resident || !actionModalSource.value || !actionDraft.value.instructions.trim()) {
    return;
  }

  const now = currentTimeLabel();
  const action: ActionRequest = {
    id: `ar-${Date.now()}`,
    residentId: resident.id,
    residentName: resident.name,
    facility: residentFacility(resident),
    priority: actionDraft.value.priority,
    assignedRole: actionDraft.value.assignedRole,
    assignedUserId: actionDraft.value.assignedUserId,
    actionType: actionDraft.value.actionType,
    instructions: actionDraft.value.instructions.trim(),
    dueTime: actionDraft.value.dueTime.trim() || "Today",
    status: "open",
    sourceScreen: actionModalSource.value,
    sourceOpportunityId: actionDraft.value.sourceOpportunityId,
    createdAt: now,
    updatedAt: now,
  };

  if (actionModalSource.value === "Messages" && selectedThread.value) {
    action.linkedThreadId = selectedThread.value.id;
    appendThreadMessage(selectedThread.value.id, {
      id: `action-${Date.now()}`,
      authorId: activeStaffUser.value.id,
      text: `Action requested: @${action.residentName} - ${action.actionType} assigned to ${actionAssigneeName(action)} by ${action.dueTime}.`,
      ts: "now",
    });
  } else if (actionDraft.value.createThread) {
    action.linkedThreadId = createActionThread(action);
  }

  actionRequests.value = [action, ...actionRequests.value];
  actionModalSource.value = null;
}

function shouldUseCnaActionStatusFlow(action: ActionRequest) {
  return selectedRole.value === "cna" && action.assignedRole === "cna";
}

function actionCompleteLabel(action: ActionRequest) {
  return shouldUseCnaActionStatusFlow(action) ? "Complete care" : "Done";
}

function actionFlagLabel(action: ActionRequest) {
  return shouldUseCnaActionStatusFlow(action) ? "Report concern" : "Flag";
}

function openActionStatusModal(action: ActionRequest, status: ActionStatusUpdateTarget) {
  actionStatusDraft.value = {
    actionId: action.id,
    status,
    note: "",
  };
}

function closeActionStatusModal() {
  actionStatusDraft.value = {
    actionId: "",
    status: "completed",
    note: "",
  };
}

function handleActionStatusSelection(action: ActionRequest, status: ActionStatusUpdateTarget) {
  if (shouldUseCnaActionStatusFlow(action)) {
    openActionStatusModal(action, status);
    return;
  }

  updateActionStatus(action, status);
}

function actionStatusThreadText(action: ActionRequest, status: ActionStatus, note: string) {
  const statusNote = note ? ` Note: ${note}` : "";
  if (shouldUseCnaActionStatusFlow(action) && status === "completed") {
    return `${actionAssigneeName(action)} completed care action for @${action.residentName}: ${action.actionType}.${statusNote}`;
  }
  if (shouldUseCnaActionStatusFlow(action) && status === "flagged") {
    return `${actionAssigneeName(action)} reported concern for @${action.residentName}: ${action.actionType}.${statusNote}`;
  }
  return `${actionAssigneeName(action)} marked @${action.residentName} ${action.actionType} as ${actionStatusLabel(status)}.${statusNote}`;
}

function updateActionStatus(action: ActionRequest, status: ActionStatus, note = "") {
  const now = currentTimeLabel();
  const statusNote = note.trim();
  action.status = status;
  action.updatedAt = now;
  action.statusChangedAt = now;
  action.statusChangedById = activeStaffUser.value.id;
  action.statusNote = statusNote || undefined;
  if (action.linkedThreadId) {
    appendThreadMessage(action.linkedThreadId, {
      id: `status-${Date.now()}`,
      authorId: activeStaffUser.value.id,
      text: actionStatusThreadText(action, status, statusNote),
      ts: "now",
    });
  }
}

function submitActionStatusUpdate() {
  const action = actionStatusModalAction.value;
  if (!action || !actionStatusCanSubmit.value) {
    return;
  }

  updateActionStatus(action, actionStatusDraft.value.status, actionStatusDraft.value.note);
  closeActionStatusModal();
}

function closeHeaderMenus() {
  profileMenuOpen.value = false;
  notificationMenuOpen.value = false;
}

function closeFloatingMenus() {
  closeHeaderMenus();
  residentActionMenuOpen.value = false;
}

function toggleProfileMenu() {
  const nextOpen = !profileMenuOpen.value;
  closeFloatingMenus();
  profileMenuOpen.value = nextOpen;
}

function toggleNotificationMenu() {
  const nextOpen = !notificationMenuOpen.value;
  closeFloatingMenus();
  notificationMenuOpen.value = nextOpen;
}

function toggleResidentActionMenu() {
  const nextOpen = !residentActionMenuOpen.value;
  residentActionMenuOpen.value = nextOpen;
}

function handleResidentHeaderAction(action: "escalate" | "order" | "huddle") {
  const resident = selectedResident.value;
  if (!resident) {
    residentActionMenuOpen.value = false;
    return;
  }

  residentActionMenuOpen.value = false;
  if (action === "escalate") {
    openEscalationModal(resident);
    return;
  }
  if (action === "order") {
    openOrderAction(resident);
    return;
  }
  openHuddleModal(resident);
}

function addReadNotificationIds(ids: string[]) {
  readNotificationIds.value = Array.from(new Set([...readNotificationIds.value, ...ids]));
}

function markAllNotificationsAsRead() {
  const notifications = headerNotifications.value;
  if (!notifications.length) {
    return;
  }

  addReadNotificationIds(notifications.map((notification) => notification.id));
}

function handleNotificationSelection(notification: HeaderNotification) {
  addReadNotificationIds([notification.id]);
  closeFloatingMenus();
  const { target } = notification;
  if (target.type === "resident" || target.type === "escalation") {
    openResident(target.residentId);
    return;
  }
  if (target.type === "encounter") {
    const encounter = providerVisitsState.value.find((visit) => visit.id === target.encounterId);
    if (encounter?.status === "needs-review") {
      openEncounterReview(encounter);
      return;
    }
    // TODO(NOTES_PLUS): If an inbound status update makes this alert stale, refresh the encounter before falling back.
    openResident(target.residentId);
    residentTab.value = "notes";
    return;
  }
  if (target.type === "schedule") {
    openScheduleItem(target.item);
    return;
  }
  openResident(target.action.residentId);
}

function setView(view: ViewName) {
  closeFloatingMenus();
  escalationModalResidentId.value = null;
  scheduleModalOpen.value = false;
  editingClinicalOrderId.value = null;
  selectedScheduleDateKey.value = null;
  closeStartEncounterModal();
  closeActionStatusModal();
  closeThreadRenameModal();
  threadMenuOpen.value = false;
  if (view !== "provider-visit") {
    stopVisitRecording();
    clearVisitElapsedTimer();
    activeVisitId.value = null;
    visitStopConfirmOpen.value = false;
  }
  if (view !== "provider-review") {
    activeReviewVisitId.value = null;
    revisionModalSectionId.value = null;
    revisionModalThreadId.value = null;
    signEncounterConfirmOpen.value = false;
  }
  activeView.value = view;
  selectedResidentId.value = null;
  if (!["messages", "provider-collaboration", "cna-messages"].includes(view)) {
    selectedThreadId.value = null;
  }
}

function selectRole(role: RoleKey) {
  closeFloatingMenus();
  escalationModalResidentId.value = null;
  scheduleModalOpen.value = false;
  editingClinicalOrderId.value = null;
  selectedScheduleDateKey.value = null;
  closeStartEncounterModal();
  closeThreadRenameModal();
  threadMenuOpen.value = false;
  stopVisitRecording();
  clearVisitElapsedTimer();
  activeVisitId.value = null;
  visitStopConfirmOpen.value = false;
  selectedRole.value = role;
  ensureLoginUserForRole(role);
  syncProfileFromLoginUser(role);
  selectedFacility.value = defaultFacilityForRole(role);
  activeView.value = roleProfiles[role].defaultView;
  selectedResidentId.value = null;
  selectedThreadId.value = null;
  messageTab.value = "rooms";
  if (residentTab.value === "notes" && role !== "provider") {
    residentTab.value = "situation";
  }
}

function login() {
  closeFloatingMenus();
  ensureLoginUserForRole(selectedRole.value);
  syncProfileFromLoginUser(selectedRole.value);
  isAuthenticated.value = true;
  selectedFacility.value = defaultFacilityForRole(selectedRole.value);
  activeView.value = activeRole.value.defaultView;
  activeVisitId.value = null;
  visitStopConfirmOpen.value = false;
  closeStartEncounterModal();
  closeThreadRenameModal();
  threadMenuOpen.value = false;
  selectedResidentId.value = null;
  selectedThreadId.value = null;
  threadMessages.value = [];
  messageTab.value = "rooms";
}

function openResident(residentOrId: Resident | string) {
  closeFloatingMenus();
  const resident =
    typeof residentOrId === "string"
      ? residents.find((entry) => entry.id === residentOrId)
      : residentOrId;
  if (!resident) {
    return;
  }

  selectedResidentId.value = resident.id;
  residentTab.value = "situation";
  residentContextTab.value = "updates";
  residentChat.value = [...resident.talk];
  workingCareSteps.value = { ...resident.careSteps };
  expandedProviderNoteId.value = null;
  encounterModalNoteId.value = null;
  closeStartEncounterModal();
  deleteProviderNoteId.value = null;
  providerTranscript.value = "";
  providerNoteDraft.value = "";
  assignedNurse.value = null;
  openClarify.value = resident.situation.clarify.length ? 0 : null;
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

function closeResident() {
  residentActionMenuOpen.value = false;
  if (activeView.value === "provider-visit") {
    stopVisitRecording();
    clearVisitElapsedTimer();
    activeVisitId.value = null;
    visitStopConfirmOpen.value = false;
  }
  selectedResidentId.value = null;
}

function openProviderHomeNote(note: ProviderNote) {
  const resident = residents.find((entry) => entry.id === note.residentId);
  if (!resident) {
    return;
  }
  openResident(resident);
  residentTab.value = "notes";
  expandedProviderNoteId.value = note.id;
}

function delegateActions() {
  const now = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  workingCareSteps.value = {
    surveillance: "done",
    reassessment: "active",
    provider: "pending",
  };
  assignedNurse.value = { name: "Sarah Jenkins, RN", time: now };
  showDelegate.value = false;
}

function sendResidentChat() {
  const text = residentDraft.value.trim();
  if (!text) {
    return;
  }

  residentChat.value.push({ id: `u-${Date.now()}`, sender: "user", text });
  residentDraft.value = "";
  window.setTimeout(() => {
    residentChat.value.push({
      id: `s-${Date.now()}`,
      sender: "sage",
      text: "I've noted that. Anything else you want me to add to the handoff?",
    });
  }, 400);
}

function openThread(thread: Thread) {
  if (thread.unread > 0 || !visibleThreads.value.some((entry) => entry.id === thread.id)) {
    createLocalThread({ ...thread, unread: 0 });
  }
  selectedThreadId.value = thread.id;
  threadMessages.value = [...thread.messages];
  threadMenuOpen.value = false;
  closeThreadUtilityModal();
}

function callMessage(mode: Exclude<MessageStartMode, "message">, authorId = activeStaffUser.value.id): ThreadMessage {
  return {
    id: `call-${Date.now()}`,
    authorId,
    text: mode === "video-call" ? "Video call started" : "Voice call started",
    ts: "now",
    kind: mode,
  };
}

function openDirectMessage(user: CareUser, mode: MessageStartMode = "message") {
  if (user.id === activeStaffUser.value.id) {
    return;
  }
  const existingThread = visibleThreads.value.find(
    (thread) =>
      thread.kind === "dm" &&
      thread.members.map((member) => normalizeActorId(member)).includes(activeStaffUser.value.id) &&
      thread.members.map((member) => normalizeActorId(member)).includes(user.id),
  );
  if (existingThread) {
    if (mode !== "message") {
      appendThreadMessage(existingThread.id, callMessage(mode));
    }
    threadMenuOpen.value = false;
    selectedUserIds.value = [];
    openThread(
      visibleThreads.value.find((thread) => thread.id === existingThread.id) ?? existingThread,
    );
    return;
  }
  const thread: Thread = {
    id: `dm-${activeStaffUser.value.id}-${user.id}`,
    kind: "dm",
    purpose: "direct",
    title: user.name,
    members: uniqueIds([activeStaffUser.value.id, user.id]),
    image: user.image,
    lastMessage:
      mode === "message"
        ? "New direct message"
        : mode === "video-call"
          ? "Video call started"
          : "Voice call started",
    lastTs: "now",
    unread: 0,
    messages: mode === "message" ? [] : [callMessage(mode)],
  };
  createLocalThread(thread);
  threadMenuOpen.value = false;
  selectedUserIds.value = [];
  openThread(thread);
}

function toggleThreadMenu() {
  threadMenuOpen.value = !threadMenuOpen.value;
}

function openThreadSummary() {
  if (!selectedThread.value) {
    return;
  }
  threadUtilityModal.value = "summary";
  threadUtilityMessageId.value = null;
  threadMenuOpen.value = false;
}

function openThreadInsight() {
  if (!selectedThread.value) {
    return;
  }
  threadUtilityModal.value = "insight";
  threadUtilityMessageId.value = null;
  threadMenuOpen.value = false;
}

function openThreadTranscription(message: ThreadMessage) {
  if (message.kind !== "voice-call" && message.kind !== "video-call") {
    return;
  }
  threadUtilityModal.value = "transcription";
  threadUtilityMessageId.value = message.id;
  threadMenuOpen.value = false;
}

function closeThreadUtilityModal() {
  threadUtilityModal.value = null;
  threadUtilityMessageId.value = null;
}

function openThreadRenameModal() {
  const thread = selectedThread.value;
  if (!thread || thread.kind !== "huddle") {
    return;
  }
  threadRenameDraft.value = thread.title;
  threadRenameModalOpen.value = true;
  threadMenuOpen.value = false;
}

function closeThreadRenameModal() {
  threadRenameModalOpen.value = false;
  threadRenameDraft.value = "";
}

function saveThreadRename() {
  const thread = selectedThread.value;
  const title = threadRenameDraft.value.trim();
  if (!thread || thread.kind !== "huddle" || !title) {
    return;
  }

  createLocalThread({ ...thread, title });
  closeThreadRenameModal();
}

function closeThread() {
  selectedThreadId.value = null;
  threadMessages.value = [];
  threadDraft.value = "";
  threadMenuOpen.value = false;
  closeThreadUtilityModal();
  closeThreadRenameModal();
}

function sendThreadMessage() {
  const text = threadDraft.value.trim();
  const thread = selectedThread.value;
  if (!text || !thread) {
    return;
  }

  appendThreadMessage(thread.id, {
    id: `m-${Date.now()}`,
    authorId: activeStaffUser.value.id,
    text,
    ts: "now",
  });
  threadDraft.value = "";
}

function toggleUserSelection(userId: string) {
  selectedUserIds.value = selectedUserIds.value.includes(userId)
    ? selectedUserIds.value.filter((id) => id !== userId)
    : [...selectedUserIds.value, userId];
}

function startHuddle() {
  startGroupConversation("message");
}

function startGroupConversation(mode: MessageStartMode = "message") {
  const selectedIds = selectedUserIds.value.filter((userId) => userId !== activeStaffUser.value.id);
  if (selectedIds.length === 0) {
    return;
  }
  const selectedUsers = users.filter((user) => selectedIds.includes(user.id));
  const title =
    selectedUsers.length === 1
      ? selectedUsers[0].name
      : selectedUsers.length <= 3
        ? selectedUsers.map((user) => user.name.split(" ")[0]).join(", ")
        : `${selectedUsers.length} person group`;
  const thread: Thread = {
    id: `group-${Date.now()}`,
    kind: "huddle",
    purpose: "staff-group",
    title,
    members: uniqueIds([activeStaffUser.value.id, ...selectedUsers.map((user) => user.id)]),
    lastMessage:
      mode === "message"
        ? "New group conversation"
        : mode === "video-call"
          ? "Group video call started"
          : "Group voice call started",
    lastTs: "now",
    unread: 0,
    messages:
      mode === "message"
        ? [
            {
              id: `m-${Date.now()}`,
              authorId: activeStaffUser.value.id,
              text: "Started a group conversation.",
              ts: "now",
            },
          ]
        : [callMessage(mode)],
  };
  createdThreads.value = [thread, ...createdThreads.value];
  selectedUserIds.value = [];
  openThread(thread);
}

function startThreadCall(mode: Exclude<MessageStartMode, "message">) {
  const thread = selectedThread.value;
  if (!thread) {
    return;
  }
  appendThreadMessage(thread.id, callMessage(mode));
}

function openSelectedThreadResident() {
  const thread = selectedThread.value;
  const resident = thread ? threadResident(thread) : null;
  if (resident) {
    openResident(resident);
  }
}

function scheduleSelectedThreadHuddle() {
  const thread = selectedThread.value;
  const resident = thread ? threadResident(thread) : null;
  if (resident) {
    openScheduleModal("huddle", resident);
  }
}

function openThreadUtilityResident() {
  if (!threadUtilityResident.value) {
    return;
  }
  closeThreadUtilityModal();
  openSelectedThreadResident();
}

function sendAi(text: string, tailored?: SuggestedPrompt["response"]) {
  const clean = text.trim();
  if (!clean) {
    return;
  }

  aiMessages.value.push({
    id: `u-${Date.now()}`,
    kind: "text",
    from: "me",
    text: clean,
  });
  aiMessages.value.push({
    id: `s-${Date.now()}`,
    kind: "text",
    from: "sage",
    text: tailored?.text ?? "Noted. Pulling that up now.",
    bullets: tailored?.bullets,
    footer: tailored?.footer,
  });
  aiDraft.value = "";
}

function usePrompt(prompt: SuggestedPrompt) {
  usedPrompts.value.push(prompt.id);
  sendAi(prompt.label, prompt.response);
}

function currentTimeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: activeProfile.value.time24Hour ? "2-digit" : "numeric",
    minute: "2-digit",
    hour12: !activeProfile.value.time24Hour,
  });
}

function currentNoteDateTimeLabel() {
  const now = new Date();
  const date = now.toLocaleDateString([], { month: "short", day: "numeric" });
  return `${date}, ${currentTimeLabel()}`;
}

function displayFirstName(name: string) {
  return name.replace(/^Dr\.\s*/i, "").split(" ")[0].replace(/,$/, "");
}

function clearProviderRecordingTimer() {
  if (providerRecordingTimer) {
    window.clearInterval(providerRecordingTimer);
    providerRecordingTimer = null;
  }
}

function clearCnaRecordingTimer() {
  if (cnaRecordingTimer) {
    window.clearInterval(cnaRecordingTimer);
    cnaRecordingTimer = null;
  }
}

function clearVisitRecordingTimer() {
  if (visitRecordingTimer) {
    window.clearInterval(visitRecordingTimer);
    visitRecordingTimer = null;
  }
}

function clearVisitElapsedTimer() {
  if (visitElapsedTimer) {
    window.clearInterval(visitElapsedTimer);
    visitElapsedTimer = null;
  }
}

function syncVisitElapsed() {
  const visit = activeProviderVisit.value;
  visitElapsedSeconds.value = visit
    ? Math.max(0, Math.floor((Date.now() - visit.startedAtMs) / 1000))
    : 0;
}

function startVisitElapsedTimer() {
  clearVisitElapsedTimer();
  syncVisitElapsed();
  visitElapsedTimer = window.setInterval(syncVisitElapsed, 1000);
}

function stopVisitRecording() {
  const visit = activeProviderVisit.value;
  if (!visit || !visitRecordingActive.value) {
    return;
  }

  visitRecordingActive.value = false;
  clearVisitRecordingTimer();
  visitRecordingSeconds.value = Math.max(visitRecordingSeconds.value, 8);
  visit.voiceTranscript = `${visit.residentName}: provider reviewed current trajectory, unresolved concerns, medication and monitoring needs, and care-team follow-up during this encounter.`;
}

function startVisitRecording() {
  if (!activeProviderVisit.value || visitRecordingActive.value) {
    return;
  }

  visitRecordingActive.value = true;
  visitRecordingSeconds.value = 0;
  clearVisitRecordingTimer();
  visitRecordingTimer = window.setInterval(() => {
    visitRecordingSeconds.value += 1;
  }, 1000);
}

function visitNoteSummary(visit: ProviderVisit) {
  const source = visit.textNote.trim() || visit.voiceTranscript.trim();
  return source ? timelineSummary(source, 140) : "Encounter opened; note content not added yet.";
}

function visitSourceLabel(visit: ProviderVisit) {
  const sources = [
    visit.textNote.trim() ? "Text note" : "",
    visit.voiceTranscript.trim() ? "Voice note" : "",
  ].filter(Boolean);
  return sources.length ? sources.join(" + ") : "No note captured";
}

function visitOrderSummary(visit: ProviderVisit) {
  const count = visit.orderIds.length;
  return count === 1 ? "1 order" : `${count} orders`;
}

function providerVisitStatusLabel(visit: ProviderVisit) {
  const labels: Record<ProviderEncounterStatus, string> = {
    scheduled: "Scheduled",
    "provider-in-progress": "Encounter In Progress",
    "scribe-in-progress": "In Progress",
    "needs-review": "Needs Review",
    revision: "Revision",
    "submitted-to-billing": "Submitted to Billing",
  };
  return labels[visit.status];
}

function visitSyncSummary(visit: ProviderVisit) {
  if (visit.status === "scheduled" || visit.status === "provider-in-progress") {
    return "";
  }
  if (visit.notesPlusSyncStatus === "synced") {
    return `Automatically synced to Otangeles Notes+${visit.notesPlusSyncedAt ? ` at ${visit.notesPlusSyncedAt}` : ""}`;
  }
  return "Waiting to sync to Otangeles Notes+";
}

function defaultVisitTypeForResident(resident: Resident): VisitType {
  return providerOpportunityByResidentId.value.get(resident.id)?.visitType ?? "Follow-Up";
}

function encounterResident(encounter: ProviderVisit) {
  return residents.find((resident) => resident.id === encounter.residentId) ?? residents[0];
}

function inProgressVisitForResident(residentId: string) {
  return providerVisitsState.value.find(
    (visit) => visit.residentId === residentId && visit.status === "provider-in-progress",
  ) ?? null;
}

function scheduledVisitForResident(residentId: string) {
  return providerVisitsState.value.find(
    (visit) => visit.residentId === residentId && visit.status === "scheduled",
  ) ?? null;
}

function prepareResidentForEncounter(resident: Resident) {
  closeFloatingMenus();
  selectedResidentId.value = resident.id;
  residentTab.value = "notes";
  residentChat.value = [...resident.talk];
  workingCareSteps.value = { ...resident.careSteps };
}

function openProviderVisit(visit: ProviderVisit) {
  closeFloatingMenus();
  activeVisitId.value = visit.id;
  activeView.value = "provider-visit";
  visitNoteMode.value = "text";
  visitStopConfirmOpen.value = false;
  visitRecordingActive.value = false;
  visitRecordingSeconds.value = 0;
  startVisitElapsedTimer();
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

function createProviderVisit(resident: Resident, visitType: VisitType) {
  const now = Date.now();
  const visit: ProviderVisit = {
    id: `visit-${now}`,
    residentId: resident.id,
    residentName: resident.name,
    providerUserId: activeStaffUser.value.id,
    providerName: activeStaffUser.value.name,
    visitType,
    scheduledDate: todayDateKey(),
    scheduledTime: currentTimeLabel(),
    clinicalPriority: mockEncounterPriority(resident),
    visitReason: resident.situation.concerns[0]?.title ?? resident.latest,
    baselineChange: resident.latest,
    supportingEvidence: mockEncounterEvidence(resident),
    startedAt: currentTimeLabel(),
    startedAtMs: now,
    textNote: "",
    voiceTranscript: "",
    orderIds: [],
    status: "provider-in-progress",
    notesPlusSyncStatus: "pending",
    documentTitle: "Progress Notes",
    sections: encounterSectionsForResident(resident),
  };
  providerVisitsState.value = [visit, ...providerVisitsState.value];
  return visit;
}

function startVisitForResident(
  resident: Resident,
  visitType = defaultVisitTypeForResident(resident),
  scheduledEncounter: ProviderVisit | null = null,
) {
  stopVisitRecording();
  prepareResidentForEncounter(resident);
  const existingVisit = inProgressVisitForResident(resident.id);
  const visit = existingVisit ?? scheduledEncounter ?? createProviderVisit(resident, visitType);
  if (visit.status === "scheduled") {
    visit.status = "provider-in-progress";
    visit.startedAt = currentTimeLabel();
    visit.startedAtMs = Date.now();
    visit.providerUserId = activeStaffUser.value.id;
    visit.providerName = activeStaffUser.value.name;
  }
  openProviderVisit(visit);
}

function requestStartEncounterForResident(resident: Resident) {
  const existingVisit = inProgressVisitForResident(resident.id);
  if (existingVisit) {
    startVisitForResident(resident);
    return;
  }

  const scheduledVisit = scheduledVisitForResident(resident.id);
  if (scheduledVisit) {
    startVisitForResident(resident, scheduledVisit.visitType, scheduledVisit);
    return;
  }

  closeFloatingMenus();
  startEncounterResidentId.value = resident.id;
  startEncounterDraft.value = {
    visitType: defaultVisitTypeForResident(resident),
  };
}

function startScheduledEncounter(encounter: ProviderVisit) {
  const resident = residents.find((entry) => entry.id === encounter.residentId);
  if (resident) {
    startVisitForResident(resident, encounter.visitType, encounter);
  }
}

function closeStartEncounterModal() {
  startEncounterResidentId.value = null;
}

function submitStartEncounterModal() {
  const resident = startEncounterResident.value;
  if (!resident) {
    closeStartEncounterModal();
    return;
  }

  const visitType = startEncounterDraft.value.visitType;
  closeStartEncounterModal();
  startVisitForResident(resident, visitType);
}

function addEncounterNoteForSelectedResident() {
  if (selectedResident.value) {
    requestStartEncounterForResident(selectedResident.value);
  }
}

function returnToResidentNotes() {
  const resident = activeVisitResident.value;
  stopVisitRecording();
  clearVisitElapsedTimer();
  activeVisitId.value = null;
  visitStopConfirmOpen.value = false;
  activeView.value = selectedRole.value === "provider" ? "provider-home" : activeRole.value.defaultView;
  if (resident) {
    openResident(resident);
    residentTab.value = "notes";
  }
}

function requestStopVisit() {
  visitStopConfirmOpen.value = true;
}

function confirmStopVisit() {
  const visit = activeProviderVisit.value;
  if (!visit) {
    visitStopConfirmOpen.value = false;
    returnToResidentNotes();
    return;
  }

  stopVisitRecording();
  clearVisitElapsedTimer();
  visit.status = "scribe-in-progress";
  visit.endedAt = currentTimeLabel();
  visit.assignedScribe = "Mark Rivera, Scribe";
  syncProviderNoteIntoEncounterDocument(visit);
  const assessmentPlanSection = visit.sections.find((section) => section.id === "assessment-plan");
  if (assessmentPlanSection && visit.orderIds.length) {
    assessmentPlanSection.content = [
      ...assessmentPlanSection.content,
      ...visit.orderIds.map((orderId) => ({ label: "Orders", text: `Linked clinical order ${orderId} routed with this encounter.` })),
    ];
  }
  syncEndedEncounterToNotesPlus(visit);
  visitStopConfirmOpen.value = false;
  returnToResidentNotes();
}

function linkOrderToActiveVisit(orderId: string) {
  const visit = activeProviderVisit.value;
  if (!visit || visit.orderIds.includes(orderId)) {
    return;
  }
  visit.orderIds = [...visit.orderIds, orderId];
}

function openVisitOrder() {
  const resident = activeVisitResident.value;
  if (resident) {
    openScheduleModal("clinical-order", resident);
  }
}

function openEncounterReview(encounter: ProviderVisit) {
  if (encounter.status !== "needs-review") {
    return;
  }
  openResident(encounter.residentId);
  residentTab.value = "notes";
  activeReviewVisitId.value = encounter.id;
  activeView.value = "provider-review";
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
}

function returnToResidentEncounters() {
  const residentId = activeReviewEncounter.value?.residentId;
  activeReviewVisitId.value = null;
  revisionModalSectionId.value = null;
  revisionModalThreadId.value = null;
  signEncounterConfirmOpen.value = false;
  activeView.value = "provider-home";
  if (residentId) {
    openResident(residentId);
    residentTab.value = "notes";
  }
}

function encounterSectionHasOpenRevision(section: EncounterSection) {
  return section.revisionThreads.some((thread) => thread.status === "open");
}

function toggleEncounterSectionVerified(section: EncounterSection) {
  if (section.verified || encounterSectionHasOpenRevision(section)) {
    return;
  }
  section.verified = true;
}

function toggleAllEncounterSections(event: Event) {
  const encounter = activeReviewEncounter.value;
  const input = event.target as HTMLInputElement;
  if (!encounter || activeReviewHasOpenRevisions.value) {
    input.checked = false;
    return;
  }
  encounter.sections.forEach((section) => {
    section.verified = input.checked;
  });
}

function openRevisionCommentModal(section: EncounterSection, thread: RevisionThread | null = null) {
  revisionModalSectionId.value = section.id;
  revisionModalThreadId.value = thread?.id ?? null;
  revisionModalText.value = thread?.comments[0]?.body ?? "";
}

function closeRevisionCommentModal() {
  revisionModalSectionId.value = null;
  revisionModalThreadId.value = null;
  revisionModalText.value = "";
}

function submitRevisionComment() {
  const section = revisionModalSection.value;
  const text = revisionModalText.value.trim();
  if (!section || !text) {
    return;
  }

  const existingThread = revisionModalThreadId.value
    ? section.revisionThreads.find((thread) => thread.id === revisionModalThreadId.value)
    : null;
  if (existingThread?.comments[0]) {
    existingThread.comments[0].body = text;
    existingThread.comments[0].createdAt = currentTimeLabel();
  } else {
    const now = Date.now();
    section.revisionThreads.push({
      id: `revision-${section.id}-${now}`,
      status: "open",
      comments: [
        {
          id: `revision-comment-${now}`,
          authorId: activeStaffUser.value.id,
          authorName: activeStaffUser.value.name,
          role: "provider",
          body: text,
          createdAt: currentTimeLabel(),
        },
      ],
    });
  }
  section.verified = false;
  closeRevisionCommentModal();
}

function deleteRevisionThread(section: EncounterSection, threadId: string) {
  section.revisionThreads = section.revisionThreads.filter((thread) => thread.id !== threadId);
  delete revisionReplyDrafts.value[threadId];
}

function submitRevisionReply(thread: RevisionThread) {
  const body = revisionReplyDrafts.value[thread.id]?.trim();
  if (!body || thread.status !== "open") {
    return;
  }
  thread.comments.push({
    id: `revision-reply-${Date.now()}`,
    authorId: activeStaffUser.value.id,
    authorName: activeStaffUser.value.name,
    role: "provider",
    body,
    createdAt: currentTimeLabel(),
  });
  revisionReplyDrafts.value[thread.id] = "";
}

function deleteRevisionReply(thread: RevisionThread, commentId: string) {
  thread.comments = thread.comments.filter(
    (comment, index) => index === 0 || comment.id !== commentId || comment.authorId !== activeStaffUser.value.id,
  );
}

function returnEncounterToScribe() {
  const encounter = activeReviewEncounter.value;
  if (!encounter || !activeReviewHasOpenRevisions.value) {
    return;
  }
  returnEncounterRevisionToNotesPlus(encounter);
  returnToResidentEncounters();
}

function simulateScribeResubmission(encounter: ProviderVisit) {
  if (encounter.status !== "revision") {
    return;
  }
  encounter.sections.forEach((section) => {
    const openThreads = section.revisionThreads.filter((thread) => thread.status === "open");
    openThreads.forEach((thread) => {
      thread.status = "addressed";
      thread.comments.push({
        id: `scribe-reply-${thread.id}-${Date.now()}`,
        authorId: "mock-scribe",
        authorName: encounter.assignedScribe ?? "Mark Rivera, Scribe",
        role: "scribe",
        body: "The requested correction has been applied to this section and is ready for provider review.",
        createdAt: currentTimeLabel(),
      });
    });
    if (openThreads.length) {
      section.content = [
        ...section.content,
        { label: "Scribe revision", text: "Updated to incorporate the provider's clarification request." },
      ];
      section.revisedAt = currentTimeLabel();
    }
    section.verified = false;
  });
  // TODO(NOTES_PLUS): Remove this prototype control when Scribe resubmission status updates arrive from Notes+.
  receiveEncounterStatusFromNotesPlus(encounter, "needs-review");
  readNotificationIds.value = readNotificationIds.value.filter(
    (id) => id !== `encounter-review-${encounter.id}`,
  );
}

function requestEncounterSignature() {
  if (!activeReviewEncounter.value || activeReviewHasOpenRevisions.value || !activeReviewAllVerified.value) {
    return;
  }
  if (!currentProviderSignature.value) {
    signatureSetupPromptOpen.value = true;
    return;
  }
  signEncounterConfirmOpen.value = true;
}

function confirmEncounterSignature() {
  const encounter = activeReviewEncounter.value;
  const signature = currentProviderSignature.value;
  if (!encounter || !signature || !activeReviewAllVerified.value || activeReviewHasOpenRevisions.value) {
    return;
  }
  const signedAt = `${new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} ${currentTimeLabel()}`;
  encounter.signedSignature = {
    method: signature.method,
    typedName: signature.typedName,
    dataUrl: signature.dataUrl,
    savedAt: signature.savedAt,
    providerId: activeStaffUser.value.id,
    providerName: activeStaffUser.value.name,
    signedAt,
  };
  submitSignedEncounterToNotesPlus(encounter);
  signEncounterConfirmOpen.value = false;
  returnToResidentEncounters();
}

function setSignatureMode(mode: SignatureMethod) {
  signatureMode.value = mode;
  signatureError.value = "";
  signatureSavedMessage.value = "";
  if (mode === "draw") {
    nextTick(clearSignatureCanvas);
  }
}

function signatureCanvasPoint(event: PointerEvent) {
  const canvas = signatureCanvas.value;
  if (!canvas) {
    return { x: 0, y: 0 };
  }
  const bounds = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
    y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
  };
}

function beginSignatureDrawing(event: PointerEvent) {
  const canvas = signatureCanvas.value;
  const context = canvas?.getContext("2d");
  if (!canvas || !context) {
    return;
  }
  signatureDrawing.value = true;
  canvas.setPointerCapture(event.pointerId);
  const point = signatureCanvasPoint(event);
  context.beginPath();
  context.moveTo(point.x, point.y);
  context.strokeStyle = "#1c192e";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.lineJoin = "round";
}

function drawSignature(event: PointerEvent) {
  const context = signatureCanvas.value?.getContext("2d");
  if (!signatureDrawing.value || !context) {
    return;
  }
  const point = signatureCanvasPoint(event);
  context.lineTo(point.x, point.y);
  context.stroke();
  signatureCanvasDirty.value = true;
}

function endSignatureDrawing() {
  signatureDrawing.value = false;
}

function clearSignatureCanvas() {
  const canvas = signatureCanvas.value;
  const context = canvas?.getContext("2d");
  if (canvas && context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  signatureCanvasDirty.value = false;
}

function handleSignatureUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  signatureError.value = "";
  signatureSavedMessage.value = "";
  if (!file) {
    return;
  }
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    signatureError.value = "Upload a PNG, JPEG, or WebP signature image.";
    input.value = "";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    signatureError.value = "Signature images must be 2 MB or smaller.";
    input.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    signatureUploadPreview.value = typeof reader.result === "string" ? reader.result : "";
  };
  reader.onerror = () => {
    signatureError.value = "The selected signature image could not be read.";
  };
  reader.readAsDataURL(file);
}

function saveProviderSignature() {
  signatureError.value = "";
  signatureSavedMessage.value = "";
  let signature: ProviderSignature | null = null;
  const savedAt = `${new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} ${currentTimeLabel()}`;
  if (signatureMode.value === "type") {
    const typedName = signatureTypedName.value.trim();
    if (!typedName) {
      signatureError.value = "Type the provider name before saving the signature.";
      return;
    }
    signature = { method: "type", typedName, savedAt };
  } else if (signatureMode.value === "draw") {
    if (!signatureCanvasDirty.value || !signatureCanvas.value) {
      signatureError.value = "Draw a signature in the box before saving.";
      return;
    }
    signature = { method: "draw", dataUrl: signatureCanvas.value.toDataURL("image/png"), savedAt };
  } else {
    if (!signatureUploadPreview.value) {
      signatureError.value = "Choose a signature image before saving.";
      return;
    }
    signature = { method: "upload", dataUrl: signatureUploadPreview.value, savedAt };
  }
  providerSignatures.value = {
    ...providerSignatures.value,
    [activeStaffUser.value.id]: signature,
  };
  signatureSavedMessage.value = "Signature saved for encounter signing.";
}

function removeProviderSignature() {
  const next = { ...providerSignatures.value };
  delete next[activeStaffUser.value.id];
  providerSignatures.value = next;
  signatureSavedMessage.value = "Signature removed.";
  signatureError.value = "";
}

function goToSignatureSettings() {
  signatureSetupPromptOpen.value = false;
  signatureTypedName.value ||= activeProfileDisplayName.value;
  setView("provider-profile");
  nextTick(() => {
    document.getElementById("provider-signature-settings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function resetMockEncounterWorkflow() {
  providerVisitsState.value = cloneInitialProviderVisits();
  activeVisitId.value = null;
  activeReviewVisitId.value = null;
  readNotificationIds.value = readNotificationIds.value.filter((id) => !id.startsWith("encounter-review-"));
  signatureSavedMessage.value = "Mock encounter workflow reset.";
}

function createProviderNote(source: ProviderNoteSource, body: string) {
  if (!selectedResident.value) {
    return;
  }

  const text = body.trim();
  if (!text) {
    return;
  }

  const note: ProviderNote = {
    id: `pn-${Date.now()}`,
    residentId: selectedResident.value.id,
    residentName: selectedResident.value.name,
    title: `${source === "voice" ? "Voice Note" : "Note"} - ${currentNoteDateTimeLabel()}`,
    body: text,
    source,
    createdAt: currentTimeLabel(),
    status: "note",
  };

  providerNotesState.value = [...providerNotesState.value, note];
  expandedProviderNoteId.value = note.id;
  providerNoteDraft.value = "";
}

function saveTypedProviderNote() {
  createProviderNote("typed", providerNoteDraft.value);
}

function startProviderRecording() {
  if (!selectedResident.value || providerRecordingActive.value) {
    return;
  }

  providerRecordingActive.value = true;
  providerRecordingSeconds.value = 0;
  providerTranscript.value = "";
  clearProviderRecordingTimer();
  providerRecordingTimer = window.setInterval(() => {
    providerRecordingSeconds.value += 1;
  }, 1000);
}

function stopProviderRecording() {
  if (!selectedResident.value || !providerRecordingActive.value) {
    return;
  }

  providerRecordingActive.value = false;
  clearProviderRecordingTimer();
  providerRecordingSeconds.value = Math.max(providerRecordingSeconds.value, 8);
  const transcript = `${selectedResident.value.name}: provider reviewed resident trajectory, current nursing concerns, and next follow-up needs. Route this observation into the encounter draft after clinical review.`;
  providerTranscript.value = transcript;
  createProviderNote("voice", transcript);
}

function toggleProviderNote(noteId: string) {
  expandedProviderNoteId.value = expandedProviderNoteId.value === noteId ? null : noteId;
}

function noteSummaryForEncounter(body: string) {
  const text = body.trim().replace(/\s+/g, " ");
  if (text.length <= 180) {
    return text;
  }

  const sentenceMatches = text.match(/[^.!?]+[.!?]+/g);
  const summary = sentenceMatches?.slice(0, 2).join(" ").trim() || text.slice(0, 240).trim();
  return summary.length > 260 ? `${summary.slice(0, 257).trim()}...` : summary;
}

function defaultVisitTypeForProviderNote(note: ProviderNote): VisitType {
  const lower = `${note.title} ${note.body}`.toLowerCase();
  if (/(acute|uti|delirium|fall|pain|fever|change)/.test(lower)) {
    return "Acute";
  }
  return "Follow-Up";
}

function openEncounterModal(note: ProviderNote) {
  encounterModalNoteId.value = note.id;
  expandedProviderNoteId.value = note.id;
  encounterModalDraft.value = {
    residentName: note.residentName,
    visitType: note.encounterDraft?.visitType ?? defaultVisitTypeForProviderNote(note),
    notes: note.encounterDraft?.body ?? noteSummaryForEncounter(note.body),
  };
}

function closeEncounterModal() {
  encounterModalNoteId.value = null;
}

function submitEncounterModal() {
  const note = encounterModalNote.value;
  if (!note) {
    return;
  }

  const notes = encounterModalDraft.value.notes.trim();
  if (!encounterModalDraft.value.residentName.trim() || !notes) {
    return;
  }

  note.residentName = encounterModalDraft.value.residentName.trim();
  note.encounterDraft = {
    id: note.encounterDraft?.id ?? `enc-${Date.now()}`,
    residentId: note.residentId,
    visitType: encounterModalDraft.value.visitType,
    body: notes,
    instructions: "Review note, confirm orders or follow-up instructions, then send to Otangeles Notes+.",
    destination: "Otangeles Notes+",
    status: "draft",
  };
  note.status = "draft-created";
  expandedProviderNoteId.value = note.id;
  closeEncounterModal();
}

function openDeleteProviderNoteModal(note: ProviderNote) {
  deleteProviderNoteId.value = note.id;
  expandedProviderNoteId.value = note.id;
}

function closeDeleteProviderNoteModal() {
  deleteProviderNoteId.value = null;
}

function deleteProviderNote(noteId: string) {
  providerNotesState.value = providerNotesState.value.filter((note) => note.id !== noteId);
  if (expandedProviderNoteId.value === noteId) {
    expandedProviderNoteId.value = null;
  }
}

function confirmDeleteProviderNote() {
  if (!deleteProviderNoteId.value) {
    return;
  }
  deleteProviderNote(deleteProviderNoteId.value);
  closeDeleteProviderNoteModal();
}

function providerNoteSourceLabel(source: ProviderNoteSource) {
  return source === "voice" ? "Voice transcript" : "Typed note";
}

function selectCnaAssignment(assignmentId: string) {
  if (cnaRecordingActive.value) {
    clearCnaRecordingTimer();
    cnaRecordingActive.value = false;
  }
  selectedCnaAssignmentId.value = assignmentId;
  cnaDebriefDraft.value =
    cnaDebriefs.value.find((entry) => entry.assignmentId === assignmentId)?.transcript ?? "";
}

function updateCnaDebriefStatus(assignmentId: string, status: CnaDebriefStatus) {
  const entry = cnaDebriefs.value.find((item) => item.assignmentId === assignmentId);
  if (entry) {
    entry.status = status;
  }
}

function startCnaRecording() {
  if (!currentDebriefAssignment.value || cnaRecordingActive.value) {
    return;
  }

  cnaRecordingActive.value = true;
  cnaRecordingSeconds.value = 0;
  updateCnaDebriefStatus(currentDebriefAssignment.value.id, "recording");
  clearCnaRecordingTimer();
  cnaRecordingTimer = window.setInterval(() => {
    cnaRecordingSeconds.value += 1;
  }, 1000);
}

function stopCnaRecording() {
  if (!currentDebriefAssignment.value || !cnaRecordingActive.value) {
    return;
  }

  cnaRecordingActive.value = false;
  clearCnaRecordingTimer();
  cnaRecordingSeconds.value = Math.max(cnaRecordingSeconds.value, 10);
  cnaDebriefDraft.value = `${currentDebriefAssignment.value.resident.name} completed care review. Intake, mood, transfers, comfort, and anything unusual were discussed.`;
  updateCnaDebriefStatus(currentDebriefAssignment.value.id, "not-started");
}

function sendCnaDebrief() {
  const text = cnaDebriefDraft.value.trim();
  if (!text || !currentDebriefAssignment.value) {
    return;
  }

  const entry = cnaDebriefs.value.find(
    (item) => item.assignmentId === currentDebriefAssignment.value?.id,
  );
  const flagged = /weaker|confus|less|refus|pain|fall|odor|unusual/i.test(text);
  if (entry) {
    entry.transcript = text;
    entry.flaggedConcern = flagged ? "Routed to nurse for review" : "";
    entry.status = flagged ? "flagged" : "captured";
    entry.capturedAt = currentTimeLabel();
  }

  const visibleAssignmentIds = new Set(filteredCnaAssignments.value.map((assignment) => assignment.id));
  const next = cnaDebriefs.value.find(
    (item) =>
      visibleAssignmentIds.has(item.assignmentId) &&
      (item.status === "not-started" || item.status === "recording"),
  );
  cnaDebriefDraft.value = "";
  if (next) {
    selectedCnaAssignmentId.value = next.assignmentId;
  }
}

function cnaDebriefFor(assignmentId: string) {
  return cnaDebriefs.value.find((entry) => entry.assignmentId === assignmentId) ?? null;
}

function cnaStatusLabel(status: CnaDebriefStatus) {
  if (status === "not-started") {
    return "Not started";
  }
  if (status === "recording") {
    return "Recording";
  }
  if (status === "captured") {
    return "Captured";
  }
  return "Flagged";
}

function statusTone(label: string) {
  const normalized = label.toLowerCase();
  if (
    normalized.includes("declining") ||
    normalized.includes("new") ||
    normalized.includes("active") ||
    normalized.includes("urgent") ||
    normalized.includes("escalation") ||
    normalized.includes("escalated") ||
    normalized.includes("hospital") ||
    normalized.includes("correction") ||
    normalized.includes("revision") ||
    normalized.includes("flagged") ||
    normalized.includes("cancelled") ||
    normalized.includes("stat")
  ) {
    return "danger";
  }
  if (
    normalized.includes("watch") ||
    normalized.includes("monitor") ||
    normalized.includes("trend") ||
    normalized.includes("high") ||
    normalized.includes("pending") ||
    normalized.includes("review") ||
    normalized.includes("signing") ||
    normalized.includes("recording") ||
    normalized.includes("draft") ||
    normalized.includes("progress") ||
    normalized.includes("follow-up") ||
    normalized.includes("order")
  ) {
    return "warning";
  }
  if (
    normalized.includes("stable") ||
    normalized.includes("done") ||
    normalized.includes("captured") ||
    normalized.includes("routine") ||
    normalized.includes("ready") ||
    normalized.includes("completed") ||
    normalized.includes("scheduled") ||
    normalized.includes("sent") ||
    normalized.includes("submitted") ||
    normalized.includes("billing") ||
    normalized.includes("verified") ||
    normalized.includes("synced")
  ) {
    return "success";
  }
  return "neutral";
}

function scheduleItemTone(item: ResidentScheduleItem) {
  return item.kind === "escalation" ? "danger" : statusTone(item.tone);
}

function concernTone(color: Resident["situation"]["concerns"][number]["color"]) {
  if (color === "coral") {
    return "danger";
  }
  if (color === "amber") {
    return "warning";
  }
  return "success";
}

function iconFor(name: string) {
  return iconMap[name] ?? Activity;
}

function firstVitalNumber(value: string) {
  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function vitalTrendDirection(vital: Resident["situation"]["vitals"][number]) {
  const baseline = firstVitalNumber(vital.base);
  const current = firstVitalNumber(vital.current);
  if (baseline === null || current === null) {
    return vital.isAbnormal ? "up" : "down";
  }
  return current >= baseline ? "up" : "down";
}

function vitalTrendIcon(vital: Resident["situation"]["vitals"][number]) {
  return vitalTrendDirection(vital) === "down" ? ArrowDownRight : ArrowUpRight;
}

function vitalTrendLabel(vital: Resident["situation"]["vitals"][number]) {
  return vitalTrendDirection(vital) === "down" ? "Falling from baseline" : "Rising from baseline";
}

function careUserIcon(user?: CareUser | null) {
  void user;
  return UserIcon;
}

function threadIcon(thread: Thread) {
  if (thread.kind === "huddle") {
    return Users;
  }
  const otherMember = directThreadPeer(thread);
  return careUserIcon(otherMember ? getUser(otherMember) : null);
}

function careStepItems(steps: Resident["careSteps"]) {
  return [
    {
      label:
        steps.surveillance === "done"
          ? "Surveillance complete"
          : "Active surveillance",
      state: steps.surveillance,
    },
    {
      label:
        steps.reassessment === "active"
          ? "Reassessment in progress"
          : steps.reassessment === "done"
            ? "Reassessment complete"
            : "Reassessment pending",
      state: steps.reassessment,
    },
    { label: "Provider notified", state: steps.provider },
  ] as Array<{ label: string; state: CareStep }>;
}

function presenceText(user: CareUser) {
  if (user.presence === "online") {
    return "Online";
  }
  return `${user.presence === "away" ? "Away" : "Offline"} · ${user.lastSeen ?? ""}`;
}

function authorName(authorId: string) {
  return isCurrentUser(authorId) ? appUser.value.name : userName(authorId);
}

function signOut() {
  closeFloatingMenus();
  showSignOutModal.value = true;
}

function confirmSignOut() {
  clearProviderRecordingTimer();
  clearCnaRecordingTimer();
  providerRecordingActive.value = false;
  cnaRecordingActive.value = false;
  isAuthenticated.value = false;
  selectedResidentId.value = null;
  selectedThreadId.value = null;
  threadMessages.value = [];
  activeView.value = activeRole.value.defaultView;
  showSignOutModal.value = false;
  closeFloatingMenus();
  profileModal.value = null;
  taggedMessageContext.value = null;
  actionModalSource.value = null;
  escalationModalResidentId.value = null;
  scheduleModalOpen.value = false;
  editingClinicalOrderId.value = null;
  selectedScheduleDateKey.value = null;
}

function isSageNav(view: ViewName) {
  return view === "ai" || view === "provider-sage";
}
</script>

<template>
  <section v-if="!isAuthenticated" class="login-screen">
    <div class="login-shell">
      <section class="login-copy">
        <div class="login-brand">
          <div class="brand-mark">
            <Zap :size="22" />
          </div>
          <div>
            <strong>SAGE</strong>
            <span>Clinical intelligence for skilled nursing teams</span>
          </div>
        </div>

        <div class="login-intro">
          <p class="section-label">Care Monitoring Workspace</p>
          <h1>Start your shift with the right clinical context.</h1>
          <p>
            Review residents, coordinate the care team, and capture notes from one secure workspace.
          </p>
        </div>

        <div class="login-assurance">
          <span>
            <Shield :size="17" />
            Facility-aware access
          </span>
          <span>
            <Activity :size="17" />
            Real-time resident signals
          </span>
          <span>
            <MessageCircle :size="17" />
            Team coordination built in
          </span>
        </div>
      </section>

      <form class="login-panel" @submit.prevent="login">
        <div class="login-panel-head">
          <span class="staff-avatar large" aria-hidden="true">
            <Lock :size="22" />
          </span>
          <div>
            <h2>Login</h2>
            <p>Select your workspace to continue.</p>
          </div>
        </div>

        <label class="login-field">
          <span>Workspace role</span>
          <AppSelect
            :model-value="selectedRole"
            :options="roleSelectOptions"
            aria-label="Select workspace role"
            @update:model-value="selectRole($event as RoleKey)"
          />
        </label>

        <label class="login-field">
          <span>Staff identity</span>
          <AppSelect
            v-model="selectedLoginUserIdModel"
            :options="loginStaffSelectOptions"
            aria-label="Select staff identity"
          />
        </label>

        <div class="login-user">
          <span class="staff-avatar" aria-hidden="true">
            <UserIcon :size="18" />
          </span>
          <span>
            <strong>{{ activeStaffUser.name }}</strong>
            <small>{{ normalizeSystemRole(activeStaffUser.role) }}</small>
          </span>
        </div>

        <button class="primary-action login-submit" type="submit">
          <Lock :size="17" />
          Login
        </button>
      </form>
    </div>
  </section>

  <div
    v-else
    class="app-shell"
    :class="[`role-${selectedRole}`, { 'theme-dark': activeProfile.appearance === 'Dark' }]"
  >
    <aside class="desktop-nav" aria-label="SAGE sections">
      <div class="brand-lockup">
        <div class="brand-mark">
          <Zap :size="20" />
        </div>
        <div>
          <strong>SAGE</strong>
          <span>{{ activeRole.label }}</span>
        </div>
      </div>

      <button
        v-for="item in navItems"
        :key="item.key"
        class="nav-button"
        :class="{ active: activeView === item.key && !selectedResident }"
        type="button"
        @click="setView(item.key)"
      >
        <span class="nav-icon-wrap">
          <component :is="item.icon" :size="18" />
        </span>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="navBadgeCount(item.key)" class="nav-badge nav-badge-inline">{{ navBadgeCount(item.key) }}</span>
      </button>

      <div class="desktop-summary">
        <span>{{ activeRole.role }}</span>
        <strong>{{ activeRole.metricValue }} {{ activeRole.metricLabel }}</strong>
        <small v-if="selectedRole === 'don'">
          {{ decliningCount }} declining · {{ watchfulCount }} watchful
        </small>
        <small v-else>{{ activeRole.name }}</small>
      </div>
    </aside>

    <main class="main-surface">
      <div class="facility-bar content-frame">
        <div class="facility-select">
          <Globe :size="16" />
          <AppSelect
            :model-value="selectedFacility"
            :options="facilitySelectOptions"
            aria-label="Switch facility"
            @click="closeHeaderMenus"
            @update:model-value="setSelectedFacility"
          />
        </div>

        <div class="header-menu-cluster">
          <div class="notification-menu-wrap">
            <button
              class="icon-button notification-trigger"
              type="button"
              aria-label="Open notifications"
              :aria-expanded="notificationMenuOpen"
              @click="toggleNotificationMenu"
            >
              <Bell :size="18" />
              <span v-if="headerNotificationCount" class="notification-badge">
                {{ headerNotificationCount }}
              </span>
            </button>

            <div v-if="notificationMenuOpen" class="notification-menu panel">
              <div class="notification-menu-head">
                <strong>Notifications</strong>
                <button
                  class="notification-mark-read"
                  type="button"
                  :disabled="!headerNotificationCount"
                  @click="markAllNotificationsAsRead"
                >
                  Mark All as Read
                </button>
              </div>
              <div class="notification-menu-body">
                <button
                  v-for="notification in headerNotifications"
                  :key="notification.id"
                  class="notification-row"
                  :class="notification.tone"
                  type="button"
                  @click="handleNotificationSelection(notification)"
                >
                  <span class="notification-icon">
                    <component :is="notification.icon" :size="16" />
                  </span>
                  <span class="notification-copy">
                    <strong>{{ notification.title }}</strong>
                    <small>{{ notification.detail }}</small>
                    <b>{{ notification.meta }}</b>
                  </span>
                  <span v-if="notification.unread" class="notification-unread-dot" aria-hidden="true"></span>
                </button>
                <p v-if="!headerNotifications.length" class="empty-copy compact-empty">
                  No active notifications right now.
                </p>
              </div>
            </div>
          </div>

          <div class="profile-menu-wrap">
            <button
              class="profile-menu-trigger"
              type="button"
              aria-label="Open profile menu"
              :aria-expanded="profileMenuOpen"
              @click="toggleProfileMenu"
            >
              <span class="staff-avatar" aria-hidden="true">
                <UserIcon :size="18" />
              </span>
            </button>

            <div v-if="profileMenuOpen" class="profile-menu panel">
              <div class="profile-menu-head">
                <span class="staff-avatar large" aria-hidden="true">
                  <UserIcon :size="22" />
                </span>
                <span>
                  <strong>{{ activeProfileDisplayName }}</strong>
                  <small>{{ profileMenuRoleLabel }}</small>
                </span>
              </div>
              <button class="danger-text" type="button" @click="signOut">
                <LogOut :size="16" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <section
        v-if="activeView === 'provider-visit' && activeProviderVisit && activeVisitResident"
        class="screen visit-screen"
      >
        <header class="screen-header detail-header visit-detail-header content-frame">
          <button class="icon-button" type="button" aria-label="Back to encounter notes" @click="returnToResidentNotes">
            <ArrowLeft :size="19" />
          </button>
          <div class="title-stack">
            <h1>Encounter @{{ activeVisitResident.name }}</h1>
            <p>{{ activeProviderVisit.visitType }} · Room {{ activeVisitResident.room }} · {{ residentFacility(activeVisitResident) }}</p>
          </div>
          <span class="chip compact">Encounter Time {{ visitElapsedLabel }}</span>
        </header>

        <div class="visit-page content-frame">
          <article class="panel visit-note-panel">
            <div class="segmented-tabs visit-note-tabs">
              <button
                type="button"
                :class="{ active: visitNoteMode === 'text' }"
                @click="visitNoteMode = 'text'"
              >
                <FileText :size="15" />
                Text Note
              </button>
              <button
                type="button"
                :class="{ active: visitNoteMode === 'voice' }"
                @click="visitNoteMode = 'voice'"
              >
                <Mic :size="15" />
                Voice Note
              </button>
            </div>

          <label v-if="visitNoteMode === 'text'" class="visit-text-note">
            <span class="section-label">Encounter Narrative</span>
            <textarea
              v-model="activeProviderVisit.textNote"
              rows="10"
                placeholder="Document assessment, plan, and encounter-specific context..."
              />
            </label>

            <div v-else class="recording-station visit-recording" :class="{ active: visitRecordingActive }">
              <div class="recording-copy">
                <strong>{{ visitRecordingActive ? "Recording voice note" : "Voice note capture" }}</strong>
                <span>
                  {{ visitRecordingActive ? "Live transcription in progress" : "Tap record to capture encounter dictation" }}
                </span>
              </div>
              <button
                type="button"
                class="record-core"
                :class="{ active: visitRecordingActive }"
                :aria-label="visitRecordingActive ? 'Stop voice note recording' : 'Start voice note recording'"
                @click="visitRecordingActive ? stopVisitRecording() : startVisitRecording()"
              >
                <span class="radio-waves" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <X v-if="visitRecordingActive" :size="30" />
                <Mic v-else :size="32" />
              </button>
              <b class="recording-badge" :class="{ active: visitRecordingActive }">
                {{ visitRecordingActive ? `REC ${visitRecordingSeconds}s` : "Ready" }}
              </b>
              <div v-if="visitRecordingActive || activeProviderVisit.voiceTranscript" class="transcript-preview">
                <div class="section-label">
                  {{ visitRecordingActive ? "Live Transcript" : "Generated Transcript" }}
                </div>
                <p>
                  {{ visitRecordingActive ? "Listening for the provider encounter note..." : activeProviderVisit.voiceTranscript }}
                </p>
              </div>
            </div>
          </article>

          <article v-if="activeVisitOrders.length" class="panel visit-orders-panel">
            <div class="notes-panel-header">
              <div>
                <div class="section-label">Encounter Orders</div>
                <h2>{{ activeVisitOrders.length }} order{{ activeVisitOrders.length === 1 ? "" : "s" }} from this encounter</h2>
              </div>
            </div>
            <div class="schedule-list compact-schedule-list">
              <div v-for="order in activeVisitOrders" :key="order.id" class="schedule-row compact-schedule-row">
                <button class="schedule-row-main" type="button" @click="openClinicalOrderDraft(order)">
                  <span class="schedule-icon order">
                    <FileText :size="17" />
                  </span>
                  <span>
                    <strong>{{ order.orderType }} · {{ order.eventType }}</strong>
                    <small>{{ order.details }} · {{ formatDateTimeLabel(order.requestedDate, order.requestedTime) }}</small>
                  </span>
                  <span class="chip compact" :class="statusTone(order.status)">
                    {{ order.status.replaceAll("-", " ") }}
                  </span>
                </button>
              </div>
            </div>
          </article>

          <div class="visit-action-bar">
            <button class="danger-action" type="button" @click="requestStopVisit">
              <X :size="16" />
              End Encounter
            </button>
            <button class="primary-action" type="button" @click="openVisitOrder">
              <FileText :size="16" />
              New Order
            </button>
          </div>
        </div>
      </section>

      <section
        v-else-if="activeView === 'provider-review' && activeReviewEncounter && activeReviewResident"
        class="screen encounter-review-screen"
      >
        <header class="screen-header detail-header encounter-review-header content-frame">
          <button class="icon-button" type="button" aria-label="Back to resident encounters" @click="returnToResidentEncounters">
            <ArrowLeft :size="19" />
          </button>
          <div class="title-stack">
            <h1>Review Encounter</h1>
            <p>{{ activeReviewEncounter.residentName }} · {{ activeReviewEncounter.visitType }}</p>
          </div>
          <div class="encounter-review-header-actions" :class="{ 'has-revisions': activeReviewHasOpenRevisions }">
            <label class="review-all-switch header-review-all" :class="{ disabled: activeReviewHasOpenRevisions }">
              <input
                type="checkbox"
                role="switch"
                :checked="activeReviewAllVerified"
                :disabled="activeReviewHasOpenRevisions"
                @change="toggleAllEncounterSections"
              />
              <span>
                <strong>Mark all sections as verified</strong>
                <small v-if="activeReviewHasOpenRevisions">Resolve or return open revision requests first.</small>
                <small v-else>{{ activeReviewEncounter.sections.filter((section) => section.verified).length }} of {{ activeReviewEncounter.sections.length }} sections verified</small>
              </span>
            </label>
            <button
              class="review-primary-action"
              :class="{ 'return-to-scribe': activeReviewHasOpenRevisions }"
              type="button"
              :disabled="!activeReviewHasOpenRevisions && !activeReviewAllVerified"
              @click="activeReviewHasOpenRevisions ? returnEncounterToScribe() : requestEncounterSignature()"
            >
              <Undo2 v-if="activeReviewHasOpenRevisions" :size="17" />
              <Signature v-else :size="17" />
              {{ activeReviewHasOpenRevisions ? "Return to Scribe" : "Sign Encounter" }}
            </button>
          </div>
        </header>

        <div class="encounter-review-page content-frame">
          <article class="panel encounter-print-document">
            <header class="encounter-document-facility">
              <strong>{{ residentFacility(activeReviewResident) }}</strong>
              <span>{{ facilityDocumentDetails[residentFacility(activeReviewResident)].address }}</span>
              <span>
                Tel: {{ facilityDocumentDetails[residentFacility(activeReviewResident)].phone }} ·
                Fax: {{ facilityDocumentDetails[residentFacility(activeReviewResident)].fax }}
              </span>
            </header>

            <section class="encounter-document-patient">
              <div class="encounter-document-title-row">
                <div>
                  <span>{{ activeReviewEncounter.documentTitle }}</span>
                  <h2>{{ activeReviewResident.name.toUpperCase() }} ({{ activeReviewResident.sex }})</h2>
                  <p>
                    Encounter ID: {{ activeReviewEncounter.id.toUpperCase() }} ·
                    DOB: {{ mockResidentDateOfBirth(activeReviewResident) }} ·
                    <strong>{{ activeReviewResident.codeStatus }}</strong>
                  </p>
                </div>
                <span class="chip compact warning">Needs Review</span>
              </div>

              <dl class="encounter-document-metadata">
                <div><dt>Date of Service</dt><dd>{{ formatDocumentDate(activeReviewEncounter.scheduledDate) }}</dd></div>
                <div><dt>Visit Type</dt><dd>{{ activeReviewEncounter.visitType }}</dd></div>
                <div><dt>Attending Provider</dt><dd>{{ activeReviewEncounter.providerName }}</dd></div>
                <div><dt>Assigned Scribe</dt><dd>{{ activeReviewEncounter.assignedScribe ?? "Mark Rivera, Scribe" }}</dd></div>
              </dl>
            </section>

            <div class="encounter-document-body-heading">
              <div>
                <h3>Progress Notes</h3>
                <span>{{ activeReviewEncounter.startedAt }} – {{ activeReviewEncounter.endedAt ?? activeReviewEncounter.notesPlusSyncedAt }}</span>
              </div>
              <span class="document-encounter-id">{{ activeReviewEncounter.id.toUpperCase() }}</span>
            </div>

            <div class="encounter-document-sections">
              <article
                v-for="section in activeReviewEncounter.sections"
                :key="section.id"
                class="encounter-document-card"
                :class="{ verified: section.verified, 'has-open-revision': encounterSectionHasOpenRevision(section) }"
              >
                <header class="encounter-section-header">
                  <div class="encounter-section-title">
                    <h2>{{ section.title }}</h2>
                    <span class="section-record-status">New</span>
                    <small v-if="section.revisedAt">Revised by Scribe · {{ section.revisedAt }}</small>
                  </div>
                  <div class="encounter-section-actions">
                    <button type="button" class="section-action revision-action" @click="openRevisionCommentModal(section)">
                      <MessageSquarePlus :size="15" />
                      Add Revision Comment
                    </button>
                    <span class="section-actions-divider" aria-hidden="true" />
                    <button
                      type="button"
                      class="section-action verify-action"
                      :disabled="section.verified || encounterSectionHasOpenRevision(section)"
                      @click="toggleEncounterSectionVerified(section)"
                    >
                      <CheckCircle :size="15" />
                      {{ section.verified ? "Verified" : "Mark as Verified" }}
                    </button>
                  </div>
                </header>

                <div
                  v-if="section.revisionThreads.length"
                  class="revision-thread-stack"
                  :class="{ 'has-open-revision': encounterSectionHasOpenRevision(section) }"
                >
                  <div class="revision-stack-title">Revision Requests</div>
                  <article
                    v-for="(thread, threadIndex) in section.revisionThreads"
                    :key="thread.id"
                    class="revision-thread-card"
                    :class="thread.status"
                  >
                    <header>
                      <strong>Request {{ threadIndex + 1 }}</strong>
                      <div class="revision-thread-actions">
                        <span class="revision-status-pill" :class="thread.status">
                          <Check v-if="thread.status === 'addressed'" :size="12" />
                          {{ thread.status === "addressed" ? "Addressed" : "For Review" }}
                        </span>
                        <template v-if="thread.status === 'open'">
                          <button type="button" aria-label="Edit revision request" @click="openRevisionCommentModal(section, thread)">
                            <Edit3 :size="14" />
                          </button>
                          <button type="button" aria-label="Delete revision request" @click="deleteRevisionThread(section, thread.id)">
                            <Trash2 :size="14" />
                          </button>
                        </template>
                      </div>
                    </header>
                    <p>{{ thread.comments[0]?.body }}</p>
                    <div v-if="thread.comments.length > 1" class="revision-reply-list">
                      <div v-for="reply in thread.comments.slice(1)" :key="reply.id" class="revision-reply-row">
                        <p>
                          <strong :class="reply.role">{{ reply.role === "provider" ? "Provider" : "Scribe" }} Comment:</strong>
                          {{ reply.body }}
                          <small>{{ reply.authorName }} · {{ reply.createdAt }}</small>
                        </p>
                        <button
                          v-if="reply.authorId === activeStaffUser.id && thread.status === 'open'"
                          type="button"
                          aria-label="Delete your reply"
                          @click="deleteRevisionReply(thread, reply.id)"
                        >
                          <X :size="13" />
                        </button>
                      </div>
                    </div>
                    <form v-if="thread.status === 'open'" class="revision-inline-reply" @submit.prevent="submitRevisionReply(thread)">
                      <input v-model="revisionReplyDrafts[thread.id]" type="text" placeholder="Add a comment..." />
                      <button type="submit" aria-label="Send reply" :disabled="!revisionReplyDrafts[thread.id]?.trim()">
                        <Send :size="15" />
                      </button>
                    </form>
                  </article>
                </div>

                <div
                  class="encounter-section-content"
                  :class="[
                    `content-${section.kind}`,
                    `section-${section.id}`,
                    { 'content-long-form': section.id === 'review-of-systems' || section.id === 'physical-exam' },
                  ]"
                >
                  <template v-if="section.id === 'vital-signs'">
                    <ul class="encounter-reference-list-grid encounter-vitals-grid">
                      <li v-for="(item, itemIndex) in section.content" :key="itemIndex">
                        <strong>{{ item.label }}</strong>
                        <span>{{ item.text }}</span>
                      </li>
                    </ul>
                  </template>
                  <template v-else-if="section.id === 'social-history' || section.id === 'immunizations'">
                    <ul class="encounter-reference-list-grid">
                      <li v-for="(item, itemIndex) in section.content" :key="itemIndex">
                        <strong>{{ item.label }}</strong>
                        <span>{{ item.text }}</span>
                      </li>
                    </ul>
                  </template>
                  <template v-else-if="section.id === 'family-history'">
                    <div class="encounter-family-grid">
                      <article v-for="(item, itemIndex) in section.content" :key="itemIndex" class="encounter-family-card">
                        <strong>{{ item.label }}</strong>
                        <span>{{ item.text }}</span>
                      </article>
                    </div>
                  </template>
                  <template v-else-if="section.id === 'review-of-systems' || section.id === 'physical-exam'">
                    <div class="encounter-system-list">
                      <section v-for="(item, itemIndex) in section.content" :key="itemIndex" class="encounter-system-group">
                        <strong>{{ item.label }}</strong>
                        <ul>
                          <li
                            v-for="(detail, detailIndex) in splitEncounterDetail(item.text)"
                            :key="detailIndex"
                            :class="{ reported: detail.startsWith('Reports:') }"
                          >
                            {{ detail }}
                          </li>
                        </ul>
                      </section>
                    </div>
                  </template>
                  <template v-else-if="section.id === 'assessment-plan'">
                    <div class="encounter-assessment-layout">
                      <p class="encounter-assessment-summary">
                        <strong>{{ section.content[0]?.label }}:</strong>
                        {{ section.content[0]?.text }}
                      </p>
                      <div class="encounter-diagnosis-list">
                        <div v-for="(item, itemIndex) in section.content.slice(1)" :key="itemIndex" class="encounter-diagnosis-row">
                          <strong>{{ item.label }}</strong>
                          <span>{{ item.text }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="section.kind === 'bullets'">
                    <ul>
                      <li v-for="(item, itemIndex) in section.content" :key="itemIndex">
                        <strong v-if="item.label">{{ item.label }}:</strong> {{ item.text }}
                      </li>
                    </ul>
                  </template>
                  <template v-else-if="section.kind === 'grid'">
                    <div v-for="(item, itemIndex) in section.content" :key="itemIndex" class="encounter-content-row">
                      <strong>{{ item.label }}</strong>
                      <span>{{ item.text }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <p v-for="(item, itemIndex) in section.content" :key="itemIndex">
                      <strong v-if="item.label">{{ item.label }}:</strong> {{ item.text }}
                    </p>
                  </template>
                </div>
              </article>
            </div>
          </article>
        </div>
      </section>

      <section v-else-if="selectedResident && workingCareSteps" class="screen detail-screen">
        <header class="screen-header detail-header content-frame">
          <button class="icon-button" type="button" aria-label="Back" @click="closeResident">
            <ArrowLeft :size="19" />
          </button>
          <img class="avatar large" :src="selectedResident.image" :alt="selectedResident.name" />
          <div class="title-stack">
            <h1>{{ selectedResident.name }}</h1>
            <p>
              {{ selectedResident.codeStatus }} · {{ selectedResident.age
              }}{{ selectedResident.sex }} · Room {{ selectedResident.room }} · {{ residentFacility(selectedResident) }}
            </p>
          </div>
          <div class="detail-header-actions resident-action-menu-wrap">
            <button
              class="primary-action compact-action resident-action-trigger"
              type="button"
              aria-label="Open resident actions"
              :aria-expanded="residentActionMenuOpen"
              @click="toggleResidentActionMenu"
            >
              <MoreVertical :size="16" />
              Actions
              <ChevronDown :size="15" />
            </button>
            <div v-if="residentActionMenuOpen" class="resident-action-menu panel">
              <button type="button" class="danger-text" @click="handleResidentHeaderAction('escalate')">
                <AlertTriangle :size="16" />
                {{ canDirectlyEscalate() ? "Escalate" : "Request Escalation" }}
              </button>
              <button type="button" @click="handleResidentHeaderAction('order')">
                <FileText :size="16" />
                {{ selectedRole === "provider" ? "New Order" : "Request Order Review" }}
              </button>
              <button type="button" @click="handleResidentHeaderAction('huddle')">
                <Users :size="16" />
                Schedule Huddle
              </button>
            </div>
          </div>
        </header>

        <div class="detail-chips-band">
          <div class="chip-row detail-chips content-frame">
            <span
              v-for="chip in selectedResident.statusChips"
              :key="chip"
              class="chip"
              :class="statusTone(chip)"
            >
              {{ chip }}
            </span>
            <span class="chip" :class="statusTone(selectedResident.acuity)">
              {{ selectedResident.acuity }}
            </span>
          </div>
        </div>

        <div class="detail-tabs-band">
          <div class="segmented-tabs detail-tabs content-frame" :class="{ 'has-notes-tab': selectedRole === 'provider' }">
            <button
              v-for="tab in residentTabs"
              :key="tab.key"
              type="button"
              :class="{ active: residentTab === tab.key }"
              @click="residentTab = tab.key"
            >
              <component :is="tab.icon" :size="15" />
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div v-if="residentTab === 'situation'" class="detail-grid content-frame">
          <article class="panel patient-focus-panel">
            <div class="notes-panel-header">
              <div>
                <div class="section-label">Patient Focus</div>
                <h2>{{ selectedResidentOpportunity?.category ?? selectedResident.latest }}</h2>
              </div>
              <div class="patient-focus-header-chips">
                <span class="chip compact" :class="statusTone(selectedResidentOpportunity?.urgency ?? selectedResident.acuity)">
                  <template v-if="selectedResidentOpportunity">{{ selectedResidentOpportunity.confidence }}% confidence</template>
                  <template v-else>{{ selectedResident.acuity }}</template>
                </span>
                <span
                  v-if="selectedResidentOpportunity"
                  class="chip compact"
                  :class="statusTone(opportunityActionStatusLabel(selectedResidentOpportunity))"
                >
                  {{ opportunityActionStatusLabel(selectedResidentOpportunity) }}
                </span>
              </div>
            </div>

            <p class="patient-focus-read">
              {{ selectedResidentOpportunity?.reason ?? selectedResident.situation.summary }}
            </p>

            <div class="patient-focus-context">
              <section>
                <small>Summary</small>
                <p>{{ selectedResident.situation.summary }}</p>
              </section>
              <section>
                <small>Memory</small>
                <p>{{ selectedResident.situation.memory }}</p>
              </section>
              <section class="patient-focus-deviation">
                <small>Predicted deviation</small>
                <div v-if="selectedResidentOpportunity" class="patient-focus-deviation-list">
                  <span v-for="change in selectedResidentOpportunity.changes" :key="change">
                    {{ change }}
                  </span>
                </div>
                <p v-else>{{ selectedResident.latest }}</p>
              </section>
            </div>

            <div v-if="selectedResidentOpportunity" class="patient-focus-next">
              <strong>Recommended next:</strong>
              <span>{{ selectedResidentOpportunity.recommendedAction }}</span>
            </div>

            <div class="card-actions patient-focus-action-strip">
              <button
                class="soft-action compact-action"
                type="button"
                @click="toggleSection(residentSectionKey('prediction-evidence'))"
              >
                <Eye :size="15" />
                {{ isSectionExpanded(residentSectionKey('prediction-evidence')) ? "Hide evidence" : "Show evidence" }}
              </button>
              <button
                v-if="selectedRole === 'provider'"
                class="primary-action compact-action"
                type="button"
                @click="requestStartEncounterForResident(selectedResident)"
              >
                <FileText :size="15" />
                Start Encounter
              </button>
              <button
                v-else-if="selectedResidentOpportunity && !actionForOpportunity(selectedResidentOpportunity)"
                class="primary-action compact-action"
                type="button"
                @click="openActionRequestFromOpportunity(selectedResidentOpportunity, 'Resident Prediction')"
              >
                <Send :size="15" />
                Assign immediate action
              </button>
              <button
                v-else-if="selectedResidentOpportunity"
                class="soft-action compact-action"
                type="button"
                @click="reviewOpportunityAction(selectedResidentOpportunity)"
              >
                <FileText :size="15" />
                Review action
              </button>
              <button
                v-else
                class="primary-action compact-action"
                type="button"
                @click="openOrderAction(selectedResident)"
              >
                <FileText :size="15" />
                Request Review
              </button>
            </div>

            <div
              v-if="isSectionExpanded(residentSectionKey('prediction-evidence'))"
              class="prediction-evidence"
            >
              <div class="delegate-summary">
                <span><strong>Sources:</strong> {{ selectedResidentEvidenceSourceSummary }}</span>
              </div>
              <div class="evidence-group-list">
                <div
                  v-for="group in selectedResidentEvidenceGroups"
                  :key="group.source"
                  class="evidence-group"
                >
                  <strong>{{ group.source }}:</strong>
                  <ul>
                    <li v-for="item in group.items" :key="item">
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div v-if="assignedNurse" class="assignment-note">
              <UserCheck :size="18" />
              <div>
                <strong>{{ assignedNurse.name }}</strong>
                <span>Assigned at {{ assignedNurse.time }}</span>
              </div>
            </div>
          </article>

          <div
            v-if="selectedResident.situation.concerns.length || selectedResident.situation.vitals.length"
            class="resident-clinical-grid"
          >
            <article v-if="selectedResident.situation.concerns.length" class="panel concerns-panel">
              <div class="notes-panel-header">
                <div>
                  <div class="section-label">Unresolved Concerns</div>
                  <h2>Needs follow-up</h2>
                </div>
                <span class="chip compact">{{ selectedResident.situation.concerns.length }} concerns</span>
              </div>
              <div class="situation-concern-list">
                <div
                  v-for="concern in selectedResident.situation.concerns"
                  :key="concern.title"
                  class="concern-row"
                >
                  <span class="dot" :class="concernTone(concern.color)" />
                  <span>{{ concern.title }}</span>
                  <span class="chip compact" :class="statusTone(concern.status)">
                    {{ concern.status }}
                  </span>
                </div>
              </div>
            </article>

            <article v-if="selectedResident.situation.vitals.length" class="panel vitals-panel">
              <div class="notes-panel-header">
                <div>
                  <div class="section-label">Vitals</div>
                  <h2>Trajectory vs baseline</h2>
                </div>
                <span class="chip compact">{{ selectedResident.situation.vitals.length }} vitals</span>
              </div>
              <div class="vital-list">
                <div
                  v-for="vital in selectedResident.situation.vitals"
                  :key="vital.label"
                  class="vital-row"
                >
                  <component :is="iconFor(vital.icon)" :size="18" />
                  <span>{{ vital.label }}</span>
                  <small>Base {{ vital.base }}</small>
                  <span
                    class="vital-trend-arrow"
                    :class="vitalTrendDirection(vital)"
                    :aria-label="vitalTrendLabel(vital)"
                  >
                    <component :is="vitalTrendIcon(vital)" :size="15" />
                  </span>
                  <strong :class="{ abnormal: vital.isAbnormal, critical: vital.isCritical }">
                    {{ vital.current }}
                  </strong>
                </div>
              </div>
            </article>
          </div>

          <article v-if="selectedResident.situation.clarify.length" class="panel clarify-panel">
            <div class="section-label">Clarify</div>
            <div class="stack">
              <div
                v-for="(item, index) in selectedResident.situation.clarify"
                :key="item.question"
                class="accordion"
              >
                <button type="button" @click="openClarify = openClarify === index ? null : index">
                  <span>{{ item.question }}</span>
                  <ChevronUp v-if="openClarify === index" :size="17" />
                  <ChevronDown v-else :size="17" />
                </button>
                <p v-if="openClarify === index">{{ item.answer }}</p>
              </div>
            </div>
          </article>

          <button
            v-if="selectedRole === 'don'"
            class="primary-action"
            type="button"
            @click="openActionRequestModal(selectedResident, 'Resident Profile', 'provider')"
          >
            <Send :size="17" />
            Assign Immediate Action
          </button>
        </div>

        <div v-else-if="residentTab === 'talk'" class="chat-screen resident-chat">
          <div class="message-stream">
            <div
              v-for="message in residentChat"
              :key="message.id"
              class="bubble"
              :class="message.sender === 'user' ? 'me' : 'sage'"
            >
              {{ message.text }}
            </div>
          </div>
          <form class="composer" @submit.prevent="sendResidentChat">
            <input v-model="residentDraft" type="text" placeholder="Ask Sage..." />
            <button type="button" class="icon-button" aria-label="Voice input">
              <Mic :size="17" />
            </button>
            <button class="send-button" type="submit" aria-label="Send resident message">
              <Send :size="17" />
            </button>
          </form>
        </div>

        <div v-else-if="residentTab === 'notes'" class="resident-notes-screen content-frame">
          <div class="notes-layout provider-notes-layout">
            <section class="panel notes-list-panel visit-list-panel">
              <div class="notes-panel-header visit-list-header">
                <div>
                  <div class="section-label">Encounter Notes</div>
                  <h2>{{ selectedResident.name }}</h2>
                </div>
                <button class="primary-action compact-action" type="button" @click="addEncounterNoteForSelectedResident">
                  <FileText :size="15" />
                  Add Encounter Note
                </button>
              </div>

              <div v-if="selectedResidentVisits.length" class="visit-card-list">
                <article
                  v-for="visit in selectedResidentVisits"
                  :key="visit.id"
                  class="visit-card"
                >
                  <div class="visit-card-head">
                    <span>
                      <strong>{{ visit.visitType }} encounter</strong>
                      <small>
                        {{ visit.providerName }} ·
                        {{ visit.startedAt || `${visit.scheduledDate} ${visit.scheduledTime}` }}{{ visit.endedAt ? ` - ${visit.endedAt}` : "" }}
                      </small>
                    </span>
                    <span class="chip compact" :class="statusTone(providerVisitStatusLabel(visit))">
                      {{ providerVisitStatusLabel(visit) }}
                    </span>
                  </div>
                  <p>{{ visitNoteSummary(visit) }}</p>
                  <div class="visit-card-meta">
                    <span>{{ visitSourceLabel(visit) }}</span>
                    <span>{{ visitOrderSummary(visit) }}</span>
                  </div>
                  <p v-if="visitSyncSummary(visit)" class="visit-sync-note">
                    {{ visitSyncSummary(visit) }}
                  </p>
                  <div v-if="visit.assignedScribe || visit.signedSignature" class="encounter-routing-meta">
                    <span v-if="visit.assignedScribe"><strong>Scribe:</strong> {{ visit.assignedScribe }}</span>
                    <span v-if="visit.signedSignature"><strong>Signed:</strong> {{ visit.signedSignature.signedAt }}</span>
                  </div>
                  <div
                    v-if="['scheduled', 'provider-in-progress', 'needs-review', 'revision'].includes(visit.status)"
                    class="encounter-card-actions"
                  >
                    <button
                      v-if="visit.status === 'needs-review'"
                      class="primary-action compact-action"
                      type="button"
                      @click="openEncounterReview(visit)"
                    >
                      <Eye :size="15" />
                      Start Review
                    </button>
                    <button
                      v-else-if="visit.status === 'revision'"
                      class="soft-action compact-action mock-sync-action"
                      type="button"
                      @click="simulateScribeResubmission(visit)"
                    >
                      <Undo2 :size="15" />
                      Simulate Scribe Resubmission
                      <small>Mock Notes+ sync</small>
                    </button>
                    <button
                      v-else
                      class="primary-action compact-action"
                      type="button"
                      @click="startScheduledEncounter(visit)"
                    >
                      <FileText :size="15" />
                      {{ visit.status === "provider-in-progress" ? "Continue Encounter" : "Start Encounter" }}
                    </button>
                  </div>
                </article>
              </div>
              <p v-else class="empty-copy">
                No encounters documented for this resident yet.
              </p>
            </section>
          </div>
        </div>

        <div v-else class="timeline-list content-frame">
          <div class="timeline-list-header">
            <div>
              <div class="section-label">Patient Timeline</div>
              <h2>What happened for {{ selectedResident.name }}</h2>
            </div>
            <span class="chip compact">{{ selectedResidentTimelineEvents.length }} events</span>
          </div>
          <article
            v-for="event in selectedResidentTimelineEvents"
            :key="event.id"
            class="timeline-item"
          >
            <span class="timeline-icon">
              <component :is="iconFor(event.icon)" :size="17" />
            </span>
            <div>
              <div class="eyebrow">{{ event.timeAgo }} · {{ event.period }}</div>
              <div class="panel timeline-card" :class="event.tone">
                <div class="timeline-card-head">
                  <strong>{{ event.title }}</strong>
                  <span v-if="event.status" class="chip compact" :class="statusTone(event.status)">
                    {{ event.status }}
                  </span>
                </div>
                <p>{{ event.text }}</p>
                <div v-if="event.interpretation" class="sage-note">
                  <strong>Sage:</strong>
                  <span>{{ event.interpretation }}</span>
                </div>
                <div v-if="timelineEventHasActions(event)" class="timeline-card-actions">
                  <template v-if="canManageTimelineAction(event)">
                    <button
                      class="soft-action compact-action"
                      type="button"
                      @click="handleTimelineActionStatusSelection(event, 'completed')"
                    >
                      <Check :size="14" />
                      {{ timelineActionCompleteLabel(event) }}
                    </button>
                    <button
                      class="soft-action compact-action"
                      type="button"
                      @click="handleTimelineActionStatusSelection(event, 'flagged')"
                    >
                      <AlertTriangle :size="14" />
                      {{ timelineActionFlagLabel(event) }}
                    </button>
                  </template>
                  <template v-if="event.kind === 'order'">
                    <button
                      v-if="selectedRole === 'provider'"
                      class="soft-action compact-action"
                      type="button"
                      @click="openTimelineClinicalOrder(event)"
                    >
                      <FileText :size="14" />
                      Edit
                    </button>
                    <button
                      v-if="event.threadId"
                      class="soft-action compact-action"
                      type="button"
                      @click="openTimelineThread(event)"
                    >
                      <MessageCircle :size="14" />
                      Message
                    </button>
                    <button
                      class="soft-action compact-action"
                      type="button"
                      :disabled="timelineOrderStatus(event) === 'completed'"
                      @click="updateTimelineClinicalOrderStatus(event, 'completed')"
                    >
                      <Check :size="14" />
                      Complete
                    </button>
                    <button
                      class="soft-action compact-action"
                      type="button"
                      :disabled="timelineOrderStatus(event) === 'flagged'"
                      @click="updateTimelineClinicalOrderStatus(event, 'flagged')"
                    >
                      <AlertTriangle :size="14" />
                      Flag
                    </button>
                  </template>
                  <button
                    v-if="event.threadId && event.kind !== 'action' && event.kind !== 'order'"
                    class="soft-action compact-action"
                    type="button"
                    @click="openTimelineThread(event)"
                  >
                    <MessageCircle :size="14" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section v-else-if="activeView === 'situation'" class="screen">
        <header class="screen-header">
          <div>
            <h1>Situation</h1>
            <p>Needs your attention · {{ decliningCount }} declining · {{ watchfulCount }} watchful</p>
          </div>
          <div class="header-metric">
            <strong>{{ filteredPriorityResidents.length }}</strong>
            <span>active watches</span>
          </div>
        </header>

        <section class="situation-accordion-list content-frame">
          <article v-if="false" class="situation-accordion panel" :class="{ open: openSituationAccordion === 'facility-focus' }">
            <button
              class="situation-accordion-header"
              type="button"
              :aria-expanded="openSituationAccordion === 'facility-focus'"
              @click="setSituationAccordion('facility-focus')"
            >
              <span>
                <strong>Facility Focus</strong>
                <small>{{ donFocusItems.length }} focus items ranked by urgency</small>
              </span>
              <span class="accordion-header-side">
                <span class="chip compact warning">{{ donFocusItems.length }} items</span>
                <ChevronUp v-if="openSituationAccordion === 'facility-focus'" :size="17" />
                <ChevronDown v-else :size="17" />
              </span>
            </button>
            <div v-if="openSituationAccordion === 'facility-focus' && donFocusItems.length" class="focus-list situation-accordion-body">
              <article v-for="item in donFocusItems" :key="item.id" class="focus-row don-focus-row" :class="item.tone">
                <span class="focus-icon" :class="item.tone">
                  <Zap v-if="item.kind === 'prediction'" :size="16" />
                  <AlertTriangle v-else-if="item.kind === 'escalation' || item.status.toLowerCase().includes('flagged')" :size="16" />
                  <FileText v-else :size="16" />
                </span>
                <span class="focus-copy">
                  <small>{{ item.meta }}</small>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.body }}</p>
                  <span class="focus-status-row">
                    <span class="chip compact" :class="statusTone(item.status)">
                      {{ item.status }}
                    </span>
                  </span>
                </span>
                <div class="focus-actions">
                  <button class="primary-action compact-action" type="button" @click="handleFocusItemAction(item)">
                    {{ item.primaryLabel }}
                    <ArrowRight :size="14" />
                  </button>
                  <button
                    v-if="item.secondaryAction"
                    class="soft-action compact-action"
                    type="button"
                    @click="handleFocusItemAction(item, item.secondaryAction)"
                  >
                    {{ item.secondaryLabel }}
                  </button>
                </div>
              </article>
            </div>
            <p v-else-if="openSituationAccordion === 'facility-focus'" class="empty-copy situation-accordion-body">
              No urgent facility focus items for the selected facility.
            </p>
          </article>

          <article v-if="false" class="situation-accordion panel" :class="{ open: openSituationAccordion === 'requested-actions' }">
          <button
            class="situation-accordion-header"
            type="button"
            :aria-expanded="openSituationAccordion === 'requested-actions'"
            @click="setSituationAccordion('requested-actions')"
          >
            <span>
              <strong>Requested Actions</strong>
              <small>{{ openActionRequests.length }} open team follow-ups</small>
            </span>
            <span class="accordion-header-side">
              <span class="chip compact warning">{{ openActionRequests.length }} open</span>
              <ChevronUp v-if="openSituationAccordion === 'requested-actions'" :size="17" />
              <ChevronDown v-else :size="17" />
            </span>
          </button>
            <div v-if="openSituationAccordion === 'requested-actions' && openActionRequests.length" class="action-list command-action-list situation-accordion-body">
              <div
                v-for="action in openActionRequests.slice(0, 4)"
                :key="action.id"
                class="action-row readable-action-row"
              >
                <span class="action-row-copy">
                  <strong>{{ action.residentName }} · {{ action.actionType }}</strong>
                  <small>{{ actionAssigneeName(action) }} · {{ action.priority }} · {{ action.dueTime }}</small>
                  <small>{{ action.instructions }}</small>
                </span>
                <span class="chip compact" :class="statusTone(action.status)">
                  {{ action.status.replace("-", " ") }}
                </span>
                <div class="action-row-controls">
                  <button class="soft-action compact-action" type="button" @click="reviewActionResident(action)">
                    <FileText :size="14" />
                    Review Chart
                  </button>
                  <button class="soft-action compact-action" type="button" @click="assignImmediateActionFromRequest(action)">
                    <Send :size="14" />
                    Assign immediate action
                  </button>
                </div>
              </div>
            </div>
            <p v-else-if="openSituationAccordion === 'requested-actions'" class="empty-copy situation-accordion-body">
              No open requested actions for this facility.
            </p>
          </article>

          <article v-if="false" class="situation-accordion panel" :class="{ open: openSituationAccordion === 'facility-intelligence' }">
          <button
            class="situation-accordion-header"
            type="button"
            :aria-expanded="openSituationAccordion === 'facility-intelligence'"
            @click="setSituationAccordion('facility-intelligence')"
          >
            <span>
              <strong>Facility Intelligence</strong>
              <small>{{ filteredProviderOpportunities.length }} generated predictions across {{ filteredFacilityIntelligenceSummaries.length }} facilities</small>
            </span>
            <span class="accordion-header-side">
              <span class="chip compact warning">{{ filteredProviderOpportunities.length }} predictions</span>
              <ChevronUp v-if="openSituationAccordion === 'facility-intelligence'" :size="17" />
              <ChevronDown v-else :size="17" />
            </span>
          </button>

            <div v-if="openSituationAccordion === 'facility-intelligence' && filteredFacilityIntelligenceSummaries.length" class="action-list command-action-list situation-accordion-body">
              <div
                v-for="summary in filteredFacilityIntelligenceSummaries"
                :key="summary.facility"
                class="action-row readable-action-row"
              >
                <div class="facility-intelligence-copy">
                  <div class="facility-intelligence-head">
                    <strong>{{ summary.facility }}</strong>
                    <span class="facility-intelligence-status-group">
                      <span class="chip compact" :class="summary.urgent ? 'danger' : summary.high ? 'warning' : 'success'">
                        {{ summary.urgent ? "urgent" : summary.high ? "watch" : "routine" }}
                      </span>
                      <span class="chip compact facility-intelligence-status-chip" :class="statusTone(facilityReadinessLabel(summary))">
                        {{ facilityReadinessLabel(summary) }}
                      </span>
                      <span
                        v-if="summary.topOpportunity"
                        class="chip compact facility-intelligence-status-chip"
                        :class="statusTone(opportunityActionStatusLabel(summary.topOpportunity!))"
                      >
                        {{ opportunityActionStatusLabel(summary.topOpportunity!) }}
                      </span>
                    </span>
                  </div>
                  <div class="facility-intelligence-metrics">
                    <span>
                      <strong>{{ summary.total }}</strong>
                      predictions
                    </span>
                    <span>
                      <strong>{{ summary.urgent }}</strong>
                      urgent
                    </span>
                    <span>
                      <strong>{{ summary.high }}</strong>
                      high
                    </span>
                    <span>
                      <strong>{{ summary.openActions }}</strong>
                      open actions
                    </span>
                  </div>
                  <div v-if="summary.topOpportunity" class="facility-intelligence-top-resident">
                    <small>Top resident</small>
                    <strong>{{ summary.topOpportunity!.resident.name }}</strong>
                    <p>{{ summary.topOpportunity!.reason }}</p>
                  </div>
                  <div class="facility-intelligence-source-grid">
                    <span>
                      <small>Coverage</small>
                      {{ facilitySourceCoverageText(summary) }}
                    </span>
                    <span>
                      <small>Source mix</small>
                      {{ facilitySourceMixText(summary) }}
                    </span>
                    <span>
                      <small>Sources</small>
                      {{ facilitySummarySourceText(summary) }}
                    </span>
                    <span>
                      <small>Gap</small>
                      {{ facilityInputGapText(summary) }}
                    </span>
                  </div>
                </div>
                <div v-if="summary.topOpportunity" class="action-row-controls facility-intelligence-actions">
                  <button
                    v-if="!actionForOpportunity(summary.topOpportunity!)"
                    class="primary-action compact-action"
                    type="button"
                    @click="openActionRequestFromOpportunity(summary.topOpportunity!, 'DON Facility Intelligence')"
                  >
                    <Send :size="14" />
                    Assign immediate action
                  </button>
                  <button
                    v-else
                    class="soft-action compact-action"
                    type="button"
                    @click="reviewOpportunityAction(summary.topOpportunity!)"
                  >
                    <FileText :size="14" />
                    Review action
                  </button>
                  <button class="soft-action compact-action" type="button" @click="openResident(summary.topOpportunity!.resident)">
                    <FileText :size="14" />
                    Review top resident
                  </button>
                </div>
              </div>
            </div>
            <p v-else-if="openSituationAccordion === 'facility-intelligence'" class="empty-copy situation-accordion-body">
              No generated facility intelligence for this facility.
            </p>
          </article>

          <article class="panel current-watches-panel">
            <div class="notes-panel-header current-watches-header">
              <div>
                <div class="section-label">Current Watches</div>
                <h2>{{ filteredPriorityResidents.length }} residents with active watch context</h2>
              </div>
              <span class="chip compact">{{ filteredPriorityResidents.length }} watches</span>
            </div>

        <div class="situation-layout current-watches-body">
          <div class="priority-list">
            <article
              v-for="resident in filteredPriorityResidents"
              :key="resident.id"
              class="resident-card situation-row"
              :class="{ selected: activeSituationId === resident.id }"
            >
              <button type="button" class="resident-card-head" @click="activeSituationId = resident.id">
                <img class="avatar" :src="resident.image" :alt="resident.name" />
                <span>
                  <strong>{{ resident.name }}</strong>
                  <small>Room {{ resident.room }} · {{ resident.latest }}</small>
                </span>
                <span class="chip" :class="statusTone(resident.statusChips[0] ?? resident.acuity)">
                  {{ resident.statusChips[0] ?? resident.acuity }}
                </span>
              </button>
              <div v-if="activeSituationId === resident.id" class="resident-card-body situation-card-body">
                <div class="alert-line">
                  <AlertCircle :size="16" />
                  <strong>{{ resident.latest }}</strong>
                </div>
                <p>{{ resident.situation.summary }}</p>
                <div
                  v-if="resident.situation.concerns.length || resident.situation.vitals.length"
                  class="situation-clinical-stack"
                >
                  <section v-if="resident.situation.concerns.length" class="watch-context-card">
                    <div class="section-label">Unresolved Concerns</div>
                    <div class="situation-concern-list compact-context-list">
                      <div
                        v-for="concern in resident.situation.concerns.slice(0, 3)"
                        :key="concern.title"
                        class="concern-row"
                      >
                        <span class="dot" :class="concernTone(concern.color)" />
                        <span>{{ concern.title }}</span>
                        <span class="chip compact" :class="statusTone(concern.status)">
                          {{ concern.status }}
                        </span>
                      </div>
                    </div>
                  </section>
                  <section v-if="resident.situation.vitals.length" class="watch-context-card">
                    <div class="section-label">Vitals</div>
                    <div class="vital-list watch-vital-list">
                      <div
                        v-for="vital in resident.situation.vitals"
                        :key="vital.label"
                        class="vital-row compact-vital-row"
                      >
                        <component :is="iconFor(vital.icon)" :size="17" />
                        <span>{{ vital.label }}</span>
                        <small>Base {{ vital.base }}</small>
                        <span
                          class="vital-trend-arrow"
                          :class="vitalTrendDirection(vital)"
                          :aria-label="vitalTrendLabel(vital)"
                        >
                          <component :is="vitalTrendIcon(vital)" :size="15" />
                        </span>
                        <strong :class="{ abnormal: vital.isAbnormal, critical: vital.isCritical }">
                          {{ vital.current }}
                        </strong>
                      </div>
                    </div>
                  </section>
                </div>
                <button type="button" class="primary-action compact-action" @click="openResident(resident)">
                  <FileText :size="15" />
                  Review Chart
                  <ArrowRight :size="15" />
                </button>
                <button type="button" class="soft-action" @click="openActionRequestModal(resident, 'DON Situation', 'provider')">
                  Assign immediate action
                  <Send :size="15" />
                </button>
              </div>
            </article>
          </div>

          <aside v-if="activeSituationResident" class="situation-detail-panel panel">
            <div class="situation-detail-head">
              <img class="avatar large" :src="activeSituationResident.image" :alt="activeSituationResident.name" />
              <div>
                <div class="section-label">Selected Watch</div>
                <h2>{{ activeSituationResident.name }}</h2>
                <p>Room {{ activeSituationResident.room }} · {{ residentFacility(activeSituationResident) }}</p>
              </div>
              <span class="chip compact" :class="statusTone(activeSituationResident.statusChips[0] ?? activeSituationResident.acuity)">
                {{ activeSituationResident.statusChips[0] ?? activeSituationResident.acuity }}
              </span>
            </div>
            <div class="alert-line compact-alert">
              <AlertCircle :size="16" />
              <strong>{{ activeSituationResident.latest }}</strong>
            </div>
            <p class="body-copy">{{ activeSituationResident.situation.summary }}</p>
            <div
              v-if="activeSituationResident.situation.concerns.length || activeSituationResident.situation.vitals.length"
              class="situation-clinical-stack"
            >
              <section v-if="activeSituationResident.situation.concerns.length" class="watch-context-card">
                <div class="section-label">Unresolved Concerns</div>
                <div class="situation-concern-list compact-context-list">
                  <div
                    v-for="concern in activeSituationResident.situation.concerns.slice(0, 3)"
                    :key="concern.title"
                    class="concern-row"
                  >
                    <span class="dot" :class="concernTone(concern.color)" />
                    <span>{{ concern.title }}</span>
                    <span class="chip compact" :class="statusTone(concern.status)">
                      {{ concern.status }}
                    </span>
                  </div>
                </div>
              </section>
              <section v-if="activeSituationResident.situation.vitals.length" class="watch-context-card">
                <div class="section-label">Vitals</div>
                <div class="vital-list watch-vital-list">
                  <div
                    v-for="vital in activeSituationResident.situation.vitals"
                    :key="vital.label"
                    class="vital-row compact-vital-row"
                  >
                    <component :is="iconFor(vital.icon)" :size="17" />
                    <span>{{ vital.label }}</span>
                    <small>Base {{ vital.base }}</small>
                    <span
                      class="vital-trend-arrow"
                      :class="vitalTrendDirection(vital)"
                      :aria-label="vitalTrendLabel(vital)"
                    >
                      <component :is="vitalTrendIcon(vital)" :size="15" />
                    </span>
                    <strong :class="{ abnormal: vital.isAbnormal, critical: vital.isCritical }">
                      {{ vital.current }}
                    </strong>
                  </div>
                </div>
              </section>
            </div>
            <div class="context-stats">
              <span>
                <strong>{{ activeSituationResident.situation.concerns.length }}</strong>
                concerns
              </span>
              <span>
                <strong>{{ activeSituationResident.situation.vitals.length }}</strong>
                vitals
              </span>
              <span>
                <strong>{{ activeSituationResident.timeline.length }}</strong>
                events
              </span>
            </div>
            <div class="card-actions">
              <button type="button" class="primary-action compact-action" @click="openResident(activeSituationResident)">
                <FileText :size="15" />
                Review Chart
              </button>
            </div>
          </aside>
        </div>
          </article>
        </section>
      </section>

      <section v-else-if="activeView === 'residents'" class="screen">
        <header class="screen-header residents-screen-header">
          <div>
            <h1>Residents</h1>
            <p>{{ searchedResidents.length }} of {{ filteredResidents.length }} residents · Day shift</p>
          </div>
          <div class="screen-header-actions resident-search-wrap" :class="{ 'search-open': residentSearchOpen }">
            <button
              v-if="!residentSearchOpen"
              class="icon-button search-button"
              type="button"
              aria-label="Search residents"
              :aria-expanded="residentSearchOpen"
              @click="residentSearchOpen = !residentSearchOpen"
            >
              <Search :size="18" />
            </button>
            <div v-if="residentSearchOpen" class="search-panel header-search-panel">
              <label class="header-search-field" aria-label="Search residents">
                <Search :size="17" />
                <input
                  v-model="residentSearchQuery"
                  type="search"
                  placeholder="Search by resident, room, facility, status, or summary"
                />
              </label>
            </div>
            <button
              v-if="residentSearchOpen"
              class="icon-button search-close-button"
              type="button"
              aria-label="Close resident search"
              @click="residentSearchOpen = false; residentSearchQuery = ''"
            >
              <X :size="16" />
            </button>
          </div>
        </header>

        <section class="schedule-strip content-frame">
          <article class="panel schedule-panel">
            <div class="notes-panel-header schedule-panel-header">
              <div class="schedule-title-row">
                <div>
                  <div class="section-label">Residents Schedule</div>
                  <h2>Calendar & clinical work</h2>
                </div>
              </div>
              <div class="schedule-panel-controls">
                <button class="primary-action compact-action" type="button" @click="openScheduleModal()">
                  <CalendarDays :size="14" />
                  New Schedule
                </button>
                <div class="schedule-view-toggle" role="tablist" aria-label="Schedule view">
                  <button type="button" :class="{ active: scheduleView === 'list' }" @click="scheduleView = 'list'">
                    <FileText :size="14" />
                    List
                  </button>
                  <button type="button" :class="{ active: scheduleView === 'calendar' }" @click="scheduleView = 'calendar'">
                    <CalendarDays :size="14" />
                    Calendar
                  </button>
                </div>
              </div>
            </div>
            <div v-if="visibleScheduleMonthItems.length && scheduleView === 'list'" class="schedule-list">
              <div v-for="item in visibleScheduleMonthItems.slice(0, 6)" :key="`${item.kind}-${item.id}`" class="schedule-row resident-schedule-row">
                <button class="schedule-row-main" type="button" @click="openScheduleItem(item)">
                  <span class="schedule-icon" :class="item.kind">
                    <Users v-if="item.kind === 'huddle'" :size="17" />
                    <AlertTriangle v-else-if="item.kind === 'escalation'" :size="17" />
                    <FileText v-else-if="item.kind === 'order'" :size="17" />
                    <Clock v-else-if="item.kind === 'follow-up'" :size="17" />
                    <CheckCircle v-else :size="17" />
                  </span>
                  <span class="schedule-event-copy">
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.detail }}</small>
                  </span>
                </button>
                <div class="schedule-row-footer">
                  <span class="schedule-meta">
                    <span class="schedule-time">
                      {{ item.time }}
                    </span>
                    <span class="chip compact" :class="scheduleItemTone(item)">
                      {{ item.kind === "order" ? orderStatusForScheduleItem(item).replaceAll("-", " ") : item.kind }}
                    </span>
                  </span>
                  <button
                    v-if="item.threadId"
                    class="soft-action compact-action schedule-thread-action"
                    type="button"
                    @click="openScheduleThread(item.threadId)"
                  >
                    <MessageCircle :size="14" />
                    Thread
                  </button>
                </div>
              </div>
            </div>
            <div v-else-if="scheduleView === 'calendar'" class="schedule-calendar-month">
              <div class="schedule-month-toolbar">
                <button class="icon-button" type="button" aria-label="Previous month" @click="changeScheduleMonth(-1)">
                  <ArrowLeft :size="16" />
                </button>
                <strong>{{ scheduleMonthLabel }}</strong>
                <button class="icon-button" type="button" aria-label="Next month" @click="changeScheduleMonth(1)">
                  <ArrowRight :size="16" />
                </button>
              </div>
              <div class="schedule-weekdays">
                <span v-for="weekday in calendarWeekdays" :key="weekday">{{ weekday }}</span>
              </div>
              <div class="schedule-month-grid">
                <div
                  v-for="cell in scheduleMonthCells"
                  :key="cell.id"
                  class="schedule-month-day"
                  :class="{ muted: !cell.inMonth, today: cell.isToday }"
                  role="button"
                  tabindex="0"
                  @click="selectScheduleDay(cell.dateKey)"
                  @keydown.enter.prevent="selectScheduleDay(cell.dateKey)"
                  @keydown.space.prevent="selectScheduleDay(cell.dateKey)"
                >
                  <span class="schedule-day-number">{{ cell.dayNumber }}</span>
                  <div class="schedule-day-chip-list">
                    <button
                      v-for="item in cell.items.slice(0, 2)"
                      :key="`${cell.id}-${item.kind}-${item.id}`"
                      type="button"
                      class="schedule-event-chip"
                      :class="item.kind"
                      @click.stop="openScheduleItem(item)"
                    >
                      <span>{{ item.timeLabel }}</span>
                      {{ item.title }}
                    </button>
                    <button
                      v-if="cell.items.length > 2"
                      type="button"
                      class="schedule-more-chip"
                      @click.stop="selectScheduleDay(cell.dateKey)"
                    >
                      +{{ cell.items.length - 2 }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="empty-copy">
              No scheduled huddles or follow-ups for this facility yet.
            </p>
          </article>
        </section>

        <div class="resident-groups">
          <section v-for="group in groupedResidents" :key="group.level" class="group-block">
            <div class="group-title">
              <span>{{ group.level }}</span>
              <small>{{ group.residents.length }}</small>
            </div>
            <div class="resident-grid">
              <button
                v-for="resident in group.residents"
                :key="resident.id"
                type="button"
                class="roster-row"
                @click="openResident(resident)"
              >
                <img class="avatar" :src="resident.image" :alt="resident.name" />
                <span>
                  <strong>{{ resident.name }}</strong>
                  <small>{{ resident.latest }}</small>
                </span>
                <span v-if="resident.statusChips.length" class="chip compact" :class="statusTone(resident.statusChips[0])">
                  {{ resident.statusChips[0] }}
                </span>
              </button>
            </div>
          </section>
        </div>
      </section>

      <section v-else-if="activeView === 'ai'" class="screen ai-screen has-prompt-rail">
        <header class="screen-header ai-header">
          <div class="sage-orb">
            <Zap :size="20" />
          </div>
          <div>
            <h1>Sage</h1>
            <p><span class="status-dot online" /> Continuously monitoring 30 residents</p>
          </div>
        </header>

        <div class="message-stream ai-stream">
          <template v-for="message in aiMessages" :key="message.id">
            <article v-if="message.kind === 'briefing'" class="panel briefing-card">
              <div class="section-label">Morning Briefing</div>
              <h2>{{ greeting }}, {{ displayFirstName(activeStaffUser.name) }}.</h2>
              <p>
                I'm actively monitoring <strong>30 residents</strong> across East and West Hall.
              </p>
              <div class="attention-band">
                <strong>Elevated Attention · 2 Residents</strong>
                <span>
                  Highest concern: Mary Lou Smith - worsening confusion, poor intake, and increased transfer difficulty overnight.
                </span>
              </div>
            </article>

            <article v-else class="bubble structured" :class="message.from === 'me' ? 'me' : 'sage'">
              <p>{{ message.text }}</p>
              <ul v-if="message.bullets?.length">
                <li v-for="bullet in message.bullets" :key="bullet">{{ bullet }}</li>
              </ul>
              <footer v-if="message.footer">{{ message.footer }}</footer>
            </article>
          </template>
        </div>

        <div v-if="remainingPrompts.length" class="prompt-rail">
          <div class="section-label">Suggested For You</div>
          <div class="prompt-scroll">
            <button
              v-for="prompt in remainingPrompts"
              :key="prompt.id"
              type="button"
              class="prompt-pill"
              @click="usePrompt(prompt)"
            >
              <component :is="prompt.icon" :size="14" />
              {{ prompt.label }}
            </button>
          </div>
        </div>

        <form class="composer" @submit.prevent="sendAi(aiDraft)">
          <input v-model="aiDraft" type="text" placeholder="Ask Sage anything... @ to tag" />
          <button type="button" class="icon-button" aria-label="Voice input">
            <Mic :size="17" />
          </button>
          <button class="send-button" type="submit" aria-label="Send message to Sage">
            <Send :size="17" />
          </button>
        </form>
      </section>

      <section v-else-if="activeView === 'provider-home'" class="screen role-screen">
        <header class="screen-header">
          <div>
            <h1>Provider Home</h1>
            <p>{{ greeting }} {{ displayFirstName(activeStaffUser.name) }} · {{ filteredResidents.length }} active residents</p>
          </div>
          <div class="header-metric">
            <strong>{{ dailyProviderEncounters.length }}</strong>
            <span>encounters today</span>
          </div>
        </header>

        <div class="role-workspace provider-home-workspace">
          <div class="role-main provider-home-main">
            <section class="content-frame provider-daily-visit-list">
              <article class="panel clinical-attention-panel">
                <div class="notes-panel-header">
                  <div>
                    <div class="section-label">Daily Encounter List</div>
                    <h2>Residents to see today</h2>
                  </div>
                  <span class="chip compact">{{ dailyProviderEncounters.length }} scheduled</span>
                </div>

                <div v-if="dailyProviderEncounters.length" class="attention-list daily-visit-cards">
                  <article
                    v-for="encounter in dailyProviderEncounters"
                    :key="encounter.id"
                    class="attention-card daily-visit-card"
                  >
                    <div class="attention-head">
                      <img class="avatar" :src="encounterResident(encounter).image" :alt="encounter.residentName" />
                      <div class="attention-head-copy">
                        <div class="attention-title-row">
                          <strong>{{ encounter.residentName }}</strong>
                          <span class="chip compact" :class="statusTone(providerVisitStatusLabel(encounter))">
                            {{ providerVisitStatusLabel(encounter) }}
                          </span>
                        </div>
                        <small>{{ residentFacility(encounterResident(encounter)) }} · Room {{ encounterResident(encounter).room }}</small>
                      </div>
                    </div>
                    <div class="chip-row daily-visit-status">
                      <span class="chip compact" :class="statusTone(encounter.clinicalPriority)">
                        {{ encounter.clinicalPriority }} priority
                      </span>
                      <span class="chip compact">{{ encounter.scheduledTime }}</span>
                      <span class="chip compact lavender">{{ encounter.visitType }}</span>
                    </div>
                    <div class="daily-visit-reason">
                      <div class="section-label">Reason for Visit</div>
                      <strong>{{ encounter.visitReason }}</strong>
                      <p>{{ encounterResident(encounter).situation.summary }}</p>
                    </div>
                    <div class="delegate-summary daily-visit-next daily-visit-baseline">
                      <span><strong>Change from baseline:</strong> {{ encounter.baselineChange }}</span>
                    </div>
                    <div class="daily-visit-context-grid">
                      <section v-if="encounterResident(encounter).situation.concerns.length" class="daily-visit-context-card">
                        <div class="section-label">Unresolved Concerns</div>
                        <div class="situation-concern-list compact-context-list">
                          <div
                            v-for="concern in encounterResident(encounter).situation.concerns.slice(0, 2)"
                            :key="concern.title"
                            class="concern-row"
                          >
                            <span class="dot" :class="concernTone(concern.color)" />
                            <span>{{ concern.title }}</span>
                            <span class="chip compact" :class="statusTone(concern.status)">
                              {{ concern.status }}
                            </span>
                          </div>
                        </div>
                      </section>
                      <section v-if="encounterResident(encounter).situation.vitals.length" class="daily-visit-context-card">
                        <div class="section-label">Vitals</div>
                        <div class="vital-list watch-vital-list">
                          <div
                            v-for="vital in encounterResident(encounter).situation.vitals.slice(0, 3)"
                            :key="vital.label"
                            class="vital-row compact-vital-row"
                          >
                            <component :is="iconFor(vital.icon)" :size="17" />
                            <span>{{ vital.label }}</span>
                            <small>Base {{ vital.base }}</small>
                            <span
                              class="vital-trend-arrow"
                              :class="vitalTrendDirection(vital)"
                              :aria-label="vitalTrendLabel(vital)"
                            >
                              <component :is="vitalTrendIcon(vital)" :size="15" />
                            </span>
                            <strong :class="{ abnormal: vital.isAbnormal, critical: vital.isCritical }">
                              {{ vital.current }}
                            </strong>
                          </div>
                        </div>
                      </section>
                    </div>
                    <div class="daily-visit-source">
                      <span>Otangeles Notes+ Daily Visit List</span>
                      <span>{{ encounter.providerName }}</span>
                    </div>
                    <div class="card-actions clinical-attention-actions">
                      <button
                        class="primary-action compact-action clinical-attention-primary-action"
                        type="button"
                        @click="startScheduledEncounter(encounter)"
                      >
                        <FileText :size="15" />
                        {{ encounter.status === "provider-in-progress" ? "Continue Encounter" : "Start Encounter" }}
                      </button>
                    </div>
                  </article>
                </div>
                <p v-else class="empty-copy">
                  No scheduled encounters for this facility right now.
                </p>
              </article>
            </section>

            <section v-if="false" class="situation-accordion-list provider-home-accordion-list">
              <article class="situation-accordion panel" :class="{ open: openProviderHomeAccordion === 'review-decide' }">
                <button
                  class="situation-accordion-header"
                  type="button"
                  :aria-expanded="openProviderHomeAccordion === 'review-decide'"
                  @click="setProviderHomeAccordion('review-decide')"
                >
                  <span>
                    <strong>Review & Decide</strong>
                    <small>{{ providerFocusItems.length }} focus items ranked by urgency</small>
                  </span>
                  <span class="accordion-header-side">
                    <span class="chip compact warning">{{ providerFocusItems.length }} items</span>
                    <ChevronUp v-if="openProviderHomeAccordion === 'review-decide'" :size="17" />
                    <ChevronDown v-else :size="17" />
                  </span>
                </button>
                <div v-if="openProviderHomeAccordion === 'review-decide'" class="focus-panel provider-focus-panel situation-accordion-body">
                  <div class="focus-summary-row">
                    <span><strong>{{ filteredProviderOpportunities.length }}</strong> Sage predictions</span>
                    <span><strong>{{ providerActionRequests.filter((action) => action.status !== 'completed').length }}</strong> open actions</span>
                    <span><strong>{{ clinicalOrders.filter((order) => order.status !== 'completed' && order.status !== 'cancelled').length }}</strong> active orders</span>
                  </div>
                  <div v-if="providerFocusItems.length" class="focus-list provider-focus-list">
                    <article v-for="item in providerFocusItems" :key="item.id" class="focus-row provider-focus-row" :class="item.tone">
                      <span class="focus-icon" :class="item.tone">
                        <Zap v-if="item.kind === 'prediction'" :size="16" />
                        <FileText v-else-if="item.kind === 'order'" :size="16" />
                        <AlertTriangle v-else-if="item.status.toLowerCase().includes('flagged')" :size="16" />
                        <CheckCircle v-else :size="16" />
                      </span>
                      <span class="focus-copy">
                        <small>{{ item.meta }}</small>
                        <strong>{{ item.title }}</strong>
                        <p>{{ item.body }}</p>
                        <span class="focus-status-row">
                          <span class="chip compact" :class="statusTone(item.status)">
                            {{ item.status }}
                          </span>
                        </span>
                      </span>
                      <div class="focus-actions">
                        <button class="primary-action compact-action" type="button" @click="handleFocusItemAction(item)">
                          {{ item.primaryLabel }}
                          <ArrowRight :size="14" />
                        </button>
                        <button
                          v-if="item.secondaryAction"
                          class="soft-action compact-action"
                          type="button"
                          @click="handleFocusItemAction(item, item.secondaryAction)"
                        >
                          {{ item.secondaryLabel }}
                        </button>
                      </div>
                    </article>
                  </div>
                  <p v-else class="empty-copy">
                    No provider focus items for this facility right now.
                  </p>
                </div>
              </article>

              <article class="situation-accordion panel" :class="{ open: openProviderHomeAccordion === 'facility-intelligence' }">
                <button
                  class="situation-accordion-header"
                  type="button"
                  :aria-expanded="openProviderHomeAccordion === 'facility-intelligence'"
                  @click="setProviderHomeAccordion('facility-intelligence')"
                >
                  <span>
                    <strong>Facility Intelligence</strong>
                    <small>{{ filteredFacilityIntelligenceSummaries.length }} facilities · {{ filteredProviderOpportunities.length }} predictions</small>
                  </span>
                  <span class="accordion-header-side">
                    <span class="chip compact">{{ filteredFacilityIntelligenceSummaries.length }} facilities</span>
                    <ChevronUp v-if="openProviderHomeAccordion === 'facility-intelligence'" :size="17" />
                    <ChevronDown v-else :size="17" />
                  </span>
                </button>
                <div v-if="openProviderHomeAccordion === 'facility-intelligence'" class="morning-brief situation-accordion-body">
                  <div v-if="filteredFacilityIntelligenceSummaries.length" class="provider-facility-intelligence-list">
                    <article
                      v-for="summary in filteredFacilityIntelligenceSummaries.slice(0, 4)"
                      :key="summary.facility"
                      class="facility-intelligence-card"
                    >
                      <div class="facility-intelligence-copy">
                        <div class="facility-intelligence-head">
                          <strong>{{ summary.facility }}</strong>
                          <span class="facility-intelligence-status-group">
                            <span class="chip compact" :class="summary.urgent ? 'danger' : summary.high ? 'warning' : 'success'">
                              {{ summary.urgent ? "urgent" : summary.high ? "watch" : "routine" }}
                            </span>
                            <span class="chip compact facility-intelligence-status-chip" :class="statusTone(facilityReadinessLabel(summary))">
                              {{ facilityReadinessLabel(summary) }}
                            </span>
                          </span>
                        </div>
                        <div class="facility-intelligence-metrics">
                          <span>
                            <strong>{{ summary.total }}</strong>
                            predictions
                          </span>
                          <span>
                            <strong>{{ summary.urgent }}</strong>
                            urgent
                          </span>
                          <span>
                            <strong>{{ summary.high }}</strong>
                            high
                          </span>
                          <span>
                            <strong>{{ summary.openActions }}</strong>
                            open actions
                          </span>
                        </div>
                        <div v-if="summary.topOpportunity" class="facility-intelligence-top-resident">
                          <small>Top resident</small>
                          <strong>{{ summary.topOpportunity!.resident.name }}</strong>
                          <p>{{ summary.topOpportunity!.category }} · {{ summary.topOpportunity!.reason }}</p>
                        </div>
                        <div class="facility-intelligence-source-grid">
                          <span>
                            <small>Coverage</small>
                            {{ facilitySourceCoverageText(summary) }}
                          </span>
                          <span>
                            <small>Source mix</small>
                            {{ facilitySourceMixText(summary) }}
                          </span>
                          <span>
                            <small>Gap</small>
                            {{ facilityInputGapText(summary) }}
                          </span>
                          <span>
                            <small>Sources</small>
                            {{ facilitySummarySourceText(summary) }}
                          </span>
                        </div>
                      </div>
                    </article>
                  </div>
                  <p v-else class="empty-copy">
                    No facility intelligence summaries for this facility right now.
                  </p>
                </div>
              </article>

              <article class="situation-accordion panel" :class="{ open: openProviderHomeAccordion === 'assigned-actions' }">
                <button
                  class="situation-accordion-header"
                  type="button"
                  :aria-expanded="openProviderHomeAccordion === 'assigned-actions'"
                  @click="setProviderHomeAccordion('assigned-actions')"
                >
                  <span>
                    <strong>Assigned Actions</strong>
                    <small>{{ providerActionRequests.filter((action) => action.status !== 'completed').length }} open provider follow-ups</small>
                  </span>
                  <span class="accordion-header-side">
                    <span class="chip compact warning">{{ providerActionRequests.filter((action) => action.status !== 'completed').length }} open</span>
                    <ChevronUp v-if="openProviderHomeAccordion === 'assigned-actions'" :size="17" />
                    <ChevronDown v-else :size="17" />
                  </span>
                </button>
                <div v-if="openProviderHomeAccordion === 'assigned-actions'" class="action-panel situation-accordion-body">
                  <div v-if="providerActionRequests.length" class="action-list">
                    <div v-for="action in providerActionRequests.slice(0, 4)" :key="action.id" class="action-row">
                      <span>
                        <strong>{{ action.residentName }} · {{ action.actionType }}</strong>
                        <small>{{ action.instructions }} · {{ action.dueTime }}</small>
                      </span>
                      <span class="chip compact" :class="statusTone(action.priority)">
                        {{ action.priority }}
                      </span>
                      <div class="action-row-controls">
                        <button class="soft-action compact-action" type="button" @click="openResident(action.residentId)">
                          Review
                        </button>
                        <button class="soft-action compact-action" type="button" @click="handleActionStatusSelection(action, 'completed')">
                          <Check :size="14" />
                          {{ actionCompleteLabel(action) }}
                        </button>
                        <button class="soft-action compact-action" type="button" @click="handleActionStatusSelection(action, 'flagged')">
                          <AlertTriangle :size="14" />
                          {{ actionFlagLabel(action) }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p v-else class="empty-copy">
                    No assigned provider actions for this facility right now.
                  </p>
                </div>
              </article>

              <article class="situation-accordion panel" :class="{ open: openProviderHomeAccordion === 'clinical-attention' }">
                <button
                  class="situation-accordion-header"
                  type="button"
                  :aria-expanded="openProviderHomeAccordion === 'clinical-attention'"
                  @click="setProviderHomeAccordion('clinical-attention')"
                >
                  <span>
                    <strong>Clinical Attention Queue</strong>
                    <small>{{ filteredProviderOpportunities.length }} Sage-identified residents</small>
                  </span>
                  <span class="accordion-header-side">
                    <span class="chip compact">{{ filteredProviderOpportunities.length }} residents</span>
                    <ChevronUp v-if="openProviderHomeAccordion === 'clinical-attention'" :size="17" />
                    <ChevronDown v-else :size="17" />
                  </span>
                </button>
                <div v-if="openProviderHomeAccordion === 'clinical-attention'" class="provider-attention-body situation-accordion-body">
                  <div v-if="filteredProviderOpportunities.length" class="attention-list">
                    <article
                      v-for="opportunity in filteredProviderOpportunities"
                      :key="opportunity.id"
                      class="panel attention-card"
                    >
                      <div class="attention-head">
                        <img class="avatar" :src="opportunity.resident.image" :alt="opportunity.resident.name" />
                        <div class="attention-head-copy">
                          <div class="attention-title-row">
                            <strong>{{ opportunity.resident.name }}</strong>
                          </div>
                          <small>{{ opportunity.facility }} · Room {{ opportunity.resident.room }}</small>
                        </div>
                      </div>
                      <div class="attention-status-row">
                        <span class="chip compact" :class="statusTone(opportunity.urgency)">
                          {{ opportunity.category }}
                        </span>
                        <span class="chip compact" :class="statusTone(opportunityActionStatusLabel(opportunity))">
                          {{ opportunityActionStatusLabel(opportunity) }}
                        </span>
                      </div>
                      <p>{{ opportunity.reason }}</p>
                      <div class="context-chip-row">
                        <span class="chip compact success">{{ opportunity.confidence }}% confidence</span>
                        <span class="chip compact">{{ opportunitySourceSummary(opportunity) }}</span>
                      </div>
                      <div class="delegate-summary">
                        <span><strong>Next:</strong> {{ opportunity.recommendedAction }}</span>
                        <div class="evidence-group-list">
                          <div
                            v-for="group in opportunityEvidenceGroups(opportunity)"
                            :key="group.source"
                            class="evidence-group"
                          >
                            <strong>{{ group.source }}:</strong>
                            <ul>
                              <li v-for="event in group.events" :key="event.id">
                                {{ opportunityEvidenceItemText(event) }}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div class="card-actions clinical-attention-actions">
                        <div class="clinical-attention-action-buttons">
                          <button
                            v-if="!actionForOpportunity(opportunity)"
                            class="primary-action compact-action clinical-attention-primary-action"
                            type="button"
                            @click="openActionRequestFromOpportunity(opportunity, 'Provider Queue')"
                          >
                            <Send :size="15" />
                            Assign action
                          </button>
                          <button
                            v-else
                            class="soft-action compact-action clinical-attention-primary-action"
                            type="button"
                            @click="reviewOpportunityAction(opportunity)"
                          >
                            <FileText :size="15" />
                            Review action
                          </button>
                          <div class="clinical-attention-secondary-actions">
                            <button
                              class="soft-action compact-action"
                              type="button"
                              @click="openResident(opportunity.resident)"
                            >
                              Review chart
                              <ArrowRight :size="15" />
                            </button>
                            <button
                              class="soft-icon"
                              type="button"
                              aria-label="Message care team"
                              @click="openTaggedMessageModal(opportunity)"
                            >
                              <MessageCircle :size="16" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                  <p v-else class="empty-copy">
                    No Sage-identified residents for this facility right now.
                  </p>
                </div>
              </article>
            </section>
          </div>

          <aside v-if="false" class="role-side provider-home-side">
            <article class="panel provider-side-panel">
              <div class="notes-panel-header">
                <div>
                  <h2>Recent notes</h2>
                </div>
                <span class="chip compact">{{ filteredProviderNotes.length }} notes</span>
              </div>
              <div v-if="filteredProviderNotes.length" class="note-stack">
                <button
                  v-for="note in filteredProviderNotes.slice(0, 3)"
                  :key="note.id"
                  class="provider-home-note-row"
                  type="button"
                  @click="openProviderHomeNote(note)"
                >
                  <span>
                    <strong>{{ note.residentName }}:</strong> {{ note.title }}
                    <small>{{ providerNoteSourceLabel(note.source) }} · {{ note.createdAt }}</small>
                  </span>
                  <ArrowRight :size="15" />
                </button>
              </div>
              <p v-else class="empty-copy">No provider notes in this facility yet.</p>
            </article>
          </aside>
        </div>
      </section>

      <section v-else-if="activeView === 'provider-residents'" class="screen role-screen">
        <header class="screen-header residents-screen-header">
          <div>
            <h1>Facility Residents</h1>
            <p>{{ filteredResidents.length }} residents across assigned facilities</p>
          </div>
          <div class="screen-header-actions resident-search-wrap" :class="{ 'search-open': providerResidentSearchOpen }">
            <button
              v-if="!providerResidentSearchOpen"
              class="icon-button search-button"
              type="button"
              aria-label="Search residents"
              :aria-expanded="providerResidentSearchOpen"
              @click="providerResidentSearchOpen = !providerResidentSearchOpen"
            >
              <Search :size="18" />
            </button>
            <div v-if="providerResidentSearchOpen" class="search-panel header-search-panel">
              <label class="header-search-field" aria-label="Search residents">
                <Search :size="17" />
                <input
                  v-model="providerResidentSearchQuery"
                  type="search"
                  placeholder="Search by resident, room, facility, condition, or summary"
                />
              </label>
            </div>
            <button
              v-if="providerResidentSearchOpen"
              class="icon-button search-close-button"
              type="button"
              aria-label="Close provider resident search"
              @click="providerResidentSearchOpen = false; providerResidentSearchQuery = ''"
            >
              <X :size="16" />
            </button>
          </div>
        </header>

        <section class="schedule-strip content-frame">
          <article class="panel schedule-panel">
            <div class="notes-panel-header schedule-panel-header">
              <div class="schedule-title-row">
                <div>
                  <div class="section-label">Residents Schedule</div>
                  <h2>Calendar & clinical work</h2>
                </div>
              </div>
              <div class="schedule-panel-controls">
                <button class="primary-action compact-action" type="button" @click="openScheduleModal()">
                  <CalendarDays :size="14" />
                  New Schedule
                </button>
                <div class="schedule-view-toggle" role="tablist" aria-label="Schedule view">
                  <button type="button" :class="{ active: scheduleView === 'list' }" @click="scheduleView = 'list'">
                    <FileText :size="14" />
                    List
                  </button>
                  <button type="button" :class="{ active: scheduleView === 'calendar' }" @click="scheduleView = 'calendar'">
                    <CalendarDays :size="14" />
                    Calendar
                  </button>
                </div>
              </div>
            </div>
            <div v-if="visibleScheduleMonthItems.length && scheduleView === 'list'" class="schedule-list">
              <div v-for="item in visibleScheduleMonthItems.slice(0, 6)" :key="`${item.kind}-${item.id}`" class="schedule-row resident-schedule-row">
                <button class="schedule-row-main" type="button" @click="openScheduleItem(item)">
                  <span class="schedule-icon" :class="item.kind">
                    <Users v-if="item.kind === 'huddle'" :size="17" />
                    <AlertTriangle v-else-if="item.kind === 'escalation'" :size="17" />
                    <FileText v-else-if="item.kind === 'order'" :size="17" />
                    <Clock v-else-if="item.kind === 'follow-up'" :size="17" />
                    <CheckCircle v-else :size="17" />
                  </span>
                  <span class="schedule-event-copy">
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.detail }}</small>
                  </span>
                </button>
                <div class="schedule-row-footer">
                  <span class="schedule-meta">
                    <span class="schedule-time">
                      {{ item.time }}
                    </span>
                    <span class="chip compact" :class="scheduleItemTone(item)">
                      {{ item.kind === "order" ? orderStatusForScheduleItem(item).replaceAll("-", " ") : item.kind }}
                    </span>
                  </span>
                  <button
                    v-if="item.threadId"
                    class="soft-action compact-action schedule-thread-action"
                    type="button"
                    @click="openScheduleThread(item.threadId)"
                  >
                    <MessageCircle :size="14" />
                    Thread
                  </button>
                </div>
              </div>
            </div>
            <div v-else-if="scheduleView === 'calendar'" class="schedule-calendar-month">
              <div class="schedule-month-toolbar">
                <button class="icon-button" type="button" aria-label="Previous month" @click="changeScheduleMonth(-1)">
                  <ArrowLeft :size="16" />
                </button>
                <strong>{{ scheduleMonthLabel }}</strong>
                <button class="icon-button" type="button" aria-label="Next month" @click="changeScheduleMonth(1)">
                  <ArrowRight :size="16" />
                </button>
              </div>
              <div class="schedule-weekdays">
                <span v-for="weekday in calendarWeekdays" :key="weekday">{{ weekday }}</span>
              </div>
              <div class="schedule-month-grid">
                <div
                  v-for="cell in scheduleMonthCells"
                  :key="cell.id"
                  class="schedule-month-day"
                  :class="{ muted: !cell.inMonth, today: cell.isToday }"
                  role="button"
                  tabindex="0"
                  @click="selectScheduleDay(cell.dateKey)"
                  @keydown.enter.prevent="selectScheduleDay(cell.dateKey)"
                  @keydown.space.prevent="selectScheduleDay(cell.dateKey)"
                >
                  <span class="schedule-day-number">{{ cell.dayNumber }}</span>
                  <div class="schedule-day-chip-list">
                    <button
                      v-for="item in cell.items.slice(0, 2)"
                      :key="`${cell.id}-${item.kind}-${item.id}`"
                      type="button"
                      class="schedule-event-chip"
                      :class="item.kind"
                      @click.stop="openScheduleItem(item)"
                    >
                      <span>{{ item.timeLabel }}</span>
                      {{ item.title }}
                    </button>
                    <button
                      v-if="cell.items.length > 2"
                      type="button"
                      class="schedule-more-chip"
                      @click.stop="selectScheduleDay(cell.dateKey)"
                    >
                      +{{ cell.items.length - 2 }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="empty-copy">
              No scheduled huddles or follow-ups for your residents yet.
            </p>
          </article>
        </section>

        <div class="resident-groups provider-resident-view">
          <section v-for="group in groupedProviderResidents" :key="group.level" class="group-block">
            <div class="group-title">
              <span>{{ group.level }}</span>
              <small>{{ group.residents.length }}</small>
            </div>
            <div class="resident-grid">
              <button
                v-for="resident in group.residents"
                :key="resident.id"
                type="button"
                class="roster-row provider-row"
                @click="openResident(resident)"
              >
                <img class="avatar" :src="resident.image" :alt="resident.name" />
                <span>
                  <strong>{{ resident.name }}</strong>
                  <small v-if="providerOpportunityByResidentId.get(resident.id)">
                    {{ providerOpportunityByResidentId.get(resident.id)?.category }} · {{ providerOpportunityByResidentId.get(resident.id)?.reason }}
                  </small>
                  <small v-if="providerOpportunityByResidentId.get(resident.id)" class="provider-row-meta">
                    Surfaced at {{ providerOpportunityByResidentId.get(resident.id)?.surfaced }}
                  </small>
                  <small v-else>
                    Room {{ resident.room }} · {{ resident.latest }}
                  </small>
                </span>
                <span v-if="resident.statusChips.length" class="provider-status-chips">
                  <span
                    v-for="chip in resident.statusChips.slice(0, 2)"
                    :key="chip"
                    class="chip compact"
                    :class="statusTone(chip)"
                  >
                    {{ chip }}
                  </span>
                </span>
              </button>
            </div>
          </section>
        </div>
      </section>

      <section v-else-if="activeView === 'provider-sage'" class="screen ai-screen role-screen has-prompt-rail">
        <header class="screen-header ai-header">
          <div class="sage-orb">
            <Zap :size="20" />
          </div>
          <div>
            <h1>Provider Sage</h1>
            <p><span class="status-dot online" /> Resident context, notes, and decision memory</p>
          </div>
        </header>

        <div class="message-stream ai-stream">
          <article class="panel briefing-card">
            <div class="section-label">Clinical Read</div>
            <h2>Which residents need attention today?</h2>
            <p>
              Sage surfaced <strong>{{ filteredProviderOpportunities.length }} generated attention opportunities</strong>.
              <template v-if="filteredProviderOpportunities[0]">
                {{ filteredProviderOpportunities[0].resident.name }} is highest priority because {{ filteredProviderOpportunities[0].reason.toLowerCase() }}
              </template>
            </p>
            <div class="attention-band">
              <strong>Suggested next action</strong>
              <span>{{ filteredProviderOpportunities[0]?.recommendedAction ?? "No generated provider actions for this facility right now." }}</span>
            </div>
          </article>

          <article v-if="filteredProviderOpportunities[0]" class="bubble structured sage">
            <p>Provider-ready summary for {{ filteredProviderOpportunities[0].resident.name }}:</p>
            <ul>
              <li v-for="change in filteredProviderOpportunities[0].changes" :key="change">{{ change }}</li>
              <li v-for="event in filteredProviderOpportunities[0].evidence.slice(0, 3)" :key="event.id">
                {{ opportunityEvidenceText(event) }}
              </li>
            </ul>
            <footer>{{ filteredProviderOpportunities[0].confidence }}% confidence · {{ opportunitySourceSummary(filteredProviderOpportunities[0]) }}</footer>
          </article>

          <article
            v-for="message in providerSageMessages"
            :key="message.id"
            class="bubble structured"
            :class="message.from === 'me' ? 'me' : 'sage'"
          >
            <p>{{ message.text }}</p>
            <ul v-if="message.bullets?.length">
              <li v-for="bullet in message.bullets" :key="bullet">{{ bullet }}</li>
            </ul>
            <footer v-if="message.footer">{{ message.footer }}</footer>
          </article>
        </div>

        <div v-if="remainingPrompts.length" class="prompt-rail">
          <div class="section-label">Suggested For You</div>
          <div class="prompt-scroll">
            <button
              v-for="prompt in remainingPrompts"
              :key="prompt.id"
              type="button"
              class="prompt-pill"
              @click="usePrompt(prompt)"
            >
              <component :is="prompt.icon" :size="14" />
              {{ prompt.label }}
            </button>
          </div>
        </div>

        <form class="composer" @submit.prevent="sendAi(aiDraft)">
          <input v-model="aiDraft" type="text" placeholder="Capture observation or ask Sage..." />
          <button type="button" class="icon-button" aria-label="Voice input">
            <Mic :size="17" />
          </button>
          <button class="send-button" type="submit" aria-label="Send provider note">
            <Send :size="17" />
          </button>
        </form>
      </section>

      <section v-else-if="activeView === 'cna-home'" class="screen role-screen">
        <header class="screen-header">
          <div>
            <h1>My Shift</h1>
            <p>Debrief pending · Voice-first capture</p>
          </div>
          <button class="huddle-button start-debrief-button" type="button" @click="activeView = 'cna-debrief'">
            <Mic :size="15" />
            Start Debrief
          </button>
        </header>

        <div class="role-workspace cna-workspace">
          <div class="role-main">
            <article class="panel focus-panel">
              <div class="notes-panel-header">
                <div>
                  <div class="section-label">Next Care Actions</div>
                  <h2>What to do next this shift</h2>
                </div>
                <span class="chip compact warning">{{ cnaFocusItems.length }} focus items</span>
              </div>
              <div class="focus-summary-row">
                <span><strong>Started</strong> 7:00 AM</span>
                <span><strong>{{ filteredCnaAssignments.length }}</strong> residents</span>
                <span><strong>{{ cnaActionRequests.filter((action) => action.status !== 'completed').length }}</strong> open actions</span>
                <span><strong>{{ capturedDebriefCount }}</strong> debriefs captured</span>
              </div>
              <div v-if="cnaFocusItems.length" class="focus-list">
                <article v-for="item in cnaFocusItems" :key="item.id" class="focus-row" :class="item.tone">
                  <span class="focus-icon" :class="item.tone">
                    <Mic v-if="item.kind === 'debrief'" :size="16" />
                    <AlertTriangle v-else-if="item.status.toLowerCase().includes('flagged')" :size="16" />
                    <CheckCircle v-else :size="16" />
                  </span>
                  <span class="focus-copy">
                    <small>{{ item.meta }}</small>
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.body }}</p>
                  </span>
                  <span class="chip compact" :class="statusTone(item.status)">
                    {{ item.status }}
                  </span>
                  <div class="focus-actions">
                    <button class="primary-action compact-action" type="button" @click="handleFocusItemAction(item)">
                      {{ item.primaryLabel }}
                      <ArrowRight :size="14" />
                    </button>
                    <button
                      v-if="item.secondaryAction"
                      class="soft-action compact-action"
                      type="button"
                      @click="handleFocusItemAction(item, item.secondaryAction)"
                    >
                      {{ item.secondaryLabel }}
                    </button>
                  </div>
                </article>
              </div>
              <p v-else class="empty-copy">
                No immediate CNA focus items for this shift.
              </p>
            </article>

            <section v-if="cnaActionRequests.length" class="context-section">
              <button
                class="context-toggle"
                type="button"
                :aria-expanded="isSectionExpanded('cna-assigned-actions')"
                @click="toggleSection('cna-assigned-actions')"
              >
                <span>
                  <strong>Assigned Actions</strong>
                  <small>{{ cnaActionRequests.filter((action) => action.status !== 'completed').length }} open CNA follow-ups</small>
                </span>
                <ChevronUp v-if="isSectionExpanded('cna-assigned-actions')" :size="17" />
                <ChevronDown v-else :size="17" />
              </button>
            </section>

            <article v-if="cnaActionRequests.length && isSectionExpanded('cna-assigned-actions')" class="panel action-panel">
              <div class="notes-panel-header">
                <div>
                  <div class="section-label">Assigned Actions</div>
                  <h2>CNA shift follow-up</h2>
                </div>
                <span class="chip compact warning">{{ cnaActionRequests.filter((action) => action.status !== 'completed').length }} open</span>
              </div>
              <div class="action-list">
                <div v-for="action in cnaActionRequests.slice(0, 4)" :key="action.id" class="action-row">
                  <span>
                    <strong>{{ action.residentName }} · {{ action.actionType }}</strong>
                    <small>{{ action.instructions }} · {{ action.dueTime }}</small>
                  </span>
                  <span class="chip compact" :class="statusTone(action.priority)">
                    {{ action.priority }}
                  </span>
                  <div class="action-row-controls">
                    <button class="soft-action compact-action" type="button" @click="openResident(action.residentId)">
                      View
                    </button>
                    <button class="soft-action compact-action" type="button" @click="handleActionStatusSelection(action, 'completed')">
                      <Check :size="14" />
                      {{ actionCompleteLabel(action) }}
                    </button>
                    <button class="soft-action compact-action" type="button" @click="handleActionStatusSelection(action, 'flagged')">
                      <AlertTriangle :size="14" />
                      {{ actionFlagLabel(action) }}
                    </button>
                  </div>
                </div>
              </div>
            </article>

            <section class="context-section">
              <button
                class="context-toggle"
                type="button"
                :aria-expanded="isSectionExpanded('cna-resident-cards')"
                @click="toggleSection('cna-resident-cards')"
              >
                <span>
                  <strong>Assigned Residents</strong>
                  <small>{{ filteredCnaAssignments.length }} residents with care reminders</small>
                </span>
                <ChevronUp v-if="isSectionExpanded('cna-resident-cards')" :size="17" />
                <ChevronDown v-else :size="17" />
              </button>
            </section>

            <div v-if="isSectionExpanded('cna-resident-cards')" class="resident-grid">
              <article v-for="assignment in filteredCnaAssignments" :key="assignment.id" class="panel cna-card">
                <div class="attention-head">
                  <img class="avatar" :src="assignment.resident.image" :alt="assignment.resident.name" />
                  <div>
                    <strong>{{ assignment.resident.name }}</strong>
                    <small>Room {{ assignment.resident.room }} · {{ assignment.care }}</small>
                  </div>
                  <span class="chip compact" :class="statusTone(assignment.status)">
                    {{ assignment.status }}
                  </span>
                </div>
                <p><strong>Reminder:</strong> {{ assignment.reminder }}</p>
                <p><strong>Watch for:</strong> {{ assignment.watchFor }}</p>
              </article>
            </div>
          </div>

          <aside class="role-side">
            <section class="context-section">
              <button
                class="context-toggle"
                type="button"
                :aria-expanded="isSectionExpanded('cna-quick-notes')"
                @click="toggleSection('cna-quick-notes')"
              >
                <span>
                  <strong>Quick Resident Notes</strong>
                  <small>3 shift reminders</small>
                </span>
                <ChevronUp v-if="isSectionExpanded('cna-quick-notes')" :size="17" />
                <ChevronDown v-else :size="17" />
              </button>
            </section>
            <article v-if="isSectionExpanded('cna-quick-notes')" class="panel">
              <div class="section-label">Quick Resident Notes</div>
              <div class="note-stack">
                <p>Mary Lou ate less than usual and needs fluid encouragement.</p>
                <p>Walter should not transfer without two-person assist.</p>
                <p>Elena prefers music during afternoon care.</p>
              </div>
            </article>
          </aside>
        </div>
      </section>

      <section v-else-if="activeView === 'cna-debrief'" class="screen ai-screen role-screen">
        <header class="screen-header ai-header">
          <div class="sage-orb">
            <Mic :size="20" />
          </div>
          <div>
            <h1>Shift Debrief</h1>
            <p>{{ capturedDebriefCount }} of {{ filteredCnaAssignments.length }} residents captured · Sage structures the observations.</p>
          </div>
        </header>

        <div class="debrief-layout">
          <aside class="panel debrief-queue">
            <div class="notes-panel-header">
              <div>
                <div class="section-label">Resident Queue</div>
                <h2>Assigned Residents</h2>
              </div>
              <span class="chip compact" :class="allCnaDebriefsComplete ? 'success' : 'warning'">
                {{ capturedDebriefCount }}/{{ filteredCnaAssignments.length }}
              </span>
            </div>

            <button
              v-for="assignment in filteredCnaAssignments"
              :key="assignment.id"
              type="button"
              class="debrief-resident-row"
              :class="{ selected: currentDebriefAssignment?.id === assignment.id }"
              @click="selectCnaAssignment(assignment.id)"
            >
              <img class="avatar" :src="assignment.resident.image" :alt="assignment.resident.name" />
              <span>
                <strong>{{ assignment.resident.name }}</strong>
                <small>Room {{ assignment.resident.room }} · {{ assignment.watchFor }}</small>
              </span>
              <span
                class="chip compact"
                :class="statusTone(cnaStatusLabel(cnaDebriefFor(assignment.id)?.status ?? 'not-started'))"
              >
                {{ cnaStatusLabel(cnaDebriefFor(assignment.id)?.status ?? "not-started") }}
              </span>
            </button>
          </aside>

          <section class="debrief-main">
            <article v-if="currentDebriefAssignment" class="panel briefing-card active-debrief-card">
              <div class="section-label">Current Resident</div>
              <div class="attention-head">
                <img
                  class="avatar large"
                  :src="currentDebriefAssignment.resident.image"
                  :alt="currentDebriefAssignment.resident.name"
                />
                <div>
                  <h2>{{ currentDebriefAssignment.resident.name }}</h2>
                  <p>Room {{ currentDebriefAssignment.resident.room }} · {{ currentDebriefAssignment.reminder }}</p>
                </div>
              </div>

              <div class="recording-station cna-recording-panel" :class="{ active: cnaRecordingActive }">
                <div class="recording-copy">
                  <strong>{{ cnaRecordingActive ? "Recording debrief" : "Ready to record" }}</strong>
                  <span>
                    {{ cnaRecordingActive ? "Listening and transcribing this resident debrief" : `How was ${currentDebriefAssignment.resident.name.split(" ")[0]} today? Anything unusual?` }}
                  </span>
                </div>
                <button
                  type="button"
                  class="record-core"
                  :class="{ active: cnaRecordingActive }"
                  :aria-label="cnaRecordingActive ? 'Stop debrief recording' : 'Start debrief recording'"
                  @click="cnaRecordingActive ? stopCnaRecording() : startCnaRecording()"
                >
                  <span class="radio-waves" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <X v-if="cnaRecordingActive" :size="30" />
                  <Mic v-else :size="32" />
                </button>
                <b class="recording-badge" :class="{ active: cnaRecordingActive }">
                  {{ cnaRecordingActive ? `REC ${cnaRecordingSeconds}s` : "Ready" }}
                </b>
                <div v-if="cnaRecordingActive || cnaDebriefDraft" class="transcript-preview">
                  <div class="section-label">
                    {{ cnaRecordingActive ? "Live Transcript" : "Draft Transcript" }}
                  </div>
                  <p>
                    {{ cnaRecordingActive ? "Listening for the shift debrief..." : cnaDebriefDraft }}
                  </p>
                </div>
              </div>

              <div v-if="currentCnaDebrief?.transcript" class="captured-transcript">
                <div class="section-label">Captured Transcript</div>
                <p>{{ currentCnaDebrief.transcript }}</p>
                <small v-if="currentCnaDebrief.flaggedConcern">{{ currentCnaDebrief.flaggedConcern }}</small>
              </div>

              <div v-if="currentCnaActions.length" class="resident-action-stack">
                <div class="section-label">Immediate Actions</div>
                <div v-for="action in currentCnaActions" :key="action.id" class="action-row">
                  <span>
                    <strong>{{ action.actionType }}</strong>
                    <small>{{ action.instructions }} · {{ action.dueTime }}</small>
                  </span>
                  <span class="chip compact" :class="statusTone(action.status)">
                    {{ action.status.replace("-", " ") }}
                  </span>
                  <div class="action-row-controls">
                    <button class="soft-action compact-action" type="button" @click="handleActionStatusSelection(action, 'completed')">
                      {{ actionCompleteLabel(action) }}
                    </button>
                    <button class="soft-action compact-action" type="button" @click="handleActionStatusSelection(action, 'flagged')">
                      {{ actionFlagLabel(action) }}
                    </button>
                  </div>
                </div>
              </div>
            </article>

            <article v-if="allCnaDebriefsComplete" class="panel completion-card">
              <CheckCircle :size="22" />
              <div>
                <strong>Shift debrief complete</strong>
                <span>All assigned residents have captured observations. Sage can summarize and route concerns.</span>
              </div>
            </article>

            <article class="panel debrief-summary-list">
              <div class="section-label">Shift Summary</div>
              <div
                v-for="entry in filteredCnaDebriefs.filter((item) => item.transcript)"
                :key="entry.assignmentId"
                class="summary-row"
              >
                <strong>
                  {{ cnaAssignments.find((assignment) => assignment.id === entry.assignmentId)?.resident.name }}
                </strong>
                <span>{{ entry.transcript }}</span>
                <small>{{ entry.capturedAt }} {{ entry.flaggedConcern ? `· ${entry.flaggedConcern}` : "" }}</small>
              </div>
              <p v-if="!filteredCnaDebriefs.some((item) => item.transcript)" class="empty-copy">
                No resident debriefs captured yet.
              </p>
            </article>
          </section>
        </div>

        <form class="composer" @submit.prevent="sendCnaDebrief">
          <input v-model="cnaDebriefDraft" type="text" placeholder="Speak or type what you noticed for the selected resident..." />
          <button
            type="button"
            class="icon-button"
            :aria-label="cnaRecordingActive ? 'Stop debrief recording' : 'Start debrief recording'"
            @click="cnaRecordingActive ? stopCnaRecording() : startCnaRecording()"
          >
            <X v-if="cnaRecordingActive" :size="17" />
            <Mic v-else :size="17" />
          </button>
          <button class="send-button" type="submit" aria-label="Save resident debrief">
            <Send :size="17" />
          </button>
        </form>
      </section>

      <section v-else-if="activeView === 'cna-residents'" class="screen role-screen">
        <header class="screen-header residents-screen-header">
          <div>
            <h1>Residents</h1>
            <p>{{ searchedCnaAssignments.length }} of {{ filteredCnaAssignments.length }} assigned residents</p>
          </div>
          <div class="screen-header-actions resident-search-wrap" :class="{ 'search-open': cnaResidentSearchOpen }">
            <button
              v-if="!cnaResidentSearchOpen"
              class="icon-button search-button"
              type="button"
              aria-label="Search assigned residents"
              :aria-expanded="cnaResidentSearchOpen"
              @click="cnaResidentSearchOpen = !cnaResidentSearchOpen"
            >
              <Search :size="18" />
            </button>
            <div v-if="cnaResidentSearchOpen" class="search-panel header-search-panel">
              <label class="header-search-field" aria-label="Search assigned residents">
                <Search :size="17" />
                <input
                  v-model="cnaResidentSearchQuery"
                  type="search"
                  placeholder="Search residents, room, reminder, care, or watch item"
                />
              </label>
            </div>
            <button
              v-if="cnaResidentSearchOpen"
              class="icon-button search-close-button"
              type="button"
              aria-label="Close CNA resident search"
              @click="cnaResidentSearchOpen = false; cnaResidentSearchQuery = ''"
            >
              <X :size="16" />
            </button>
          </div>
        </header>

        <section class="schedule-strip content-frame">
          <article class="panel schedule-panel">
            <div class="notes-panel-header schedule-panel-header">
              <div class="schedule-title-row">
                <div>
                  <div class="section-label">Residents Schedule</div>
                  <h2>Calendar & clinical work</h2>
                </div>
              </div>
              <div class="schedule-panel-controls">
                <button class="primary-action compact-action" type="button" @click="openScheduleModal()">
                  <CalendarDays :size="14" />
                  New Schedule
                </button>
                <div class="schedule-view-toggle" role="tablist" aria-label="Schedule view">
                  <button type="button" :class="{ active: scheduleView === 'list' }" @click="scheduleView = 'list'">
                    <FileText :size="14" />
                    List
                  </button>
                  <button type="button" :class="{ active: scheduleView === 'calendar' }" @click="scheduleView = 'calendar'">
                    <CalendarDays :size="14" />
                    Calendar
                  </button>
                </div>
              </div>
            </div>
            <div v-if="visibleScheduleMonthItems.length && scheduleView === 'list'" class="schedule-list">
              <div v-for="item in visibleScheduleMonthItems.slice(0, 6)" :key="`${item.kind}-${item.id}`" class="schedule-row resident-schedule-row">
                <button class="schedule-row-main" type="button" @click="openScheduleItem(item)">
                  <span class="schedule-icon" :class="item.kind">
                    <Users v-if="item.kind === 'huddle'" :size="17" />
                    <AlertTriangle v-else-if="item.kind === 'escalation'" :size="17" />
                    <FileText v-else-if="item.kind === 'order'" :size="17" />
                    <Clock v-else-if="item.kind === 'follow-up'" :size="17" />
                    <CheckCircle v-else :size="17" />
                  </span>
                  <span class="schedule-event-copy">
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.detail }}</small>
                  </span>
                </button>
                <div class="schedule-row-footer">
                  <span class="schedule-meta">
                    <span class="schedule-time">
                      {{ item.time }}
                    </span>
                    <span class="chip compact" :class="scheduleItemTone(item)">
                      {{ item.kind === "order" ? orderStatusForScheduleItem(item).replaceAll("-", " ") : item.kind }}
                    </span>
                  </span>
                  <button
                    v-if="item.threadId"
                    class="soft-action compact-action schedule-thread-action"
                    type="button"
                    @click="openScheduleThread(item.threadId)"
                  >
                    <MessageCircle :size="14" />
                    Thread
                  </button>
                </div>
              </div>
            </div>
            <div v-else-if="scheduleView === 'calendar'" class="schedule-calendar-month">
              <div class="schedule-month-toolbar">
                <button class="icon-button" type="button" aria-label="Previous month" @click="changeScheduleMonth(-1)">
                  <ArrowLeft :size="16" />
                </button>
                <strong>{{ scheduleMonthLabel }}</strong>
                <button class="icon-button" type="button" aria-label="Next month" @click="changeScheduleMonth(1)">
                  <ArrowRight :size="16" />
                </button>
              </div>
              <div class="schedule-weekdays">
                <span v-for="weekday in calendarWeekdays" :key="weekday">{{ weekday }}</span>
              </div>
              <div class="schedule-month-grid">
                <div
                  v-for="cell in scheduleMonthCells"
                  :key="cell.id"
                  class="schedule-month-day"
                  :class="{ muted: !cell.inMonth, today: cell.isToday }"
                  role="button"
                  tabindex="0"
                  @click="selectScheduleDay(cell.dateKey)"
                  @keydown.enter.prevent="selectScheduleDay(cell.dateKey)"
                  @keydown.space.prevent="selectScheduleDay(cell.dateKey)"
                >
                  <span class="schedule-day-number">{{ cell.dayNumber }}</span>
                  <div class="schedule-day-chip-list">
                    <button
                      v-for="item in cell.items.slice(0, 2)"
                      :key="`${cell.id}-${item.kind}-${item.id}`"
                      type="button"
                      class="schedule-event-chip"
                      :class="item.kind"
                      @click.stop="openScheduleItem(item)"
                    >
                      <span>{{ item.timeLabel }}</span>
                      {{ item.title }}
                    </button>
                    <button
                      v-if="cell.items.length > 2"
                      type="button"
                      class="schedule-more-chip"
                      @click.stop="selectScheduleDay(cell.dateKey)"
                    >
                      +{{ cell.items.length - 2 }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="empty-copy">
              No scheduled huddles or follow-ups for your assigned residents yet.
            </p>
          </article>
        </section>

        <div class="resident-groups">
          <article v-for="assignment in searchedCnaAssignments" :key="assignment.id" class="panel cna-snapshot">
            <div class="attention-head">
              <img class="avatar large" :src="assignment.resident.image" :alt="assignment.resident.name" />
              <div>
                <strong>{{ assignment.resident.name }}</strong>
                <small>Room {{ assignment.resident.room }} · {{ assignment.resident.latest }}</small>
              </div>
            </div>
            <div class="snapshot-grid">
              <span><strong>Care preference</strong>{{ assignment.reminder }}</span>
              <span><strong>Watch for</strong>{{ assignment.watchFor }}</span>
              <span class="snapshot-row-full"><strong>Recent change</strong>{{ assignment.resident.situation.summary }}</span>
            </div>
          </article>
        </div>
      </section>

      <section v-else-if="isMessagesView" class="screen messages-screen">
        <template v-if="selectedThread">
          <header
            class="screen-header thread-header"
            :class="{ 'compact-thread-header': !threadResident(selectedThread) }"
          >
            <div class="thread-header-main">
              <button class="icon-button" type="button" aria-label="Back to messages" @click="closeThread">
                <ArrowLeft :size="19" />
              </button>
              <img
                v-if="threadResident(selectedThread)"
                class="avatar"
                :src="threadResident(selectedThread)?.image"
                :alt="threadDisplayTitle(selectedThread)"
              />
              <div v-else-if="selectedThread.kind === 'huddle'" class="huddle-avatar">
                <Users :size="17" />
              </div>
              <div v-else class="staff-avatar" aria-hidden="true">
                <component :is="threadIcon(selectedThread)" :size="18" />
              </div>
              <div class="title-stack">
                <h1>{{ threadDisplayTitle(selectedThread) }}</h1>
                <p>
                  <template v-if="threadResident(selectedThread)">
                    Room {{ threadResident(selectedThread)?.room }} · Resident care team · {{ selectedThread.members.length }} members
                  </template>
                  <template v-else>
                    {{ selectedThread.kind === "huddle" ? `${selectedThread.members.length} member staff group` : "Direct message" }}
                  </template>
                </p>
              </div>
            </div>
            <div
              class="thread-header-actions"
              :class="{ 'compact-thread-actions': !threadResident(selectedThread) }"
            >
              <button
                v-if="threadResident(selectedThread)"
                class="soft-action compact-action thread-context-action"
                type="button"
                @click="openSelectedThreadResident"
              >
                <UserIcon :size="15" />
                View Resident
              </button>
              <button
                v-if="threadResident(selectedThread)"
                class="soft-action compact-action thread-context-action"
                type="button"
                @click="scheduleSelectedThreadHuddle"
              >
                <CalendarDays :size="15" />
                Schedule Huddle
              </button>
              <button class="icon-button" type="button" aria-label="Start voice call" @click="startThreadCall('voice-call')">
                <Phone :size="18" />
              </button>
              <button class="icon-button" type="button" aria-label="Start video call" @click="startThreadCall('video-call')">
                <Video :size="18" />
              </button>
              <div class="thread-menu-wrap">
                <button
                  class="icon-button"
                  type="button"
                  aria-label="Thread menu"
                  :aria-expanded="threadMenuOpen"
                  @click="toggleThreadMenu"
                >
                  <MoreVertical :size="18" />
                </button>

                <div v-if="threadMenuOpen" class="thread-menu panel">
                  <button type="button" @click="openThreadSummary"><FileText :size="16" /> View summary</button>
                  <button type="button" @click="openThreadInsight"><Zap :size="16" /> View Insight</button>
                  <button v-if="canRenameThread(selectedThread)" type="button" @click="openThreadRenameModal">
                    <Edit3 :size="16" />
                    Rename huddle
                  </button>
                  <button v-if="selectedRole === 'don'" type="button" @click="openActionRequestFromThread">
                    <Send :size="16" />
                    Assign action
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div class="message-stream thread-stream">
            <div
              v-for="message in threadMessages"
              :key="message.id"
              class="thread-message"
              :class="{ me: isCurrentUser(message.authorId), event: message.kind === 'voice-call' || message.kind === 'video-call' }"
            >
              <template v-if="message.kind === 'voice-call' || message.kind === 'video-call'">
                <span class="call-chip">
                  <Video v-if="message.kind === 'video-call'" :size="14" />
                  <Phone v-else :size="14" />
                  {{ message.kind === 'video-call' ? 'Video call' : 'Voice call' }}
                  <small v-if="message.duration">· {{ message.duration }}</small>
                  <button class="call-transcription-action" type="button" @click.stop="openThreadTranscription(message)">
                    <Mic :size="13" />
                    View transcription
                  </button>
                </span>
              </template>
              <template v-else>
                <small v-if="selectedThread.kind === 'huddle' && !isCurrentUser(message.authorId)">
                  {{ authorName(message.authorId) }}
                </small>
                <div class="bubble" :class="isCurrentUser(message.authorId) ? 'me' : 'sage'">
                  {{ message.text }}
                </div>
                <time>{{ message.ts }}</time>
              </template>
            </div>
          </div>

          <form class="composer" @submit.prevent="sendThreadMessage">
            <input v-model="threadDraft" type="text" placeholder="Message... type @ to tag a resident" />
            <button type="button" class="icon-button" aria-label="Voice input">
              <Mic :size="17" />
            </button>
            <button class="send-button" type="submit" aria-label="Send thread message">
              <Send :size="17" />
            </button>
          </form>
        </template>

        <template v-else>
          <header class="screen-header residents-screen-header">
            <div>
              <h1>{{ messageHeader.title }}</h1>
              <p>{{ messageHeader.subtitle }}</p>
            </div>
            <div class="screen-header-actions resident-search-wrap" :class="{ 'search-open': messageSearchOpen }">
              <button
                v-if="!messageSearchOpen"
                class="icon-button search-button"
                type="button"
                aria-label="Search messages"
                :aria-expanded="messageSearchOpen"
                @click="messageSearchOpen = !messageSearchOpen"
              >
                <Search :size="18" />
              </button>
              <div v-if="messageSearchOpen" class="search-panel header-search-panel">
                <label class="header-search-field" aria-label="Search messages">
                  <Search :size="17" />
                  <input
                    v-model="messageSearchQuery"
                    type="search"
                    placeholder="Search rooms, people, or message content"
                  />
                </label>
              </div>
              <button
                v-if="messageSearchOpen"
                class="icon-button search-close-button"
                type="button"
                aria-label="Close message search"
                @click="messageSearchOpen = false; messageSearchQuery = ''"
              >
                <X :size="16" />
              </button>
            </div>
          </header>

          <div class="message-tabs-band">
            <div class="segmented-tabs message-tabs content-frame">
              <button
                type="button"
                :class="{ active: messageTab === 'rooms' }"
                @click="messageTab = 'rooms'"
              >
                Resident Rooms
              </button>
              <button
                type="button"
                :class="{ active: messageTab === 'people' }"
                @click="messageTab = 'people'; selectedUserIds = []"
              >
                People
              </button>
            </div>
          </div>

          <div v-if="messageTab === 'rooms'" class="thread-list">
            <button
              v-for="thread in searchedResidentRoomThreads"
              :key="thread.id"
              type="button"
              class="thread-row resident-room-row"
              @click="openThread(thread)"
            >
              <img
                v-if="threadResident(thread)"
                class="avatar"
                :src="threadResident(thread)?.image"
                :alt="threadDisplayTitle(thread)"
              />
              <div v-else class="huddle-avatar">
                <Users :size="17" />
              </div>
              <span class="thread-copy">
                <strong>{{ threadDisplayTitle(thread) }}</strong>
                <small>{{ threadSubtitle(thread) }}</small>
                <small
                  class="thread-last-message"
                  :class="{ 'thread-search-match': threadSearchMessagePreview(thread, messageSearchQuery) }"
                >
                  {{ threadSearchMessagePreview(thread, messageSearchQuery) ?? thread.lastMessage }}
                </small>
              </span>
              <time>{{ thread.lastTs }}</time>
              <b v-if="thread.unread">{{ thread.unread }}</b>
            </button>
            <article v-if="!searchedResidentRoomThreads.length" class="empty-state panel">
              <Search v-if="messageSearchQuery.trim()" :size="18" />
              <Users v-else :size="18" />
              <strong>{{ messageSearchQuery.trim() ? 'No matching resident rooms' : 'No resident rooms yet' }}</strong>
              <p v-if="messageSearchQuery.trim()">Try a resident name, room, facility, status, or message text.</p>
              <p v-else>Open a resident profile or schedule a huddle to start a care-team room.</p>
            </article>
          </div>

          <div v-else class="thread-list">
            <button
              v-for="thread in searchedPeopleThreads"
              :key="thread.id"
              type="button"
              class="thread-row people-thread-row"
              @click="openThread(thread)"
            >
              <div v-if="thread.kind === 'huddle'" class="huddle-avatar">
                <Users :size="17" />
              </div>
              <div v-else class="staff-avatar" aria-hidden="true">
                <component :is="threadIcon(thread)" :size="18" />
              </div>
              <span class="thread-copy">
                <strong>{{ threadDisplayTitle(thread) }}</strong>
                <small>{{ threadSubtitle(thread) }}</small>
                <small
                  class="thread-last-message"
                  :class="{ 'thread-search-match': threadSearchMessagePreview(thread, messageSearchQuery) }"
                >
                  {{ threadSearchMessagePreview(thread, messageSearchQuery) ?? thread.lastMessage }}
                </small>
              </span>
              <time>{{ thread.lastTs }}</time>
              <b v-if="thread.unread">{{ thread.unread }}</b>
            </button>
            <div v-if="searchedPeopleThreads.length || searchedMessageUsers.length" class="list-helper">
              {{ selectedUserIds.length ? `${selectedUserIds.length} selected` : 'Start a direct message or group chat' }}
            </div>
            <div v-if="selectedUserIds.length" class="group-action-bar">
              <button class="soft-action compact-action" type="button" @click="startGroupConversation('message')">
                <MessageCircle :size="15" />
                Group Message
              </button>
              <button class="soft-action compact-action" type="button" @click="startGroupConversation('voice-call')">
                <Phone :size="15" />
                Group Call
              </button>
              <button class="soft-action compact-action" type="button" @click="startGroupConversation('video-call')">
                <Video :size="15" />
                Group Video
              </button>
            </div>
            <div
              v-for="user in searchedMessageUsers"
              :key="user.id"
              class="thread-row user-row"
              :class="{ selected: selectedUserIds.includes(user.id) }"
              role="button"
              tabindex="0"
              @click="toggleUserSelection(user.id)"
              @keydown.enter.prevent="toggleUserSelection(user.id)"
              @keydown.space.prevent="toggleUserSelection(user.id)"
            >
              <label class="user-select-checkbox" @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedUserIds.includes(user.id)"
                  :aria-label="`Select ${user.name}`"
                  @change.stop="toggleUserSelection(user.id)"
                  @keydown.stop
                />
                <span aria-hidden="true">
                  <Check :size="13" />
                </span>
              </label>
              <span class="avatar-wrap">
                <span class="staff-avatar" aria-hidden="true">
                  <component :is="careUserIcon(user)" :size="18" />
                </span>
                <span class="presence" :class="user.presence" />
              </span>
              <span class="user-row-copy">
                <strong>{{ user.name }}</strong>
                <small>{{ normalizeSystemRole(user.role) }} · {{ presenceText(user) }}</small>
              </span>
              <div class="user-row-actions">
                <button class="soft-icon" type="button" aria-label="Open direct message" @click.stop="openDirectMessage(user)">
                  <MessageCircle :size="16" />
                </button>
                <button class="soft-icon" type="button" aria-label="Start voice call" @click.stop="openDirectMessage(user, 'voice-call')">
                  <Phone :size="16" />
                </button>
                <button class="soft-icon" type="button" aria-label="Start video call" @click.stop="openDirectMessage(user, 'video-call')">
                  <Video :size="16" />
                </button>
              </div>
            </div>
            <article
              v-if="!searchedPeopleThreads.length && !searchedMessageUsers.length"
              class="empty-state panel"
            >
              <Search :size="18" />
              <strong>No matching people or conversations</strong>
              <p>Try a name, role, department, facility, or message text.</p>
            </article>
          </div>
        </template>
      </section>

      <section v-else-if="isProfileView" class="screen settings-screen">
        <header class="screen-header">
          <div>
            <h1>{{ profileHeader }}</h1>
            <p>Account, preferences, support, and role access</p>
          </div>
        </header>

        <div class="settings-dashboard content-frame">
          <article class="panel settings-card settings-card-wide">
            <div class="settings-detail-head">
              <span class="staff-avatar large" aria-hidden="true">
                <UserIcon :size="22" />
              </span>
              <div>
                <div class="section-label">Profile Information</div>
                <h2>{{ activeProfileDisplayName }}</h2>
                <p>Name and contact details can be edited here. Role access remains read-only.</p>
              </div>
            </div>
            <div class="modal-form settings-form">
              <label>
                First Name
                <input v-model="activeProfile.firstName" type="text" />
              </label>
              <label>
                Last Name
                <input v-model="activeProfile.lastName" type="text" />
              </label>
              <label>
                Email Address
                <input v-model="activeProfile.email" type="email" readonly />
              </label>
              <label>
                Phone Number
                <input v-model="activeProfile.phone" type="tel" />
              </label>
              <label class="form-field-full">
                System Role
                <input v-model="activeProfile.systemRole" type="text" readonly />
              </label>
            </div>
            <div class="settings-card-actions">
              <span class="form-hint">Last applied: {{ profileChangesAppliedAt[selectedRole] }}</span>
              <button class="primary-action compact-action" type="button" @click="applyProfileChanges">
                <Check :size="16" />
                Apply changes
              </button>
            </div>
          </article>

          <article
            v-if="selectedRole === 'provider'"
            id="provider-signature-settings"
            class="panel settings-card settings-card-wide provider-signature-card"
          >
            <div class="settings-detail-head">
              <Signature :size="22" />
              <div>
                <div class="section-label">Encounter Signature</div>
                <h2>{{ currentProviderSignature ? "Signature on file" : "Set up your signature" }}</h2>
                <p>Create the signature shown when you confirm and sign a reviewed encounter.</p>
              </div>
            </div>

            <div v-if="currentProviderSignature" class="saved-signature-preview">
              <div class="section-label">Current Signature</div>
              <strong v-if="currentProviderSignature.method === 'type'" class="typed-signature-preview">
                {{ currentProviderSignature.typedName }}
              </strong>
              <img
                v-else
                :src="currentProviderSignature.dataUrl"
                :alt="`${activeProfileDisplayName} signature`"
              />
              <small>{{ currentProviderSignature.method }} signature · Saved {{ currentProviderSignature.savedAt }}</small>
            </div>

            <div class="signature-mode-tabs segmented-tabs" role="tablist" aria-label="Signature method">
              <button type="button" :class="{ active: signatureMode === 'draw' }" @click="setSignatureMode('draw')">
                <Edit3 :size="15" /> Draw
              </button>
              <button type="button" :class="{ active: signatureMode === 'type' }" @click="setSignatureMode('type')">
                <Signature :size="15" /> Type
              </button>
              <button type="button" :class="{ active: signatureMode === 'upload' }" @click="setSignatureMode('upload')">
                <Upload :size="15" /> Upload
              </button>
            </div>

            <div v-if="signatureMode === 'draw'" class="signature-method-panel">
              <div class="signature-method-copy">
                <span><strong>Draw your signature</strong><small>Use a mouse, stylus, or finger.</small></span>
                <button class="soft-action compact-action" type="button" @click="clearSignatureCanvas">
                  <Trash2 :size="14" /> Clear
                </button>
              </div>
              <canvas
                ref="signatureCanvas"
                class="signature-canvas"
                width="680"
                height="220"
                aria-label="Draw provider signature"
                @pointerdown.prevent="beginSignatureDrawing"
                @pointermove.prevent="drawSignature"
                @pointerup.prevent="endSignatureDrawing"
                @pointercancel.prevent="endSignatureDrawing"
                @pointerleave="endSignatureDrawing"
              />
            </div>

            <div v-else-if="signatureMode === 'type'" class="signature-method-panel">
              <label class="signature-type-field">
                Type your name
                <input v-model="signatureTypedName" type="text" :placeholder="activeProfileDisplayName" />
              </label>
              <div class="typed-signature-stage">
                <span>{{ signatureTypedName || activeProfileDisplayName }}</span>
              </div>
            </div>

            <div v-else class="signature-method-panel">
              <label class="signature-upload-drop">
                <Upload :size="24" />
                <span><strong>Choose a signature image</strong><small>PNG, JPEG, or WebP · 2 MB maximum</small></span>
                <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleSignatureUpload" />
              </label>
              <div v-if="signatureUploadPreview" class="signature-upload-preview">
                <img :src="signatureUploadPreview" alt="Uploaded signature preview" />
              </div>
            </div>

            <p v-if="signatureError" class="signature-feedback error" role="alert">{{ signatureError }}</p>
            <p v-if="signatureSavedMessage" class="signature-feedback success" role="status">{{ signatureSavedMessage }}</p>

            <div class="signature-settings-actions">
              <button v-if="currentProviderSignature" class="soft-action" type="button" @click="removeProviderSignature">
                <Trash2 :size="15" /> Remove Signature
              </button>
              <button class="soft-action" type="button" @click="resetMockEncounterWorkflow">
                <Undo2 :size="15" /> Reset Mock Encounters
              </button>
              <button class="primary-action" type="button" @click="saveProviderSignature">
                <Check :size="16" /> Save Signature
              </button>
            </div>
          </article>

          <article class="panel settings-card">
            <div class="settings-detail-head">
              <FileText :size="22" />
              <div>
                <div class="section-label">Otangeles Notes+</div>
                <h2>{{ otangelesAccount.status }}</h2>
                <p>Clinical documentation routing and practice administration for this workspace.</p>
              </div>
            </div>
            <div class="delegate-summary">
              <span><strong>Connected as:</strong> {{ otangelesAccount.connectedAs }}</span>
              <span><strong>Workspace:</strong> {{ otangelesAccount.workspace }}</span>
              <span><strong>Sync:</strong> {{ otangelesAccount.syncScope }}</span>
              <span><strong>Practice Admin:</strong> {{ otangelesAccount.practiceAdmin }} · {{ otangelesAccount.adminRole }}</span>
              <span><strong>Admin Contact:</strong> {{ otangelesAccount.adminContact }}</span>
            </div>
            <button type="button" class="soft-action" @click="openExternalResource('Otangeles Practice Admin')">
              <MessageCircle :size="16" />
              Contact Practice Admin
            </button>
          </article>

          <article class="panel settings-card">
            <div class="settings-detail-head">
              <Shield :size="22" />
              <div>
                <div class="section-label">Security</div>
                <h2>Access controls</h2>
                <p>Password, 2FA, and active sessions for this role.</p>
              </div>
            </div>
            <label class="modal-switch">
              <span>
                <strong>Require 2FA</strong>
                <small>{{ activeProfile.twoFactorEnabled ? "Enabled for this role" : "Not set up yet" }}</small>
              </span>
              <input v-model="activeProfile.twoFactorEnabled" type="checkbox" role="switch" />
            </label>
            <div class="modal-form settings-form compact-settings-form">
              <label>
                Current Password
                <input v-model="passwordDraft.current" type="password" />
              </label>
              <label>
                New Password
                <input v-model="passwordDraft.next" type="password" />
              </label>
              <label>
                Confirm New Password
                <input v-model="passwordDraft.confirm" type="password" />
              </label>
            </div>
            <div class="settings-card-actions">
              <span class="form-hint">Last update: {{ activeProfile.passwordUpdatedAt }}</span>
              <button
                class="primary-action compact-action"
                type="button"
                :disabled="!passwordDraft.next || passwordDraft.next !== passwordDraft.confirm"
                @click="updatePassword"
              >
                Update Password
              </button>
            </div>
            <div class="session-list">
              <div v-for="session in activeSessions[selectedRole]" :key="session.id" class="session-row">
                <span>
                  <strong>{{ session.device }}</strong>
                  <small>{{ session.location }} · {{ session.lastActive }}</small>
                </span>
                <span v-if="session.current" class="chip compact success">Current</span>
                <button v-else class="soft-action compact-action" type="button" @click="revokeSession(session.id)">
                  Revoke
                </button>
              </div>
            </div>
          </article>

          <article class="panel settings-card">
            <div class="settings-detail-head">
              <Settings :size="22" />
              <div>
                <div class="section-label">Workspace Defaults</div>
                <h2>{{ defaultFacilityLabel }}</h2>
                <p>Choose the default facility and preferred time format.</p>
              </div>
            </div>
            <div class="modal-form">
              <label>
                Default Facility
                <AppSelect
                  :model-value="activeProfile.defaultFacility"
                  :options="roleFacilitySelectOptions"
                  aria-label="Select default facility"
                  @update:model-value="setDefaultFacility"
                />
              </label>
            </div>
            <div class="radio-card-list" role="radiogroup" aria-label="Time format">
              <label class="radio-card">
                <input v-model="activeProfile.time24Hour" type="radio" :value="false" />
                <span>
                  <strong>12-hour format</strong>
                  <small>Example: 8:30 AM</small>
                </span>
              </label>
              <label class="radio-card">
                <input v-model="activeProfile.time24Hour" type="radio" :value="true" />
                <span>
                  <strong>24-hour format</strong>
                  <small>Example: 08:30</small>
                </span>
              </label>
            </div>
          </article>

          <article class="panel settings-card">
            <div class="settings-detail-head">
              <Users :size="22" />
              <div>
                <div class="section-label">Work Assignments</div>
                <h2>{{ activeProfile.assignedFacilities.length }} facilities</h2>
                <p>Facility access controls which residents and queues appear.</p>
              </div>
            </div>
            <div class="facility-check-list">
              <label v-for="facility in facilities" :key="facility" class="facility-check">
                <span>
                  <strong>{{ facility }}</strong>
                  <small>{{ activeProfile.assignedFacilities.includes(facility) ? "Assigned" : "Not assigned" }}</small>
                </span>
                <input
                  type="checkbox"
                  :checked="activeProfile.assignedFacilities.includes(facility)"
                  disabled
                />
              </label>
            </div>
          </article>

          <article class="panel settings-card">
            <div class="settings-detail-head">
              <Bell :size="22" />
              <div>
                <div class="section-label">Appearance & Notifications</div>
                <h2>{{ activeProfile.appearance }}</h2>
                <p>Notification and display defaults for this workspace.</p>
              </div>
            </div>
            <label class="modal-switch">
              <span>
                <strong>Push Notifications</strong>
                <small>Escalations, messages, and debrief reminders</small>
              </span>
              <input v-model="activeProfile.pushEnabled" type="checkbox" role="switch" />
            </label>
            <div class="modal-form settings-form compact-settings-form">
              <label>
                Appearance
                <AppSelect
                  v-model="activeProfile.appearance"
                  :options="appearanceSelectOptions"
                  aria-label="Select appearance"
                />
              </label>
              <label>
                Language
                <AppSelect
                  v-model="activeProfile.language"
                  :options="languageSelectOptions"
                  aria-label="Select language"
                />
              </label>
            </div>
          </article>

          <article class="panel settings-card">
            <div class="settings-detail-head">
              <Activity :size="22" />
              <div>
                <div class="section-label">Features</div>
                <h2>{{ activeRole.label }} workspace</h2>
                <p>Feature availability for the selected role.</p>
              </div>
            </div>
            <div class="feature-card-list">
              <div v-for="feature in profileFeatures" :key="feature.id" class="feature-card-row">
                <component :is="feature.icon" :size="17" />
                <span>
                  <strong>{{ feature.label }}</strong>
                  <small>{{ feature.detail }}</small>
                </span>
                <strong class="feature-status">{{ feature.status }}</strong>
              </div>
            </div>
          </article>

          <article class="panel settings-card">
            <div class="settings-detail-head">
              <HelpCircle :size="22" />
              <div>
                <div class="section-label">Support</div>
                <h2>Resources</h2>
                <p>Open external help, legal, and privacy resources.</p>
              </div>
            </div>
            <div class="support-card-actions">
              <button type="button" class="soft-action" @click="openExternalResource('Help Center')">
                <HelpCircle :size="16" />
                Help Center
              </button>
              <button type="button" class="soft-action" @click="openExternalResource('Terms Privacy')">
                <FileText :size="16" />
                Terms & Privacy
              </button>
            </div>
          </article>
        </div>

        <div v-if="false" class="settings-content content-frame">
          <div class="settings-shell">
            <aside class="settings-sidebar">
              <article class="panel settings-group">
                <div class="section-label">Account</div>
                <button type="button" :class="{ active: activeSettingsPanel === 'profile' }" @click="openSettingsPanel('profile')">
                  <UserIcon :size="17" />
                  <span>Profile Information <small>Name and contact details</small></span>
                  <ChevronRight :size="16" />
                </button>
                <button type="button" :class="{ active: activeSettingsPanel === 'credentials' }" @click="openSettingsPanel('credentials')">
                  <Briefcase :size="17" />
                  <span>License & Credentials <small>Role-specific credentials and verification</small></span>
                  <ChevronRight :size="16" />
                </button>
                <button type="button" :class="{ active: activeSettingsPanel === 'change-password' }" @click="openSettingsPanel('change-password')">
                  <Lock :size="17" />
                  <span>Change Password <small>Update account credentials</small></span>
                  <ChevronRight :size="16" />
                </button>
                <button type="button" :class="{ active: activeSettingsPanel === 'two-factor' }" @click="openSettingsPanel('two-factor')">
                  <Shield :size="17" />
                  <span>Two-Factor Authentication <small>{{ activeProfile.twoFactorEnabled ? "Enabled" : "Set up an extra layer of security" }}</small></span>
                  <ChevronRight :size="16" />
                </button>
                <button type="button" :class="{ active: activeSettingsPanel === 'sessions' }" @click="openSettingsPanel('sessions')">
                  <Globe :size="17" />
                  <span>Active Sessions <small>{{ activeSessions[selectedRole].length }} signed-in devices</small></span>
                  <ChevronRight :size="16" />
                </button>
              </article>

              <article class="panel settings-group">
                <div class="section-label">Preferences</div>
                <button type="button" :class="{ active: activeSettingsPanel === 'preferences' }" @click="openSettingsPanel('preferences')">
                  <Bell :size="17" />
                  <span>Notifications & Appearance <small>{{ activeProfile.pushEnabled ? "Notifications on" : "Notifications paused" }} · {{ activeProfile.appearance }}</small></span>
                  <ChevronRight :size="16" />
                </button>
                <button type="button" :class="{ active: activeSettingsPanel === 'workspace' }" @click="openSettingsPanel('workspace')">
                  <Settings :size="17" />
                  <span>Workspace Defaults <small>{{ activeRole.label }} workspace · {{ defaultFacilityLabel }} · {{ activeProfile.time24Hour ? "24-hour" : "12-hour" }}</small></span>
                  <ChevronRight :size="16" />
                </button>
                <button type="button" :class="{ active: activeSettingsPanel === 'assignments' }" @click="openSettingsPanel('assignments')">
                  <Users :size="17" />
                  <span>Work Assignments <small>{{ activeProfile.assignedFacilities.length }} assigned facilities</small></span>
                  <ChevronRight :size="16" />
                </button>
              </article>

              <article class="panel settings-group">
                <div class="section-label">Features</div>
                <button
                  v-for="feature in profileFeatures"
                  :key="feature.id"
                  type="button"
                  :class="{ active: activeSettingsPanel === 'feature' && selectedFeatureId === feature.id }"
                  @click="openSettingsPanel('feature', feature.id)"
                >
                  <component :is="feature.icon" :size="17" />
                  <span>{{ feature.label }} <small>{{ feature.detail }}</small></span>
                  <strong class="feature-status">{{ feature.status }}</strong>
                  <ChevronRight :size="16" />
                </button>
              </article>

              <article class="panel settings-group">
                <div class="section-label">Support</div>
                <button type="button" class="external-row" @click="openExternalResource('Help Center')">
                  <HelpCircle :size="17" />
                  <span>Help Center <small>Open Sage support resources</small></span>
                  <Globe :size="15" />
                </button>
                <button type="button" class="external-row" @click="openExternalResource('Terms Privacy')">
                  <FileText :size="17" />
                  <span>Terms & Privacy <small>Open legal and privacy policies</small></span>
                  <Globe :size="15" />
                </button>
              </article>
            </aside>

            <section class="panel settings-detail-panel">
              <template v-if="activeSettingsPanel === 'profile'">
                <div class="settings-detail-head">
                  <span class="staff-avatar large" aria-hidden="true">
                    <UserIcon :size="22" />
                  </span>
                  <div>
                    <div class="section-label">Account</div>
                    <h2>Profile Information</h2>
                    <p>Name and contact details can be updated here. Role access remains read-only.</p>
                  </div>
                </div>
                <div class="modal-form settings-form">
                  <label>
                    First Name
                    <input v-model="activeProfile.firstName" type="text" />
                  </label>
                  <label>
                    Last Name
                    <input v-model="activeProfile.lastName" type="text" />
                  </label>
                  <label>
                    Email Address
                    <input v-model="activeProfile.email" type="email" readonly />
                  </label>
                  <label>
                    Phone Number
                    <input v-model="activeProfile.phone" type="tel" />
                  </label>
                  <label class="form-field-full">
                    System Role
                    <input v-model="activeProfile.systemRole" type="text" readonly />
                  </label>
                </div>
                <div class="settings-card-actions">
                  <span class="form-hint">Last applied: {{ profileChangesAppliedAt[selectedRole] }}</span>
                  <button class="primary-action compact-action" type="button" @click="applyProfileChanges">
                    <Check :size="16" />
                    Apply changes
                  </button>
                </div>
              </template>

              <template v-else-if="activeSettingsPanel === 'assignments'">
                <div class="settings-detail-head">
                  <Users :size="22" />
                  <div>
                    <div class="section-label">Work Assignments</div>
                    <h2>Assigned Facilities</h2>
                    <p>Choose which facilities this workspace can access. At least one facility must stay assigned.</p>
                  </div>
                </div>
                <div class="facility-check-list">
                  <label v-for="facility in facilities" :key="facility" class="facility-check">
                    <span>
                      <strong>{{ facility }}</strong>
                      <small>{{ activeProfile.assignedFacilities.includes(facility) ? "Assigned" : "Not assigned" }}</small>
                    </span>
                      <input
                        type="checkbox"
                        :checked="activeProfile.assignedFacilities.includes(facility)"
                        disabled
                      />
                  </label>
                </div>
              </template>

              <template v-else-if="activeSettingsPanel === 'change-password'">
                <div class="settings-detail-head">
                  <Lock :size="22" />
                  <div>
                    <div class="section-label">Security</div>
                    <h2>Change Password</h2>
                    <p>Password values are not stored in this frontend workspace.</p>
                  </div>
                </div>
                <div class="modal-form settings-form compact-settings-form">
                  <label>
                    Current Password
                    <input v-model="passwordDraft.current" type="password" />
                  </label>
                  <label>
                    New Password
                    <input v-model="passwordDraft.next" type="password" />
                  </label>
                  <label>
                    Confirm New Password
                    <input v-model="passwordDraft.confirm" type="password" />
                  </label>
                  <span class="form-hint">Last update: {{ activeProfile.passwordUpdatedAt }}</span>
                </div>
                <button
                  class="primary-action compact-action"
                  type="button"
                  :disabled="!passwordDraft.next || passwordDraft.next !== passwordDraft.confirm"
                  @click="updatePassword"
                >
                  <Check :size="16" />
                  Update Password
                </button>
              </template>

              <template v-else-if="activeSettingsPanel === 'two-factor'">
                <div class="settings-detail-head">
                  <Shield :size="22" />
                  <div>
                    <div class="section-label">Security</div>
                    <h2>Two-Factor Authentication</h2>
                    <p>Control whether this role requires a second verification step.</p>
                  </div>
                </div>
                <label class="modal-switch">
                  <span>
                    <strong>Require 2FA</strong>
                    <small>{{ activeProfile.twoFactorEnabled ? "Enabled for this role" : "Not set up yet" }}</small>
                  </span>
                  <input v-model="activeProfile.twoFactorEnabled" type="checkbox" role="switch" />
                </label>
              </template>

              <template v-else-if="activeSettingsPanel === 'sessions'">
                <div class="settings-detail-head">
                  <Globe :size="22" />
                  <div>
                    <div class="section-label">Security</div>
                    <h2>Active Sessions</h2>
                    <p>Review signed-in devices and revoke old sessions.</p>
                  </div>
                </div>
                <div class="session-list">
                  <div v-for="session in activeSessions[selectedRole]" :key="session.id" class="session-row">
                    <span>
                      <strong>{{ session.device }}</strong>
                      <small>{{ session.location }} · {{ session.lastActive }}</small>
                    </span>
                    <span v-if="session.current" class="chip compact success">Current</span>
                    <button v-else class="soft-action compact-action" type="button" @click="revokeSession(session.id)">
                      Revoke
                    </button>
                  </div>
                </div>
              </template>

              <template v-else-if="activeSettingsPanel === 'credentials'">
                <div class="settings-detail-head">
                  <Briefcase :size="22" />
                  <div>
                    <div class="section-label">Credentials</div>
                    <h2>License & Credentials</h2>
                    <p>Role credentials and facility verification details.</p>
                  </div>
                </div>
                <div class="delegate-summary">
                  <span><strong>Role:</strong> {{ activeProfile.systemRole }}</span>
                  <span><strong>Status:</strong> Verified for assigned facilities</span>
                </div>
              </template>

              <template v-else-if="activeSettingsPanel === 'preferences'">
                <div class="settings-detail-head">
                  <Bell :size="22" />
                  <div>
                    <div class="section-label">Preferences</div>
                    <h2>Notifications & Appearance</h2>
                    <p>Personalize notifications, theme, and language defaults.</p>
                  </div>
                </div>
                <label class="modal-switch">
                  <span>
                    <strong>Push Notifications</strong>
                    <small>Escalations, messages, and debrief reminders</small>
                  </span>
                  <input v-model="activeProfile.pushEnabled" type="checkbox" role="switch" />
                </label>
                <div class="modal-form settings-form">
                  <label>
                    Appearance
                    <AppSelect
                      v-model="activeProfile.appearance"
                      :options="appearanceSelectOptions"
                      aria-label="Select appearance"
                    />
                  </label>
                  <label>
                    Language
                    <AppSelect
                      v-model="activeProfile.language"
                      :options="languageSelectOptions"
                      aria-label="Select language"
                    />
                  </label>
                </div>
              </template>

              <template v-else-if="activeSettingsPanel === 'workspace'">
                <div class="settings-detail-head">
                  <Settings :size="22" />
                  <div>
                    <div class="section-label">Workspace</div>
                    <h2>Workspace Defaults</h2>
                    <p>Choose which facility loads first and how time appears across the app.</p>
                  </div>
                </div>
                <div class="modal-form settings-form">
                  <label>
                    Default Facility
                    <AppSelect
                      :model-value="activeProfile.defaultFacility"
                      :options="roleFacilitySelectOptions"
                      aria-label="Select default facility"
                      @update:model-value="setDefaultFacility"
                    />
                  </label>
                </div>
                <div class="radio-card-list" role="radiogroup" aria-label="Time format">
                  <label class="radio-card">
                    <input v-model="activeProfile.time24Hour" type="radio" :value="false" />
                    <span>
                      <strong>12-hour format</strong>
                      <small>Example: 8:30 AM</small>
                    </span>
                  </label>
                  <label class="radio-card">
                    <input v-model="activeProfile.time24Hour" type="radio" :value="true" />
                    <span>
                      <strong>24-hour format</strong>
                      <small>Example: 08:30</small>
                    </span>
                  </label>
                </div>
              </template>

              <template v-else-if="activeSettingsPanel === 'feature'">
                <div class="settings-detail-head">
                  <component :is="selectedFeature.icon" :size="22" />
                  <div>
                    <div class="section-label">Feature</div>
                    <h2>{{ selectedFeature.label }}</h2>
                    <p>{{ selectedFeature.detail }}</p>
                  </div>
                </div>
                <div class="delegate-summary">
                  <span><strong>Status:</strong> {{ selectedFeature.status }}</span>
                  <span><strong>Workspace:</strong> {{ activeRole.label }}</span>
                </div>
              </template>
            </section>
          </div>
        </div>
      </section>
    </main>

    <nav class="mobile-nav" aria-label="SAGE sections">
      <button
        v-for="item in navItems"
        :key="item.key"
        type="button"
        :class="{ active: activeView === item.key && !selectedResident }"
        @click="setView(item.key)"
      >
        <span :class="{ 'sage-tab': isSageNav(item.key) }">
          <component :is="item.icon" :size="isSageNav(item.key) ? 23 : 20" />
          <span v-if="navBadgeCount(item.key)" class="nav-badge">{{ navBadgeCount(item.key) }}</span>
        </span>
        <small>{{ item.label }}</small>
      </button>
    </nav>

    <div v-if="profileModal" class="modal-backdrop" @click="closeProfileModal">
      <article class="modal-card profile-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeProfileModal">
          <X :size="18" />
        </button>

        <template v-if="profileModal === 'profile'">
          <h2>Profile Information</h2>
          <p>Name and contact details can be updated here. Role access remains read-only.</p>
          <div class="modal-form">
            <label>
              First Name
              <input v-model="activeProfile.firstName" type="text" />
            </label>
            <label>
              Last Name
              <input v-model="activeProfile.lastName" type="text" />
            </label>
            <label>
              Email Address
              <input v-model="activeProfile.email" type="email" readonly />
            </label>
            <label>
              Phone Number
              <input v-model="activeProfile.phone" type="tel" />
            </label>
            <label class="form-field-full">
              System Role
              <input v-model="activeProfile.systemRole" type="text" readonly />
            </label>
          </div>
          <span class="form-hint">Last applied: {{ profileChangesAppliedAt[selectedRole] }}</span>
          <button class="primary-action" type="button" @click="applyProfileChanges(); closeProfileModal()">
            <Check :size="16" />
            Apply changes
          </button>
        </template>

        <template v-else-if="profileModal === 'assignments'">
          <h2>Work Assignments</h2>
          <p>Choose which facilities this workspace can access. At least one facility must stay assigned.</p>
          <div class="facility-check-list">
            <label v-for="facility in facilities" :key="facility" class="facility-check">
              <span>
                <strong>{{ facility }}</strong>
                <small>{{ activeProfile.assignedFacilities.includes(facility) ? "Assigned" : "Not assigned" }}</small>
              </span>
              <input
                type="checkbox"
                :checked="activeProfile.assignedFacilities.includes(facility)"
                disabled
              />
            </label>
          </div>
          <button class="primary-action" type="button" @click="closeProfileModal">
            <Check :size="16" />
            Done
          </button>
        </template>

        <template v-else-if="profileModal === 'change-password'">
          <h2>Change Password</h2>
          <p>This is mock-only. Password values are not stored.</p>
          <div class="modal-form compact-settings-form">
            <label>
              Current Password
              <input v-model="passwordDraft.current" type="password" />
            </label>
            <label>
              New Password
              <input v-model="passwordDraft.next" type="password" />
            </label>
            <label>
              Confirm New Password
              <input v-model="passwordDraft.confirm" type="password" />
            </label>
            <span class="form-hint">Last update: {{ activeProfile.passwordUpdatedAt }}</span>
          </div>
          <button
            class="primary-action"
            type="button"
            :disabled="!passwordDraft.next || passwordDraft.next !== passwordDraft.confirm"
            @click="updatePassword(); closeProfileModal()"
          >
            <Check :size="16" />
            Update Password
          </button>
        </template>

        <template v-else-if="profileModal === 'two-factor'">
          <h2>Two-Factor Authentication</h2>
          <p>Use this mock setting to show whether the account requires a second verification step.</p>
          <label class="modal-switch">
            <span>
              <strong>Require 2FA</strong>
              <small>{{ activeProfile.twoFactorEnabled ? "Enabled for this role" : "Not set up yet" }}</small>
            </span>
            <input v-model="activeProfile.twoFactorEnabled" type="checkbox" role="switch" />
          </label>
          <button class="primary-action" type="button" @click="closeProfileModal">
            <Check :size="16" />
            Save Security
          </button>
        </template>

        <template v-else-if="profileModal === 'sessions'">
          <h2>Active Sessions</h2>
          <p>Review signed-in devices and revoke old sessions.</p>
          <div class="session-list">
            <div v-for="session in activeSessions[selectedRole]" :key="session.id" class="session-row">
              <span>
                <strong>{{ session.device }}</strong>
                <small>{{ session.location }} · {{ session.lastActive }}</small>
              </span>
              <span v-if="session.current" class="chip compact success">Current</span>
              <button v-else class="soft-action compact-action" type="button" @click="revokeSession(session.id)">
                Revoke
              </button>
            </div>
          </div>
          <button class="primary-action" type="button" @click="closeProfileModal">
            Done
          </button>
        </template>

        <template v-else-if="profileModal === 'credentials'">
          <h2>License & Credentials</h2>
          <p>Role credentials are mocked for this prototype.</p>
          <div class="delegate-summary">
            <span><strong>Role:</strong> {{ activeProfile.systemRole }}</span>
            <span><strong>Status:</strong> Verified for assigned facilities</span>
          </div>
          <button class="primary-action" type="button" @click="closeProfileModal">
            Done
          </button>
        </template>

        <template v-else-if="profileModal === 'preferences'">
          <h2>Preferences</h2>
          <p>Personalize notifications and display defaults for this mock workspace.</p>
          <label class="modal-switch">
            <span>
              <strong>Push Notifications</strong>
              <small>Escalations, messages, and debrief reminders</small>
            </span>
            <input v-model="activeProfile.pushEnabled" type="checkbox" role="switch" />
          </label>
          <div class="modal-form">
            <label>
              Appearance
              <AppSelect
                v-model="activeProfile.appearance"
                :options="appearanceSelectOptions"
                aria-label="Select appearance"
              />
            </label>
            <label>
              Language
              <AppSelect
                v-model="activeProfile.language"
                :options="languageSelectOptions"
                aria-label="Select language"
              />
            </label>
          </div>
          <button class="primary-action" type="button" @click="closeProfileModal">
            <Check :size="16" />
            Save Preferences
          </button>
        </template>

        <template v-else-if="profileModal === 'workspace'">
          <h2>Workspace Default</h2>
          <p>Choose which facility loads first and how time appears across the app.</p>
          <div class="modal-form">
            <label>
              Default Facility
              <AppSelect
                :model-value="activeProfile.defaultFacility"
                :options="roleFacilitySelectOptions"
                aria-label="Select default facility"
                @update:model-value="setDefaultFacility"
              />
            </label>
          </div>
          <div class="radio-card-list" role="radiogroup" aria-label="Time format">
            <label class="radio-card">
              <input v-model="activeProfile.time24Hour" type="radio" :value="false" />
              <span>
                <strong>12-hour format</strong>
                <small>Example: 8:30 AM</small>
              </span>
            </label>
            <label class="radio-card">
              <input v-model="activeProfile.time24Hour" type="radio" :value="true" />
              <span>
                <strong>24-hour format</strong>
                <small>Example: 08:30</small>
              </span>
            </label>
          </div>
          <button class="primary-action" type="button" @click="closeProfileModal">
            <Check :size="16" />
            Save Defaults
          </button>
        </template>

        <template v-else-if="profileModal === 'feature'">
          <h2>{{ selectedFeature.label }}</h2>
          <p>{{ selectedFeature.detail }}</p>
          <div class="delegate-summary">
            <span><strong>Status:</strong> {{ selectedFeature.status }}</span>
            <span><strong>Workspace:</strong> {{ activeRole.label }}</span>
          </div>
          <button class="primary-action" type="button" @click="closeProfileModal">
            Done
          </button>
        </template>
      </article>
    </div>

    <div v-if="escalationModalResident" class="modal-backdrop" @click="closeEscalationModal">
      <article class="modal-card profile-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeEscalationModal">
          <X :size="18" />
        </button>
        <h2>{{ canDirectlyEscalate() ? "Escalate to Hospital" : "Request Escalation Review" }}</h2>
        <p>
          {{ canDirectlyEscalate()
            ? "Create a mock hospital-transfer escalation and notify the care team."
            : "Route an immediate provider review request. CNA users do not directly send hospital transfers in this mock workflow." }}
        </p>
        <div class="context-chip-row">
          <span class="chip warning">@{{ escalationModalResident.name }}</span>
          <span class="chip compact">{{ residentFacility(escalationModalResident) }}</span>
        </div>
        <div class="modal-form settings-form">
          <label>
            Urgency
            <AppSelect
              v-model="escalationDraft.urgency"
              :options="prioritySelectOptions"
              aria-label="Select escalation urgency"
            />
          </label>
          <label>
            Destination Hospital / ED
            <input v-model="escalationDraft.destination" type="text" />
          </label>
          <label>
            Follow-up Time
            <input v-model="escalationDraft.followUpTime" type="text" />
          </label>
        </div>
        <div class="modal-form">
          <label>
            Reason
            <textarea v-model="escalationDraft.reason" rows="3" />
          </label>
          <label>
            Notes
            <textarea v-model="escalationDraft.notes" rows="3" placeholder="Transport readiness, family notification, orders, or context..." />
          </label>
        </div>
        <label class="modal-switch">
          <span>
            <strong>Notify care team</strong>
            <small>Create a resident-tagged message thread for this escalation</small>
          </span>
          <input v-model="escalationDraft.notifyTeam" type="checkbox" role="switch" />
        </label>
        <button
          class="primary-action"
          :class="{ 'danger-primary': canDirectlyEscalate() }"
          type="button"
          :disabled="!escalationDraft.reason.trim()"
          @click="submitEscalation"
        >
          <AlertTriangle :size="16" />
          {{ canDirectlyEscalate() ? "Send Hospital Escalation" : "Request Provider Review" }}
        </button>
      </article>
    </div>

    <div v-if="selectedScheduleDateKey" class="modal-backdrop" @click="closeScheduleDayModal">
      <article class="modal-card profile-modal schedule-day-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeScheduleDayModal">
          <X :size="18" />
        </button>
        <div class="notes-panel-header">
          <div>
            <div class="section-label">Schedule Day</div>
            <h2>{{ formatDateLabel(selectedScheduleDateKey) }}</h2>
            <p>{{ selectedScheduleDayItems.length ? `${selectedScheduleDayItems.length} events scheduled` : "No events scheduled for this day" }}</p>
          </div>
          <button class="primary-action compact-action" type="button" @click="openScheduleModalForDate(selectedScheduleDateKey || todayDateKey())">
            <CalendarDays :size="15" />
            New Schedule
          </button>
        </div>

        <div v-if="selectedScheduleDayItems.length" class="schedule-list compact-schedule-list schedule-day-modal-list">
          <div
            v-for="item in selectedScheduleDayItems"
            :key="`day-modal-${item.kind}-${item.id}`"
            class="schedule-row compact-schedule-row"
          >
            <button class="schedule-row-main" type="button" @click="openScheduleItem(item); closeScheduleDayModal()">
              <span class="schedule-icon" :class="item.kind">
                <Users v-if="item.kind === 'huddle'" :size="17" />
                <AlertTriangle v-else-if="item.kind === 'escalation'" :size="17" />
                <FileText v-else-if="item.kind === 'order'" :size="17" />
                <Clock v-else-if="item.kind === 'follow-up'" :size="17" />
                <CheckCircle v-else :size="17" />
              </span>
              <span>
                <strong>{{ item.timeLabel }} · {{ item.title }}</strong>
                <small>{{ item.residentName }} · {{ item.detail }}</small>
              </span>
              <span class="chip compact" :class="scheduleItemTone(item)">
                {{ item.kind === "order" ? orderStatusForScheduleItem(item).replaceAll("-", " ") : item.kind }}
              </span>
            </button>
            <button
              v-if="item.threadId"
              class="soft-icon"
              type="button"
              aria-label="Open linked thread"
              @click="openScheduleThread(item.threadId); closeScheduleDayModal()"
            >
              <MessageCircle :size="15" />
            </button>
          </div>
        </div>
        <div v-else class="empty-schedule-day">
          <CalendarDays :size="24" />
          <span>
            <strong>No events yet</strong>
            <small>Add a huddle, follow-up, or clinical order for this date.</small>
          </span>
        </div>
      </article>
    </div>

    <div v-if="revisionModalSection" class="modal-backdrop" @click="closeRevisionCommentModal">
      <article class="modal-card profile-modal revision-comment-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeRevisionCommentModal">
          <X :size="18" />
        </button>
        <div class="revision-modal-heading">
          <div class="modal-title-icon"><MessageSquarePlus :size="20" /></div>
          <div>
            <h2>{{ revisionModalThreadId ? "Edit Revision Comment" : "Add Revision Comment" }}</h2>
            <p>Request a correction to the <strong>{{ revisionModalSection.title }}</strong> section.</p>
          </div>
        </div>
        <form class="revision-comment-form" @submit.prevent="submitRevisionComment">
          <label class="modal-text-field">
            <span>Comment Description</span>
            <textarea v-model="revisionModalText" rows="4" placeholder="Describe what the Scribe should revise..." autofocus />
          </label>
          <div class="modal-actions revision-modal-actions">
            <button class="soft-action" type="button" @click="closeRevisionCommentModal">Cancel</button>
            <button class="primary-action" type="submit" :disabled="!revisionModalText.trim()">
              <Send :size="16" /> Submit
            </button>
          </div>
        </form>
      </article>
    </div>

    <div v-if="signatureSetupPromptOpen" class="modal-backdrop" @click="signatureSetupPromptOpen = false">
      <article class="modal-card signature-required-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="signatureSetupPromptOpen = false">
          <X :size="18" />
        </button>
        <span class="signature-modal-icon"><Signature :size="24" /></span>
        <h2>Set up your signature first</h2>
        <p>A saved provider signature is required before this encounter can be signed and submitted to billing.</p>
        <div class="modal-actions">
          <button class="soft-action" type="button" @click="signatureSetupPromptOpen = false">Cancel</button>
          <button class="primary-action" type="button" @click="goToSignatureSettings">
            <Settings :size="16" /> Set Up Signature
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="signEncounterConfirmOpen && activeReviewEncounter && currentProviderSignature"
      class="modal-backdrop"
      @click="signEncounterConfirmOpen = false"
    >
      <article class="modal-card sign-encounter-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="signEncounterConfirmOpen = false">
          <X :size="18" />
        </button>
        <span class="signature-modal-icon success"><Signature :size="24" /></span>
        <h2>Confirm Encounter Signature</h2>
        <p>Review the signature that will be attached to {{ activeReviewEncounter.residentName }}'s encounter.</p>
        <div class="signature-confirm-preview">
          <strong v-if="currentProviderSignature.method === 'type'" class="typed-signature-preview">
            {{ currentProviderSignature.typedName }}
          </strong>
          <img v-else :src="currentProviderSignature.dataUrl" :alt="`${activeProfileDisplayName} signature`" />
          <span>{{ activeStaffUser.name }}</span>
          <small>{{ activeReviewEncounter.visitType }} · {{ activeReviewEncounter.sections.length }} verified sections</small>
        </div>
        <div class="modal-actions">
          <button class="soft-action" type="button" @click="signEncounterConfirmOpen = false">Cancel</button>
          <button class="primary-action" type="button" @click="confirmEncounterSignature">
            <Signature :size="16" /> Confirm & Sign
          </button>
        </div>
      </article>
    </div>

    <div v-if="startEncounterResident" class="modal-backdrop" @click="closeStartEncounterModal">
      <article class="modal-card profile-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeStartEncounterModal">
          <X :size="18" />
        </button>
        <h2>Start Encounter</h2>
        <p>Select the encounter visit type before opening the note for {{ startEncounterResident.name }}.</p>
        <div class="delegate-summary">
          <span><strong>Resident:</strong> {{ startEncounterResident.name }}</span>
          <span><strong>Location:</strong> Room {{ startEncounterResident.room }} · {{ residentFacility(startEncounterResident) }}</span>
        </div>
        <div class="modal-form">
          <label>
            Encounter Type
            <AppSelect
              v-model="startEncounterDraft.visitType"
              :options="visitTypeSelectOptions"
              aria-label="Select encounter type"
            />
          </label>
        </div>
        <div class="modal-actions">
          <button class="soft-action" type="button" @click="closeStartEncounterModal">
            Cancel
          </button>
          <button class="primary-action" type="button" @click="submitStartEncounterModal">
            <FileText :size="16" />
            Start Encounter
          </button>
        </div>
      </article>
    </div>

    <div v-if="visitStopConfirmOpen && activeProviderVisit" class="modal-backdrop" @click="visitStopConfirmOpen = false">
      <article class="modal-card" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="visitStopConfirmOpen = false">
          <X :size="18" />
        </button>
        <h2>End encounter?</h2>
        <p>This will save the current encounter note for {{ activeProviderVisit.residentName }}, sync it to Otangeles Notes+, and return to Encounter Notes.</p>
        <div class="modal-actions">
          <button class="soft-action" type="button" @click="visitStopConfirmOpen = false">Cancel</button>
          <button class="danger-action" type="button" @click="confirmStopVisit">
            <X :size="16" />
            End Encounter
          </button>
        </div>
      </article>
    </div>

    <div v-if="threadRenameModalOpen" class="modal-backdrop" @click="closeThreadRenameModal">
      <article class="modal-card thread-rename-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeThreadRenameModal">
          <X :size="18" />
        </button>
        <h2>Rename Huddle</h2>
        <p>Update the group chat title for this care-team huddle.</p>
        <div class="modal-form">
          <label>
            Huddle Name
            <input v-model="threadRenameDraft" type="text" />
          </label>
        </div>
        <div class="modal-actions">
          <button class="soft-action" type="button" @click="closeThreadRenameModal">
            Cancel
          </button>
          <button class="primary-action" type="button" :disabled="!threadRenameDraft.trim()" @click="saveThreadRename">
            Save
          </button>
        </div>
      </article>
    </div>

    <div v-if="threadUtilityModal && selectedThread" class="modal-backdrop" @click="closeThreadUtilityModal">
      <article class="modal-card profile-modal thread-utility-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeThreadUtilityModal">
          <X :size="18" />
        </button>
        <h2>{{ threadUtilityTitle }}</h2>
        <p>{{ threadUtilityIntro }}</p>
        <div class="context-chip-row">
          <span class="chip compact">{{ threadDisplayTitle(selectedThread) }}</span>
          <span v-if="threadUtilityResident" class="chip warning">Room {{ threadUtilityResident.room }}</span>
          <span class="chip compact">{{ threadUtilityParticipantNames.length }} members</span>
        </div>

        <div v-if="threadUtilityModal === 'summary'" class="thread-utility-section">
          <div class="section-label">Summary</div>
          <ul class="thread-utility-list">
            <li v-for="point in threadSummaryPoints" :key="point">{{ point }}</li>
          </ul>
          <div v-if="threadUtilityLatestMessages.length" class="thread-utility-section">
            <div class="section-label">Latest Messages</div>
            <div class="thread-utility-message-list">
              <article v-for="message in threadUtilityLatestMessages" :key="`summary-${message.id}`">
                <strong>{{ authorName(message.authorId) }}</strong>
                <span>{{ message.text }}</span>
                <small>{{ message.ts }}</small>
              </article>
            </div>
          </div>
        </div>

        <div v-else-if="threadUtilityModal === 'insight'" class="thread-utility-section">
          <div class="section-label">Insight</div>
          <ul class="thread-utility-list insight-list">
            <li v-for="point in threadInsightPoints" :key="point">{{ point }}</li>
          </ul>
        </div>

        <div v-else class="thread-utility-section">
          <div class="section-label">Transcription</div>
          <div v-if="threadTranscriptionLines.length" class="thread-transcription-card">
            <p v-for="line in threadTranscriptionLines" :key="line">{{ line }}</p>
          </div>
          <p v-else>No transcription is available for this call.</p>
        </div>

        <div class="modal-actions">
          <button class="soft-action" type="button" @click="closeThreadUtilityModal">
            Done
          </button>
          <button v-if="threadUtilityResident" class="primary-action" type="button" @click="openThreadUtilityResident">
            <UserIcon :size="16" />
            View Resident
          </button>
        </div>
      </article>
    </div>

    <div v-if="scheduleModalOpen" class="modal-backdrop" @click="closeScheduleModal">
      <article class="modal-card profile-modal schedule-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeScheduleModal">
          <X :size="18" />
        </button>
        <h2>{{ scheduleModalCopy.title }}</h2>
        <p>{{ scheduleModalCopy.description }}</p>
        <div class="context-chip-row">
          <span v-if="scheduleModalResident" class="chip warning">@{{ scheduleModalResident.name }}</span>
          <span class="chip compact">{{ formatDateLabel(scheduleDraft.date) }} · {{ formatTimeInput(scheduleDraft.time) }}</span>
        </div>
        <div v-if="scheduleDraft.type !== 'huddle'" class="modal-form settings-form">
          <label>
            Event Category
            <AppSelect
              :model-value="scheduleDraft.type"
              :options="scheduleTypeSelectOptions"
              aria-label="Select event category"
              @update:model-value="setScheduleType"
            />
          </label>
          <label>
            Event Type
            <AppSelect
              :model-value="scheduleDraft.eventType"
              :options="scheduleEventSelectOptions"
              aria-label="Select event type"
              @update:model-value="setScheduleEventType"
            />
          </label>
          <label>
            Date
            <input v-model="scheduleDraft.date" type="date" />
          </label>
          <label>
            Time
            <input v-model="scheduleDraft.time" type="time" />
          </label>
          <label>
            Title
            <input v-model="scheduleDraft.title" type="text" />
          </label>
          <label v-if="scheduleDraft.type !== 'clinical-order'">
            Duration
            <input v-model="scheduleDraft.duration" type="text" />
          </label>
        </div>

        <div v-if="scheduleDraft.type !== 'huddle'" class="schedule-search-block">
          <div class="section-label">Resident</div>
          <label class="search-panel schedule-search-field">
            <Search :size="17" />
            <input
              v-model="scheduleResidentSearchQuery"
              type="search"
              placeholder="Search resident by name, room, facility, status, or summary"
            />
          </label>
          <div v-if="scheduleModalResident" class="selected-context-row">
            <img class="avatar" :src="scheduleModalResident.image" :alt="scheduleModalResident.name" />
            <span>
              <strong>{{ scheduleModalResident.name }}</strong>
              <small>Room {{ scheduleModalResident.room }} · {{ residentFacility(scheduleModalResident) }}</small>
            </span>
          </div>
          <div class="schedule-result-list">
            <button
              v-for="resident in searchedScheduleResidentOptions.slice(0, 5)"
              :key="resident.id"
              type="button"
              class="schedule-search-result"
              :class="{ selected: scheduleDraft.residentId === resident.id }"
              @click="selectScheduleResident(resident)"
            >
              <img class="avatar" :src="resident.image" :alt="resident.name" />
              <span>
                <strong>{{ resident.name }}</strong>
                <small>Room {{ resident.room }} · {{ residentFacility(resident) }} · {{ resident.acuity }}</small>
              </span>
              <Check v-if="scheduleDraft.residentId === resident.id" :size="16" />
            </button>
          </div>
        </div>

        <div v-if="scheduleDraft.type !== 'huddle'" class="schedule-search-block">
          <div class="section-label">Assign & Tag Staff</div>
          <label class="search-panel schedule-search-field">
            <Search :size="17" />
            <input
              v-model="scheduleStaffSearchQuery"
              type="search"
              placeholder="Search staff by name, role, department, facility, or specialization"
            />
          </label>
          <div class="selected-context-row">
            <span class="staff-avatar" aria-hidden="true">
              <UserIcon :size="17" />
            </span>
            <span>
              <strong>Owner: {{ userName(scheduleDraft.primaryOwnerId) }}</strong>
              <small>
                {{ userRoleLabel(scheduleDraft.primaryOwnerId) }}
                <template v-if="scheduleDraft.taggedUserIds.length">
                  · Tagged: {{ taggedStaffNames(scheduleDraft.taggedUserIds) }}
                </template>
              </small>
            </span>
          </div>
          <div class="staff-picker-list">
            <div
              v-for="user in searchedScheduleStaffOptions.slice(0, 8)"
              :key="user.id"
              class="staff-picker-row"
              :class="{ selected: scheduleDraft.primaryOwnerId === user.id || scheduleDraft.taggedUserIds.includes(user.id) }"
            >
              <span class="staff-avatar" aria-hidden="true">
                <UserIcon :size="17" />
              </span>
              <span>
                <strong>{{ user.name }}</strong>
                <small>{{ normalizeSystemRole(user.role) }} · {{ user.department ?? "Care team" }} · {{ presenceText(user) }}</small>
              </span>
              <div class="staff-picker-actions">
                <button
                  class="soft-action compact-action"
                  type="button"
                  :class="{ active: scheduleDraft.primaryOwnerId === user.id }"
                  @click="setSchedulePrimaryOwner(user.id)"
                >
                  Owner
                </button>
                <button
                  class="soft-action compact-action"
                  type="button"
                  :disabled="scheduleDraft.primaryOwnerId === user.id"
                  :class="{ active: scheduleDraft.taggedUserIds.includes(user.id) }"
                  @click="toggleScheduleTaggedUser(user.id)"
                >
                  {{ scheduleDraft.taggedUserIds.includes(user.id) ? "Tagged" : "Tag" }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <template v-if="scheduleDraft.type === 'huddle'">
          <div class="quick-huddle-layout">
            <div class="schedule-search-block huddle-resident-card">
              <div class="section-label">Resident</div>
              <label class="search-panel schedule-search-field">
                <Search :size="17" />
                <input
                  v-model="scheduleResidentSearchQuery"
                  type="search"
                  placeholder="Search resident by name, room, facility, status, or summary"
                />
              </label>
              <div v-if="scheduleModalResident" class="selected-context-row">
                <img class="avatar" :src="scheduleModalResident.image" :alt="scheduleModalResident.name" />
                <span>
                  <strong>{{ scheduleModalResident.name }}</strong>
                  <small>Room {{ scheduleModalResident.room }} · {{ residentFacility(scheduleModalResident) }}</small>
                </span>
                <button class="soft-action compact-action" type="button" @click="scheduleModalResident && openResident(scheduleModalResident)">
                  <UserIcon :size="15" />
                  View
                </button>
              </div>
              <div class="schedule-result-list compact-resident-picker">
                <button
                  v-for="resident in searchedScheduleResidentOptions.slice(0, 3)"
                  :key="resident.id"
                  type="button"
                  class="schedule-search-result"
                  @click="selectScheduleResident(resident)"
                >
                  <img class="avatar" :src="resident.image" :alt="resident.name" />
                  <span>
                    <strong>{{ resident.name }}</strong>
                    <small>Room {{ resident.room }} · {{ residentFacility(resident) }} · {{ resident.acuity }}</small>
                  </span>
                </button>
              </div>
              <p class="form-hint">
                This invite will post to {{ scheduleModalResident ? scheduleModalResident.name : "the resident" }}'s care-team room.
              </p>
            </div>

            <div class="modal-form settings-form">
              <label>
                Purpose
                <AppSelect
                  :model-value="scheduleDraft.eventType"
                  :options="scheduleEventSelectOptions"
                  aria-label="Select huddle purpose"
                  @update:model-value="setScheduleEventType"
                />
              </label>
              <label>
                Date
                <input v-model="scheduleDraft.date" type="date" />
              </label>
              <label>
                Time
                <input v-model="scheduleDraft.time" type="time" />
              </label>
              <label>
                Duration
                <input v-model="scheduleDraft.duration" type="text" />
              </label>
              <label class="form-field-full">
                Call Type
                <AppSelect
                  v-model="scheduleDraft.callMode"
                  :options="callModeSelectOptions"
                  aria-label="Select call type"
                />
              </label>
            </div>

            <div class="schedule-search-block">
              <div class="section-label">Care Team</div>
              <label class="search-panel schedule-search-field">
                <Search :size="17" />
                <input
                  v-model="scheduleStaffSearchQuery"
                  type="search"
                  placeholder="Search staff by name, role, department, facility, or specialization"
                />
              </label>
              <div class="selected-context-row">
                <span class="staff-avatar" aria-hidden="true">
                  <UserIcon :size="17" />
                </span>
                <span>
                  <strong>Organizer: {{ userName(scheduleDraft.primaryOwnerId) }}</strong>
                  <small>
                    {{ normalizeSystemRole(userRoleLabel(scheduleDraft.primaryOwnerId)) }}
                    <template v-if="scheduleDraft.taggedUserIds.length">
                      · Invitees: {{ taggedStaffNames(scheduleDraft.taggedUserIds) }}
                    </template>
                  </small>
                </span>
              </div>
              <div class="staff-picker-list compact-staff-picker">
                <div
                  v-for="user in searchedScheduleStaffOptions.slice(0, 8)"
                  :key="user.id"
                  class="staff-picker-row"
                  :class="{ selected: scheduleDraft.primaryOwnerId === user.id || scheduleDraft.taggedUserIds.includes(user.id) }"
                >
                  <span class="staff-avatar" aria-hidden="true">
                    <UserIcon :size="17" />
                  </span>
                  <span>
                    <strong>{{ user.name }}</strong>
                    <small>{{ normalizeSystemRole(user.role) }} · {{ user.department ?? "Care team" }} · {{ presenceText(user) }}</small>
                  </span>
                  <div class="staff-picker-actions">
                    <button
                      class="soft-action compact-action"
                      type="button"
                      :class="{ active: scheduleDraft.primaryOwnerId === user.id }"
                      @click="setSchedulePrimaryOwner(user.id)"
                    >
                      Organizer
                    </button>
                    <button
                      class="soft-action compact-action"
                      type="button"
                      :disabled="scheduleDraft.primaryOwnerId === user.id"
                      :class="{ active: scheduleDraft.taggedUserIds.includes(user.id) }"
                      @click="toggleScheduleTaggedUser(user.id)"
                    >
                      {{ scheduleDraft.taggedUserIds.includes(user.id) ? "Invited" : "Invite" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-form">
              <label>
                Purpose Notes
                <textarea
                  v-model="scheduleDraft.details"
                  rows="3"
                  placeholder="Example: Align on UA status, hydration plan, and next provider orders."
                />
              </label>
            </div>
          </div>
        </template>

        <div v-else-if="scheduleDraft.type === 'follow-up'" class="modal-form">
          <label>
            Follow-up Details
            <textarea v-model="scheduleDraft.details" rows="4" />
          </label>
        </div>

        <template v-else>
          <div class="modal-form settings-form">
            <label>
              Priority
              <AppSelect
                v-model="scheduleDraft.priority"
                :options="prioritySelectOptions"
                aria-label="Select order priority"
              />
            </label>
          </div>
          <div class="modal-form">
            <label>
              Indication / Reason
              <textarea v-model="scheduleDraft.indication" rows="3" />
            </label>
            <label>
              Order Details
              <textarea v-model="scheduleDraft.orderDetails" rows="3" placeholder="Example: CBC, CMP, UA with C&S if indicated..." />
            </label>
            <label>
              Instructions
              <textarea v-model="scheduleDraft.instructions" rows="3" />
            </label>
          </div>
          <div class="delegate-summary">
            <span><strong>Destination:</strong> Otangeles Notes+</span>
            <span><strong>Status:</strong> {{ editingClinicalOrderId ? "Editing order" : "New order" }}</span>
          </div>
        </template>

        <div class="modal-actions" :class="{ 'huddle-schedule-actions': scheduleDraft.type === 'huddle' }">
          <button
            v-if="scheduleDraft.type === 'huddle'"
            class="soft-action"
            type="button"
            :disabled="!scheduleDraftCanSave"
            @click="saveScheduleDraft(false)"
          >
            <Clock :size="16" />
            Send Invite
          </button>
          <button
            class="primary-action"
            type="button"
            :disabled="!scheduleDraftCanSave"
            @click="saveScheduleDraft(scheduleDraft.type === 'huddle')"
          >
            <Video v-if="scheduleDraft.type === 'huddle' && scheduleDraft.callMode === 'video-call'" :size="16" />
            <Phone v-else-if="scheduleDraft.type === 'huddle'" :size="16" />
            <FileText v-else :size="16" />
            {{ scheduleDraft.type === "huddle" ? "Start Now" : scheduleDraft.type === "clinical-order" ? "Save Order" : "Save Follow-up" }}
          </button>
        </div>
      </article>
    </div>

    <div v-if="taggedMessageContext && taggedMessageResident" class="modal-backdrop" @click="closeTaggedMessageModal">
      <article class="modal-card profile-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeTaggedMessageModal">
          <X :size="18" />
        </button>
        <h2>Message care team</h2>
        <p>Resident stays tagged as clinical context. Only staff users receive the message.</p>
        <div class="context-chip-row">
          <span class="chip warning">{{ residentTag(taggedMessageResident) }}</span>
          <span v-if="taggedMessageOpportunity" class="chip compact" :class="statusTone(taggedMessageOpportunity.urgency)">
            {{ taggedMessageOpportunity.category }}
          </span>
        </div>
        <div class="modal-form">
          <label>
            Message
            <textarea v-model="taggedMessageContext.body" rows="4" />
          </label>
        </div>
        <div class="recipient-picker">
          <div class="section-label">Send To</div>
          <button
            v-for="user in clinicalRecipients"
            :key="user.id"
            type="button"
            class="recipient-row"
            :class="{ selected: taggedMessageContext.recipientIds.includes(user.id) }"
            @click="toggleTaggedMessageRecipient(user.id)"
          >
            <span class="staff-avatar" aria-hidden="true">
              <UserIcon :size="17" />
            </span>
            <span>
              <strong>{{ user.name }}</strong>
              <small>{{ normalizeSystemRole(user.role) }} · {{ presenceText(user) }}</small>
            </span>
            <Check v-if="taggedMessageContext.recipientIds.includes(user.id)" :size="16" />
          </button>
        </div>
        <button
          class="primary-action"
          type="button"
          :disabled="taggedMessageContext.recipientIds.length === 0"
          @click="sendTaggedCareMessage"
        >
          <MessageCircle :size="16" />
          Send Message
        </button>
      </article>
    </div>

    <div v-if="actionModalSource && actionModalResident" class="modal-backdrop" @click="closeActionRequestModal">
      <article class="modal-card profile-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeActionRequestModal">
          <X :size="18" />
        </button>
        <h2>Assign immediate action</h2>
        <p>Create a trackable request and optionally open a linked staff message thread.</p>
        <div class="context-chip-row">
          <span class="chip warning">@{{ actionModalResident.name }}</span>
          <span class="chip compact">{{ actionModalSource }}</span>
        </div>
        <div class="modal-form settings-form">
          <label>
            Resident
            <AppSelect
              v-model="actionDraft.residentId"
              :options="actionResidentSelectOptions"
              aria-label="Select resident"
            />
          </label>
          <label>
            Assign To Role
            <AppSelect
              :model-value="actionDraft.assignedRole"
              :options="actionRoleSelectOptions"
              aria-label="Select action role"
              @update:model-value="setActionAssignedRole($event as ActionTargetRole)"
            />
          </label>
          <label>
            Staff Member
            <AppSelect
              v-model="actionDraft.assignedUserId"
              :options="actionAssigneeSelectOptions"
              aria-label="Select staff member"
            />
          </label>
          <label>
            Action Type
            <AppSelect
              v-model="actionDraft.actionType"
              :options="actionTypeSelectOptions"
              aria-label="Select action type"
            />
          </label>
          <label>
            Priority
            <AppSelect
              v-model="actionDraft.priority"
              :options="prioritySelectOptions"
              aria-label="Select priority"
            />
          </label>
          <label>
            Due Time
            <input v-model="actionDraft.dueTime" type="text" />
          </label>
        </div>
        <div class="modal-form">
          <label>
            Instructions
            <textarea v-model="actionDraft.instructions" rows="4" />
          </label>
        </div>
        <label class="modal-switch">
          <span>
            <strong>Create linked message thread</strong>
            <small>Posts resident context and assignment to Messages</small>
          </span>
          <input v-model="actionDraft.createThread" type="checkbox" role="switch" />
        </label>
        <button
          class="primary-action"
          type="button"
          :disabled="!actionDraft.instructions.trim()"
          @click="createActionRequest"
        >
          <Send :size="16" />
          Assign Action
        </button>
      </article>
    </div>

    <div v-if="actionStatusModalAction" class="modal-backdrop" @click="closeActionStatusModal">
      <article class="modal-card profile-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeActionStatusModal">
          <X :size="18" />
        </button>
        <h2>{{ actionStatusModalCopy.title }}</h2>
        <p>{{ actionStatusModalCopy.description }}</p>
        <div class="context-chip-row">
          <span class="chip warning">@{{ actionStatusModalAction.residentName }}</span>
          <span class="chip compact" :class="statusTone(actionStatusModalAction.priority)">
            {{ actionStatusModalAction.priority }}
          </span>
        </div>
        <div class="delegate-summary">
          <span><strong>Action:</strong> {{ actionStatusModalAction.actionType }}</span>
          <span><strong>Due:</strong> {{ actionStatusModalAction.dueTime }}</span>
          <span><strong>Instructions:</strong> {{ actionStatusModalAction.instructions }}</span>
        </div>
        <div class="modal-form">
          <label>
            {{ actionStatusModalCopy.noteLabel }}
            <textarea
              v-model="actionStatusDraft.note"
              rows="3"
              :placeholder="actionStatusModalCopy.placeholder"
            />
          </label>
          <span v-if="actionStatusDraft.status === 'flagged'" class="form-hint">
            Required so the nurse, provider, and DON know what needs review.
          </span>
        </div>
        <div class="modal-actions">
          <button class="soft-action" type="button" @click="closeActionStatusModal">
            Cancel
          </button>
          <button
            class="primary-action"
            :class="{ 'danger-primary': actionStatusDraft.status === 'flagged' }"
            type="button"
            :disabled="!actionStatusCanSubmit"
            @click="submitActionStatusUpdate"
          >
            <AlertTriangle v-if="actionStatusDraft.status === 'flagged'" :size="16" />
            <Check v-else :size="16" />
            {{ actionStatusModalCopy.submitLabel }}
          </button>
        </div>
      </article>
    </div>

    <div v-if="encounterModalNote" class="modal-backdrop" @click="closeEncounterModal">
      <article class="modal-card profile-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeEncounterModal">
          <X :size="18" />
        </button>
        <h2>Create an Encounter</h2>
        <p>This will create an encounter in Otangeles Notes+ for clinical review.</p>
        <div class="delegate-summary">
          <span><strong>Source note:</strong> {{ encounterModalNote.title }}</span>
          <span><strong>Captured:</strong> {{ providerNoteSourceLabel(encounterModalNote.source) }} · {{ encounterModalNote.createdAt }}</span>
        </div>
        <div class="modal-form">
          <label>
            Resident Name
            <input v-model="encounterModalDraft.residentName" type="text" />
          </label>
          <label>
            Encounter Type
            <AppSelect
              v-model="encounterModalDraft.visitType"
              :options="visitTypeSelectOptions"
              aria-label="Select encounter visit type"
            />
          </label>
          <label>
            Notes
            <textarea v-model="encounterModalDraft.notes" rows="6" />
          </label>
        </div>
        <div class="modal-actions">
          <button class="soft-action" type="button" @click="closeEncounterModal">
            Cancel
          </button>
          <button
            class="primary-action"
            type="button"
            :disabled="!encounterModalDraft.residentName.trim() || !encounterModalDraft.notes.trim()"
            @click="submitEncounterModal"
          >
            <FileText :size="16" />
            Create an Encounter
          </button>
        </div>
      </article>
    </div>

    <div v-if="deleteProviderNoteTarget" class="modal-backdrop" @click="closeDeleteProviderNoteModal">
      <article class="modal-card" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeDeleteProviderNoteModal">
          <X :size="18" />
        </button>
        <h2>Delete note?</h2>
        <p>
          This removes {{ deleteProviderNoteTarget.title }} from {{ deleteProviderNoteTarget.residentName }}'s provider notes.
        </p>
        <div class="modal-actions">
          <button class="soft-action" type="button" @click="closeDeleteProviderNoteModal">Cancel</button>
          <button class="danger-action" type="button" @click="confirmDeleteProviderNote">
            <X :size="16" />
            Delete
          </button>
        </div>
      </article>
    </div>

    <div v-if="showSignOutModal" class="modal-backdrop" @click="showSignOutModal = false">
      <article class="modal-card" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="showSignOutModal = false">
          <X :size="18" />
        </button>
        <h2>Logout?</h2>
        <p>You will return to the mock login screen. Unsaved local mock state may reset when the page reloads.</p>
        <div class="modal-actions">
          <button class="soft-action" type="button" @click="showSignOutModal = false">Cancel</button>
          <button class="danger-action" type="button" @click="confirmSignOut">
            <LogOut :size="16" />
            Logout
          </button>
        </div>
      </article>
    </div>

    <div v-if="showDelegate && selectedResident" class="modal-backdrop" @click="showDelegate = false">
      <article class="modal-card" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="showDelegate = false">
          <X :size="18" />
        </button>
        <h2>Delegate Reassessment</h2>
        <p>
          Sage will message the charge nurse to perform a focused reassessment and notify the on-call provider.
        </p>
        <div class="delegate-summary">
          <span><strong>Charge:</strong> Sarah Jenkins, RN</span>
          <span><strong>Provider:</strong> {{ userName(providerRecipientIds[0] ?? 'u4') }}</span>
          <span><strong>Task:</strong> Focus on mental status, lung sounds, and fresh vitals for {{ selectedResident.name.split(" ")[0] }}.</span>
        </div>
        <button class="primary-action" type="button" @click="delegateActions">
          Confirm Delegation
        </button>
      </article>
    </div>
  </div>
</template>
