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
      isCritical?: boolean;
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
    careSteps: { surveillance: "active", reassessment: "pending", provider: "pending" },
    situation: {
      summary: "Mary Lou has exhibited increased confusion and restlessness over the past 14 hours. CNA reported strong urine odor. Vitals show mild tachycardia and low-grade temp. High suspicion for UTI-induced delirium given her history.",
      memory: "Admitted 6 weeks ago for sepsis secondary to UTI. Responds well to gentle redirection. Daughter (Sarah) visits on weekends.",
      concerns: [
        { title: "Possible UTI / Delirium", status: "NEW", color: "coral" },
        { title: "Tachycardia", status: "MONITORING", color: "amber" },
      ],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "88", current: "104", isAbnormal: true },
        { label: "Temperature", icon: "thermometer", base: "98.6°", current: "100.4°", isAbnormal: true, isCritical: true },
        { label: "Blood Pressure", icon: "heart", base: "108/62", current: "96/58", isAbnormal: true, isCritical: true },
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
    careSteps: { surveillance: "active", reassessment: "pending", provider: "done" },
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
        { label: "Fasting BG", icon: "activity", base: "110", current: "185", isAbnormal: true, isCritical: true },
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
  },
  {
    id: "7",
    name: "Beatrice Holloway",
    age: 91,
    sex: "F",
    room: "208",
    acuity: "WATCHFUL",
    statusChips: ["DECLINING"],
    image: require("@/assets/images/resident-7.png"),
    codeStatus: "DNR/DNI",
    latest: "New onset chest tightness post-meal",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "pending" },
    situation: {
      summary: "Beatrice reported chest tightness after lunch. EKG unremarkable. Vitals trending toward baseline but daughter requests close monitoring.",
      memory: "Hx CHF, on furosemide. Daughter is HCPOA, very involved.",
      concerns: [
        { title: "Atypical Chest Pain", status: "NEW", color: "coral" }
      ],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "70", current: "88", isAbnormal: true },
        { label: "Blood Pressure", icon: "heart", base: "118/72", current: "138/86", isAbnormal: true },
        { label: "SpO2", icon: "activity", base: "97%", current: "94%", isAbnormal: true, isCritical: true }
      ],
      clarify: [
        { question: "Was there exertion before symptoms?", answer: "No, occurred at rest after meal." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "AFTERNOON", icon: "alert-circle", text: "Chest tightness reported." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "I'd recommend cardiology phone consult." }
    ]
  },
  {
    id: "8",
    name: "Raymond Cho",
    age: 73,
    sex: "M",
    room: "212A",
    acuity: "MONITORING",
    statusChips: [],
    image: require("@/assets/images/resident-8.png"),
    codeStatus: "Full Code",
    latest: "Wound check due, healing well",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Surgical wound on right calf granulating well. No drainage or odor. Pain controlled on PRN acetaminophen.",
      memory: "S/p AKA 6 weeks ago. Strong rehab motivation.",
      concerns: [
        { title: "Wound Healing", status: "WATCHING", color: "amber" }
      ],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "72", current: "74", isAbnormal: false },
        { label: "Temperature", icon: "thermometer", base: "98.4°", current: "98.6°", isAbnormal: false }
      ],
      clarify: []
    },
    timeline: [
      { id: "t1", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Dressing change tolerated well." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Healing on schedule." }
    ]
  },
  {
    id: "9",
    name: "Ingrid Larsson",
    age: 86,
    sex: "F",
    room: "216",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-9.png"),
    codeStatus: "DNR",
    latest: "Cheerful, joined morning singalong",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Ingrid is in good spirits. Ate full breakfast. No complaints.",
      memory: "Former music teacher. Loves choir activities.",
      concerns: [],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "76", current: "74", isAbnormal: false }
      ],
      clarify: []
    },
    timeline: [
      { id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "music", text: "Led morning singalong." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Ingrid is having a great morning." }
    ]
  },
  {
    id: "10",
    name: "Otis McKenna",
    age: 79,
    sex: "M",
    room: "219B",
    acuity: "MONITORING",
    statusChips: [],
    image: require("@/assets/images/resident-10.png"),
    codeStatus: "Full Code",
    latest: "AFib rate trending up, asymptomatic",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "pending" },
    situation: {
      summary: "Heart rate has crept up over past 24 hours. Patient denies palpitations or shortness of breath. Continues home meds.",
      memory: "Chronic AFib, anticoagulated. Avid Sudoku player.",
      concerns: [
        { title: "Rate Control", status: "TRENDING", color: "amber" }
      ],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "78", current: "96", isAbnormal: true },
        { label: "Blood Pressure", icon: "heart", base: "126/74", current: "122/76", isAbnormal: false }
      ],
      clarify: []
    },
    timeline: [
      { id: "t1", timeAgo: "30 MIN AGO", period: "MORNING", icon: "trending-up", text: "HR 96 noted on rounds." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Watch for symptoms; consider provider notification if rate >110." }
    ]
  },
  {
    id: "11",
    name: "Constance Webb",
    age: 88,
    sex: "F",
    room: "201A",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-11.png"),
    codeStatus: "Comfort Care",
    latest: "Comfortable, family visiting today",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Resting comfortably. Pain rating 0/10. Family expected at 2pm.",
      memory: "Hospice eligible. Prefers chamomile tea in afternoons.",
      concerns: [],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "70", current: "72", isAbnormal: false }
      ],
      clarify: []
    },
    timeline: [
      { id: "t1", timeAgo: "4 HOURS AGO", period: "MORNING", icon: "smile", text: "Family confirmed afternoon visit." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Constance is peaceful and ready for visitors." }
    ]
  },
  {
    id: "12",
    name: "Eduardo Salinas",
    age: 81,
    sex: "M",
    room: "222",
    acuity: "WATCHFUL",
    statusChips: ["DECLINING"],
    image: require("@/assets/images/resident-12.png"),
    codeStatus: "Full Code",
    latest: "Decreased PO intake, fatigue",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "pending" },
    situation: {
      summary: "Eduardo has eaten less than 25% of meals over past 48 hours. Reports fatigue. Weight down 1.2 kg this week.",
      memory: "Hx CKD stage 3. Speaks Spanish, English when alert.",
      concerns: [
        { title: "Poor PO Intake", status: "NEW", color: "coral" },
        { title: "Weight Loss", status: "WATCHING", color: "amber" }
      ],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "76", current: "84", isAbnormal: false },
        { label: "Blood Pressure", icon: "heart", base: "132/78", current: "118/68", isAbnormal: true, isCritical: true }
      ],
      clarify: [
        { question: "Any new medications?", answer: "Started new BP med 5 days ago." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "alert-triangle", text: "Refused breakfast." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Consider dietitian consult and BMP recheck." }
    ]
  },
  {
    id: "13",
    name: "Margaret O'Sullivan",
    age: 86, sex: "F", room: "205A",
    acuity: "MONITORING",
    statusChips: [],
    image: require("@/assets/images/resident-13.png"),
    codeStatus: "DNR",
    latest: "Mild dehydration, encouraging fluids",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "pending" },
    situation: {
      summary: "Margaret's intake has been below baseline for 2 days. Skin turgor mildly decreased. Encouraging q1h fluids.",
      memory: "Hx mild dementia. Loves classical music in the afternoons.",
      concerns: [{ title: "Hydration", status: "WATCHING", color: "amber" }],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "74", current: "82", isAbnormal: false },
        { label: "Blood Pressure", icon: "heart", base: "118/68", current: "112/64", isAbnormal: false }
      ],
      clarify: []
    },
    timeline: [
      { id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "droplet", text: "Took 240 mL water with breakfast." }
    ],
    talk: [{ id: "m1", sender: "sage", text: "Hydration trend slowly improving." }]
  },
  {
    id: "14",
    name: "Henry Brennan",
    age: 73, sex: "M", room: "207",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-14.png"),
    codeStatus: "Full Code",
    latest: "Stable post-knee replacement day 14",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Day 14 post right TKA. Ambulating with walker. Pain controlled on PRN Tylenol.",
      memory: "Retired carpenter. Eager to return home. Wife visits daily.",
      concerns: [],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "72", current: "74", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "check-circle", text: "PT session completed, 200 ft ambulation." }],
    talk: [{ id: "m1", sender: "sage", text: "Recovery progressing well." }]
  },
  {
    id: "15",
    name: "Yolanda Pierce",
    age: 91, sex: "F", room: "210B",
    acuity: "MONITORING",
    statusChips: [],
    image: require("@/assets/images/resident-15.png"),
    codeStatus: "DNR",
    latest: "Pressure injury healing, repositioning q2h",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "done" },
    situation: {
      summary: "Stage 2 sacral pressure injury improving. Wound nurse following weekly. Repositioning q2h.",
      memory: "Bedbound. Loves visits from therapy dog program.",
      concerns: [{ title: "Skin Integrity", status: "MONITORING", color: "amber" }],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "76", current: "78", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "refresh-cw", text: "Repositioned to right side." }],
    talk: [{ id: "m1", sender: "sage", text: "Wound granulating well." }]
  },
  {
    id: "16",
    name: "Clarence Boudreaux",
    age: 82, sex: "M", room: "212",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-16.png"),
    codeStatus: "DNR",
    latest: "COPD stable on home O2",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "COPD stable. SpO2 94% on 2L NC. No new dyspnea.",
      memory: "Former jazz musician from New Orleans. Tells great stories.",
      concerns: [],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "84", current: "82", isAbnormal: false },
        { label: "Temperature", icon: "thermometer", base: "98.4°", current: "98.2°", isAbnormal: false }
      ],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "wind", text: "SpO2 94% on 2L." }],
    talk: [{ id: "m1", sender: "sage", text: "Respiratory status stable." }]
  },
  {
    id: "17",
    name: "Pearl Robinson",
    age: 89, sex: "F", room: "214A",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-17.png"),
    codeStatus: "DNR",
    latest: "Cheerful, attended bingo",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Pleasant interaction at breakfast. Independent with ADLs except bathing.",
      memory: "Retired schoolteacher. 4 great-grandchildren.",
      concerns: [],
      vitals: [{ label: "Blood Pressure", icon: "heart", base: "124/72", current: "126/74", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "smile", text: "Won bingo round." }],
    talk: [{ id: "m1", sender: "sage", text: "Pearl is doing wonderfully today." }]
  },
  {
    id: "18",
    name: "Vincent Kowalski",
    age: 76, sex: "M", room: "216B",
    acuity: "MONITORING",
    statusChips: [],
    image: require("@/assets/images/resident-18.png"),
    codeStatus: "Full Code",
    latest: "Post-stroke rehab, mild left weakness",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "pending" },
    situation: {
      summary: "3 weeks post-CVA. Left arm 3/5 strength. Aggressive PT/OT plan.",
      memory: "Retired engineer. Highly motivated in therapy.",
      concerns: [{ title: "Mobility", status: "MONITORING", color: "amber" }],
      vitals: [{ label: "Blood Pressure", icon: "heart", base: "138/82", current: "142/86", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "4 HOURS AGO", period: "MORNING", icon: "activity", text: "OT session, gripping exercises." }],
    talk: [{ id: "m1", sender: "sage", text: "Steady progress noted." }]
  },
  {
    id: "19",
    name: "Adelaide Fontaine",
    age: 94, sex: "F", room: "218",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-19.png"),
    codeStatus: "Comfort Care",
    latest: "Comfortable, no acute concerns",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Comfortable on routine comfort meds. Sleeps most of day. Family aware.",
      memory: "French is her first language. Smiles when read to.",
      concerns: [],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "68", current: "70", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "moon", text: "Slept comfortably overnight." }],
    talk: [{ id: "m1", sender: "sage", text: "Adelaide is peaceful." }]
  },
  {
    id: "20",
    name: "Reginald Thompson",
    age: 80, sex: "M", room: "220A",
    acuity: "WATCHFUL",
    statusChips: ["NEW"],
    image: require("@/assets/images/resident-20.png"),
    codeStatus: "Full Code",
    latest: "New admit — CHF exacerbation",
    careSteps: { surveillance: "active", reassessment: "active", provider: "done" },
    situation: {
      summary: "Admitted yesterday from hospital after CHF exacerbation. Lasix titrating. Daily weights ordered.",
      memory: "Lives alone. Daughter is POA. Loves baseball.",
      concerns: [
        { title: "Fluid Overload", status: "ACTIVE", color: "coral" },
        { title: "Daily Weights", status: "MONITORING", color: "amber" }
      ],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "82", current: "94", isAbnormal: true },
        { label: "Blood Pressure", icon: "heart", base: "128/78", current: "118/72", isAbnormal: false }
      ],
      clarify: [{ question: "Weight today?", answer: "Down 0.6 kg from yesterday — diuresis working." }]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "trending-down", text: "AM weight 78.4 kg, down 0.6 kg." }
    ],
    talk: [{ id: "m1", sender: "sage", text: "Diuresis on track. Watching K+ next draw." }]
  },
  {
    id: "21",
    name: "Lillian Greco",
    age: 87, sex: "F", room: "221B",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-21.png"),
    codeStatus: "DNR",
    latest: "Stable, enjoying garden visits",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Pleasant. Independent ambulation with cane. Eats 80%+ of meals.",
      memory: "Avid gardener. Family brings cuttings to her room.",
      concerns: [],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "72", current: "74", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "sun", text: "Walked outside in courtyard." }],
    talk: [{ id: "m1", sender: "sage", text: "Lillian is thriving." }]
  },
  {
    id: "22",
    name: "Theodore Whitman",
    age: 75, sex: "M", room: "223",
    acuity: "MONITORING",
    statusChips: [],
    image: require("@/assets/images/resident-22.png"),
    codeStatus: "Full Code",
    latest: "Diabetes management, sliding scale insulin",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "done" },
    situation: {
      summary: "Type 2 DM on sliding scale. Recent BG trending high mid-morning. Endocrine consult pending.",
      memory: "Retired accountant. Tracks his own BG religiously.",
      concerns: [{ title: "Glucose Control", status: "TRENDING", color: "amber" }],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "76", current: "78", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "trending-up", text: "BG 198 ac lunch." }],
    talk: [{ id: "m1", sender: "sage", text: "BG pattern suggests sliding scale adjustment." }]
  },
  {
    id: "23",
    name: "Geraldine Park",
    age: 83, sex: "F", room: "225A",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-23.png"),
    codeStatus: "DNR",
    latest: "Stable post-pneumonia recovery",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Completed antibiotics 3 days ago. Lung sounds clear. Energy returning.",
      memory: "Korean is first language. Loves video calls with grandchildren in Seoul.",
      concerns: [],
      vitals: [
        { label: "Temperature", icon: "thermometer", base: "98.4°", current: "98.6°", isAbnormal: false }
      ],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "4 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Lung sounds clear bilaterally." }],
    talk: [{ id: "m1", sender: "sage", text: "Recovery on track." }]
  },
  {
    id: "24",
    name: "Mortimer Hayes",
    age: 78, sex: "M", room: "226B",
    acuity: "MONITORING",
    statusChips: [],
    image: require("@/assets/images/resident-24.png"),
    codeStatus: "DNR/DNI",
    latest: "Parkinson's, increased rigidity AM",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "pending" },
    situation: {
      summary: "Increased AM rigidity, possibly related to med timing. Neuro consult on radar.",
      memory: "Retired professor. Enjoys jazz LPs in his room.",
      concerns: [{ title: "Med Timing", status: "MONITORING", color: "amber" }],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "70", current: "72", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "alert-circle", text: "Slow to respond, more rigid than baseline." }],
    talk: [{ id: "m1", sender: "sage", text: "Recommend reviewing carbidopa-levodopa schedule." }]
  },
  {
    id: "25",
    name: "Rosalind Mercado",
    age: 85, sex: "F", room: "228",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-25.png"),
    codeStatus: "DNR",
    latest: "Stable, ate full breakfast",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Independent in most ADLs. Pleasant and engaged. No new concerns.",
      memory: "Tagalog is preferred language. Catholic, attends weekly Mass.",
      concerns: [],
      vitals: [{ label: "Blood Pressure", icon: "heart", base: "122/72", current: "120/70", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate 100% breakfast." }],
    talk: [{ id: "m1", sender: "sage", text: "Rosalind is doing very well." }]
  },
  {
    id: "26",
    name: "Augustus Calloway",
    age: 81, sex: "M", room: "230A",
    acuity: "WATCHFUL",
    statusChips: ["DECLINING"],
    image: require("@/assets/images/resident-26.png"),
    codeStatus: "DNR",
    latest: "Anorexia, declining intake third day",
    careSteps: { surveillance: "active", reassessment: "active", provider: "pending" },
    situation: {
      summary: "Third day of poor intake (<25%). No GI symptoms. Mood withdrawn. Considering depression vs medical workup.",
      memory: "Korean War veteran. Usually social, recent withdrawal noted.",
      concerns: [
        { title: "Poor PO Intake", status: "ACTIVE", color: "coral" },
        { title: "Mood Change", status: "WATCHING", color: "amber" }
      ],
      vitals: [{ label: "Blood Pressure", icon: "heart", base: "126/76", current: "112/64", isAbnormal: true }],
      clarify: [{ question: "Recent losses?", answer: "Wife passed 6 weeks ago." }]
    },
    timeline: [{ id: "t1", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "alert-triangle", text: "Refused breakfast." }],
    talk: [{ id: "m1", sender: "sage", text: "Recommend social work and provider consult." }]
  },
  {
    id: "27",
    name: "Wilhelmina Dietrich",
    age: 90, sex: "F", room: "231B",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-27.png"),
    codeStatus: "DNR",
    latest: "Stable, knitting in common room",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Pleasant, social. Enjoys knitting circle three times weekly.",
      memory: "Born in Germany, immigrated 1956. Speaks German with one staff member.",
      concerns: [],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "70", current: "72", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "smile", text: "Knitting circle this morning." }],
    talk: [{ id: "m1", sender: "sage", text: "Wilhelmina is content and well." }]
  },
  {
    id: "28",
    name: "Bernard Achebe",
    age: 79, sex: "M", room: "233",
    acuity: "MONITORING",
    statusChips: [],
    image: require("@/assets/images/resident-28.png"),
    codeStatus: "Full Code",
    latest: "Anticoagulation INR 3.4, slightly elevated",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "done" },
    situation: {
      summary: "On warfarin for AFib. Recent INR 3.4 (target 2-3). Held last dose, rechecking AM.",
      memory: "Retired physician. Educates staff on his own conditions.",
      concerns: [{ title: "INR Trending Up", status: "MONITORING", color: "amber" }],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "78", current: "80", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "alert-circle", text: "INR 3.4, warfarin held." }],
    talk: [{ id: "m1", sender: "sage", text: "Recheck INR scheduled tomorrow." }]
  },
  {
    id: "29",
    name: "Estelle Chamberlain",
    age: 86, sex: "F", room: "235A",
    acuity: "STABLE",
    statusChips: [],
    image: require("@/assets/images/resident-29.png"),
    codeStatus: "DNR",
    latest: "Stable, scheduled hair appointment today",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Pleasant. Looking forward to in-house salon visit. No concerns.",
      memory: "Former model in the 1960s. Particular about her appearance.",
      concerns: [],
      vitals: [{ label: "Blood Pressure", icon: "heart", base: "120/70", current: "118/72", isAbnormal: false }],
      clarify: []
    },
    timeline: [{ id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "smile", text: "Excited for hair appt at 1pm." }],
    talk: [{ id: "m1", sender: "sage", text: "Estelle is in great spirits." }]
  },
  {
    id: "30",
    name: "Solomon Kapoor",
    age: 77, sex: "M", room: "236B",
    acuity: "WATCHFUL",
    statusChips: ["NEW"],
    image: require("@/assets/images/resident-30.png"),
    codeStatus: "Full Code",
    latest: "New admit — post-op hip ORIF day 3",
    careSteps: { surveillance: "active", reassessment: "active", provider: "done" },
    situation: {
      summary: "Day 3 post-ORIF for left hip fx. Pain 4/10 on PCA. PT consult started today. Watching for VTE signs.",
      memory: "Vegetarian. Daughter coordinating care from out of state.",
      concerns: [
        { title: "Post-op Pain", status: "ACTIVE", color: "coral" },
        { title: "VTE Risk", status: "MONITORING", color: "amber" }
      ],
      vitals: [
        { label: "Heart Rate", icon: "activity", base: "76", current: "88", isAbnormal: false },
        { label: "Temperature", icon: "thermometer", base: "98.4°", current: "99.1°", isAbnormal: false }
      ],
      clarify: [{ question: "VTE prophylaxis?", answer: "On enoxaparin and SCDs." }]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "activity", text: "PT eval — bedside, dangled at edge." }
    ],
    talk: [{ id: "m1", sender: "sage", text: "Recovery on expected post-op trajectory." }]
  }
];

export function getResident(id: string) {
  return residents.find(r => r.id === id);
}
