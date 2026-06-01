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
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
};

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
