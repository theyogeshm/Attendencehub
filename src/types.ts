/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Subject {
  id: string;
  name: string;
  code: string;
  prof: string;
  time: string;
  room: string;
  attendanceCount: number;
  totalClasses: number;
  category: "Core" | "Applied" | "Theoretical" | "Core CS" | "Common" | "Advanced";
  description: string;
  type?: "LEC" | "LAB"; // LEC = lecture, LAB = lab
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  dueDate: string; // "Due in 4 hours" or "Oct 24, 2023" or YYYY-MM-DD
  status: "URGENT" | "UPCOMING" | "COMPLETED";
}

export interface TimetableSlot {
  day: "MON" | "TUE" | "WED" | "THU" | "FRI";
  timeSlot: string; // e.g. "08:00 - 09:00"
  subjectName: string;
  room: string;
  colSpan?: number;
  specialColor?: string; // "primary", "secondary", "error" etc.
  isLunch?: boolean;
  type?: "LEC" | "LAB";
}

export type AttendanceStatus = "present" | "absent" | "miss" | "leave" | "clear";
