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

// ── Helper to standardize base subject names across all pages ─────────────────
export const getStandardizedBaseName = (raw: string): string => {
  if (!raw) return "";
  const lower = raw.toLowerCase().trim();
  if (lower.includes("object oriented") || lower.includes("oop") || lower.includes("ood")) return "Object Oriented Design";
  if (lower.includes("algorithm") || lower.includes("daa")) return "Design & Analysis of Algorithm";
  if (lower.includes("digital logic") || lower.includes("digital electronics") || lower.includes("dld")) return "Digital Logic Design";
  if (lower.includes("operating system") || lower === "os") return "Operating System Design";
  if (lower.includes("software engineering") || lower === "se") return "Software Engineering";
  if (lower.includes("compiler design") || lower.includes("cd")) return "Compiler Design";
  if (lower.includes("machine learning") || lower.includes("ml")) return "Machine Learning";
  if (lower.includes("information and network security") || lower.includes("ins")) return "Information and Network Security";
  if (lower.includes("distributed system") || lower.includes("dis")) return "Distributed Systems";
  return raw;
};

export const getStandardizedSubjectName = (name: string): string => {
  if (!name) return "";
  const isLab = name.toLowerCase().includes("lab");
  const isTut = name.toLowerCase().includes("tutorial") || name.toLowerCase().includes("tut");

  const rawBase = name
    .replace(/ - (Theory|Lab|Tutorial|Tut)$/i, "")
    .replace(/ (Theory|Lab|Tutorial|Tut)$/i, "")
    .trim();
  const base = getStandardizedBaseName(rawBase);

  if (isLab) return `${base} - Lab`;
  if (isTut) return `${base} - Tutorial`;
  return `${base} - Theory`;
};

// ── Helper: convert a list of subject name strings into Subject objects ───────
export const subjectNamestoSubjects = (names: string[]): Subject[] =>
  names.map((name, idx) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + idx,
    name: getStandardizedSubjectName(name),
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
