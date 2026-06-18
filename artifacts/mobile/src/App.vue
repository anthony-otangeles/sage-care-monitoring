<script setup lang="ts">
import { computed, ref, type Component } from "vue";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
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
  Mic,
  Moon,
  MoreVertical,
  Phone,
  Search,
  Send,
  Settings,
  Shield,
  Smile,
  Thermometer,
  TrendingDown,
  TrendingUp,
  User as UserIcon,
  UserCheck,
  Users,
  Video,
  X,
  Zap,
} from "lucide-vue-next";

import colors from "../constants/colors";
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
  | "provider-profile"
  | "cna-home"
  | "cna-debrief"
  | "cna-residents"
  | "cna-messages"
  | "cna-profile";
type ResidentTab = "situation" | "talk" | "timeline" | "notes";
type MessageTab = "threads" | "new";
type ScheduleView = "list" | "calendar";
type ScheduleDraftType = "huddle" | "follow-up" | "clinical-order";
type ScheduleStaffRole = RoleKey | "staff";
type MessageStartMode = "message" | "voice-call" | "video-call";
type ActionTargetRole = "provider" | "cna";
type ActionPriority = "Stat" | "High" | "Routine";
type ActionStatus = "open" | "in-progress" | "completed" | "flagged";
type EscalationStatus = "sent-to-hospital" | "requested-review";
type HuddleStatus = "scheduled" | "started" | "completed";
type ScheduleFollowUpStatus = "scheduled" | "completed";
type ClinicalOrderStatus = "draft" | "ready" | "sent";
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
  resident: Resident;
  category: string;
  facility: Facility;
  reason: string;
  changes: string[];
  surfaced: string;
  urgency: "urgent" | "high" | "routine";
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

interface CnaDebriefEntry {
  assignmentId: string;
  residentId: string;
  status: CnaDebriefStatus;
  transcript: string;
  flaggedConcern: string;
  capturedAt?: string;
}

interface ProfileState {
  fullName: string;
  email: string;
  phone: string;
  systemRole: string;
  department: string;
  specialization: string;
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

const theme = colors.light;

const providerUser = getUser("u4") ?? donUser;
const cnaUser = getUser("u3") ?? donUser;

const facilities: Facility[] = [
  "Brickyard Healthcare – Elkhart Care Center",
  "Brickyard Healthcare – Merrillville Care Center",
  "Casa of Hobart",
  "Niles Care Center",
];

const defaultLoginUserIds: Record<RoleKey, string> = {
  don: "u8",
  provider: "u4",
  cna: "u3",
};

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
    role: "Medical Provider",
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
  return {
    fullName: fallbackName,
    email:
      user?.email ??
      `${fallbackName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.+|\.+$/g, "")}@sagecare.local`,
    phone: role === "provider" ? "(219) 555-0128" : role === "cna" ? "(219) 555-0146" : "(219) 555-0184",
    systemRole: profile.role,
    department:
      user?.department ??
      (role === "provider" ? "Medical Services" : role === "cna" ? "Nursing" : "Nursing Administration"),
    specialization:
      user?.specialization ??
      (role === "provider" ? "Geriatric Primary Care" : role === "cna" ? "Long-Term Care" : "Facility Operations"),
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
  "git-branch": GitBranch,
  heart: Heart,
  moon: Moon,
  smile: Smile,
  thermometer: Thermometer,
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
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

const providerOpportunities: ProviderOpportunity[] = [
  {
    id: "po-1",
    resident: residents[0],
    category: "Acute Changes",
    facility: residentFacility(residents[0]),
    reason: "Worsening confusion, low-grade temp, tachycardia, and poor intake.",
    changes: ["confusion increased overnight", "PO intake down to 30%", "UA not yet collected"],
    surfaced: "7:42 AM",
    urgency: "urgent",
  },
  {
    id: "po-2",
    resident: residents[1],
    category: "Nurse Request",
    facility: residentFacility(residents[1]),
    reason: "Post-fall hip pain with imaging pending and lower BP than baseline.",
    changes: ["left hip pain 4/10", "x-ray scheduled", "neuro checks underway"],
    surfaced: "8:10 AM",
    urgency: "high",
  },
  {
    id: "po-3",
    resident: residents[3],
    category: "Follow-Up",
    facility: residentFacility(residents[3]),
    reason: "Three consecutive elevated fasting blood sugars after family food intake.",
    changes: ["fasting BG 185", "diet pattern changed", "family teaching may be needed"],
    surfaced: "8:35 AM",
    urgency: "routine",
  },
  {
    id: "po-4",
    resident: residents[2],
    category: "Monthly Visit Due",
    facility: residentFacility(residents[2]),
    reason: "Monthly compliance visit due after pneumonia antibiotic completion.",
    changes: ["antibiotics completed", "lungs clear", "72-hour recheck recommended"],
    surfaced: "Yesterday",
    urgency: "routine",
  },
];

const providerDocumentation = [
  { id: "doc-1", title: "Mary Lou Smith - acute change note", status: "For review", due: "Today" },
  { id: "doc-2", title: "Walter Jefferson - post-fall visit", status: "For signing", due: "Today" },
  { id: "doc-3", title: "GDR review bundle", status: "Needs correction", due: "Tomorrow" },
];

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
  "Create visit note",
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
    instructions: "Review worsening confusion, fever trend, intake decline, and UA status. Provide next orders or visit plan.",
    dueTime: "Now",
    status: "open",
    sourceScreen: "DON Situation",
    linkedThreadId: "t3",
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
    status: "draft",
    linkedThreadId: "t3",
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
    status: "ready",
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
const residentChat = ref<Resident["talk"]>([]);
const residentDraft = ref("");
const openClarify = ref<number | null>(null);
const showDelegate = ref(false);
const assignedNurse = ref<{ name: string; time: string } | null>(null);
const workingCareSteps = ref<Resident["careSteps"] | null>(null);

const messageTab = ref<MessageTab>("threads");
const selectedUserIds = ref<string[]>([]);
const selectedThreadId = ref<string | null>(null);
const createdThreads = ref<Thread[]>([]);
const threadMessages = ref<ThreadMessage[]>([]);
const threadDraft = ref("");
const threadMenuOpen = ref(false);
const residentSearchOpen = ref(false);
const residentSearchQuery = ref("");
const providerResidentSearchOpen = ref(false);
const providerResidentSearchQuery = ref("");
const cnaResidentSearchOpen = ref(false);
const cnaResidentSearchQuery = ref("");
const scheduleView = ref<ScheduleView>("list");
const providerNoteDraft = ref("");
const providerNotesState = ref<ProviderNote[]>([...initialProviderNotes]);
const selectedProviderNoteId = ref<string | null>(initialProviderNotes[0]?.id ?? null);
const noteActionMenuOpen = ref<string | null>(null);
const providerRecordingActive = ref(false);
const providerRecordingSeconds = ref(0);
const providerTranscript = ref("");

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
const passwordDraft = ref({ current: "", next: "", confirm: "" });
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
});
const escalationModalResidentId = ref<string | null>(null);
const escalationDraft = ref({
  urgency: "High" as ActionPriority,
  destination: "Local Emergency Department",
  reason: "",
  notes: "",
  followUpTime: "Today 1:00 PM",
  notifyTeam: true,
});
const huddleModalResidentId = ref<string | null>(null);
const huddleDraft = ref({
  title: "",
  scheduledFor: "Today 2:00 PM",
  duration: "20 min",
  participantIds: [] as string[],
  callMode: "video-call" as Exclude<MessageStartMode, "message">,
  agenda: "",
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
const activeRole = computed<RoleProfile>(() => ({
  ...roleProfiles[selectedRole.value],
  name: activeStaffUser.value.name,
  role: activeStaffUser.value.role,
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
const selectedFacilityModel = computed({
  get: () => selectedFacility.value,
  set: (facility: FacilitySelection) => setSelectedFacility(facility),
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
  providerOpportunities.filter(
    (opportunity) => selectedFacility.value === "all" || opportunity.facility === selectedFacility.value,
  ),
);
const filteredProviderNotes = computed(() =>
  providerNotesState.value.filter((note) => {
    const resident = residents.find((entry) => entry.id === note.residentId);
    return !resident || selectedFacility.value === "all" || residentFacility(resident) === selectedFacility.value;
  }),
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
const visibleScheduleItems = computed(() => scheduleItemsForRole(selectedRole.value));
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
const selectedResidentClinicalOrders = computed(() =>
  selectedResident.value
    ? clinicalOrders.value.filter((order) => order.residentId === selectedResident.value?.id)
    : [],
);
const scheduleResidentOptions = computed(() => {
  if (selectedRole.value === "cna") {
    return filteredCnaAssignments.value.map((assignment) => assignment.resident);
  }
  return filteredResidents.value;
});
const searchedScheduleResidentOptions = computed(() =>
  scheduleResidentOptions.value.filter((resident) =>
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
const huddleModalResident = computed(() =>
  huddleModalResidentId.value
    ? residents.find((resident) => resident.id === huddleModalResidentId.value) ?? null
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
    return true;
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
const residentTabs = computed(() =>
  selectedRole.value === "provider"
    ? baseResidentTabs
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
      subtitle: "Messages, huddles, calls, and clinical discussions",
    };
  }
  if (selectedRole.value === "cna") {
    return {
      title: "Messages",
      subtitle: "Charge nurse, unit manager, and DON communication",
    };
  }
  return {
    title: "Messages",
    subtitle: "Care team huddles and direct messages",
  };
});
const profileHeader = computed(() => "Settings");
const profileMenuRoleLabel = computed(() => {
  if (selectedRole.value === "provider") {
    if (/medical doctor|doctor|attending|medical director/i.test(activeStaffUser.value.role)) {
      return "Medical Doctor";
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
const selectedProviderNote = computed(
  () =>
    providerNotesState.value.find((note) => note.id === selectedProviderNoteId.value) ??
    selectedResidentNotes.value[0] ??
    null,
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

const visibleThreads = computed(() => [
  ...createdThreads.value,
  ...threads.filter((thread) => !createdThreads.value.some((created) => created.id === thread.id)),
]);

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
      members: ["me", user.id],
      lastMessage: "",
      lastTs: "now",
      unread: 0,
      messages: threadMessages.value,
    };
  }

  return null;
});

const sortedUsers = computed(() => {
  const order = { online: 0, away: 1, offline: 2 };
  return users
    .filter((user) => user.id !== activeStaffUser.value.id)
    .slice()
    .sort((a, b) => order[a.presence] - order[b.presence]);
});
const clinicalRecipients = computed(() =>
  users.filter((user) => clinicalRecipientIds.includes(user.id) && user.id !== activeStaffUser.value.id),
);
const taggedMessageOpportunity = computed(() =>
  taggedMessageContext.value
    ? providerOpportunities.find((opportunity) => opportunity.id === taggedMessageContext.value?.opportunityId) ?? null
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

function revokeSession(sessionId: string) {
  activeSessions.value[selectedRole.value] = activeSessions.value[selectedRole.value].filter(
    (session) => session.id !== sessionId || session.current,
  );
}

function openExternalResource(label: string) {
  window.open(`https://otangelesnotes.example/${label.toLowerCase().replaceAll(" ", "-")}`, "_blank");
}

function userName(userId: string) {
  if (userId === activeStaffUser.value.id || userId === "me") {
    return activeStaffUser.value.name;
  }
  return getUser(userId)?.name ?? careUserById(userId)?.name ?? "Care team";
}

function actionAssigneeName(action: ActionRequest) {
  return userName(action.assignedUserId);
}

function userRoleLabel(userId: string) {
  if (userId === activeStaffUser.value.id || userId === "me") {
    return activeStaffUser.value.role;
  }
  return getUser(userId)?.role ?? careUserById(userId)?.role ?? "Care team";
}

function taggedStaffNames(userIds: string[]) {
  return userIds.map((id) => userName(id)).filter(Boolean).join(", ");
}

function assignmentSummary(primaryOwnerId: string, taggedUserIds: string[] = []) {
  const tagged = taggedStaffNames(taggedUserIds);
  return tagged ? `Owner: ${userName(primaryOwnerId)} · Tagged: ${tagged}` : `Owner: ${userName(primaryOwnerId)}`;
}

function residentTag(resident: Resident) {
  return `@${resident.name}`;
}

function actionResident(action: ActionRequest) {
  return residents.find((resident) => resident.id === action.residentId) ?? null;
}

function actionSourceResidentFromThread() {
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
    detail: `${huddle.eventType} · ${huddle.residentName} · ${huddle.duration} · ${assignmentSummary(huddle.primaryOwnerId, huddle.taggedUserIds)}`,
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
  messageTab.value = "threads";
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

function handleScheduleTypeChange(event: Event) {
  const nextType = (event.target as HTMLSelectElement).value as ScheduleDraftType;
  const resident = residents.find((entry) => entry.id === scheduleDraft.value.residentId) ?? null;
  resetScheduleDraft(nextType, resident, scheduleDraft.value.date || todayDateKey());
}

function handleScheduleEventTypeChange(event: Event) {
  const eventType = (event.target as HTMLSelectElement).value;
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
  const recipientIds = uniqueIds([order.primaryOwnerId, ...order.taggedUserIds, "u1", "u2"]).filter(
    (id) => id !== activeStaffUser.value.id,
  );
  const resident = residents.find((entry) => entry.id === order.residentId) ?? residents[0];
  const text = `Provider order draft: ${residentTag(resident)} - ${order.eventType}. ${order.indication}`;
  const thread: Thread = {
    id: `order-thread-${Date.now()}`,
    kind: "huddle",
    title: `${order.residentName} · ${order.eventType} order`,
    members: ["me", ...recipientIds],
    lastMessage: text,
    lastTs: "now",
    unread: 0,
    messages: [
      {
        id: `m-${Date.now()}`,
        authorId: "me",
        text,
        ts: "now",
      },
      {
        id: `m-${Date.now()}-details`,
        authorId: "me",
        text: `${assignmentSummary(order.primaryOwnerId, order.taggedUserIds)}. Details: ${order.details}. Instructions: ${order.instructions}`,
        ts: "now",
      },
    ],
  };
  createLocalThread(thread);
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
    status: "draft",
    createdAt: currentTimeLabel(),
  };
  order.linkedThreadId = createOrderContextThread(order);
  clinicalOrders.value = [order, ...clinicalOrders.value];
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
  const recipientIds = uniqueIds([providerRecipientIds[0] ?? "u4", providerRecipientIds[1] ?? "", "u1", "u2"]).filter(
    (id) => id !== activeStaffUser.value.id,
  );
  const text = `Hospital transfer escalation initiated: ${residentTag(resident)} - ${escalation.reason}. Destination: ${escalation.destination}.`;
  const thread: Thread = {
    id: `hospital-thread-${Date.now()}`,
    kind: "huddle",
    title: `${resident.name} · hospital transfer`,
    members: ["me", ...recipientIds],
    lastMessage: text,
    lastTs: "now",
    unread: 0,
    messages: [
      {
        id: `m-${Date.now()}`,
        authorId: "me",
        text,
        ts: "now",
      },
      {
        id: `m-${Date.now()}-followup`,
        authorId: "me",
        text: `Follow-up scheduled: ${escalation.followUpTime || "Not set"}. Notes: ${escalation.notes || "No additional notes."}`,
        ts: "now",
      },
    ],
  };
  createLocalThread(thread);
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

function closeHuddleModal() {
  huddleModalResidentId.value = null;
}

function toggleHuddleParticipant(userId: string) {
  huddleDraft.value.participantIds = huddleDraft.value.participantIds.includes(userId)
    ? huddleDraft.value.participantIds.filter((id) => id !== userId)
    : [...huddleDraft.value.participantIds, userId];
}

function createScheduledHuddleThread(huddle: ScheduledHuddle, startNow: boolean) {
  const message = `Scheduled ${huddle.eventType}: ${residentTag(residents.find((resident) => resident.id === huddle.residentId) ?? residents[0])} - ${huddle.title} at ${huddle.scheduledFor}. ${assignmentSummary(huddle.primaryOwnerId, huddle.taggedUserIds)}. Agenda: ${huddle.agenda}`;
  const messages: ThreadMessage[] = [
    {
      id: `m-${Date.now()}`,
      authorId: "me",
      text: message,
      ts: "now",
    },
  ];
  if (startNow) {
    messages.push(callMessage(huddle.callMode));
  }

  const thread: Thread = {
    id: huddle.threadId,
    kind: "huddle",
    title: huddle.title,
    members: ["me", ...huddle.participantIds.filter((id) => id !== activeStaffUser.value.id)],
    lastMessage: startNow
      ? huddle.callMode === "video-call"
        ? "Group video call started"
        : "Group voice call started"
      : message,
    lastTs: "now",
    unread: 0,
    messages,
  };
  createLocalThread(thread);
  return thread;
}

function saveScheduledHuddle(startNow = false) {
  const resident = huddleModalResident.value;
  if (!resident || !huddleDraft.value.title.trim() || huddleDraft.value.participantIds.length === 0) {
    return;
  }

  const stamp = Date.now();
  const huddle: ScheduledHuddle = {
    id: `sh-${stamp}`,
    residentId: resident.id,
    residentName: resident.name,
    facility: residentFacility(resident),
    eventType: "Care Huddle",
    primaryOwnerId: huddleDraft.value.participantIds[0] ?? activeStaffUser.value.id,
    taggedUserIds: huddleDraft.value.participantIds.slice(1),
    title: huddleDraft.value.title.trim(),
    scheduledDate: scheduleDateKeyFromText(huddleDraft.value.scheduledFor.trim() || "Today"),
    scheduledTime: "14:00",
    scheduledFor: huddleDraft.value.scheduledFor.trim() || "Today",
    duration: huddleDraft.value.duration.trim() || "20 min",
    participantIds: [...huddleDraft.value.participantIds],
    callMode: huddleDraft.value.callMode,
    agenda: huddleDraft.value.agenda.trim() || `Discuss ${resident.name}'s current status and next care-team actions.`,
    status: startNow ? "started" : "scheduled",
    threadId: `huddle-thread-${stamp}`,
    createdAt: currentTimeLabel(),
  };
  const thread = createScheduledHuddleThread(huddle, startNow);
  scheduledHuddles.value = [huddle, ...scheduledHuddles.value];
  closeHuddleModal();

  if (startNow) {
    setView(roleMessagesView());
    messageTab.value = "threads";
    openThread(thread);
  }
}

function saveScheduledHuddleFromScheduleDraft(startNow = false) {
  const resident = scheduleModalResident.value;
  if (!resident || !scheduleDraft.value.primaryOwnerId) {
    return;
  }

  const stamp = Date.now();
  const participantIds = scheduleParticipantIds();
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
    threadId: `huddle-thread-${stamp}`,
    createdAt: currentTimeLabel(),
  };
  const thread = createScheduledHuddleThread(huddle, startNow);
  scheduledHuddles.value = [huddle, ...scheduledHuddles.value];
  closeScheduleModal();

  if (startNow) {
    setView(roleMessagesView());
    messageTab.value = "threads";
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
  order.status = status;
  if (order.linkedThreadId) {
    appendThreadMessage(order.linkedThreadId, {
      id: `order-status-${Date.now()}`,
      authorId: "me",
      text: `${order.residentName} ${order.orderType} order marked ${status} for ${order.destination}.`,
      ts: "now",
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

  const recipients = users.filter((user) => context.recipientIds.includes(user.id));
  const body = context.body.trim() || `${residentTag(resident)} - please review.`;
  const thread: Thread = {
    id: `tagged-${Date.now()}`,
    kind: "huddle",
    title: `${resident.name} · care team`,
    members: ["me", ...recipients.map((user) => user.id)],
    lastMessage: body,
    lastTs: "now",
    unread: 0,
    messages: [
      {
        id: `m-${Date.now()}`,
        authorId: "me",
        text: body,
        ts: "now",
      },
      {
        id: `m-${Date.now()}-context`,
        authorId: "me",
        text: `Context: ${opportunity?.category ?? "Resident update"} · ${opportunity?.changes.join("; ") ?? resident.latest}`,
        ts: "now",
      },
    ],
  };
  createLocalThread(thread);
  taggedMessageContext.value = null;
  setView("provider-collaboration");
  messageTab.value = "threads";
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
  };
}

function openActionRequestModal(resident: Resident, sourceScreen: string, assignedRole: ActionTargetRole = "provider") {
  resetActionDraft(resident, sourceScreen, assignedRole);
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

function handleActionRoleChange(event: Event) {
  setActionAssignedRole((event.target as HTMLSelectElement).value as ActionTargetRole);
}

function createActionThread(action: ActionRequest) {
  const recipient = getUser(action.assignedUserId);
  const thread: Thread = {
    id: `action-thread-${Date.now()}`,
    kind: "huddle",
    title: `${action.residentName} · ${action.actionType}`,
    members: ["me", ...uniqueIds([action.assignedUserId]).filter((id) => id !== activeStaffUser.value.id)],
    lastMessage: `${residentTag(actionResident(action) ?? residents[0])} - ${action.actionType}: ${action.instructions}`,
    lastTs: "now",
    unread: selectedRole.value === action.assignedRole ? 0 : 1,
    messages: [
      {
        id: `m-${Date.now()}`,
        authorId: "me",
        text: `${action.priority} action for ${recipient?.name ?? "care team"}: @${action.residentName} - ${action.instructions}`,
        ts: "now",
      },
    ],
  };
  createLocalThread(thread);
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
    createdAt: now,
    updatedAt: now,
  };

  if (actionModalSource.value === "Messages" && selectedThread.value) {
    action.linkedThreadId = selectedThread.value.id;
    appendThreadMessage(selectedThread.value.id, {
      id: `action-${Date.now()}`,
      authorId: "me",
      text: `Action requested: @${action.residentName} - ${action.actionType} assigned to ${actionAssigneeName(action)} by ${action.dueTime}.`,
      ts: "now",
    });
  } else if (actionDraft.value.createThread) {
    action.linkedThreadId = createActionThread(action);
  }

  actionRequests.value = [action, ...actionRequests.value];
  actionModalSource.value = null;
}

function updateActionStatus(action: ActionRequest, status: ActionStatus) {
  action.status = status;
  action.updatedAt = currentTimeLabel();
  if (action.linkedThreadId) {
    appendThreadMessage(action.linkedThreadId, {
      id: `status-${Date.now()}`,
      authorId: "me",
      text: `${actionAssigneeName(action)} marked @${action.residentName} ${action.actionType} as ${status.replace("-", " ")}.`,
      ts: "now",
    });
  }
}

function setView(view: ViewName) {
  profileMenuOpen.value = false;
  escalationModalResidentId.value = null;
  huddleModalResidentId.value = null;
  scheduleModalOpen.value = false;
  editingClinicalOrderId.value = null;
  selectedScheduleDateKey.value = null;
  activeView.value = view;
  selectedResidentId.value = null;
  if (!["messages", "provider-collaboration", "cna-messages"].includes(view)) {
    selectedThreadId.value = null;
  }
}

function selectRole(role: RoleKey) {
  profileMenuOpen.value = false;
  escalationModalResidentId.value = null;
  huddleModalResidentId.value = null;
  scheduleModalOpen.value = false;
  editingClinicalOrderId.value = null;
  selectedScheduleDateKey.value = null;
  selectedRole.value = role;
  ensureLoginUserForRole(role);
  syncProfileFromLoginUser(role);
  selectedFacility.value = defaultFacilityForRole(role);
  activeView.value = roleProfiles[role].defaultView;
  selectedResidentId.value = null;
  selectedThreadId.value = null;
  messageTab.value = "threads";
  if (residentTab.value === "notes" && role !== "provider") {
    residentTab.value = "situation";
  }
}

function handleLoginRoleChange(event: Event) {
  selectRole((event.target as HTMLSelectElement).value as RoleKey);
}

function login() {
  profileMenuOpen.value = false;
  ensureLoginUserForRole(selectedRole.value);
  syncProfileFromLoginUser(selectedRole.value);
  isAuthenticated.value = true;
  selectedFacility.value = defaultFacilityForRole(selectedRole.value);
  activeView.value = activeRole.value.defaultView;
  selectedResidentId.value = null;
  selectedThreadId.value = null;
  threadMessages.value = [];
  messageTab.value = "threads";
}

function openResident(residentOrId: Resident | string) {
  profileMenuOpen.value = false;
  const resident =
    typeof residentOrId === "string"
      ? residents.find((entry) => entry.id === residentOrId)
      : residentOrId;
  if (!resident) {
    return;
  }

  selectedResidentId.value = resident.id;
  residentTab.value = "situation";
  residentChat.value = [...resident.talk];
  workingCareSteps.value = { ...resident.careSteps };
  selectedProviderNoteId.value =
    providerNotesState.value.find((note) => note.residentId === resident.id)?.id ?? null;
  providerTranscript.value = "";
  providerNoteDraft.value = "";
  assignedNurse.value = null;
  openClarify.value = null;
}

function openResidentNotes(resident: Resident) {
  openResident(resident);
  if (selectedRole.value === "provider") {
    residentTab.value = "notes";
  }
}

function closeResident() {
  selectedResidentId.value = null;
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
  selectedThreadId.value = thread.id;
  threadMessages.value = [...thread.messages];
  threadMenuOpen.value = false;
}

function callMessage(mode: Exclude<MessageStartMode, "message">, authorId = "me"): ThreadMessage {
  return {
    id: `call-${Date.now()}`,
    authorId,
    text: mode === "video-call" ? "Video call started" : "Voice call started",
    ts: "now",
    kind: mode,
  };
}

function openDirectMessage(user: CareUser, mode: MessageStartMode = "message") {
  selectedThreadId.value = `dm-${user.id}`;
  threadMessages.value =
    mode === "message"
      ? []
      : [callMessage(mode)];
  threadMenuOpen.value = false;
  selectedUserIds.value = [];
}

function closeThread() {
  selectedThreadId.value = null;
  threadMessages.value = [];
  threadDraft.value = "";
}

function sendThreadMessage() {
  const text = threadDraft.value.trim();
  if (!text) {
    return;
  }

  threadMessages.value.push({
    id: `m-${Date.now()}`,
    authorId: "me",
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
  if (selectedUserIds.value.length === 0) {
    return;
  }
  const selectedUsers = users.filter((user) => selectedUserIds.value.includes(user.id));
  const title =
    selectedUsers.length === 1
      ? selectedUsers[0].name
      : selectedUsers.length <= 3
        ? selectedUsers.map((user) => user.name.split(" ")[0]).join(", ")
        : `${selectedUsers.length} person group`;
  const thread: Thread = {
    id: `group-${Date.now()}`,
    kind: "huddle",
    title,
    members: ["me", ...selectedUsers.map((user) => user.id)],
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
              authorId: "me",
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
  if (!selectedThread.value) {
    return;
  }
  threadMessages.value.push(callMessage(mode));
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
    title:
      text.length > 58
        ? `${text.slice(0, 58).trim()}...`
        : text,
    body: text,
    source,
    createdAt: currentTimeLabel(),
    status: "note",
  };

  providerNotesState.value = [note, ...providerNotesState.value];
  selectedProviderNoteId.value = note.id;
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

function createEncounterDraft(note: ProviderNote) {
  if (!note.encounterDraft) {
    note.encounterDraft = {
      id: `enc-${Date.now()}`,
      residentId: note.residentId,
      visitType: note.title.toLowerCase().includes("uti") ? "Acute" : "Follow-Up",
      body: note.body,
      instructions: "Review note, confirm orders or follow-up instructions, then send to Otangeles Notes+.",
      destination: "Otangeles Notes+",
      status: "draft",
    };
  }
  note.status = "draft-created";
  selectedProviderNoteId.value = note.id;
  noteActionMenuOpen.value = null;
}

function markEncounterReady(note: ProviderNote) {
  if (!note.encounterDraft) {
    createEncounterDraft(note);
  }
  if (note.encounterDraft) {
    note.encounterDraft.status = "ready";
  }
  note.status = "ready-for-ehr";
}

function toggleNoteActions(noteId: string) {
  noteActionMenuOpen.value = noteActionMenuOpen.value === noteId ? null : noteId;
}

function deleteProviderNote(noteId: string) {
  providerNotesState.value = providerNotesState.value.filter((note) => note.id !== noteId);
  if (selectedProviderNoteId.value === noteId) {
    selectedProviderNoteId.value = selectedResidentNotes.value[0]?.id ?? null;
  }
  noteActionMenuOpen.value = null;
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
    normalized.includes("escalated") ||
    normalized.includes("correction") ||
    normalized.includes("flagged") ||
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
    normalized.includes("sent")
  ) {
    return "success";
  }
  return "neutral";
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

function careUserIcon(user?: CareUser | null) {
  void user;
  return UserIcon;
}

function threadIcon(thread: Thread) {
  if (thread.kind === "huddle") {
    return Users;
  }
  const otherMember = thread.members.find((member) => member !== "me");
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
  return authorId === "me" ? appUser.value.name : getUser(authorId)?.name ?? "Care team";
}

function signOut() {
  profileMenuOpen.value = false;
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
  profileMenuOpen.value = false;
  profileModal.value = null;
  taggedMessageContext.value = null;
  actionModalSource.value = null;
  escalationModalResidentId.value = null;
  huddleModalResidentId.value = null;
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
          <select
            :value="selectedRole"
            aria-label="Select workspace role"
            @change="handleLoginRoleChange"
          >
            <option
              v-for="role in roleProfiles"
              :key="role.key"
              :value="role.key"
            >
              {{ role.label }}
            </option>
          </select>
        </label>

        <label class="login-field">
          <span>Staff identity</span>
          <select
            v-model="selectedLoginUserIdModel"
            aria-label="Select staff identity"
          >
            <option
              v-for="user in loginStaffOptions"
              :key="user.id"
              :value="user.id"
            >
              {{ user.name }} · {{ user.role }}
            </option>
          </select>
        </label>

        <div class="login-user">
          <span class="staff-avatar" aria-hidden="true">
            <UserIcon :size="18" />
          </span>
          <span>
            <strong>{{ activeStaffUser.name }}</strong>
            <small>{{ activeStaffUser.role }}</small>
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
        <component :is="item.icon" :size="18" />
        <span>{{ item.label }}</span>
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
        <label class="facility-select">
          <Globe :size="16" />
          <select v-model="selectedFacilityModel" aria-label="Switch facility">
            <option
              v-for="facility in facilityOptions"
              :key="facility"
              :value="facility"
            >
              {{ facilityOptionLabel(facility) }}
            </option>
          </select>
        </label>

        <div class="profile-menu-wrap">
          <button
            class="profile-menu-trigger"
            type="button"
            aria-label="Open profile menu"
            :aria-expanded="profileMenuOpen"
            @click="profileMenuOpen = !profileMenuOpen"
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
                <strong>{{ activeProfile.fullName }}</strong>
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

      <section v-if="selectedResident && workingCareSteps" class="screen detail-screen">
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
          <div class="detail-header-actions">
            <button
              class="danger-action compact-action"
              type="button"
              @click="openEscalationModal(selectedResident)"
            >
              <AlertTriangle :size="16" />
              {{ canDirectlyEscalate() ? "Escalate" : "Request Escalation" }}
            </button>
            <button
              class="soft-action compact-action"
              type="button"
              @click="openOrderAction(selectedResident)"
            >
              <FileText :size="16" />
              {{ selectedRole === "provider" ? "New Order" : "Request Order Review" }}
            </button>
            <button
              class="huddle-button compact-action"
              type="button"
              @click="openHuddleModal(selectedResident)"
            >
              <Users :size="16" />
              Schedule Huddle
            </button>
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
          <article class="panel care-panel">
            <div class="section-label">Care Status</div>
            <div class="stepper">
              <template v-for="(step, index) in careStepItems(workingCareSteps)" :key="step.label">
                <div class="step">
                  <span class="step-dot" :class="step.state">
                    <Check v-if="step.state === 'done'" :size="15" />
                    <span v-else-if="step.state === 'active'" class="active-dot" />
                    <span v-else>{{ index + 1 }}</span>
                  </span>
                  <span>{{ step.label }}</span>
                </div>
                <span
                  v-if="index < careStepItems(workingCareSteps).length - 1"
                  class="step-line"
                />
              </template>
            </div>

            <div v-if="assignedNurse" class="assignment-note">
              <UserCheck :size="18" />
              <div>
                <strong>{{ assignedNurse.name }}</strong>
                <span>Assigned at {{ assignedNurse.time }}</span>
              </div>
            </div>
          </article>

          <article class="panel summary-panel">
            <div class="section-label">Summary</div>
            <p class="body-copy">{{ selectedResident.situation.summary }}</p>
            <div class="note-band">
              <Info :size="16" />
              <div>
                <strong>Memory</strong>
                <p>{{ selectedResident.situation.memory }}</p>
              </div>
            </div>
          </article>

          <article v-if="selectedResidentActions.length" class="panel action-panel">
            <div class="notes-panel-header">
              <div>
                <div class="section-label">Shared Actions</div>
                <h2>Role follow-up</h2>
              </div>
              <span class="chip compact">{{ selectedResidentActions.length }} active</span>
            </div>
            <div class="action-list">
              <div v-for="action in selectedResidentActions" :key="action.id" class="action-row">
                <span>
                  <strong>{{ action.actionType }}</strong>
                  <small>{{ actionAssigneeName(action) }} · {{ action.dueTime }} · {{ action.instructions }}</small>
                </span>
                <span class="chip compact" :class="statusTone(action.status)">
                  {{ action.status.replace("-", " ") }}
                </span>
                <div
                  v-if="(selectedRole === 'provider' && action.assignedRole === 'provider') || (selectedRole === 'cna' && action.assignedRole === 'cna')"
                  class="action-row-controls"
                >
                  <button class="soft-action compact-action" type="button" @click="updateActionStatus(action, 'completed')">
                    <Check :size="14" />
                    Done
                  </button>
                  <button class="soft-action compact-action" type="button" @click="updateActionStatus(action, 'flagged')">
                    <AlertTriangle :size="14" />
                    Flag
                  </button>
                </div>
              </div>
            </div>
          </article>

          <article class="panel action-panel orders-followups-panel">
            <div class="notes-panel-header">
              <div>
                <div class="section-label">Orders & Follow-ups</div>
                <h2>Scheduled clinical work</h2>
              </div>
              <button class="soft-action compact-action" type="button" @click="openOrderAction(selectedResident)">
                <FileText :size="14" />
                {{ selectedRole === "provider" ? "New Order" : "Request Review" }}
              </button>
            </div>
            <div v-if="selectedResidentScheduleItems.length" class="schedule-list compact-schedule-list">
              <div
                v-for="item in selectedResidentScheduleItems.slice(0, 6)"
                :key="`${item.kind}-${item.id}`"
                class="schedule-row compact-schedule-row"
              >
                <button class="schedule-row-main" type="button" @click="openScheduleItem(item)">
                  <span class="schedule-icon" :class="item.kind">
                    <Users v-if="item.kind === 'huddle'" :size="17" />
                    <AlertTriangle v-else-if="item.kind === 'escalation'" :size="17" />
                    <FileText v-else-if="item.kind === 'order'" :size="17" />
                    <Clock v-else-if="item.kind === 'follow-up'" :size="17" />
                    <CheckCircle v-else :size="17" />
                  </span>
                  <span>
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.time }} · {{ item.detail }}</small>
                  </span>
                  <span class="chip compact" :class="statusTone(item.tone)">
                    {{ item.kind }}
                  </span>
                </button>
                <button
                  v-if="item.threadId"
                  class="soft-icon"
                  type="button"
                  aria-label="Open linked thread"
                  @click="openScheduleThread(item.threadId)"
                >
                  <MessageCircle :size="15" />
                </button>
              </div>
            </div>
            <p v-else class="empty-copy">
              No orders, huddles, or follow-ups scheduled for this resident yet.
            </p>
            <div v-if="selectedRole === 'provider' && selectedResidentClinicalOrders.length" class="order-draft-list">
              <div v-for="order in selectedResidentClinicalOrders" :key="order.id" class="order-draft-row">
                <span>
                  <strong>{{ order.orderType }} · {{ order.status }}</strong>
                  <small>{{ formatDateTimeLabel(order.requestedDate, order.requestedTime) }} · {{ order.indication }}</small>
                </span>
                <div class="action-row-controls">
                  <button class="soft-action compact-action" type="button" @click="openClinicalOrderDraft(order)">
                    Edit
                  </button>
                  <button
                    class="soft-action compact-action"
                    type="button"
                    :disabled="order.status === 'ready' || order.status === 'sent'"
                    @click="updateClinicalOrderStatus(order, 'ready')"
                  >
                    Mark Ready
                  </button>
                  <button
                    class="primary-action compact-action"
                    type="button"
                    :disabled="order.status === 'sent'"
                    @click="updateClinicalOrderStatus(order, 'sent')"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </article>

          <article v-if="selectedResident.situation.concerns.length" class="panel">
            <div class="section-label">Unresolved Concerns</div>
            <div class="stack">
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
            <div class="section-label">Vitals · Trajectory vs Baseline</div>
            <div class="vital-list">
              <div
                v-for="vital in selectedResident.situation.vitals"
                :key="vital.label"
                class="vital-row"
              >
                <component :is="iconFor(vital.icon)" :size="18" />
                <span>{{ vital.label }}</span>
                <small>Base {{ vital.base }}</small>
                <strong :class="{ abnormal: vital.isAbnormal, critical: vital.isCritical }">
                  {{ vital.current }}
                </strong>
              </div>
            </div>
          </article>

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
          <div class="notes-layout">
            <section class="panel notes-list-panel">
              <div class="notes-panel-header">
                <div>
                  <div class="section-label">Provider Notes</div>
                  <h2>{{ selectedResident.name }}</h2>
                </div>
                <span class="chip compact">{{ selectedResidentNotes.length }} notes</span>
              </div>

              <div class="recording-station" :class="{ active: providerRecordingActive }">
                <div class="recording-copy">
                  <strong>{{ providerRecordingActive ? "Recording provider note" : "Voice note capture" }}</strong>
                  <span>
                    {{ providerRecordingActive ? "Live transcription in progress" : "Tap the center button to capture a provider observation" }}
                  </span>
                </div>
                <button
                  type="button"
                  class="record-core"
                  :class="{ active: providerRecordingActive }"
                  :aria-label="providerRecordingActive ? 'Stop recording' : 'Start provider note recording'"
                  @click="providerRecordingActive ? stopProviderRecording() : startProviderRecording()"
                >
                  <span class="radio-waves" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <X v-if="providerRecordingActive" :size="30" />
                  <Mic v-else :size="32" />
                </button>
                <b class="recording-badge" :class="{ active: providerRecordingActive }">
                  {{ providerRecordingActive ? `REC ${providerRecordingSeconds}s` : "Ready" }}
                </b>
                <div v-if="providerRecordingActive || providerTranscript" class="transcript-preview">
                  <div class="section-label">
                    {{ providerRecordingActive ? "Live Transcript" : "Generated Transcript" }}
                  </div>
                  <p>
                    {{ providerRecordingActive ? "Listening for the provider note..." : providerTranscript }}
                  </p>
                </div>
              </div>

              <div class="note-card-list">
                <article
                  v-for="note in selectedResidentNotes"
                  :key="note.id"
                  class="note-card"
                  :class="{ selected: selectedProviderNote?.id === note.id }"
                >
                  <button class="note-card-main" type="button" @click="selectedProviderNoteId = note.id">
                    <span>
                      <strong>{{ note.title }}</strong>
                      <small>{{ providerNoteSourceLabel(note.source) }} · {{ note.createdAt }}</small>
                      <span v-if="note.source === 'voice'" class="recorded-pill">
                        <Mic :size="12" />
                        Recorded note
                      </span>
                    </span>
                    <span class="chip compact" :class="statusTone(note.status)">
                      {{ note.status.replaceAll("-", " ") }}
                    </span>
                  </button>
                  <button
                    class="note-menu-button"
                    type="button"
                    :aria-label="`Open actions for ${note.title}`"
                    @click.stop="toggleNoteActions(note.id)"
                  >
                    <ChevronDown :size="16" />
                  </button>
                  <div v-if="noteActionMenuOpen === note.id" class="note-actions-menu">
                    <button type="button" @click="createEncounterDraft(note)">
                      <FileText :size="15" />
                      {{ note.encounterDraft ? "Open encounter draft" : "Convert to encounter" }}
                    </button>
                    <button type="button" class="danger-text" @click="deleteProviderNote(note.id)">
                      <X :size="15" />
                      Delete note
                    </button>
                  </div>
                </article>
                <p v-if="selectedResidentNotes.length === 0" class="empty-copy">
                  No provider notes yet for this resident.
                </p>
              </div>
            </section>

            <section v-if="selectedProviderNote" class="panel note-detail-panel">
              <div class="notes-panel-header">
                <div>
                  <div class="section-label">Note Detail</div>
                  <h2>{{ selectedProviderNote.title }}</h2>
                  <p>{{ providerNoteSourceLabel(selectedProviderNote.source) }} · {{ selectedProviderNote.createdAt }}</p>
                </div>
                <span class="chip compact" :class="statusTone(selectedProviderNote.status)">
                  {{ selectedProviderNote.status.replaceAll("-", " ") }}
                </span>
              </div>
              <p class="body-copy">{{ selectedProviderNote.body }}</p>

              <button
                v-if="!selectedProviderNote.encounterDraft"
                class="primary-action"
                type="button"
                @click="createEncounterDraft(selectedProviderNote)"
              >
                <FileText :size="16" />
                Create Encounter Draft
              </button>

              <div v-if="selectedProviderNote.encounterDraft" class="encounter-draft">
                <div class="section-label">Otangeles Notes+ Visit Draft</div>
                <label>
                  Resident
                  <input v-model="selectedProviderNote.residentName" type="text" />
                </label>
                <label>
                  Visit Type
                  <select v-model="selectedProviderNote.encounterDraft.visitType">
                    <option v-for="visitType in visitTypes" :key="visitType" :value="visitType">
                      {{ visitType }}
                    </option>
                  </select>
                </label>
                <label>
                  Note Body
                  <textarea v-model="selectedProviderNote.encounterDraft.body" rows="5" />
                </label>
                <label>
                  Instructions
                  <textarea v-model="selectedProviderNote.encounterDraft.instructions" rows="3" />
                </label>
                <div class="encounter-actions">
                  <span>{{ selectedProviderNote.encounterDraft.destination }}</span>
                  <button
                    class="primary-action compact-action"
                    type="button"
                    @click="markEncounterReady(selectedProviderNote)"
                  >
                    <Check :size="15" />
                    Mark Ready
                  </button>
                </div>
              </div>
            </section>
          </div>

          <form class="composer" @submit.prevent="saveTypedProviderNote">
            <input v-model="providerNoteDraft" type="text" placeholder="Type provider note for this resident..." />
            <button
              type="button"
              class="icon-button"
              :aria-label="providerRecordingActive ? 'Stop recording' : 'Record provider note'"
              @click="providerRecordingActive ? stopProviderRecording() : startProviderRecording()"
            >
              <X v-if="providerRecordingActive" :size="17" />
              <Mic v-else :size="17" />
            </button>
            <button class="send-button" type="submit" aria-label="Save provider note">
              <Send :size="17" />
            </button>
          </form>
        </div>

        <div v-else class="timeline-list content-frame">
          <div class="section-label">Last 24 Hours</div>
          <article
            v-for="event in selectedResident.timeline"
            :key="event.id"
            class="timeline-item"
          >
            <span class="timeline-icon">
              <component :is="iconFor(event.icon)" :size="17" />
            </span>
            <div>
              <div class="eyebrow">{{ event.timeAgo }} · {{ event.period }}</div>
              <div class="panel timeline-card">
                <p>{{ event.text }}</p>
                <div v-if="event.interpretation" class="sage-note">
                  <strong>Sage:</strong>
                  <span>{{ event.interpretation }}</span>
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

        <div v-if="openActionRequests.length" class="action-command-strip content-frame">
          <article class="panel action-panel">
            <div class="notes-panel-header">
              <div>
                <div class="section-label">Immediate Actions</div>
                <h2>DON coordination queue</h2>
              </div>
              <span class="chip compact warning">{{ openActionRequests.length }} open</span>
            </div>
            <div class="action-list compact">
              <div v-for="action in openActionRequests.slice(0, 4)" :key="action.id" class="action-row">
                <span>
                  <strong>{{ action.residentName }} · {{ action.actionType }}</strong>
                  <small>{{ actionAssigneeName(action) }} · {{ action.priority }} · {{ action.dueTime }}</small>
                </span>
                <span class="chip compact" :class="statusTone(action.status)">
                  {{ action.status.replace("-", " ") }}
                </span>
              </div>
            </div>
          </article>
        </div>

        <div class="situation-layout">
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
                <div class="mini-vitals">
                  <span
                    v-for="vital in resident.situation.vitals.slice(0, 3)"
                    :key="vital.label"
                    :class="{ abnormal: vital.isAbnormal }"
                  >
                    {{ vital.label }} {{ vital.current }}
                  </span>
                </div>
                <button type="button" class="soft-action" @click="openResident(resident)">
                  Open full chart
                  <ArrowRight :size="15" />
                </button>
                <button type="button" class="soft-action" @click="openActionRequestModal(resident, 'DON Situation', 'provider')">
                  Assign action
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
            <div class="mini-vitals">
              <span
                v-for="vital in activeSituationResident.situation.vitals.slice(0, 4)"
                :key="vital.label"
                :class="{ abnormal: vital.isAbnormal }"
              >
                {{ vital.label }} {{ vital.current }}
              </span>
            </div>
            <div v-if="activeSituationResident.situation.concerns.length" class="situation-concern-list">
              <div class="section-label">Unresolved Concerns</div>
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
              <button type="button" class="soft-action" @click="openResident(activeSituationResident)">
                Open full chart
                <ArrowRight :size="15" />
              </button>
              <button type="button" class="primary-action compact-action" @click="openResident(activeSituationResident)">
                Review chart
              </button>
              <button
                type="button"
                class="soft-icon"
                aria-label="Assign immediate action"
                @click="openActionRequestModal(activeSituationResident, 'DON Situation', 'provider')"
              >
                <Send :size="16" />
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section v-else-if="activeView === 'residents'" class="screen">
        <header class="screen-header">
          <div>
            <h1>Residents</h1>
            <p>{{ searchedResidents.length }} of {{ filteredResidents.length }} residents · Day shift</p>
          </div>
          <button
            class="icon-button search-button"
            type="button"
            aria-label="Search residents"
            @click="residentSearchOpen = !residentSearchOpen"
          >
            <Search :size="18" />
          </button>
        </header>

        <div v-if="residentSearchOpen" class="search-panel content-frame">
          <Search :size="17" />
          <input
            v-model="residentSearchQuery"
            type="search"
            placeholder="Search by resident, room, facility, status, or summary"
          />
          <button
            v-if="residentSearchQuery"
            class="soft-icon"
            type="button"
            aria-label="Clear resident search"
            @click="residentSearchQuery = ''"
          >
            <X :size="16" />
          </button>
        </div>

        <section class="schedule-strip content-frame">
          <article class="panel schedule-panel">
            <div class="notes-panel-header">
              <div>
                <div class="section-label">Residents Schedule</div>
                <h2>Calendar & clinical work</h2>
              </div>
              <div class="schedule-panel-controls">
                <span class="chip compact">{{ visibleScheduleItems.length }} items</span>
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
            <div v-if="visibleScheduleItems.length && scheduleView === 'list'" class="schedule-list">
              <div v-for="item in visibleScheduleItems.slice(0, 6)" :key="`${item.kind}-${item.id}`" class="schedule-row">
                <button class="schedule-row-main" type="button" @click="openScheduleItem(item)">
                  <span class="schedule-icon" :class="item.kind">
                    <Users v-if="item.kind === 'huddle'" :size="17" />
                    <AlertTriangle v-else-if="item.kind === 'escalation'" :size="17" />
                    <FileText v-else-if="item.kind === 'order'" :size="17" />
                    <Clock v-else-if="item.kind === 'follow-up'" :size="17" />
                    <CheckCircle v-else :size="17" />
                  </span>
                  <span>
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.detail }}</small>
                  </span>
                  <span class="schedule-time">
                    {{ item.time }}
                  </span>
                  <span class="chip compact" :class="statusTone(item.tone)">
                    {{ item.kind }}
                  </span>
                </button>
                <button
                  v-if="item.threadId"
                  class="soft-action compact-action"
                  type="button"
                  @click="openScheduleThread(item.threadId)"
                >
                  <MessageCircle :size="14" />
                  Thread
                </button>
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
                      +{{ cell.items.length - 2 }} more
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

      <section v-else-if="activeView === 'ai'" class="screen ai-screen">
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
            <strong>{{ filteredProviderOpportunities.length }}</strong>
            <span>ready to review</span>
          </div>
        </header>

        <div class="role-workspace">
          <div class="role-main">
            <article class="panel morning-brief">
              <div class="section-label">Morning Brief</div>
              <div class="brief-grid">
                <span><strong>{{ filteredProviderOpportunities.length }}</strong> attention opportunities</span>
                <span><strong>{{ providerActionRequests.filter((action) => action.status !== 'completed').length }}</strong> assigned actions</span>
                <span><strong>7</strong> monthly visits due</span>
                <span><strong>4</strong> open nurse requests</span>
              </div>
            </article>

            <article v-if="providerActionRequests.length" class="panel action-panel">
              <div class="notes-panel-header">
                <div>
                  <div class="section-label">Assigned Actions</div>
                  <h2>Provider follow-up</h2>
                </div>
                <span class="chip compact warning">{{ providerActionRequests.filter((action) => action.status !== 'completed').length }} open</span>
              </div>
              <div class="action-list">
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
                    <button class="soft-action compact-action" type="button" @click="updateActionStatus(action, 'completed')">
                      <Check :size="14" />
                      Done
                    </button>
                    <button class="soft-action compact-action" type="button" @click="updateActionStatus(action, 'flagged')">
                      <AlertTriangle :size="14" />
                      Flag
                    </button>
                  </div>
                </div>
              </div>
            </article>

            <div class="section-heading">
              <div>
                <h2>Clinical Attention Queue</h2>
                <p>Sage identifies. Provider decides.</p>
              </div>
            </div>

            <div class="attention-list">
              <article
                v-for="opportunity in filteredProviderOpportunities"
                :key="opportunity.id"
                class="panel attention-card"
              >
                <div class="attention-head">
                  <img class="avatar" :src="opportunity.resident.image" :alt="opportunity.resident.name" />
                  <div>
                    <strong>{{ opportunity.resident.name }}</strong>
                    <small>{{ opportunity.facility }} · Room {{ opportunity.resident.room }}</small>
                  </div>
                  <span class="chip compact" :class="statusTone(opportunity.urgency)">
                    {{ opportunity.category }}
                  </span>
                </div>
                <p>{{ opportunity.reason }}</p>
                <ul class="clean-list">
                  <li v-for="change in opportunity.changes" :key="change">{{ change }}</li>
                </ul>
                <div class="card-actions">
                  <button class="soft-action" type="button" @click="openResident(opportunity.resident)">
                    Review resident
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
              </article>
            </div>
          </div>

          <aside class="role-side">
            <article class="panel">
              <div class="section-label">Recent Resident Notes</div>
              <div class="note-stack">
                <p v-for="note in filteredProviderNotes.slice(0, 3)" :key="note.id">
                  <strong>{{ note.residentName }}:</strong> {{ note.title }}
                </p>
              </div>
              <button
                v-if="filteredProviderOpportunities[0]"
                class="primary-action compact-action"
                type="button"
                @click="openResidentNotes(filteredProviderOpportunities[0].resident)"
              >
                <FileText :size="16" />
                Open resident notes
              </button>
              <p v-else class="empty-copy">No provider notes in this facility yet.</p>
            </article>

            <article class="panel">
              <div class="section-label">Documentation Review</div>
              <div class="doc-list">
                <div v-for="doc in providerDocumentation" :key="doc.id" class="doc-row">
                  <span>
                    <strong>{{ doc.title }}</strong>
                    <small>{{ doc.due }}</small>
                  </span>
                  <span class="chip compact" :class="statusTone(doc.status)">{{ doc.status }}</span>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </section>

      <section v-else-if="activeView === 'provider-residents'" class="screen role-screen">
        <header class="screen-header">
          <div>
            <h1>Provider Residents</h1>
            <p>{{ searchedProviderResidents.length }} of {{ filteredResidents.length }} residents across assigned facilities</p>
          </div>
          <button
            class="icon-button search-button"
            type="button"
            aria-label="Search residents"
            @click="providerResidentSearchOpen = !providerResidentSearchOpen"
          >
            <Search :size="18" />
          </button>
        </header>

        <div v-if="providerResidentSearchOpen" class="search-panel content-frame">
          <Search :size="17" />
          <input
            v-model="providerResidentSearchQuery"
            type="search"
            placeholder="Search by resident, room, facility, condition, or summary"
          />
          <button
            v-if="providerResidentSearchQuery"
            class="soft-icon"
            type="button"
            aria-label="Clear provider resident search"
            @click="providerResidentSearchQuery = ''"
          >
            <X :size="16" />
          </button>
        </div>

        <section class="schedule-strip content-frame">
          <article class="panel schedule-panel">
            <div class="notes-panel-header">
              <div>
                <div class="section-label">Residents Schedule</div>
                <h2>Calendar & clinical work</h2>
              </div>
              <div class="schedule-panel-controls">
                <span class="chip compact">{{ visibleScheduleItems.length }} items</span>
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
            <div v-if="visibleScheduleItems.length && scheduleView === 'list'" class="schedule-list">
              <div v-for="item in visibleScheduleItems.slice(0, 6)" :key="`${item.kind}-${item.id}`" class="schedule-row">
                <button class="schedule-row-main" type="button" @click="openScheduleItem(item)">
                  <span class="schedule-icon" :class="item.kind">
                    <Users v-if="item.kind === 'huddle'" :size="17" />
                    <AlertTriangle v-else-if="item.kind === 'escalation'" :size="17" />
                    <FileText v-else-if="item.kind === 'order'" :size="17" />
                    <Clock v-else-if="item.kind === 'follow-up'" :size="17" />
                    <CheckCircle v-else :size="17" />
                  </span>
                  <span>
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.detail }}</small>
                  </span>
                  <span class="schedule-time">
                    {{ item.time }}
                  </span>
                  <span class="chip compact" :class="statusTone(item.tone)">
                    {{ item.kind }}
                  </span>
                </button>
                <button
                  v-if="item.threadId"
                  class="soft-action compact-action"
                  type="button"
                  @click="openScheduleThread(item.threadId)"
                >
                  <MessageCircle :size="14" />
                  Thread
                </button>
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
                      +{{ cell.items.length - 2 }} more
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
                  <small v-else>
                    Room {{ resident.room }} · {{ resident.latest }}
                  </small>
                </span>
                <span
                  class="chip compact"
                  :class="statusTone(providerOpportunityByResidentId.get(resident.id)?.urgency ?? resident.acuity)"
                >
                  {{ providerOpportunityByResidentId.get(resident.id)?.surfaced ?? resident.acuity }}
                </span>
              </button>
            </div>
          </section>
        </div>
      </section>

      <section v-else-if="activeView === 'provider-sage'" class="screen ai-screen role-screen">
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
              Sage surfaced <strong>23 attention opportunities</strong>. Mary Lou Smith is the
              highest priority because her change is acute and nursing actions are still pending.
            </p>
            <div class="attention-band">
              <strong>Suggested next action</strong>
              <span>Review Mary Lou, confirm UA/culture status, and capture provider instructions for Otangeles Notes+.</span>
            </div>
          </article>

          <article class="bubble structured sage">
            <p>Provider-ready summary for Mary Lou Smith:</p>
            <ul>
              <li>New confusion and restlessness over 14 hours.</li>
              <li>Temp 100.4, HR 104, BP softer than baseline.</li>
              <li>CNA reported urine odor overnight; UA not collected yet.</li>
            </ul>
            <footer>Observation can be routed to Otangeles Notes+ after review.</footer>
          </article>
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
            <article class="panel morning-brief">
              <div class="section-label">Shift Status</div>
              <div class="brief-grid">
                <span><strong>Started</strong> 7:00 AM</span>
                <span><strong>{{ filteredCnaAssignments.length }}</strong> assigned residents</span>
                <span><strong>{{ cnaActionRequests.filter((action) => action.status !== 'completed').length }}</strong> open actions</span>
                <span><strong>{{ capturedDebriefCount }}</strong> debriefs captured</span>
              </div>
            </article>

            <article v-if="cnaActionRequests.length" class="panel action-panel">
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
                    <button class="soft-action compact-action" type="button" @click="updateActionStatus(action, 'completed')">
                      <Check :size="14" />
                      Done
                    </button>
                    <button class="soft-action compact-action" type="button" @click="updateActionStatus(action, 'flagged')">
                      <AlertTriangle :size="14" />
                      Flag
                    </button>
                  </div>
                </div>
              </div>
            </article>

            <div class="resident-grid">
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
            <article class="panel">
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
                    <button class="soft-action compact-action" type="button" @click="updateActionStatus(action, 'completed')">
                      Done
                    </button>
                    <button class="soft-action compact-action" type="button" @click="updateActionStatus(action, 'flagged')">
                      Flag
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
        <header class="screen-header">
          <div>
            <h1>Residents</h1>
            <p>{{ searchedCnaAssignments.length }} of {{ filteredCnaAssignments.length }} assigned residents</p>
          </div>
          <button
            class="icon-button search-button"
            type="button"
            aria-label="Search assigned residents"
            @click="cnaResidentSearchOpen = !cnaResidentSearchOpen"
          >
            <Search :size="18" />
          </button>
        </header>

        <div v-if="cnaResidentSearchOpen" class="search-panel content-frame">
          <Search :size="17" />
          <input
            v-model="cnaResidentSearchQuery"
            type="search"
            placeholder="Search residents, room, reminder, care, or watch item"
          />
          <button
            v-if="cnaResidentSearchQuery"
            class="soft-icon"
            type="button"
            aria-label="Clear CNA resident search"
            @click="cnaResidentSearchQuery = ''"
          >
            <X :size="16" />
          </button>
        </div>

        <section class="schedule-strip content-frame">
          <article class="panel schedule-panel">
            <div class="notes-panel-header">
              <div>
                <div class="section-label">Residents Schedule</div>
                <h2>Calendar & clinical work</h2>
              </div>
              <div class="schedule-panel-controls">
                <span class="chip compact">{{ visibleScheduleItems.length }} items</span>
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
            <div v-if="visibleScheduleItems.length && scheduleView === 'list'" class="schedule-list">
              <div v-for="item in visibleScheduleItems.slice(0, 6)" :key="`${item.kind}-${item.id}`" class="schedule-row">
                <button class="schedule-row-main" type="button" @click="openScheduleItem(item)">
                  <span class="schedule-icon" :class="item.kind">
                    <Users v-if="item.kind === 'huddle'" :size="17" />
                    <AlertTriangle v-else-if="item.kind === 'escalation'" :size="17" />
                    <FileText v-else-if="item.kind === 'order'" :size="17" />
                    <Clock v-else-if="item.kind === 'follow-up'" :size="17" />
                    <CheckCircle v-else :size="17" />
                  </span>
                  <span>
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.detail }}</small>
                  </span>
                  <span class="schedule-time">
                    {{ item.time }}
                  </span>
                  <span class="chip compact" :class="statusTone(item.tone)">
                    {{ item.kind }}
                  </span>
                </button>
                <button
                  v-if="item.threadId"
                  class="soft-action compact-action"
                  type="button"
                  @click="openScheduleThread(item.threadId)"
                >
                  <MessageCircle :size="14" />
                  Thread
                </button>
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
                      +{{ cell.items.length - 2 }} more
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
              <span><strong>Recent change</strong>{{ assignment.resident.situation.summary }}</span>
            </div>
          </article>
        </div>
      </section>

      <section v-else-if="isMessagesView" class="screen messages-screen">
        <template v-if="selectedThread">
          <header class="screen-header thread-header">
            <button class="icon-button" type="button" aria-label="Back to messages" @click="closeThread">
              <ArrowLeft :size="19" />
            </button>
            <div v-if="selectedThread.kind === 'huddle'" class="huddle-avatar">
              <Users :size="17" />
            </div>
            <div v-else class="staff-avatar" aria-hidden="true">
              <component :is="threadIcon(selectedThread)" :size="18" />
            </div>
            <div class="title-stack">
              <h1>{{ selectedThread.title }}</h1>
              <p>
                {{ selectedThread.kind === "huddle" ? `Huddle · ${selectedThread.members.length} members` : "Direct message" }}
              </p>
            </div>
            <button class="icon-button" type="button" aria-label="Call" @click="startThreadCall('voice-call')">
              <Phone :size="18" />
            </button>
            <button class="icon-button" type="button" aria-label="Video" @click="startThreadCall('video-call')">
              <Video :size="18" />
            </button>
            <button
              class="icon-button"
              type="button"
              aria-label="Thread menu"
              @click="threadMenuOpen = !threadMenuOpen"
            >
              <MoreVertical :size="18" />
            </button>
          </header>

          <div v-if="threadMenuOpen" class="thread-menu panel">
            <button type="button"><FileText :size="16" /> View summary</button>
            <button type="button"><Mic :size="16" /> View transcription</button>
            <button type="button"><Zap :size="16" /> View insight</button>
            <button v-if="selectedRole === 'don'" type="button" @click="openActionRequestFromThread">
              <Send :size="16" />
              Assign action
            </button>
          </div>

          <div class="message-stream thread-stream">
            <div
              v-for="message in threadMessages"
              :key="message.id"
              class="thread-message"
              :class="{ me: message.authorId === 'me', event: message.kind === 'voice-call' || message.kind === 'video-call' }"
            >
              <template v-if="message.kind === 'voice-call' || message.kind === 'video-call'">
                <span class="call-chip">
                  <Video v-if="message.kind === 'video-call'" :size="14" />
                  <Phone v-else :size="14" />
                  {{ message.kind === 'video-call' ? 'Video call' : 'Voice call' }}
                  <small v-if="message.duration">· {{ message.duration }}</small>
                </span>
              </template>
              <template v-else>
                <small v-if="selectedThread.kind === 'huddle' && message.authorId !== 'me'">
                  {{ authorName(message.authorId) }}
                </small>
                <div class="bubble" :class="message.authorId === 'me' ? 'me' : 'sage'">
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
          <header class="screen-header">
            <div>
              <h1>{{ messageHeader.title }}</h1>
              <p>{{ messageHeader.subtitle }}</p>
            </div>
          </header>

          <div class="message-tabs-band">
            <div class="segmented-tabs message-tabs content-frame">
              <button
                type="button"
                :class="{ active: messageTab === 'threads' }"
                @click="messageTab = 'threads'"
              >
                Threads
              </button>
              <button
                type="button"
                :class="{ active: messageTab === 'new' }"
                @click="messageTab = 'new'; selectedUserIds = []"
              >
                New
              </button>
            </div>
          </div>

          <div v-if="messageTab === 'threads'" class="thread-list">
            <button
              v-for="thread in visibleThreads"
              :key="thread.id"
              type="button"
              class="thread-row"
              @click="openThread(thread)"
            >
              <div v-if="thread.kind === 'huddle'" class="huddle-avatar">
                <Users :size="17" />
              </div>
              <div v-else class="staff-avatar" aria-hidden="true">
                <component :is="threadIcon(thread)" :size="18" />
              </div>
              <span>
                <strong>{{ thread.title }}</strong>
                <small>{{ thread.lastMessage }}</small>
              </span>
              <time>{{ thread.lastTs }}</time>
              <b v-if="thread.unread">{{ thread.unread }}</b>
            </button>
          </div>

          <div v-else class="thread-list">
            <div class="list-helper">
              {{ selectedUserIds.length ? `${selectedUserIds.length} selected` : 'Start a new conversation' }}
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
              v-for="user in sortedUsers"
              :key="user.id"
              class="thread-row user-row"
              :class="{ selected: selectedUserIds.includes(user.id) }"
              role="button"
              tabindex="0"
              @click="toggleUserSelection(user.id)"
              @keydown.enter.prevent="toggleUserSelection(user.id)"
              @keydown.space.prevent="toggleUserSelection(user.id)"
            >
              <span class="avatar-wrap">
                <span class="staff-avatar" aria-hidden="true">
                  <component :is="careUserIcon(user)" :size="18" />
                </span>
                <span class="presence" :class="user.presence" />
              </span>
              <span>
                <strong>{{ user.name }}</strong>
                <small>{{ user.role }} · {{ presenceText(user) }}</small>
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
                <h2>{{ activeProfile.fullName }}</h2>
                <p>Identity is managed by the organization. Contact and specialty fields can be edited here.</p>
              </div>
            </div>
            <div class="modal-form settings-form">
              <label>
                Full Name
                <input v-model="activeProfile.fullName" type="text" readonly />
              </label>
              <label>
                Email Address
                <input v-model="activeProfile.email" type="email" readonly />
              </label>
              <label>
                Phone Number
                <input v-model="activeProfile.phone" type="tel" />
              </label>
              <label>
                System Role
                <input v-model="activeProfile.systemRole" type="text" readonly />
              </label>
              <label>
                Department
                <input v-model="activeProfile.department" type="text" />
              </label>
              <label>
                Specialization
                <input v-model="activeProfile.specialization" type="text" />
              </label>
            </div>
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
                <select v-model="activeProfile.defaultFacility" @change="setDefaultFacility(activeProfile.defaultFacility)">
                  <option
                    v-for="facility in roleFacilityOptions(selectedRole)"
                    :key="facility"
                    :value="facility"
                  >
                    {{ facilityOptionLabel(facility) }}
                  </option>
                </select>
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
                <select v-model="activeProfile.appearance">
                  <option>System</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </label>
              <label>
                Language
                <select v-model="activeProfile.language">
                  <option>English (US)</option>
                  <option>Spanish</option>
                </select>
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
                  <span>Profile Information <small>Name, contact, department, and specialization</small></span>
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
                    <p>Core identity fields are controlled by your organization. Contact details can be updated here.</p>
                  </div>
                </div>
                <div class="modal-form settings-form">
                  <label>
                    Full Name
                    <input v-model="activeProfile.fullName" type="text" readonly />
                  </label>
                  <label>
                    Email Address
                    <input v-model="activeProfile.email" type="email" readonly />
                  </label>
                  <label>
                    Phone Number
                    <input v-model="activeProfile.phone" type="tel" />
                  </label>
                  <label>
                    System Role
                    <input v-model="activeProfile.systemRole" type="text" readonly />
                  </label>
                  <label>
                    Department
                    <input v-model="activeProfile.department" type="text" />
                  </label>
                  <label>
                    Specialization
                    <input v-model="activeProfile.specialization" type="text" />
                  </label>
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
                <div class="modal-form settings-form">
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
                  <span><strong>Department:</strong> {{ activeProfile.department }}</span>
                  <span><strong>Specialization:</strong> {{ activeProfile.specialization }}</span>
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
                    <select v-model="activeProfile.appearance">
                      <option>System</option>
                      <option>Light</option>
                      <option>Dark</option>
                    </select>
                  </label>
                  <label>
                    Language
                    <select v-model="activeProfile.language">
                      <option>English (US)</option>
                      <option>Spanish</option>
                    </select>
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
                    <select v-model="activeProfile.defaultFacility" @change="setDefaultFacility(activeProfile.defaultFacility)">
                      <option
                        v-for="facility in roleFacilityOptions(selectedRole)"
                        :key="facility"
                        :value="facility"
                      >
                        {{ facilityOptionLabel(facility) }}
                      </option>
                    </select>
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
          <p>Core identity fields are controlled by your organization. Contact details can be updated here.</p>
          <div class="modal-form">
            <label>
              Full Name
              <input v-model="activeProfile.fullName" type="text" readonly />
            </label>
            <label>
              Email Address
              <input v-model="activeProfile.email" type="email" readonly />
            </label>
            <label>
              Phone Number
              <input v-model="activeProfile.phone" type="tel" />
            </label>
            <label>
              System Role
              <input v-model="activeProfile.systemRole" type="text" readonly />
            </label>
            <label>
              Department
              <input v-model="activeProfile.department" type="text" />
            </label>
            <label>
              Specialization
              <input v-model="activeProfile.specialization" type="text" />
            </label>
          </div>
          <button class="primary-action" type="button" @click="closeProfileModal">
            <Check :size="16" />
            Save Profile
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
          <div class="modal-form">
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
            <span><strong>Department:</strong> {{ activeProfile.department }}</span>
            <span><strong>Specialization:</strong> {{ activeProfile.specialization }}</span>
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
              <select v-model="activeProfile.appearance">
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </label>
            <label>
              Language
              <select v-model="activeProfile.language">
                <option>English (US)</option>
                <option>Spanish</option>
              </select>
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
              <select v-model="activeProfile.defaultFacility" @change="setDefaultFacility(activeProfile.defaultFacility)">
                <option
                  v-for="facility in roleFacilityOptions(selectedRole)"
                  :key="facility"
                  :value="facility"
                >
                  {{ facilityOptionLabel(facility) }}
                </option>
              </select>
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
            <select v-model="escalationDraft.urgency">
              <option>Stat</option>
              <option>High</option>
              <option>Routine</option>
            </select>
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
              <span class="chip compact" :class="statusTone(item.tone)">
                {{ item.kind }}
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

    <div v-if="scheduleModalOpen" class="modal-backdrop" @click="closeScheduleModal">
      <article class="modal-card profile-modal schedule-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeScheduleModal">
          <X :size="18" />
        </button>
        <h2>{{ editingClinicalOrderId ? "Edit Clinical Order" : "New Schedule" }}</h2>
        <p>
          Create huddles, follow-up reminders, and Provider-only order drafts for resident care coordination.
        </p>
        <div class="context-chip-row">
          <span v-if="scheduleModalResident" class="chip warning">@{{ scheduleModalResident.name }}</span>
          <span class="chip compact">{{ formatDateLabel(scheduleDraft.date) }} · {{ formatTimeInput(scheduleDraft.time) }}</span>
        </div>
        <div class="modal-form settings-form">
          <label>
            Event Category
            <select :value="scheduleDraft.type" @change="handleScheduleTypeChange">
              <option value="huddle">Huddle</option>
              <option value="follow-up">Follow-up</option>
              <option v-if="selectedRole === 'provider'" value="clinical-order">Clinical Order</option>
            </select>
          </label>
          <label>
            Event Type
            <select :value="scheduleDraft.eventType" @change="handleScheduleEventTypeChange">
              <option v-for="eventType in scheduleEventTypeOptions" :key="eventType" :value="eventType">
                {{ eventType }}
              </option>
            </select>
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

        <div class="schedule-search-block">
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

        <div class="schedule-search-block">
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
                <small>{{ user.role }} · {{ user.department ?? "Care team" }} · {{ presenceText(user) }}</small>
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
          <div class="modal-form">
            <label>
              Agenda
              <textarea v-model="scheduleDraft.details" rows="3" />
            </label>
          </div>
          <div class="modal-form settings-form">
            <label>
              Call Type
              <select v-model="scheduleDraft.callMode">
                <option value="voice-call">Voice call</option>
                <option value="video-call">Video call</option>
              </select>
            </label>
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
              <select v-model="scheduleDraft.priority">
                <option>Stat</option>
                <option>High</option>
                <option>Routine</option>
              </select>
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
            <span><strong>Status:</strong> {{ editingClinicalOrderId ? "Editing draft" : "New draft" }}</span>
          </div>
        </template>

        <div class="modal-actions">
          <button
            v-if="scheduleDraft.type === 'huddle'"
            class="soft-action"
            type="button"
            :disabled="!scheduleDraftCanSave"
            @click="saveScheduleDraft(false)"
          >
            <Clock :size="16" />
            Schedule
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
            {{ scheduleDraft.type === "huddle" ? "Start Huddle Now" : scheduleDraft.type === "clinical-order" ? "Save Order Draft" : "Save Follow-up" }}
          </button>
        </div>
      </article>
    </div>

    <div v-if="huddleModalResident" class="modal-backdrop" @click="closeHuddleModal">
      <article class="modal-card profile-modal huddle-modal" @click.stop>
        <button class="icon-button close-modal" type="button" aria-label="Close" @click="closeHuddleModal">
          <X :size="18" />
        </button>
        <h2>Schedule Huddle</h2>
        <p>Create a resident-tagged care-team huddle and optionally start the group call now.</p>
        <div class="context-chip-row">
          <span class="chip warning">@{{ huddleModalResident.name }}</span>
          <span class="chip compact">{{ residentFacility(huddleModalResident) }}</span>
        </div>
        <div class="modal-form settings-form">
          <label>
            Huddle Title
            <input v-model="huddleDraft.title" type="text" />
          </label>
          <label>
            Scheduled For
            <input v-model="huddleDraft.scheduledFor" type="text" />
          </label>
          <label>
            Duration
            <input v-model="huddleDraft.duration" type="text" />
          </label>
          <label>
            Call Type
            <select v-model="huddleDraft.callMode">
              <option value="voice-call">Voice call</option>
              <option value="video-call">Video call</option>
            </select>
          </label>
        </div>
        <div class="modal-form">
          <label>
            Agenda
            <textarea v-model="huddleDraft.agenda" rows="3" />
          </label>
        </div>
        <div class="recipient-picker">
          <div class="section-label">Participants</div>
          <button
            v-for="user in clinicalRecipients"
            :key="user.id"
            type="button"
            class="recipient-row"
            :class="{ selected: huddleDraft.participantIds.includes(user.id) }"
            @click="toggleHuddleParticipant(user.id)"
          >
            <span class="staff-avatar" aria-hidden="true">
              <UserIcon :size="17" />
            </span>
            <span>
              <strong>{{ user.name }}</strong>
              <small>{{ user.role }} · {{ presenceText(user) }}</small>
            </span>
            <Check v-if="huddleDraft.participantIds.includes(user.id)" :size="16" />
          </button>
        </div>
        <div class="modal-actions">
          <button
            class="soft-action"
            type="button"
            :disabled="!huddleDraft.title.trim() || huddleDraft.participantIds.length === 0"
            @click="saveScheduledHuddle(false)"
          >
            <Clock :size="16" />
            Schedule
          </button>
          <button
            class="primary-action"
            type="button"
            :disabled="!huddleDraft.title.trim() || huddleDraft.participantIds.length === 0"
            @click="saveScheduledHuddle(true)"
          >
            <Video v-if="huddleDraft.callMode === 'video-call'" :size="16" />
            <Phone v-else :size="16" />
            Start Huddle Now
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
              <small>{{ user.role }} · {{ presenceText(user) }}</small>
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
            <select v-model="actionDraft.residentId">
              <option v-for="resident in filteredResidents" :key="resident.id" :value="resident.id">
                {{ resident.name }} · Room {{ resident.room }}
              </option>
            </select>
          </label>
          <label>
            Assign To Role
            <select :value="actionDraft.assignedRole" @change="handleActionRoleChange">
              <option value="provider">Provider</option>
              <option value="cna">CNA</option>
            </select>
          </label>
          <label>
            Staff Member
            <select v-model="actionDraft.assignedUserId">
              <option v-for="user in actionAssigneeOptions" :key="user.id" :value="user.id">
                {{ user.name }} · {{ user.role }}
              </option>
            </select>
          </label>
          <label>
            Action Type
            <select v-model="actionDraft.actionType">
              <option v-for="actionType in actionTypeOptions" :key="actionType" :value="actionType">
                {{ actionType }}
              </option>
            </select>
          </label>
          <label>
            Priority
            <select v-model="actionDraft.priority">
              <option>Stat</option>
              <option>High</option>
              <option>Routine</option>
            </select>
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
