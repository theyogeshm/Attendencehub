/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, Assignment, TimetableSlot } from "./types";

import { DTU_CSE_SEM1_SUBJECTS } from "./data/timetableSem1";
import { DTU_CSE_SEM5_SUBJECTS } from "./data/timetableSem5";
import { DTU_CSE_SEM7_SUBJECTS } from "./data/timetableSem7";

// ── DTU CSE Subjects by Semester ─────────────────────────────────────────────
// NOTE: Add the real subject names for each semester below.
// These are used during onboarding and profile semester changes.
export const DTU_CSE_SUBJECTS: Record<number, string[]> = {
  1: DTU_CSE_SEM1_SUBJECTS,
  2: [
    "Data Structure - Theory",
    "Data Structure - Lab",
    "Basic ML - Theory",
    "Basic ML - Lab",
    "Physics - Theory",
    "Physics - Lab",
    "Discrete Structure - Theory",
    "Discrete Structure - Tutorial",
    "Maths II - Theory",
    "Maths II - Tutorial",
  ],
  3: [
    "Object Oriented Design - Theory",
    "Object Oriented Design - Lab",
    "Design & Analysis of Algorithm - Theory",
    "Design & Analysis of Algorithm - Lab",
    "Operating System Design - Theory",
    "Operating System Design - Lab",
    "Software Engineering - Theory",
    "Software Engineering - Tutorial",
    "Digital Logic Design - Theory",
    "Digital Logic Design - Lab",
  ],
  4: [
    "Database Management System - Theory",
    "Database Management System - Lab",
    "Computer Communication Networks - Theory",
    "Computer Communication Networks - Lab",
    "Computer Organisation and Architecture - Theory",
    "Computer Organisation and Architecture - Lab",
    "Probability and Statistics - Theory",
    "Probability and Statistics - Tutorial",
    "Theory of Computation - Theory",
    "Theory of Computation - Tutorial",
  ],
  5: DTU_CSE_SEM5_SUBJECTS,
  6: [],
  7: DTU_CSE_SEM7_SUBJECTS,
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
  // Sem 1
  if (lower.includes("am101") || lower.includes("mathematics-i") || lower.includes("mathematics 1") || (lower.includes("mathematics i") && !lower.includes("ii") && !lower.includes("2"))) return "Mathematics-I";
  if (lower.includes("co101") || lower.includes("programming fundamentals")) return "Programming Fundamentals";
  if (lower.includes("ec101") || lower.includes("basic electronics")) return "Basic Electronics & Communication Engineering";
  if (lower.includes("me105") || lower.includes("engineering graphics")) return "Computer Aided Engineering Graphics-2";
  if (lower.includes("cs103") || lower.includes("web designing") || lower.includes("web design")) return "Web Designing";
  // Sem 2
  if (lower.includes("basic ml") || lower.includes("basics of ml") || lower.includes("cs106")) return "Basic ML";
  if (lower.includes("discrete structure") || lower.includes("discrete math") || lower.includes("co104") || lower.includes("cs104")) return "Discrete Structure";
  if (lower.includes("data structure") && !lower.includes("advance") && !lower.includes("daa") && !lower.includes("algorithm")) return "Data Structure";
  if (lower.includes("maths ii") || lower.includes("maths 2") || lower.includes("mathematics-ii") || lower.includes("mathematics ii") || lower.includes("mathematics 2") || lower.includes("am102")) return "Maths II";
  if (lower.includes("physics") || lower.includes("ap102") || lower.includes("ph102")) return "Physics";
  // Sem 3
  if (lower.includes("object oriented") || lower.includes("oop") || lower.includes("ood") || lower.includes("cs203")) return "Object Oriented Design";
  if (lower.includes("algorithm") || lower.includes("daa") || lower.includes("cs205") || lower.includes("da201")) return "Design & Analysis of Algorithm";
  if (lower.includes("digital logic") || lower.includes("digital electronics") || lower.includes("dld")) return "Digital Logic Design";
  if (lower.includes("operating system") || lower === "os" || lower.includes("cs207")) return "Operating System Design";
  if (lower.includes("software engineering") || lower === "se" || lower.includes("cs209")) return "Software Engineering";
  if (lower.includes("foundation to data science") || lower.includes("da203")) return "Foundation to Data Science";
  if (lower.includes("linear algebra") || lower.includes("da205")) return "Linear Algebra";
  if (lower.includes("computer organization & os design") || lower.includes("da209")) return "Computer Organization & OS Design";
  // Sem 4
  if (lower.includes("database management") || lower.includes("dbms") || lower.includes("co202") || lower.includes("cs202")) return "Database Management System";
  if (lower.includes("probability and statistics") || lower.includes("probability & statistics") || lower.includes("am202")) return "Probability and Statistics";
  if (lower.includes("theory of computation") || lower.includes("toc") || lower.includes("co204") || lower.includes("cs204")) return "Theory of Computation";
  if (lower.includes("computer communication networks") || lower.includes("ccn") || lower.includes("co206") || lower.includes("cs206")) return "Computer Communication Networks";
  if (lower.includes("computer organisation and architecture") || lower.includes("computer organization and architecture") || lower.includes("coa") || lower.includes("co208") || lower.includes("cs208")) return "Computer Organisation and Architecture";
  // Sem 5
  if (lower.includes("compiler design") || lower.includes("cd") || lower.includes("cs301")) return "Compiler Design";
  if ((lower.includes("machine learning") || lower.includes("ml") || lower.includes("cs303") || lower.includes("da207")) && !lower.includes("basic")) return "Machine Learning";
  if (lower.includes("information and network security") || lower.includes("ins") || lower.includes("cs305")) return "Information and Network Security";
  if (lower.includes("distributed system") || lower.includes("dis") || lower.includes("cs309")) return "Distributed Systems";
  if (lower.includes("information theory") || lower.includes("itc") || lower.includes("cs311")) return "Information Theory and Coding";
  if (lower.includes("quantum computing") || lower.includes("qc") || lower.includes("cs313")) return "Quantum Computing";
  if (lower.includes("advance data structure") || lower.includes("ads") || lower.includes("cs315")) return "Advance Data Structure";
  // Sem 7 & Electives
  if (lower.includes("cyber vulnerability") || lower.includes("ethical hacking") || lower.includes("cs411")) return "Cyber Vulnerability & Ethical Hacking";
  if (lower.includes("cloud computing") || lower.includes("cs425")) return "Cloud Computing";
  if (lower.includes("advance web technology") || (lower.includes("web technology") && !lower.includes("design")) || lower.includes("cs421")) return "Advance Web Technology";
  if (lower.includes("big data analytics") || lower.includes("big data") || lower.includes("cs423")) return "Big Data Analytics";
  if (lower.includes("humanities") || lower.includes("hu301")) return "Humanities Elective (EE HU301)";
  return raw;
};

// ── Helper: check if a subject has a lab component across ANY semester ────────
export const hasLabComponent = (name: string): boolean => {
  if (!name) return false;
  const base = getStandardizedBaseName(name);
  const lower = base.toLowerCase().trim();

  // Exclude subjects that genuinely have NO lab
  if (
    lower.includes("software engineering") ||
    lower.includes("mathematics") ||
    lower.includes("maths") ||
    lower.includes("discrete") ||
    lower.includes("probability") ||
    lower.includes("theory of computation") ||
    lower.includes("toc") ||
    lower.includes("linear algebra") ||
    lower.includes("distributed") ||
    lower.includes("information theory") ||
    lower.includes("quantum") ||
    lower.includes("advance data structure") ||
    lower.includes("humanities") ||
    lower.includes("hu301")
  ) {
    return false;
  }

  // Include subjects known to have a Lab
  return (
    // Sem 1
    lower.includes("programming fundamentals") ||
    lower.includes("co101") ||
    lower.includes("basic electronics") ||
    lower.includes("ec101") ||
    lower.includes("engineering graphics") ||
    lower.includes("me105") ||
    lower.includes("web designing") ||
    lower.includes("web design") ||
    lower.includes("cs103") ||
    // Sem 2
    (lower.includes("data structure") && !lower.includes("advance")) ||
    lower.includes("basic ml") ||
    lower.includes("physics") ||
    // Sem 3
    lower.includes("object oriented") ||
    lower.includes("oop") ||
    lower.includes("ood") ||
    lower.includes("operating system") ||
    lower === "os" ||
    lower.includes("algorithm") ||
    lower.includes("daa") ||
    lower.includes("digital logic") ||
    lower.includes("digital electronics") ||
    lower.includes("data science") ||
    lower.includes("computer organization") ||
    // Sem 4
    lower.includes("database") ||
    lower.includes("dbms") ||
    lower.includes("communication networks") ||
    lower.includes("ccn") ||
    lower.includes("computer organisation") ||
    lower.includes("coa") ||
    // Sem 5 & 7
    lower.includes("compiler") ||
    lower.includes("machine learning") ||
    lower.includes("network security") ||
    lower.includes("ins") ||
    lower.includes("cyber") ||
    lower.includes("ethical hacking") ||
    lower.includes("cloud computing") ||
    lower.includes("big data") ||
    lower.includes("advance web technology")
  );
};

// ── Helper: check if a subject has a tutorial component ────────────────────────
export const hasTutorialComponent = (name: string): boolean => {
  if (!name) return false;
  const base = getStandardizedBaseName(name);
  const lower = base.toLowerCase().trim();
  return (
    lower.includes("software engineering") ||
    lower.includes("mathematics") ||
    lower.includes("maths") ||
    lower.includes("discrete") ||
    lower.includes("probability") ||
    lower.includes("theory of computation") ||
    lower.includes("linear algebra") ||
    lower.includes("distributed") ||
    lower.includes("information theory") ||
    lower.includes("quantum") ||
    lower.includes("advance data structure")
  );
};

// ── Helper: expand a subject name into its constituent Theory and Lab/Tut names ─
export const expandSubjectName = (rawName: string): string[] => {
  if (!rawName) return [];
  const lower = rawName.toLowerCase().trim();
  if (lower.includes("theory") || lower.includes("lab") || lower.includes("tutorial") || lower.includes("tut") || lower.includes("lec")) {
    return [rawName];
  }
  const base = getStandardizedBaseName(rawName);
  if (hasLabComponent(base)) {
    return [`${base} - Theory`, `${base} - Lab`];
  }
  if (hasTutorialComponent(base)) {
    return [`${base} - Theory`, `${base} - Tutorial`];
  }
  return [`${base} - Theory`];
};

// ── Helper to determine which semester a subject belongs to ──────────────────
export const getSubjectSemester = (raw: string): number | null => {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();

  // Sem 1
  if (lower.includes("am101") || lower.includes("mathematics-i") || lower.includes("mathematics 1") || (lower.includes("mathematics i") && !lower.includes("ii") && !lower.includes("2"))) return 1;
  if (lower.includes("co101") || lower.includes("programming fundamentals")) return 1;
  if (lower.includes("ec101") || lower.includes("basic electronics")) return 1;
  if (lower.includes("me105") || lower.includes("engineering graphics")) return 1;
  if (lower.includes("cs103") || lower.includes("web designing") || lower.includes("web design")) return 1;

  // Sem 2
  if (lower.includes("basic ml") || lower.includes("basics of ml")) return 2;
  if (lower.includes("discrete structure") || lower.includes("discrete math")) return 2;
  if (lower.includes("data structure") && !lower.includes("advance") && !lower.includes("daa") && !lower.includes("algorithm")) return 2;
  if (lower.includes("maths ii") || lower.includes("maths 2") || lower.includes("mathematics ii") || lower.includes("mathematics-ii") || lower.includes("mathematics 2")) return 2;
  if (lower.includes("physics")) return 2;

  // Sem 3
  if (lower.includes("object oriented") || lower.includes("oop") || lower.includes("ood")) return 3;
  if (lower.includes("algorithm") || lower.includes("daa")) return 3;
  if (lower.includes("digital logic") || lower.includes("digital electronics") || lower.includes("dld")) return 3;
  if (lower.includes("operating system") || lower === "os") return 3;
  if (lower.includes("software engineering") || lower === "se") return 3;
  if (lower.includes("foundation to data science")) return 3;
  if (lower.includes("linear algebra")) return 3;

  // Sem 4
  if (lower.includes("database management") || lower.includes("dbms")) return 4;
  if (lower.includes("probability and statistics") || lower.includes("probability & statistics")) return 4;
  if (lower.includes("theory of computation") || lower.includes("toc")) return 4;
  if (lower.includes("computer communication networks") || lower.includes("ccn")) return 4;
  if (lower.includes("computer organisation and architecture") || lower.includes("computer organization and architecture") || lower.includes("coa")) return 4;

  // Sem 5
  if (lower.includes("compiler design") || lower.includes("cd")) return 5;
  if (lower.includes("machine learning") && !lower.includes("basic")) return 5;
  if (lower.includes("information and network security") || lower.includes("ins")) return 5;
  if (lower.includes("distributed system") || lower.includes("dis")) return 5;
  if (lower.includes("cyber vulnerability") || lower.includes("ethical hacking") || lower.includes("cs411")) return 5;
  if (lower.includes("cloud computing") || lower.includes("cs425")) return 5;
  if (lower.includes("advance web technology") || lower.includes("web technology") || lower.includes("cs421")) return 5;
  if (lower.includes("big data analytics") || lower.includes("big data") || lower.includes("cs423")) return 5;
  if (lower.includes("advance data structure")) return 5;
  if (lower.includes("information theory")) return 5;
  if (lower.includes("quantum computing")) return 5;

  // Sem 7
  if (DTU_CSE_SEM7_SUBJECTS && DTU_CSE_SEM7_SUBJECTS.some(s => lower.includes(s.toLowerCase().trim()))) return 7;

  return null;
};

// ── Check if a subject belongs to a specific semester ────────────────────────
export const isSubjectInSemester = (subjectName: string, semNum: number): boolean => {
  if (!subjectName) return false;
  // Strip any slot suffix e.g. " (10-11)" or room info
  const cleanName = subjectName.replace(/\s*\([^)]+\)$/, "").trim();
  const detectedSem = getSubjectSemester(cleanName);
  if (detectedSem !== null) {
    return detectedSem === semNum;
  }
  // Check predefined list for this semester
  const list = DTU_CSE_SUBJECTS[semNum] || [];
  const clean = cleanName.toLowerCase().trim();
  return list.some(s => {
    const item = s.toLowerCase().trim();
    return item === clean || clean.includes(item) || item.includes(clean);
  });
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

// ── Helper to parse semester number (handles "CO-VII Semester", "7th Semester", "VII", "7") ──
export const parseSemesterNumber = (semStr?: string): number => {
  if (!semStr) return 3;
  const s = String(semStr).toUpperCase().trim();
  if (s.includes("VIII") || s.includes("8")) return 8;
  if (s.includes("VII") || s.includes("7")) return 7;
  if (s.includes("VI") || s.includes("6")) return 6;
  if (s.includes("IV") || s.includes("4")) return 4;
  if (s.includes("V") || s.includes("5")) return 5;
  if (s.includes("III") || s.includes("3")) return 3;
  if (s.includes("II") || s.includes("2")) return 2;
  if (s.includes("I") || s.includes("1")) return 1;
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 3;
};
