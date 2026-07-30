/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectionTimetable } from "./timetableSem3";

export interface TimetableSem7Data {
  semester: string;
  effective_from: string;
  sections: {
    [sectionId: string]: SectionTimetable;
  };
}

export interface SectionOption {
  id: string;
  label: string;
}

export const SECTION_OPTIONS_SEM_7: SectionOption[] = [
  { id: "E1", label: "Section E1" },
  { id: "E5", label: "Section E5" },
  { id: "E7", label: "Section E7" },
  { id: "E8", label: "Section E8" },
  { id: "E9", label: "Section E9" },
  { id: "E10", label: "Section E10" },
];

// ── Sem 7 Subjects ────────────────────────────────────────────────────────────
export const DTU_CSE_SEM7_SUBJECTS: string[] = [
  "Cyber Vulnerability & Ethical Hacking - Theory",
  "Cloud Computing - Theory",
  "Advance Web Technology - Theory",
  "Advance Web Technology - Lab",
  "Big Data Analytics - Theory",
  "Big Data Analytics - Lab",
];

// ── Sem 7 Timetable Data ──────────────────────────────────────────────────────
// Sections: E1, E5 → no classes listed in source PDF
// E7 → CS411 Cyber Vulnerability, CS425 Cloud Computing
// E8 → CS421 Advance Web Technology (Theory + Lab)
// E9 → CS411 Cyber Vulnerability & Ethical Hacking
// E10 → CS421 Advance Web Technology + CS423 Big Data Analytics

export const TIMETABLE_SEM_7_DATA: TimetableSem7Data = {
  semester: "CO-VII Semester",
  effective_from: "27-07-2026",
  sections: {
    "E1": {
      room: "",
      timetable: {}, // No classes listed
    },
    "E5": {
      room: "",
      timetable: {}, // No classes listed
    },
    "E7": {
      room: "AB4-315",
      timetable: {
        MON: {
          "2-3": "TH-Cyber Vulnerability & Ethical Hacking CS411 [Dr. Indu Singh] [AB4-315]",
          "3-4": "TH-Cyber Vulnerability & Ethical Hacking CS411 [Col R Sreejeth] [AB4-404] / TH-Cloud Computing CS425 [Ms. N Mongara] [AB4-201]",
        },
        TUE: {
          "2-3": "TH-Cyber Vulnerability & Ethical Hacking CS411 [Dr. Indu Singh] [AB4-404]",
          "3-4": "Tutorial-Cyber Vulnerability & Ethical Hacking CS411 [Ms. Shrey Gupta] [AB4-404] / TH-Cloud Computing CS425 [Ms. N Mongara] [AB4-201]",
        },
        THUR: {
          "3-4": "TH-Cloud Computing CS425 [Ms. Anshika Jain] [AB4-416]",
        },
      },
    },
    "E8": {
      room: "AB4-404",
      timetable: {
        MON: {
          "10-12": "TH-Advance Web Technology CS421 [Ms. Adish Dabas] [AB4-404] / Lab-Advance Web Technology CS421-G1 [IS & CI Lab] / Lab-Advance Web Technology CS421-G2 [IS & CI Lab] / Lab-Advance Web Technology CS421-G3 [IOT Lab]",
        },
        TUE: {
          "10-12": "TH-Advance Web Technology CS421 [Ms. Jyoti Devi] [AB4-404] / Lab-Advance Web Technology CS421-G1 [IPM Lab] / Lab-Advance Web Technology CS421-G2 [IS & CI Lab] / Lab-Advance Web Technology CS421-G3 [IOT Lab]",
        },
        THUR: {
          "10-12": "TH-Advance Web Technology CS421 [Ms. Jyoti Devi] [AB4-404]",
        },
      },
    },
    "E9": {
      room: "AB4-404",
      timetable: {
        MON: {
          "12-2": "TH-Cyber Vulnerability & Ethical Hacking CS411 [Ms. Anshika Jain] [AB4-404]",
        },
        THUR: {
          "12-1": "Tutorial-Cyber Vulnerability & Ethical Hacking CS411 [Mr Shrey Gupta] [AB4-404]",
          "1-2": "Tutorial-Cyber Vulnerability & Ethical Hacking CS411 [Ms. Poonam Soni] [AB4-416]",
          "2-3": "TH-Cyber Vulnerability & Ethical Hacking CS411 [Ms. Anshika Jain] [AB4-404]",
          "3-4": "TH-Cyber Vulnerability & Ethical Hacking CS411 [Mr. Shashank Swaroop] [AB4-416]",
        },
      },
    },
    "E10": {
      room: "AB4-315",
      timetable: {
        TUE: {
          "12-2": "Lab-Advance Web Technology CS421-G1 [IOT Lab] / Lab-Advance Web Technology CS421-G2 [IOT Lab] / Lab-Advance Web Technology CS421-G3 [IPM Lab] / TH-Big Data Analytics CS423 [Dr. Amrita Sisodia] [AB4-404]",
          "2-3": "Tutorial-Cloud Computing CS425 [AB4-201]",
        },
        WED: {
          "2-3": "TH-Advance Web Technology CS421 [Ms. Deepika] [AB4-315] / TH-Big Data Analytics CS423 [Dr. Amrita Sisodia] [AB4-404]",
        },
        FRI: {
          "2-3": "TH-Advance Web Technology CS421 [Ms. Deepika] [AB4-404]",
          "3-4": "TH-Big Data Analytics CS423 [Ms. Reema Sachdeva] [AB4-416] / Lab-Big Data Analytics CS423-G1 [IOT Lab] / Lab-Big Data Analytics CS423-G2 [IOT Lab] / Lab-Big Data Analytics CS423-G3 [BDA Lab]",
        },
      },
    },
  },
};
