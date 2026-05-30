/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, Assignment, TimetableSlot } from "./types";

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: "maths",
    name: "Mathematics IV",
    code: "LHC-202",
    prof: "Prof. Sharma",
    time: "02:00 PM - 03:00 PM",
    room: "LHC-202",
    attendanceCount: 18,
    totalClasses: 22,
    category: "Core",
    description: "Complex Analysis, Probability Theory, and Numerical Methods.",
    type: "LEC",
  },
  {
    id: "physics",
    name: "Engineering Physics",
    code: "LHC-201",
    prof: "Dr. Verma",
    time: "02:00 PM - 04:00 PM",
    room: "LHC-201",
    attendanceCount: 13,
    totalClasses: 20,
    category: "Applied",
    description: "Electromagnetism, Quantum Mechanics and Statistical Physics.",
    type: "LEC",
  },
  {
    id: "discrete",
    name: "Discrete Maths",
    code: "LHC-102",
    prof: "Prof. Gupta",
    time: "08:00 AM - 10:00 AM",
    room: "LHC-102",
    category: "Theoretical",
    attendanceCount: 15,
    totalClasses: 21,
    description: "Set Theory, Graph Theory, Combinatorics, and Logic.",
    type: "LEC",
  },
  {
    id: "ds",
    name: "Data Structures",
    code: "LHC-301",
    prof: "Prof. Mehta",
    time: "01:00 PM - 03:00 PM",
    room: "LHC-301",
    category: "Core CS",
    attendanceCount: 19,
    totalClasses: 23,
    description: "Stacks, Queues, Trees, Graphs, and Advanced Algorithms.",
    type: "LEC",
  },
  {
    id: "evs",
    name: "EVS",
    code: "Seminar Hall",
    prof: "Dr. Joshi",
    time: "08:00 AM - 10:00 AM",
    room: "Seminar Hall",
    category: "Common",
    attendanceCount: 12,
    totalClasses: 16,
    description: "Environmental Science, Ecology, and Sustainable Development.",
    type: "LEC",
  },
  {
    id: "ml",
    name: "Basic ML",
    code: "LHC-104",
    prof: "Prof. Singh",
    time: "12:00 PM - 01:00 PM",
    room: "LHC-104",
    category: "Advanced",
    attendanceCount: 22,
    totalClasses: 26,
    description: "Regression, Classification, and Introduction to Neural Networks.",
    type: "LEC",
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "assign-1",
    title: "Data Structures Lab Report",
    description: "Complete the implementation of AVL Trees and submit lab report with complexity analysis.",
    subjectId: "ds",
    subjectName: "Data Structures",
    dueDate: "Due in 4 hours",
    status: "URGENT",
  },
  {
    id: "assign-2",
    title: "Discrete Maths Problem Set",
    description: "Solve 10 problems on graph theory and submit hand-written solutions.",
    subjectId: "discrete",
    subjectName: "Discrete Maths",
    dueDate: "Due: 2026-05-31",
    status: "UPCOMING",
  },
  {
    id: "assign-3",
    title: "Physics Lab Experiment",
    description: "Newton's Ring experiment — record observations and submit with diagram.",
    subjectId: "physics",
    subjectName: "Engineering Physics",
    dueDate: "Submitted 2 days ago",
    status: "COMPLETED",
  },
  {
    id: "assign-4",
    title: "ML Assignment 1 — Linear Regression",
    description: "Implement linear regression from scratch in Python and analyse on Boston housing dataset.",
    subjectId: "ml",
    subjectName: "Basic ML",
    dueDate: "Due: 2026-06-02",
    status: "UPCOMING",
  },
];

// ─── TIMETABLE: Matches dtuhub.js blueprint schedule ───────────────────────
// MO: Discrete(8-10), Data Lab(12-2), Physics(2-4)
// TU: EVS(8-10), Discrete(10-11), Physics Lab(12-2), Maths(2-3)
// WE: Maths(10-11), Physics(12-1), Data(1-3)
// TH: Data(10-11), Maths(1-3)
// FR: Discrete(10-11), Basic ML(12-1), Basic ML Lab(2-4)

export const TIMETABLE_SLOTS: TimetableSlot[] = [
  // ── MONDAY ──
  { day: "MON", timeSlot: "08:00 - 09:00", subjectName: "Discrete Maths", room: "LHC-102", type: "LEC", specialColor: "primary", colSpan: 2 },
  // 09:00 skipped (colSpan 2 from 08-10)
  { day: "MON", timeSlot: "10:00 - 11:00", subjectName: "Free Slot", room: "" },
  { day: "MON", timeSlot: "11:00 - 12:00", subjectName: "Free Slot", room: "" },
  { day: "MON", timeSlot: "12:00 - 01:00", subjectName: "LUNCH", room: "", isLunch: true },
  { day: "MON", timeSlot: "01:00 - 02:00", subjectName: "Data Structures Lab", room: "Lab-A", type: "LAB", specialColor: "secondary", colSpan: 2 },
  // 02:00 skipped (colSpan 2 from 1-3)
  { day: "MON", timeSlot: "03:00 - 04:00", subjectName: "Engineering Physics", room: "LHC-201", type: "LEC", specialColor: "primary", colSpan: 2 },
  // 04:00 would be end

  // ── TUESDAY ──
  { day: "TUE", timeSlot: "08:00 - 09:00", subjectName: "EVS", room: "Seminar Hall", type: "LEC", specialColor: "primary", colSpan: 2 },
  // 09:00 skipped
  { day: "TUE", timeSlot: "10:00 - 11:00", subjectName: "Discrete Maths", room: "LHC-102", type: "LEC" },
  { day: "TUE", timeSlot: "11:00 - 12:00", subjectName: "Free Slot", room: "" },
  { day: "TUE", timeSlot: "12:00 - 01:00", subjectName: "LUNCH", room: "", isLunch: true },
  { day: "TUE", timeSlot: "01:00 - 02:00", subjectName: "Physics Lab", room: "Lab-C", type: "LAB", specialColor: "secondary", colSpan: 2 },
  // 02:00 skipped
  { day: "TUE", timeSlot: "03:00 - 04:00", subjectName: "Mathematics IV", room: "LHC-202", type: "LEC" },

  // ── WEDNESDAY ──
  { day: "WED", timeSlot: "08:00 - 09:00", subjectName: "Free Slot", room: "" },
  { day: "WED", timeSlot: "09:00 - 10:00", subjectName: "Free Slot", room: "" },
  { day: "WED", timeSlot: "10:00 - 11:00", subjectName: "Mathematics IV", room: "LHC-202", type: "LEC", specialColor: "primary" },
  { day: "WED", timeSlot: "11:00 - 12:00", subjectName: "Free Slot", room: "" },
  { day: "WED", timeSlot: "12:00 - 01:00", subjectName: "Engineering Physics", room: "LHC-201", type: "LEC" },
  { day: "WED", timeSlot: "01:00 - 02:00", subjectName: "Data Structures", room: "LHC-301", type: "LEC", specialColor: "secondary", colSpan: 2 },
  // 02:00 skipped
  { day: "WED", timeSlot: "03:00 - 04:00", subjectName: "Free Slot", room: "" },

  // ── THURSDAY ──
  { day: "THU", timeSlot: "08:00 - 09:00", subjectName: "Free Slot", room: "" },
  { day: "THU", timeSlot: "09:00 - 10:00", subjectName: "Free Slot", room: "" },
  { day: "THU", timeSlot: "10:00 - 11:00", subjectName: "Data Structures", room: "LHC-301", type: "LEC" },
  { day: "THU", timeSlot: "11:00 - 12:00", subjectName: "Free Slot", room: "" },
  { day: "THU", timeSlot: "12:00 - 01:00", subjectName: "LUNCH", room: "", isLunch: true },
  { day: "THU", timeSlot: "01:00 - 02:00", subjectName: "Mathematics IV", room: "LHC-202", type: "LEC", specialColor: "primary", colSpan: 2 },
  // 02:00 skipped
  { day: "THU", timeSlot: "03:00 - 04:00", subjectName: "Free Slot", room: "" },

  // ── FRIDAY ──
  { day: "FRI", timeSlot: "08:00 - 09:00", subjectName: "Free Slot", room: "" },
  { day: "FRI", timeSlot: "09:00 - 10:00", subjectName: "Free Slot", room: "" },
  { day: "FRI", timeSlot: "10:00 - 11:00", subjectName: "Discrete Maths", room: "LHC-102", type: "LEC" },
  { day: "FRI", timeSlot: "11:00 - 12:00", subjectName: "Free Slot", room: "" },
  { day: "FRI", timeSlot: "12:00 - 01:00", subjectName: "Basic ML", room: "LHC-104", type: "LEC" },
  { day: "FRI", timeSlot: "01:00 - 02:00", subjectName: "LUNCH", room: "", isLunch: true },
  { day: "FRI", timeSlot: "02:00 - 03:00", subjectName: "Basic ML Lab", room: "Lab-B", type: "LAB", specialColor: "secondary", colSpan: 2 },
  // 03:00 skipped
];

// ── Maps subject name → subject id (for attendance marking from timetable) ──
export const SUBJECT_NAME_TO_ID: Record<string, string> = {
  "Mathematics IV": "maths",
  "Engineering Physics": "physics",
  "Discrete Maths": "discrete",
  "Data Structures": "ds",
  "Data Structures Lab": "ds",
  "EVS": "evs",
  "Basic ML": "ml",
  "Basic ML Lab": "ml",
  "Physics Lab": "physics",
};
