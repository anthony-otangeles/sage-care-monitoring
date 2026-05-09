import { ImageSourcePropType } from "react-native";

export type PresenceStatus = "online" | "away" | "offline";

export interface User {
  id: string;
  name: string;
  role: string;
  image: ImageSourcePropType;
  presence: PresenceStatus;
  lastSeen?: string;
}

export interface ThreadMessage {
  id: string;
  authorId: string;
  text: string;
  ts: string;
}

export interface Thread {
  id: string;
  kind: "dm" | "huddle";
  title: string;
  members: string[];
  image?: ImageSourcePropType;
  lastMessage: string;
  lastTs: string;
  unread: number;
  messages: ThreadMessage[];
}

export const currentUser: User = {
  id: "me",
  name: "Jamie Patel, RN",
  role: "Day Shift Lead",
  image: require("@/assets/images/resident-3.png"),
  presence: "online",
};

export const users: User[] = [
  {
    id: "u1",
    name: "Sarah Jenkins",
    role: "RN, Charge",
    image: require("@/assets/images/resident-6.png"),
    presence: "online",
  },
  {
    id: "u2",
    name: "Marcus Lee",
    role: "RN",
    image: require("@/assets/images/resident-2.png"),
    presence: "online",
  },
  {
    id: "u3",
    name: "Priya Anand",
    role: "CNA",
    image: require("@/assets/images/resident-1.png"),
    presence: "away",
    lastSeen: "5m ago",
  },
  {
    id: "u4",
    name: "Dr. Hannah Cole",
    role: "Attending",
    image: require("@/assets/images/resident-3.png"),
    presence: "online",
  },
  {
    id: "u5",
    name: "Tomás Ruiz",
    role: "CNA",
    image: require("@/assets/images/resident-4.png"),
    presence: "offline",
    lastSeen: "1h ago",
  },
  {
    id: "u6",
    name: "Renee Park",
    role: "LPN",
    image: require("@/assets/images/resident-5.png"),
    presence: "offline",
    lastSeen: "3h ago",
  },
  {
    id: "u7",
    name: "Dr. Nathaniel Brooks",
    role: "Medical Director",
    image: require("@/assets/images/resident-2.png"),
    presence: "away",
    lastSeen: "20m ago",
  },
];

export const threads: Thread[] = [
  {
    id: "t1",
    kind: "huddle",
    title: "Day Shift · 2 East",
    members: ["me", "u1", "u2", "u3", "u4"],
    lastMessage: "Sarah: All vitals captured for @Mary Lou. Starting reassessment now.",
    lastTs: "2m",
    unread: 3,
    messages: [
      { id: "m1", authorId: "u4", text: "Morning team — let's prioritize 204B today.", ts: "8:02 AM" },
      { id: "m2", authorId: "u1", text: "On it. @Mary Lou flagged DECLINING overnight, getting fresh vitals.", ts: "8:04 AM" },
      { id: "m3", authorId: "u2", text: "I'll cover @Walter Jefferson's post-fall checks.", ts: "8:06 AM" },
      { id: "m4", authorId: "u1", text: "All vitals captured for @Mary Lou. Starting reassessment now.", ts: "8:14 AM" },
    ],
  },
  {
    id: "t2",
    kind: "dm",
    title: "Sarah Jenkins",
    members: ["me", "u1"],
    image: require("@/assets/images/resident-6.png"),
    lastMessage: "Want me to escalate to Dr. Cole?",
    lastTs: "12m",
    unread: 1,
    messages: [
      { id: "m1", authorId: "u1", text: "@Mary Lou's mental status looks worse — disoriented to time.", ts: "8:18 AM" },
      { id: "m2", authorId: "me", text: "Can you double-check her temp and HR?", ts: "8:19 AM" },
      { id: "m3", authorId: "u1", text: "Temp 100.4, HR 104. Want me to escalate to Dr. Cole?", ts: "8:22 AM" },
    ],
  },
  {
    id: "t3",
    kind: "dm",
    title: "Dr. Hannah Cole",
    members: ["me", "u4"],
    image: require("@/assets/images/resident-3.png"),
    lastMessage: "Approved — start IV abx. I'll round at 10.",
    lastTs: "34m",
    unread: 0,
    messages: [
      { id: "m1", authorId: "me", text: "@Mary Lou — high suspicion UTI, requesting orders.", ts: "7:48 AM" },
      { id: "m2", authorId: "u4", text: "Approved — start IV abx. I'll round at 10.", ts: "7:55 AM" },
    ],
  },
  {
    id: "t4",
    kind: "huddle",
    title: "Falls Committee",
    members: ["me", "u1", "u2", "u7"],
    lastMessage: "Marcus: New incident report uploaded for @Walter.",
    lastTs: "1h",
    unread: 0,
    messages: [
      { id: "m1", authorId: "u2", text: "New incident report uploaded for @Walter Jefferson.", ts: "7:10 AM" },
    ],
  },
  {
    id: "t5",
    kind: "dm",
    title: "Priya Anand",
    members: ["me", "u3"],
    image: require("@/assets/images/resident-1.png"),
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
