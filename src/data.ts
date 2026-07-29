/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, Assignment, TimetableSlot } from "./types";

import { DTU_CSE_SEM5_SUBJECTS } from "./data/timetableSem5";

// ── DTU CSE Subjects by Semester ─────────────────────────────────────────────
// NOTE: Add the real subject names for each semester below.
// These are used during onboarding and profile semester changes.
export const DTU_CSE_SUBJECTS: Record<number, string[]> = {
  1: [],
  2: [],
  3: [
    "Object Oriented Design - Theory",
    "Object Oriented Design - Lab",
    "Design & Analysis of Algorithm - Theory",
    "Design & Analysis of Algorithm - Lab",
    "Operating System Design - Theory",
    "Operating System Design - Lab",
    "Software Engineering - Theory",
    "Digital Logic Design - Theory",
    "Digital Logic Design - Lab",
  ],
  4: [],
  5: DTU_CSE_SEM5_SUBJECTS,
  6: [],
  7: [],
  8: [],
};

export const DTU_CSE_DA_SEM3_SUBJECTS: string[] = [
  "Design & Analysis of Algorithm (DAA) - Theory",
  "Design & Analysis of Algorithm (DAA) - Lab",
  "Foundation to Data Science - Theory",
  "Foundation to Data Science - Lab",
  "Linear Algebra - Theory",
  "Machine Learning - Theory",
  "Machine Learning - Lab",
  "Computer Organization & OS Design - Theory",
  "Computer Organization & OS Design - Lab",
];

// ── Helper: convert a list of subject name strings into Subject objects ───────
export const subjectNamestoSubjects = (names: string[]): Subject[] =>
  names.map((name, idx) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + idx,
    name,
    code: "",
    prof: "",
    time: "",
    room: "",
    attendanceCount: 0,
    totalClasses: 0,
    category: "Core" as Subject["category"],
    description: "",
    type: "LEC" as Subject["type"],
  }));

export const INITIAL_SUBJECTS: Subject[] = [];

export const INITIAL_ASSIGNMENTS: Assignment[] = [];
