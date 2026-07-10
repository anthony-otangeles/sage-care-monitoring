import { residentImage } from "./images";

export type PresenceStatus = "online" | "away" | "offline";

export interface User {
  id: string;
  name: string;
  role: string;
  image: string;
  presence: PresenceStatus;
  lastSeen?: string;
  loginRole?: "don" | "provider" | "cna";
  email?: string;
  department?: string;
  specialization?: string;
  assignedFacilities?: string[];
  defaultFacility?: string;
}

export interface ThreadMessage {
  id: string;
  authorId: string;
  text: string;
  ts: string;
  kind?: "text" | "voice-message" | "voice-call" | "video-call";
  duration?: string;
  durationSeconds?: number;
}

export type ThreadPurpose =
  | "resident-room"
  | "direct"
  | "staff-group"
  | "huddle-event"
  | "order"
  | "escalation"
  | "action";

export interface Thread {
  id: string;
  kind: "dm" | "huddle";
  title: string;
  members: string[];
  residentId?: string;
  purpose?: ThreadPurpose;
  image?: string;
  lastMessage: string;
  lastTs: string;
  unread: number;
  messages: ThreadMessage[];
}

export const currentUser: User = {
  id: "me",
  name: "Jamie Patel, MSN, RN",
  role: "Director of Nursing",
  image: residentImage(3),
  presence: "online",
};

export const users: User[] = [
  {
    id: "u8",
    name: "Jamie Patel, MSN, RN",
    role: "Director of Nursing",
    image: residentImage(3),
    presence: "online",
    loginRole: "don",
    email: "jamie.patel@sagecare.local",
    department: "Nursing Administration",
    specialization: "Facility Operations",
    assignedFacilities: [
      "Brickyard Healthcare – Elkhart Care Center",
      "Brickyard Healthcare – Merrillville Care Center",
      "Casa of Hobart",
      "Niles Care Center",
    ],
    defaultFacility: "all",
  },
  {
    id: "u1",
    name: "Sarah Jenkins",
    role: "RN, Charge",
    image: residentImage(6),
    presence: "online",
    department: "Nursing",
    specialization: "Charge Nurse",
    assignedFacilities: ["Brickyard Healthcare – Elkhart Care Center"],
  },
  {
    id: "u2",
    name: "Marcus Lee",
    role: "RN",
    image: residentImage(2),
    presence: "online",
    department: "Nursing",
    specialization: "Skilled Nursing",
    assignedFacilities: ["Brickyard Healthcare – Merrillville Care Center", "Casa of Hobart"],
  },
  {
    id: "u3",
    name: "Priya Anand",
    role: "CNA",
    image: residentImage(1),
    presence: "away",
    lastSeen: "5m ago",
    loginRole: "cna",
    email: "priya.anand@sagecare.local",
    department: "Nursing",
    specialization: "Long-Term Care",
    assignedFacilities: [
      "Brickyard Healthcare – Elkhart Care Center",
      "Brickyard Healthcare – Merrillville Care Center",
    ],
    defaultFacility: "Brickyard Healthcare – Elkhart Care Center",
  },
  {
    id: "u4",
    name: "Dr. Hannah Cole",
    role: "Medical Doctor",
    image: residentImage(3),
    presence: "online",
    loginRole: "provider",
    email: "hannah.cole@sagecare.local",
    department: "Medical Services",
    specialization: "Geriatric Primary Care",
    assignedFacilities: [
      "Brickyard Healthcare – Elkhart Care Center",
      "Brickyard Healthcare – Merrillville Care Center",
      "Casa of Hobart",
      "Niles Care Center",
    ],
    defaultFacility: "all",
  },
  {
    id: "u5",
    name: "Tomás Ruiz",
    role: "CNA",
    image: residentImage(4),
    presence: "offline",
    lastSeen: "1h ago",
    loginRole: "cna",
    email: "tomas.ruiz@sagecare.local",
    department: "Nursing",
    specialization: "Memory Care",
    assignedFacilities: ["Casa of Hobart", "Niles Care Center"],
    defaultFacility: "Casa of Hobart",
  },
  {
    id: "u6",
    name: "Renee Park",
    role: "LPN",
    image: residentImage(5),
    presence: "offline",
    lastSeen: "3h ago",
    department: "Nursing",
    specialization: "Medication Pass",
    assignedFacilities: ["Niles Care Center"],
  },
  {
    id: "u7",
    name: "Dr. Nathaniel Brooks",
    role: "Medical Director",
    image: residentImage(2),
    presence: "away",
    lastSeen: "20m ago",
    loginRole: "provider",
    email: "nathaniel.brooks@sagecare.local",
    department: "Medical Services",
    specialization: "Internal Medicine",
    assignedFacilities: [
      "Brickyard Healthcare – Elkhart Care Center",
      "Brickyard Healthcare – Merrillville Care Center",
      "Casa of Hobart",
      "Niles Care Center",
    ],
    defaultFacility: "all",
  },
  {
    id: "u9",
    name: "Nora Whitfield, NP",
    role: "Nurse Practitioner",
    image: residentImage(6),
    presence: "online",
    loginRole: "provider",
    email: "nora.whitfield@sagecare.local",
    department: "Medical Services",
    specialization: "Post-Acute Care",
    assignedFacilities: ["Casa of Hobart", "Niles Care Center"],
    defaultFacility: "Casa of Hobart",
  },
  {
    id: "u10",
    name: "Eli Mercado, PA-C",
    role: "Physician Assistant",
    image: residentImage(7),
    presence: "away",
    lastSeen: "12m ago",
    loginRole: "provider",
    email: "eli.mercado@sagecare.local",
    department: "Medical Services",
    specialization: "Wound Care",
    assignedFacilities: ["Brickyard Healthcare – Merrillville Care Center", "Niles Care Center"],
    defaultFacility: "Brickyard Healthcare – Merrillville Care Center",
  },
  {
    id: "u11",
    name: "Maya Chen",
    role: "CNA",
    image: residentImage(8),
    presence: "online",
    loginRole: "cna",
    email: "maya.chen@sagecare.local",
    department: "Nursing",
    specialization: "Rehab Unit",
    assignedFacilities: ["Brickyard Healthcare – Elkhart Care Center"],
    defaultFacility: "Brickyard Healthcare – Elkhart Care Center",
  },
  {
    id: "u12",
    name: "Gloria Fields",
    role: "Unit Manager",
    image: residentImage(9),
    presence: "online",
    department: "Nursing Administration",
    specialization: "Unit Operations",
    assignedFacilities: ["Casa of Hobart"],
  },
  {
    id: "u13",
    name: "Samira Nassar",
    role: "Social Services",
    image: residentImage(10),
    presence: "offline",
    lastSeen: "Yesterday",
    department: "Social Services",
    specialization: "Family Coordination",
    assignedFacilities: [
      "Brickyard Healthcare – Elkhart Care Center",
      "Brickyard Healthcare – Merrillville Care Center",
    ],
  },
  {
    id: "u14",
    name: "Owen Miller",
    role: "Therapy Lead",
    image: residentImage(11),
    presence: "away",
    lastSeen: "30m ago",
    department: "Therapy",
    specialization: "Physical Therapy",
    assignedFacilities: ["Niles Care Center", "Casa of Hobart"],
  },
  {
    id: "u15",
    name: "Alicia Grant",
    role: "Scheduler",
    image: residentImage(12),
    presence: "online",
    department: "Administration",
    specialization: "Care Team Scheduling",
    assignedFacilities: [
      "Brickyard Healthcare – Elkhart Care Center",
      "Brickyard Healthcare – Merrillville Care Center",
      "Casa of Hobart",
      "Niles Care Center",
    ],
  },
];

export const threads: Thread[] = [
  {
    id: "t1",
    kind: "huddle",
    title: "Mary Lou Smith Care Team",
    members: ["u8", "u1", "u2", "u3", "u4"],
    residentId: "1",
    purpose: "resident-room",
    lastMessage: "Dr. Hannah: Approved — start IV antibiotics. I'll round at 10.",
    lastTs: "2m",
    unread: 3,
    messages: [
      { id: "m1", authorId: "u8", text: "Mary Lou is our priority resident this morning. Please keep updates here so everyone has the same picture.", ts: "8:02 AM" },
      { id: "m2", authorId: "u1", text: "On it. @Mary Lou flagged DECLINING overnight, getting fresh vitals.", ts: "8:04 AM" },
      { id: "m3", authorId: "u2", text: "I'll cover @Walter Jefferson's post-fall checks.", ts: "8:06 AM" },
      { id: "m4", authorId: "u8", text: "Care huddle scheduled for today at 10:30 AM: review confusion, intake decline, UA status, and next provider orders.", ts: "8:08 AM" },
      { id: "m5", authorId: "u4", text: "Voice call", ts: "8:10 AM", kind: "voice-call", duration: "2 min 18 sec" },
      { id: "m6", authorId: "u1", text: "All vitals captured for @Mary Lou. Starting reassessment now.", ts: "8:14 AM" },
      { id: "m7", authorId: "u4", text: "Approved — start IV antibiotics. I'll round at 10.", ts: "8:18 AM" },
    ],
  },
  {
    id: "t2",
    kind: "dm",
    title: "Sarah Jenkins",
    members: ["u8", "u1"],
    purpose: "direct",
    image: residentImage(6),
    lastMessage: "I added the fresh vitals in Mary Lou's room.",
    lastTs: "12m",
    unread: 1,
    messages: [
      { id: "m1", authorId: "u1", text: "I added the fresh vitals in Mary Lou's room.", ts: "8:18 AM" },
      { id: "m2", authorId: "u8", text: "Thank you. Keep the resident thread updated if anything changes.", ts: "8:19 AM" },
      { id: "m3", authorId: "u1", text: "Will do.", ts: "8:22 AM" },
    ],
  },
  {
    id: "t3",
    kind: "dm",
    title: "Dr. Hannah Cole",
    members: ["u8", "u4"],
    purpose: "direct",
    image: residentImage(3),
    lastMessage: "I'll watch the resident rooms for provider decisions.",
    lastTs: "34m",
    unread: 0,
    messages: [
      { id: "m1", authorId: "u8", text: "I moved the Mary Lou updates into her care-team room so nursing and provider decisions stay together.", ts: "7:48 AM" },
      { id: "m2", authorId: "u4", text: "Voice call", ts: "7:52 AM", kind: "voice-call", duration: "2 min 18 sec" },
      { id: "m3", authorId: "u4", text: "Good. I'll watch the resident rooms for provider decisions.", ts: "7:55 AM" },
    ],
  },
  {
    id: "t4",
    kind: "huddle",
    title: "Walter Jefferson Care Team",
    members: ["u8", "u1", "u2", "u7"],
    residentId: "2",
    purpose: "resident-room",
    lastMessage: "Marcus: New incident report uploaded for Walter.",
    lastTs: "1h",
    unread: 0,
    messages: [
      { id: "m1", authorId: "u2", text: "New incident report uploaded for Walter Jefferson.", ts: "7:10 AM" },
      { id: "m2", authorId: "u8", text: "Post-fall follow-up huddle scheduled for today at 1:00 PM: align on x-ray status, transfer safety, and mobility restrictions.", ts: "7:40 AM" },
    ],
  },
  {
    id: "t5",
    kind: "dm",
    title: "Priya Anand",
    members: ["u8", "u3"],
    purpose: "direct",
    image: residentImage(1),
    lastMessage: "Bath done. @Doris is resting comfortably.",
    lastTs: "2h",
    unread: 0,
    messages: [
      { id: "m1", authorId: "u3", text: "Bath done. @Doris is resting comfortably.", ts: "6:40 AM" },
    ],
  },
];

export function getThread(id: string) {
  return threads.find(t => t.id === id);
}

export function getUser(id: string) {
  if (id === currentUser.id) return currentUser;
  return users.find(u => u.id === id);
}
