import { residentImage } from "./images";

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
  image: string;
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
    image: residentImage(1),
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
    image: residentImage(2),
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
        { question: "Current pain level?", answer: "Reports 4/10 ache in left hip. No shortening or rotation noted." },
        { question: "Imaging?", answer: "Hip x-ray ordered, awaiting transport to imaging at 1100." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "activity", text: "Pain medication given (acetaminophen 650 mg).", interpretation: "Following pain protocol, reassess in 60 min." },
      { id: "t2", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "alert-circle", text: "Complained of left hip pain 4/10 during morning care." },
      { id: "t3", timeAgo: "8 HOURS AGO", period: "NIGHT", icon: "moon", text: "Slept restlessly, repositioned twice for comfort." },
      { id: "t4", timeAgo: "16 HOURS AGO", period: "YESTERDAY EVE", icon: "alert-triangle", text: "Witnessed fall in room from wheelchair.", interpretation: "Initiated post-fall protocol — neuro checks q2h." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Walter is on post-fall monitoring. His BP is slightly lower than baseline today (118/70 vs 135/82)." },
      { id: "m2", sender: "user", text: "Any signs of fracture?" },
      { id: "m3", sender: "sage", text: "No shortening or external rotation noted. Hip x-ray ordered, transport scheduled for 1100." },
      { id: "m4", sender: "user", text: "Pain control?" },
      { id: "m5", sender: "sage", text: "Acetaminophen 650 mg given 1 hour ago. I will flag if pain stays above 3/10 at next check." }
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
    image: residentImage(3),
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
        { question: "Respiratory status?", answer: "Clear to auscultation bilaterally. No cough noted overnight." },
        { question: "Any rebound symptoms?", answer: "Afebrile x 36 hours. SpO2 96% on room air. Energy returning." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Lung sounds clear bilaterally on assessment." },
      { id: "t2", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate 75% of breakfast, took full cup of coffee." },
      { id: "t3", timeAgo: "12 HOURS AGO", period: "NIGHT", icon: "check-circle", text: "Last dose of Levofloxacin administered.", interpretation: "Completed 7-day course." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Elena finished her antibiotics last night. O2 sat is stable at 96% room air." },
      { id: "m2", sender: "user", text: "Any fever?" },
      { id: "m3", sender: "sage", text: "Afebrile for 36 hours. Temp this morning was 98.4°." },
      { id: "m4", sender: "user", text: "When should we reassess?" },
      { id: "m5", sender: "sage", text: "I'd recommend a 72-hour post-antibiotic check tomorrow morning." }
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
    image: residentImage(4),
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
        { question: "Dietary compliance?", answer: "Family brought in cookies yesterday afternoon. He consumed several after dinner." },
        { question: "Insulin coverage?", answer: "Diet-controlled only, no scheduled insulin. Sliding scale available if BG > 250." },
        { question: "Pattern over week?", answer: "Mon-Wed: 110-130. Thu-Sat: 165-210. Trend correlates with family visits." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "trending-up", text: "Repeat BG 178 before activity." },
      { id: "t2", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "activity", text: "Fasting BG 185.", interpretation: "3rd consecutive AM above goal of 130." },
      { id: "t3", timeAgo: "10 HOURS AGO", period: "NIGHT", icon: "moon", text: "Slept well, no nocturia reported." },
      { id: "t4", timeAgo: "14 HOURS AGO", period: "YESTERDAY EVE", icon: "coffee", text: "Ate family-provided cookies after dinner.", interpretation: "Documented dietary deviation." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Hiroshi's morning blood sugar was 185, the third elevated AM in a row. Pattern correlates with family visit days." },
      { id: "m2", sender: "user", text: "Has the family been counseled?" },
      { id: "m3", sender: "sage", text: "Not in the last 30 days. Last note from dietitian was 6 weeks ago." },
      { id: "m4", sender: "user", text: "Loop the dietitian in." },
      { id: "m5", sender: "sage", text: "I'll add a dietitian consult to the delegate actions and request a family teaching session." }
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
    image: residentImage(5),
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
      clarify: [
        { question: "Activity tolerance today?", answer: "Completed 20-min seated exercise class without dyspnea or chest discomfort." },
        { question: "Any new requests?", answer: "Asked for the classic-car magazines from the library cart." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "smile", text: "Chatting with tablemates over coffee in lounge." },
      { id: "t2", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "activity", text: "Attended group exercise, full participation." },
      { id: "t3", timeAgo: "8 HOURS AGO", period: "NIGHT", icon: "moon", text: "Slept 7 uninterrupted hours." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Frank is stable and engaged today. Vitals at baseline." },
      { id: "m2", sender: "user", text: "Any med changes coming up?" },
      { id: "m3", sender: "sage", text: "None scheduled. His next provider visit is on the 14th." }
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
    image: residentImage(6),
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
      clarify: [
        { question: "Pain status?", answer: "Denies pain. Comfort meds (low-dose morphine PRN) not requested in 48 hours." },
        { question: "Family contact?", answer: "Son called yesterday. Plans visit Sunday afternoon." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate 80% of breakfast, requested second cup of tea." },
      { id: "t2", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "sun", text: "Woke up well-rested, no overnight pain reports." },
      { id: "t3", timeAgo: "10 HOURS AGO", period: "NIGHT", icon: "moon", text: "Slept comfortably, no awakenings noted." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Doris had a peaceful night and a good morning. No comfort meds needed in 48 hours." },
      { id: "m2", sender: "user", text: "Library day today?" },
      { id: "m3", sender: "sage", text: "Yes — Tuesday. I'll make sure the volunteer brings her requested mystery novels." }
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
    image: residentImage(7),
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
        { question: "Was there exertion before symptoms?", answer: "No, occurred at rest about 20 min after lunch." },
        { question: "EKG findings?", answer: "Normal sinus, no acute ST changes. No prior EKG on file for comparison today." },
        { question: "Daughter notified?", answer: "Yes, called at 1330. Requested SBAR via secure message tonight." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "30 MIN AGO", period: "AFTERNOON", icon: "activity", text: "Repeat vitals: BP 132/82, HR 84. Trending down toward baseline." },
      { id: "t2", timeAgo: "1 HOUR AGO", period: "AFTERNOON", icon: "alert-circle", text: "Chest tightness reported, rated 3/10.", interpretation: "EKG done — NSR, no acute changes." },
      { id: "t3", timeAgo: "2 HOURS AGO", period: "AFTERNOON", icon: "coffee", text: "Ate full lunch, no complaints during meal." },
      { id: "t4", timeAgo: "8 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Took morning furosemide as scheduled." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Beatrice had a new chest tightness episode after lunch. EKG was unremarkable, vitals are trending back to baseline." },
      { id: "m2", sender: "user", text: "Cardiology consult?" },
      { id: "m3", sender: "sage", text: "I'd recommend a phone consult tonight given her CHF history. Daughter has also asked for an SBAR." },
      { id: "m4", sender: "user", text: "Set it up." },
      { id: "m5", sender: "sage", text: "Adding cardiology phone consult and SBAR-to-daughter to delegate actions." }
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
    image: residentImage(8),
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
      clarify: [
        { question: "Wound appearance?", answer: "Granulating, beefy red base. No drainage, no odor, no surrounding erythema." },
        { question: "Pain control?", answer: "1-2/10 on PRN acetaminophen. No opioids needed in 10 days." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "smile", text: "Independent transfer to wheelchair for therapy." },
      { id: "t2", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Dressing change tolerated well. Wound granulating.", interpretation: "Healing trajectory ahead of expected schedule." },
      { id: "t3", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "activity", text: "Weight-bearing as tolerated, used parallel bars 30 ft." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Raymond's wound is healing on or ahead of schedule. No signs of infection." },
      { id: "m2", sender: "user", text: "Is he ready for prosthetic fitting?" },
      { id: "m3", sender: "sage", text: "Wound nurse expects clearance in 7-10 days based on current granulation." }
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
    image: residentImage(9),
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
      clarify: [
        { question: "Activity participation?", answer: "Led morning singalong, requested encore. Engaged for the full 45 minutes." },
        { question: "Any concerns?", answer: "None. Eating well, sleeping well, social, no pain reports." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "smile", text: "Chatted with new resident, offered to show her around." },
      { id: "t2", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "music", text: "Led morning singalong, group asked for encore." },
      { id: "t3", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate 100% breakfast, took multivitamin." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Ingrid is having a great morning — full meal, social engagement, led singalong." },
      { id: "m2", sender: "user", text: "Anything to flag?" },
      { id: "m3", sender: "sage", text: "Nothing today. She's at her best baseline." }
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
    image: residentImage(10),
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
      clarify: [
        { question: "Symptoms?", answer: "Denies palpitations, dyspnea, chest pain, or dizziness." },
        { question: "Anticoagulation status?", answer: "On apixaban 5 mg BID. Last dose given as scheduled this AM." },
        { question: "Trigger identified?", answer: "Skipped morning metoprolol yesterday — found tablet under pillow." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "30 MIN AGO", period: "MORNING", icon: "trending-up", text: "HR 96 noted on rounds, asymptomatic.", interpretation: "Up from baseline 78." },
      { id: "t2", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Morning metoprolol observed — swallowed with full glass of water." },
      { id: "t3", timeAgo: "20 HOURS AGO", period: "YESTERDAY", icon: "alert-circle", text: "Metoprolol tablet found under pillow at evening tidy.", interpretation: "Likely missed dose explains rate trend." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Otis's HR is 96, up from baseline 78. He's asymptomatic. We found yesterday's metoprolol under his pillow last night." },
      { id: "m2", sender: "user", text: "So a missed dose?" },
      { id: "m3", sender: "sage", text: "Most likely. I'd suggest observing all metoprolol doses for the next 72 hours and rechecking HR in 4 hours." },
      { id: "m4", sender: "user", text: "Do it. Notify provider if HR > 110." },
      { id: "m5", sender: "sage", text: "Confirmed — observed-dose protocol set, threshold notification armed." }
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
    image: residentImage(11),
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
      clarify: [
        { question: "Comfort status?", answer: "Pain 0/10. No air hunger. Quiet, peaceful breathing." },
        { question: "Family plans?", answer: "Daughter and two granddaughters expected at 2 PM. Bringing chamomile and a quilt." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "sun", text: "Listening to soft hymns at her request." },
      { id: "t2", timeAgo: "4 HOURS AGO", period: "MORNING", icon: "smile", text: "Family confirmed afternoon visit." },
      { id: "t3", timeAgo: "8 HOURS AGO", period: "NIGHT", icon: "moon", text: "Slept peacefully, no comfort meds requested." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Constance is peaceful and ready for visitors. Family arriving at 2 PM." },
      { id: "m2", sender: "user", text: "Anything she needs before then?" },
      { id: "m3", sender: "sage", text: "Linens have been freshened. I've reminded the kitchen about her chamomile request." }
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
    image: residentImage(12),
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
        { question: "Any new medications?", answer: "Started lisinopril 5 mg 5 days ago. BP drop and fatigue temporally correlate." },
        { question: "Labs?", answer: "Last BMP 4 days ago — Cr 1.6 (baseline 1.4), K+ 4.2. Recheck due." },
        { question: "Family aware?", answer: "Daughter notified yesterday, requesting weekly updates." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "trending-down", text: "Weight down 0.4 kg from yesterday.", interpretation: "1.2 kg total this week." },
      { id: "t2", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "alert-triangle", text: "Refused breakfast, ate 2 bites of toast." },
      { id: "t3", timeAgo: "10 HOURS AGO", period: "NIGHT", icon: "moon", text: "Slept fitfully, said he felt 'too tired to roll over'." },
      { id: "t4", timeAgo: "5 DAYS AGO", period: "PRIOR", icon: "alert-circle", text: "Started new BP medication (lisinopril 5 mg).", interpretation: "Possible contributor to current decline." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Eduardo's intake and BP have both dropped since lisinopril was started 5 days ago. Weight is down 1.2 kg this week." },
      { id: "m2", sender: "user", text: "Hold the lisinopril and notify provider?" },
      { id: "m3", sender: "sage", text: "Recommended. I'll also queue a BMP recheck and dietitian consult." },
      { id: "m4", sender: "user", text: "Do it." },
      { id: "m5", sender: "sage", text: "Hold order, BMP, and dietitian consult added to delegate actions." }
    ]
  },
  {
    id: "13",
    name: "Margaret O'Sullivan",
    age: 86, sex: "F", room: "205A",
    acuity: "MONITORING",
    statusChips: [],
    image: residentImage(13),
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
      clarify: [
        { question: "Hydration intake today?", answer: "480 mL by 10 AM (goal 1500 mL/day). Encouraging q1h sips." },
        { question: "Skin assessment?", answer: "Mildly tented over forearm, mucous membranes slightly tacky. No urine output concerns." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "droplet", text: "Took 120 mL apple juice with morning meds." },
      { id: "t2", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "droplet", text: "Took 240 mL water with breakfast." },
      { id: "t3", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "music", text: "Listened to morning Mozart per preference." },
      { id: "t4", timeAgo: "10 HOURS AGO", period: "NIGHT", icon: "moon", text: "Slept through, no nocturia." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Margaret's hydration trend is slowly improving — 480 mL by 10 AM today." },
      { id: "m2", sender: "user", text: "Still tenting?" },
      { id: "m3", sender: "sage", text: "Mildly. I'll re-check turgor at noon and flag if no improvement." }
    ]
  },
  {
    id: "14",
    name: "Henry Brennan",
    age: 73, sex: "M", room: "207",
    acuity: "STABLE",
    statusChips: [],
    image: residentImage(14),
    codeStatus: "Full Code",
    latest: "Stable post-knee replacement day 14",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Day 14 post right TKA. Ambulating with walker. Pain controlled on PRN Tylenol.",
      memory: "Retired carpenter. Eager to return home. Wife visits daily.",
      concerns: [],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "72", current: "74", isAbnormal: false }],
      clarify: [
        { question: "Pain control?", answer: "1/10 at rest, 3/10 with PT. Tylenol 650 mg q6h PRN, last dose 3 hours ago." },
        { question: "Discharge planning?", answer: "Targeting home discharge in 5-7 days pending stair clearance." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "trending-up", text: "Walked 200 ft with walker — new daily best." },
      { id: "t2", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "check-circle", text: "PT session completed, full program tolerated." },
      { id: "t3", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate full breakfast, took morning meds." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Henry's recovery is progressing well — new ambulation best of 200 ft today." },
      { id: "m2", sender: "user", text: "Stairs assessment?" },
      { id: "m3", sender: "sage", text: "PT plans stair trial Friday. If cleared, home discharge targets early next week." }
    ]
  },
  {
    id: "15",
    name: "Yolanda Pierce",
    age: 91, sex: "F", room: "210B",
    acuity: "MONITORING",
    statusChips: [],
    image: residentImage(15),
    codeStatus: "DNR",
    latest: "Pressure injury healing, repositioning q2h",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "done" },
    situation: {
      summary: "Stage 2 sacral pressure injury improving. Wound nurse following weekly. Repositioning q2h.",
      memory: "Bedbound. Loves visits from therapy dog program.",
      concerns: [{ title: "Skin Integrity", status: "MONITORING", color: "amber" }],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "76", current: "78", isAbnormal: false }],
      clarify: [
        { question: "Wound status?", answer: "Stage 2 sacral, 2.5 x 1.8 cm, granulating. No undermining. Last measured Monday." },
        { question: "Repositioning compliance?", answer: "Q2h schedule maintained, last 5 turns documented on time." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "refresh-cw", text: "Repositioned to right side, pressure-relief cushion in place." },
      { id: "t2", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Wound dressing intact, no drainage on outer dressing." },
      { id: "t3", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "smile", text: "Therapy dog visit — patted Buddy for 15 minutes." },
      { id: "t4", timeAgo: "11 HOURS AGO", period: "NIGHT", icon: "refresh-cw", text: "Q2h turn schedule maintained overnight." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Yolanda's pressure injury is granulating well. Q2h turns documented on schedule." },
      { id: "m2", sender: "user", text: "Next wound nurse visit?" },
      { id: "m3", sender: "sage", text: "Thursday at 10 AM. I'll have the most recent measurements and photos ready." }
    ]
  },
  {
    id: "16",
    name: "Clarence Boudreaux",
    age: 82, sex: "M", room: "212",
    acuity: "STABLE",
    statusChips: [],
    image: residentImage(16),
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
      clarify: [
        { question: "Respiratory status?", answer: "SpO2 94% on 2L NC. RR 18, no use of accessory muscles. Lungs with chronic crackles at bases — baseline." },
        { question: "Recent exacerbations?", answer: "None in 90 days. Last steroid taper completed in February." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "music", text: "Played piano for 20 min in common room." },
      { id: "t2", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "wind", text: "SpO2 94% on 2L, RR 18, no dyspnea." },
      { id: "t3", timeAgo: "11 HOURS AGO", period: "NIGHT", icon: "check-circle", text: "Tolerated overnight O2 via nasal cannula, no removals." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Clarence's respiratory status is stable at his baseline. He's been at the piano this morning." },
      { id: "m2", sender: "user", text: "Any new orders pending?" },
      { id: "m3", sender: "sage", text: "No. His next pulmonary follow-up is in 3 weeks." }
    ]
  },
  {
    id: "17",
    name: "Pearl Robinson",
    age: 89, sex: "F", room: "214A",
    acuity: "STABLE",
    statusChips: [],
    image: residentImage(17),
    codeStatus: "DNR",
    latest: "Cheerful, attended bingo",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Pleasant interaction at breakfast. Independent with ADLs except bathing.",
      memory: "Retired schoolteacher. 4 great-grandchildren.",
      concerns: [],
      vitals: [{ label: "Blood Pressure", icon: "heart", base: "124/72", current: "126/74", isAbnormal: false }],
      clarify: [
        { question: "Activity engagement?", answer: "Won bingo, then joined the puzzle table. Independent ambulation throughout." },
        { question: "Family contact?", answer: "Granddaughter video call scheduled for 4 PM." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "smile", text: "Joined puzzle table, completed 100-piece set." },
      { id: "t2", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "smile", text: "Won bingo round, beamed about the chocolate prize." },
      { id: "t3", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate full breakfast independently." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Pearl is doing wonderfully today — bingo champion and now puzzling." },
      { id: "m2", sender: "user", text: "Any concerns?" },
      { id: "m3", sender: "sage", text: "None. She has a granddaughter video call at 4 PM, I'll set up the tablet." }
    ]
  },
  {
    id: "18",
    name: "Vincent Kowalski",
    age: 76, sex: "M", room: "216B",
    acuity: "MONITORING",
    statusChips: [],
    image: residentImage(18),
    codeStatus: "Full Code",
    latest: "Post-stroke rehab, mild left weakness",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "pending" },
    situation: {
      summary: "3 weeks post-CVA. Left arm 3/5 strength. Aggressive PT/OT plan.",
      memory: "Retired engineer. Highly motivated in therapy.",
      concerns: [{ title: "Mobility", status: "MONITORING", color: "amber" }],
      vitals: [{ label: "Blood Pressure", icon: "heart", base: "138/82", current: "142/86", isAbnormal: false }],
      clarify: [
        { question: "Strength gains?", answer: "Left arm 3/5 (up from 2/5 admission). Left leg 4/5. Grip improving with putty exercises." },
        { question: "BP trend?", answer: "Slight uptick today (142/86). Provider aware, will reassess in 4 hours." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "trending-up", text: "BP 142/86, slightly elevated.", interpretation: "Up from earlier 132/80." },
      { id: "t2", timeAgo: "4 HOURS AGO", period: "MORNING", icon: "activity", text: "OT session — gripping and pinch exercises, 30 min." },
      { id: "t3", timeAgo: "7 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Took all morning meds without difficulty." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Vincent is making steady progress in OT. BP is trending up slightly today, currently 142/86." },
      { id: "m2", sender: "user", text: "Symptoms with the BP?" },
      { id: "m3", sender: "sage", text: "None. No headache, vision change, or chest discomfort. I'll recheck in 4 hours and notify if > 160 systolic." }
    ]
  },
  {
    id: "19",
    name: "Adelaide Fontaine",
    age: 94, sex: "F", room: "218",
    acuity: "STABLE",
    statusChips: [],
    image: residentImage(19),
    codeStatus: "Comfort Care",
    latest: "Comfortable, no acute concerns",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Comfortable on routine comfort meds. Sleeps most of day. Family aware.",
      memory: "French is her first language. Smiles when read to.",
      concerns: [],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "68", current: "70", isAbnormal: false }],
      clarify: [
        { question: "Comfort status?", answer: "No signs of distress. Breathing soft and regular. Mottling absent." },
        { question: "Family aware?", answer: "Yes. Granddaughter visited yesterday, son updated by phone this morning." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "music", text: "Played French chansons quietly per care plan." },
      { id: "t2", timeAgo: "4 HOURS AGO", period: "MORNING", icon: "droplet", text: "Took 30 mL water with morning oral care." },
      { id: "t3", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "moon", text: "Slept comfortably overnight, no awakenings." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Adelaide is peaceful. No signs of distress, breathing soft and regular." },
      { id: "m2", sender: "user", text: "Family contact today?" },
      { id: "m3", sender: "sage", text: "Son was updated by phone this morning. Granddaughter visited yesterday afternoon." }
    ]
  },
  {
    id: "20",
    name: "Reginald Thompson",
    age: 80, sex: "M", room: "220A",
    acuity: "WATCHFUL",
    statusChips: ["NEW"],
    image: residentImage(20),
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
      clarify: [
        { question: "Weight today?", answer: "78.4 kg, down 0.6 kg from yesterday — diuresis working." },
        { question: "Lung sounds?", answer: "Crackles at bases bilaterally, less than yesterday." },
        { question: "Electrolytes?", answer: "Last K+ 3.6 (this morning). Repleted with 20 mEq KCl, recheck at 1500." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "trending-down", text: "AM weight 78.4 kg, down 0.6 kg.", interpretation: "Diuresis on target." },
      { id: "t2", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Took morning Lasix dose." },
      { id: "t3", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "alert-circle", text: "Morning K+ 3.6, repleted with 20 mEq KCl." },
      { id: "t4", timeAgo: "20 HOURS AGO", period: "YESTERDAY", icon: "activity", text: "Admitted from hospital after CHF exacerbation." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Reginald's diuresis is on track — down 0.6 kg overnight. K+ was 3.6 this morning, repleted." },
      { id: "m2", sender: "user", text: "When's the next BMP?" },
      { id: "m3", sender: "sage", text: "1500 today. I'll flag K+ if it's below 3.5 again." },
      { id: "m4", sender: "user", text: "Daughter notified?" },
      { id: "m5", sender: "sage", text: "Yes, she got the daily SBAR text at 0800 with weight and labs." }
    ]
  },
  {
    id: "21",
    name: "Lillian Greco",
    age: 87, sex: "F", room: "221B",
    acuity: "STABLE",
    statusChips: [],
    image: residentImage(21),
    codeStatus: "DNR",
    latest: "Stable, enjoying garden visits",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Pleasant. Independent ambulation with cane. Eats 80%+ of meals.",
      memory: "Avid gardener. Family brings cuttings to her room.",
      concerns: [],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "72", current: "74", isAbnormal: false }],
      clarify: [
        { question: "Activity participation?", answer: "Walked the courtyard loop independently with her cane (~150 ft)." },
        { question: "Appetite?", answer: "Eats 80%+ at every meal. Asked the kitchen for extra basil today." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "smile", text: "Tended to her windowsill basil plants." },
      { id: "t2", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "sun", text: "Walked outside in courtyard, 150 ft." },
      { id: "t3", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate 90% breakfast." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Lillian is thriving — courtyard walk this morning and tending her plants." },
      { id: "m2", sender: "user", text: "Anything to flag?" },
      { id: "m3", sender: "sage", text: "Nothing today. She mentioned her grandson visits Sunday." }
    ]
  },
  {
    id: "22",
    name: "Theodore Whitman",
    age: 75, sex: "M", room: "223",
    acuity: "MONITORING",
    statusChips: [],
    image: residentImage(22),
    codeStatus: "Full Code",
    latest: "Diabetes management, sliding scale insulin",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "done" },
    situation: {
      summary: "Type 2 DM on sliding scale. Recent BG trending high mid-morning. Endocrine consult pending.",
      memory: "Retired accountant. Tracks his own BG religiously.",
      concerns: [{ title: "Glucose Control", status: "TRENDING", color: "amber" }],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "76", current: "78", isAbnormal: false }],
      clarify: [
        { question: "BG pattern?", answer: "AC breakfast 132, AC lunch 198, AC dinner avg 175 over 3 days. Mid-morning spike persistent." },
        { question: "Sliding scale orders?", answer: "Current scale starts at BG > 200. No coverage given today yet." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "30 MIN AGO", period: "MORNING", icon: "trending-up", text: "Logged his own BG check in his journal: 198." },
      { id: "t2", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "trending-up", text: "BG 198 ac lunch.", interpretation: "Third day of mid-morning elevation." },
      { id: "t3", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "activity", text: "AC breakfast BG 132." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Theodore's mid-morning BG continues to spike (198 today). Pattern is now 3 days." },
      { id: "m2", sender: "user", text: "Time to adjust the sliding scale?" },
      { id: "m3", sender: "sage", text: "I'd recommend lowering the threshold from 200 to 180. Endocrine consult is still pending." },
      { id: "m4", sender: "user", text: "Page endocrine again." },
      { id: "m5", sender: "sage", text: "Re-paged. I'll flag when they respond." }
    ]
  },
  {
    id: "23",
    name: "Geraldine Park",
    age: 83, sex: "F", room: "225A",
    acuity: "STABLE",
    statusChips: [],
    image: residentImage(23),
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
      clarify: [
        { question: "Recovery status?", answer: "10 days post-pneumonia. Lungs clear, afebrile, energy returning to baseline." },
        { question: "Family contact?", answer: "Daily video call with Seoul grandchildren at 7 AM her time." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "smile", text: "Video call with grandchildren in Seoul, 30 min." },
      { id: "t2", timeAgo: "4 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Lung sounds clear bilaterally." },
      { id: "t3", timeAgo: "7 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate full Korean-style breakfast (rice porridge)." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Geraldine's recovery is on track. Lungs clear, afebrile, ate a full breakfast." },
      { id: "m2", sender: "user", text: "Activity tolerance?" },
      { id: "m3", sender: "sage", text: "Walked to the dining hall and back without dyspnea. Energy nearly back to baseline." }
    ]
  },
  {
    id: "24",
    name: "Mortimer Hayes",
    age: 78, sex: "M", room: "226B",
    acuity: "MONITORING",
    statusChips: [],
    image: residentImage(24),
    codeStatus: "DNR/DNI",
    latest: "Parkinson's, increased rigidity AM",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "pending" },
    situation: {
      summary: "Increased AM rigidity, possibly related to med timing. Neuro consult on radar.",
      memory: "Retired professor. Enjoys jazz LPs in his room.",
      concerns: [{ title: "Med Timing", status: "MONITORING", color: "amber" }],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "70", current: "72", isAbnormal: false }],
      clarify: [
        { question: "Med timing?", answer: "Carbidopa-levodopa is scheduled q6h. Last dose 0600, next due 1200. AM rigidity peaks pre-dose." },
        { question: "Functional impact?", answer: "Slow to initiate movement, takes 3-4 attempts to stand. Better 30 min after dose." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "music", text: "Listened to jazz LPs in his room, requested Coltrane." },
      { id: "t2", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "alert-circle", text: "Slow to respond, more rigid than baseline.", interpretation: "Pre-dose window — pattern reproducible." },
      { id: "t3", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Took 0600 carbidopa-levodopa dose." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Mortimer's AM rigidity is again peaking just before the noon dose. Pattern has been reproducible 4 days running." },
      { id: "m2", sender: "user", text: "Shorten the interval?" },
      { id: "m3", sender: "sage", text: "I'd recommend asking neuro about q4h vs q6h dosing. Want me to draft the consult?" },
      { id: "m4", sender: "user", text: "Yes, please." },
      { id: "m5", sender: "sage", text: "Neuro consult drafted with the pattern data attached." }
    ]
  },
  {
    id: "25",
    name: "Rosalind Mercado",
    age: 85, sex: "F", room: "228",
    acuity: "STABLE",
    statusChips: [],
    image: residentImage(25),
    codeStatus: "DNR",
    latest: "Stable, ate full breakfast",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Independent in most ADLs. Pleasant and engaged. No new concerns.",
      memory: "Tagalog is preferred language. Catholic, attends weekly Mass.",
      concerns: [],
      vitals: [{ label: "Blood Pressure", icon: "heart", base: "122/72", current: "120/70", isAbnormal: false }],
      clarify: [
        { question: "Activity participation?", answer: "Attended morning Mass via in-house chaplain. Ate full breakfast independently." },
        { question: "Family contact?", answer: "Niece visits Tuesdays and Fridays, brings home-cooked Filipino dishes." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "smile", text: "Attended in-house Mass, sang along to hymns." },
      { id: "t2", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate 100% breakfast." },
      { id: "t3", timeAgo: "8 HOURS AGO", period: "NIGHT", icon: "moon", text: "Slept through the night, no awakenings." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Rosalind is doing very well — attended Mass and ate a full breakfast." },
      { id: "m2", sender: "user", text: "Any concerns?" },
      { id: "m3", sender: "sage", text: "None. Niece visiting Friday with home-cooked food." }
    ]
  },
  {
    id: "26",
    name: "Augustus Calloway",
    age: 81, sex: "M", room: "230A",
    acuity: "WATCHFUL",
    statusChips: ["DECLINING"],
    image: residentImage(26),
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
      clarify: [
        { question: "Recent losses?", answer: "Wife passed 6 weeks ago. Engagement has progressively dropped since week 3." },
        { question: "Medical workup?", answer: "BMP, TSH, B12 drawn this week — all within normal limits." },
        { question: "Mood screening?", answer: "PHQ-9 score 14 (moderately severe). Up from 6 at admission." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "alert-circle", text: "Declined chaplain visit, asked to stay in his room." },
      { id: "t2", timeAgo: "3 HOURS AGO", period: "MORNING", icon: "trending-down", text: "BP 112/64, lower than baseline." },
      { id: "t3", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "alert-triangle", text: "Refused breakfast (3rd consecutive day)." },
      { id: "t4", timeAgo: "11 HOURS AGO", period: "NIGHT", icon: "moon", text: "Awake at 0300, asked CNA 'when is this going to be over?'" }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Augustus has now refused breakfast three days running and made a concerning statement to the night CNA: 'when is this going to be over?'" },
      { id: "m2", sender: "user", text: "PHQ-9 today?" },
      { id: "m3", sender: "sage", text: "Score 14, moderately severe. Up from 6 at admission." },
      { id: "m4", sender: "user", text: "Get social work and the provider in." },
      { id: "m5", sender: "sage", text: "Social work consult and provider notification added to delegate actions, with PHQ-9 trend attached." }
    ]
  },
  {
    id: "27",
    name: "Wilhelmina Dietrich",
    age: 90, sex: "F", room: "231B",
    acuity: "STABLE",
    statusChips: [],
    image: residentImage(27),
    codeStatus: "DNR",
    latest: "Stable, knitting in common room",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Pleasant, social. Enjoys knitting circle three times weekly.",
      memory: "Born in Germany, immigrated 1956. Speaks German with one staff member.",
      concerns: [],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "70", current: "72", isAbnormal: false }],
      clarify: [
        { question: "Activity engagement?", answer: "Knitting circle 3x/week. Tutors a younger resident in Continental knitting." },
        { question: "Family contact?", answer: "Granddaughter calls Sundays. Niece in Munich emails weekly." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "smile", text: "Tutored fellow resident at knitting circle." },
      { id: "t2", timeAgo: "2 HOURS AGO", period: "MORNING", icon: "smile", text: "Knitting circle started, working on baby blanket." },
      { id: "t3", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate full breakfast, took morning meds." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Wilhelmina is content and well — leading the knitting circle this morning." },
      { id: "m2", sender: "user", text: "Any concerns?" },
      { id: "m3", sender: "sage", text: "None today. Her next provider visit is in 2 weeks." }
    ]
  },
  {
    id: "28",
    name: "Bernard Achebe",
    age: 79, sex: "M", room: "233",
    acuity: "MONITORING",
    statusChips: [],
    image: residentImage(28),
    codeStatus: "Full Code",
    latest: "Anticoagulation INR 3.4, slightly elevated",
    careSteps: { surveillance: "active", reassessment: "pending", provider: "done" },
    situation: {
      summary: "On warfarin for AFib. Recent INR 3.4 (target 2-3). Held last dose, rechecking AM.",
      memory: "Retired physician. Educates staff on his own conditions.",
      concerns: [{ title: "INR Trending Up", status: "MONITORING", color: "amber" }],
      vitals: [{ label: "Heart Rate", icon: "activity", base: "78", current: "80", isAbnormal: false }],
      clarify: [
        { question: "INR trend?", answer: "Last week 2.6 then 2.9 then 3.4 today. Trending up over 3 draws." },
        { question: "Bleeding signs?", answer: "No bruising, no GI symptoms, no hematuria, gums clear." },
        { question: "Diet/med changes?", answer: "Started azithromycin 5 days ago for sinus infection — known interaction." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "check-circle", text: "Bedside skin/gum exam — no bleeding signs." },
      { id: "t2", timeAgo: "4 HOURS AGO", period: "MORNING", icon: "alert-circle", text: "Provider held warfarin pending re-check tomorrow." },
      { id: "t3", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "alert-circle", text: "INR 3.4, warfarin held.", interpretation: "Trending up from 2.6 last week." },
      { id: "t4", timeAgo: "5 DAYS AGO", period: "PRIOR", icon: "activity", text: "Started azithromycin for sinus infection.", interpretation: "Known warfarin interaction." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Bernard's INR is 3.4, trending up over 3 draws. Azithromycin started 5 days ago is the likely driver." },
      { id: "m2", sender: "user", text: "Any bleeding signs?" },
      { id: "m3", sender: "sage", text: "None. Gums, skin, urine all clear. Warfarin held, recheck scheduled tomorrow AM." },
      { id: "m4", sender: "user", text: "Notify pharmacy too." },
      { id: "m5", sender: "sage", text: "Pharmacy notified, they'll suggest a dose-resume calculation post-recheck." }
    ]
  },
  {
    id: "29",
    name: "Estelle Chamberlain",
    age: 86, sex: "F", room: "235A",
    acuity: "STABLE",
    statusChips: [],
    image: residentImage(29),
    codeStatus: "DNR",
    latest: "Stable, scheduled hair appointment today",
    careSteps: { surveillance: "done", reassessment: "done", provider: "done" },
    situation: {
      summary: "Pleasant. Looking forward to in-house salon visit. No concerns.",
      memory: "Former model in the 1960s. Particular about her appearance.",
      concerns: [],
      vitals: [{ label: "Blood Pressure", icon: "heart", base: "120/70", current: "118/72", isAbnormal: false }],
      clarify: [
        { question: "Activity engagement?", answer: "Booked salon visit at 1 PM. Picked out outfit and jewelry herself." },
        { question: "Family contact?", answer: "Daughter visits Saturdays. Always brings her favorite face cream." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "30 MIN AGO", period: "MORNING", icon: "smile", text: "Picked out a silk scarf for the salon visit." },
      { id: "t2", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "smile", text: "Excited for hair appt at 1 PM." },
      { id: "t3", timeAgo: "5 HOURS AGO", period: "MORNING", icon: "coffee", text: "Ate light breakfast, requested fresh berries." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Estelle is in great spirits — salon visit at 1 PM and she's already picked her outfit." },
      { id: "m2", sender: "user", text: "Anything to coordinate?" },
      { id: "m3", sender: "sage", text: "I'll ensure transport to the in-house salon and remind her aide about her preferred styling notes." }
    ]
  },
  {
    id: "30",
    name: "Solomon Kapoor",
    age: 77, sex: "M", room: "236B",
    acuity: "WATCHFUL",
    statusChips: ["NEW"],
    image: residentImage(30),
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
      clarify: [
        { question: "VTE prophylaxis?", answer: "On enoxaparin 40 mg daily and SCDs while in bed." },
        { question: "Pain control?", answer: "PCA morphine, currently 2 mg/hr basal + 1 mg q15min PRN. Pain 4/10." },
        { question: "Diet?", answer: "Vegetarian diet ordered, dietary aware. Tolerating soft foods well." }
      ]
    },
    timeline: [
      { id: "t1", timeAgo: "30 MIN AGO", period: "MORNING", icon: "thermometer", text: "Temp 99.1°, slight uptick.", interpretation: "Within post-op expected range, will trend." },
      { id: "t2", timeAgo: "1 HOUR AGO", period: "MORNING", icon: "activity", text: "PT eval at bedside, dangled at edge of bed." },
      { id: "t3", timeAgo: "4 HOURS AGO", period: "MORNING", icon: "check-circle", text: "Enoxaparin 40 mg administered, SCDs in place." },
      { id: "t4", timeAgo: "6 HOURS AGO", period: "MORNING", icon: "coffee", text: "Tolerated soft vegetarian breakfast, no nausea." }
    ],
    talk: [
      { id: "m1", sender: "sage", text: "Solomon's recovery is on the expected post-op trajectory. Temp ticked up to 99.1° this morning, within post-op range." },
      { id: "m2", sender: "user", text: "Pain control adequate?" },
      { id: "m3", sender: "sage", text: "PCA is meeting his needs — 4/10 with movement, 1/10 at rest. Daughter requested an evening update call." },
      { id: "m4", sender: "user", text: "Set the call for 6 PM." },
      { id: "m5", sender: "sage", text: "6 PM family update call added to delegate actions." }
    ]
  }
];

export function getResident(id: string) {
  return residents.find(r => r.id === id);
}
