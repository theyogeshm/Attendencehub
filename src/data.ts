/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, Assignment, TimetableSlot } from "./types";

// ── DTU CSE Subjects by Semester ─────────────────────────────────────────────
// NOTE: Add the real subject names for each semester below.
// These are used during onboarding and profile semester changes.
export const DTU_CSE_SUBJECTS: Record<number, string[]> = {
  1: [],
  2: [],
  3: [
    "Object Oriented Programming (OOP) - Theory",
    "Object Oriented Programming (OOP) - Lab",
    "Algorithm Design and Analysis (DAA) - Theory",
    "Algorithm Design and Analysis (DAA) - Lab",
    "Operating System Design (OS) - Theory",
    "Operating System Design (OS) - Lab",
    "Software Engineering (SE) - Theory",
    "Software Engineering (SE) - Lab",
    "Software Engineering (SE) - Tutorial",
    "Digital Electronics - Theory",
    "Digital Electronics - Lab",
  ],
  4: [],
  5: [],
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
