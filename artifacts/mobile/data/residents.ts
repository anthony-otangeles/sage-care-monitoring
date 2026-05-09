import { ImageSourcePropType } from "react-native";

export type AcuityLevel = "WATCHFUL" | "MONITORING" | "STABLE";

export type CareStep = "done" | "active" | "pending";

export interface Resident {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F";
  room: string;
  acuity: AcuityLevel;
  statusChips: string[];
  image: ImageSourcePropType;
  codeStatus: "Full Code" | "DNR" | "DNR/DNI" | "Comfort Care";
  latest: string;
  careSteps: { surveillance: CareStep; reassessment: CareStep; provider: CareStep };

  situation: {
    summary: string;
    memory: string;
    concerns: {
      title: string;
      status: string;
      color: "coral" | "amber" | "green";
    }[];
    vitals: {
      label: string;
      icon: "activity" | "thermometer" | "heart";
      base: string;
      current: string;
      isAbnormal: boolean;
    }[];
    clarify: {
      question: string;
      answer: string;
    }[];
  };

  timeline: {
    id: string;
    timeAgo: string;
    period: string;
    icon: string;
    text: string;
    interpretation?: string;
  }[];

  talk: {
    id: string;
    sender: "sage" | "user";
    text: string;
  }[];
}

export const residents: Resident[] = [
  {
    id: "1",
    name: "Mary Lou Smith",
    age: 84,
    sex: "F",
    room: "204B",
    acuity: "WATCHFUL",
    statusChips: ["DECLINING"],
    image: require("@/assets/images/resident-1.png"),
    codeStatus: "DNR",
    latest: "Confusion ↑ overnight, possible UTI",
    careSteps: { surveillance: "done", reassessment: "active", provider: "pending" },
    situation: {
      summary: "Mary Lou has exhibited increased confusion and restlessness over the past 14 hours. CNA reported strong urine odor. Vitals show mild tachycardia and low-grade temp. High suspicion for UTI-induced delirium given her history.",
      memory: "Admitted 6 weeks ago for sepsis secondary to UTI. Responds well to gentle redirection. Daughter (Sarah) visits on weekends.",
      concerns: [
        { title: "Possible UTI / Delirium", status: "NEW", color: "coral" },
        { title: "Tachycardia", status: "MONITORING", color: "amber" },
      ],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "88", current: "104", isAbnormal: true },
        { label: "Temperature", icon: "thermometer", base: "98.6°", current: "100.4°", isAbnormal: true },
        { label: "Blood Pressure", icon: "heart", base: "108/62", current: "96/58", isAbnormal: false },
      ],
      clarify: [
        {
          question: "Why are you concerned?",
          answer: "Mary Lou's baseline cognition is oriented x3. The sudden onset of confusion, combined with tachycardia (104), low-grade temp (100.4°), and reported urine odor strongly points to a new infection. Her admission 6 weeks ago was for similar symptoms that progressed to sepsis."
        },
        { question: "What changed overnight?", answer: "Slept poorly, up x4 during the night. CNA noted urine odor at 0300." },
        { question: "Has provider been contacted?", answer: "Not yet. Recommending urine dip/culture and provider notification." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "4 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate 30% of breakfast. Refused fluids.", interpretation: "Decreased PO intake compared to usual 80%." },
      { id: "t2", timeAgo: "10 HOURS AGO", period: "NIGHT", icon: "moon", text: "Restless sleep, up frequently.", interpretation: "Atypical sleep pattern for her." },
      { id: "t3", timeAgo: "14 HOURS AGO", period: "NIGHT", icon: "alert-circle", text: "CNA reported strong urine odor.", interpretation: "First sign of potential infection." },
      { id: "t4", timeAgo: "18 HOURS AGO", period: "YESTERDAY EVE", icon: "activity", text: "HR increased from baseline 88 to 92.", interpretation: "Early vital sign shift." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "I am monitoring Mary Lou Smith closely. She is showing signs of a potential UTI and delirium. What would you like to know?" },
      { id: "m2", sender: "user", text: "Did she have a fever overnight?" },
      { id: "m3", sender: "sage", text: "Yes, her temperature trended up to 100.4° at 0400, compared to her baseline of 98.6°." },
      { id: "m4", sender: "user", text: "Has anyone drawn a UA yet?" },
      { id: "m5", sender: "sage", text: "No UA has been collected yet. Would you like me to add this to the delegate actions?" }
    ]
  },
  {
    id: "2",
    name: "Walter Jefferson",
    age: 78,
    sex: "M",
    room: "211",
    acuity: "WATCHFUL",
    statusChips: [],
    image: require("@/assets/images/resident-2.png"),
    codeStatus: "Full Code",
    latest: "Hip pain after evening fall",
    careSteps: { surveillance: "done", reassessment: "active", provider: "done" },
    situation: {
      summary: "Walter had a witnessed fall yesterday evening. No obvious injuries, but complaining of left hip soreness this morning. Monitoring closely for delayed complications.",
      memory: "History of orthostatic hypotension. Prefers to mobilize independently despite recommendations.",
      concerns: [
        { title: "Post-Fall Monitoring", status: "ACTIVE", color: "coral" },
        { title: "Left Hip Pain", status: "NEW", color: "amber" }
      ],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "72", current: "76", isAbnormal: false },
        { label: "Blood Pressure", icon: "heart", base: "135/82", current: "118/70", isAbnormal: true },
      ],
      clarify: [
        { question: "Details of the fall?", answer: "Witnessed by CNA at 1800. Slid from wheelchair to floor during transfer attempt. Hit left hip." },
        { question: "Current pain level?", answer: "Reports 4/10 ache in left hip. No shortening or rotation noted." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "activity", text: "Complained of left hip pain during morning care." },
      { id: "t2", timeAgo: "16 HOURS AGO", period: "YESTERDAY EVE", icon: "alert-triangle", text: "Witnessed fall in room.", interpretation: "Initiated post-fall protocol." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Walter is on post-fall monitoring. His BP is slightly lower than baseline today." }
    ]
  },
  {
    id: "3",
    name: "Elena Vasquez",
    age: 89,
    sex: "F",
    room: "207A",
    acuity: "MONITORING",
    statusChips: [],
    image: require("@/assets/images/resident-3.png"),
    codeStatus: "DNR/DNI",
    latest: "Finished antibiotics, lungs clear",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "pending" },
    situation: {
      summary: "Elena completed her antibiotic course for pneumonia yesterday. Lungs sound clear, breathing is unlabored. Continuing to monitor for any rebound symptoms.",
      memory: "Speaks primarily Spanish. Enjoys listening to music in the afternoons.",
      concerns: [
        { title: "Post-Antibiotic Surveillance", status: "WATCHING", color: "amber" }
      ],
      vitals: [
        { label: "SpO2", icon: "activity", base: "94%", current: "96%", isAbnormal: false },
        { label: "Temperature", icon: "thermometer", base: "98.2°", current: "98.4°", isAbnormal: false },
      ],
      clarify: [
        { question: "Respiratory status?", answer: "Clear to auscultation bilaterally. No cough noted overnight." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "12 HOURS AGO", period: "NIGHT", icon: "check-circle", text: "Last dose of Levofloxacin administered." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Elena has finished her antibiotics. Her O2 saturation is stable." }
    ]
  },
  {
    id: "4",
    name: "Hiroshi Tanaka",
    age: 81,
    sex: "M",
    room: "215B",
    acuity: "MONITORING",
    statusChips: [],
    image: require("@/assets/images/resident-4.png"),
    codeStatus: "Full Code",
    latest: "Fasting BG 185, trending up",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "pending" },
    situation: {
      summary: "Hiroshi's blood sugars have been slightly elevated over the past 48 hours (ranging 180-210). He has been requesting extra snacks in the evening.",
      memory: "Type 2 Diabetic, diet-controlled. Very social, participates in most activities.",
      concerns: [
        { title: "Elevated Blood Glucose", status: "TRENDING", color: "amber" }
      ],
      vitals: [
        { label: "Fasting BG", icon: "activity", base: "110", current: "185", isAbnormal: true },
      ],
      clarify: [
        { question: "Dietary compliance?", answer: "Family brought in cookies yesterday afternoon. He consumed several after dinner." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "activity", text: "Fasting BG 185." },
      { id: "t2", timeAgo: "14 HOURS AGO", period: "YESTERDAY EVE", icon: "coffee", text: "Ate family-provided snacks." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Hiroshi's morning blood sugar was 185. He had extra snacks last night." }
    ]
  },
  {
    id: "5",
    name: "Frank O'Donnell",
    age: 76,
    sex: "M",
    room: "220",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-5.png"),
    codeStatus: "Full Code",
    latest: "Attended exercise, no concerns",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Frank is resting comfortably. No acute concerns. Attended morning exercise class.",
      memory: "Former mechanic. Loves to talk about classic cars.",
      concerns: [],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "68", current: "70", isAbnormal: false },
        { label: "Blood Pressure", icon: "heart", base: "120/80", current: "122/78", isAbnormal: false },
      ],
      clarify: []
    },
    timeline: [
      { id: "t1", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "activity", text: "Attended group exercise." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Frank is stable and doing well today." }
    ]
  },
  {
    id: "6",
    name: "Doris Whitfield",
    age: 82,
    sex: "F",
    room: "203",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-6.png"),
    codeStatus: "Comfort Care",
    latest: "Quiet night, eating well",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Doris had a quiet night. Appetite is good. No complaints of pain.",
      memory: "Avid reader. Usually requests fresh library books on Tuesdays.",
      concerns: [],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "74", current: "72", isAbnormal: false },
        { label: "SpO2", icon: "activity", base: "98%", current: "99%", isAbnormal: false },
      ],
      clarify: []
    },
    timeline: [
      { id: "t1", timeAgo: "8 HOURS AGO", period: "MORNING", icon: "sun", text: "Woke up well-rested." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Doris had a good night and is stable." }
    ]
  }
];

export function getResident(id: string) {
  return residents.find(r => r.id === id);
}
