## CRITICAL AGENT RULE - HIGHEST PRIORITY
Before writing a SINGLE line of code:
1. Open and read FEATURES.md completely
2. Find every feature marked [x] that your change touches
3. Your change must ONLY add - never remove existing behavior
4. If fixing bug A accidentally removes feature B, fix B first
5. After change, re-read FEATURES.md and verify every [x] 
   still works exactly as before
6. If any [x] feature breaks, revert and try again

NO EXCEPTIONS. Even for small 1-line fixes.

# DTU HUB / AttendanceHub — Feature Registry

This document lists all existing features in the project along with their status.

## Authentication & Session Management
- [x] Google OAuth Login via Supabase (`signInWithOAuth`) (working)
- [x] Session persistence via `localStorage` and `supabase.auth.getSession()` (working)
- [x] Auto-refresh JWT tokens (`autoRefreshToken: true`) (working)
- [x] Client-side rate-limiting on OAuth login attempts (max 5 per 10 minutes) (working)
- [x] 24-Hour idle session inactivity timeout monitoring (`startIdleTimer`) (working)
- [x] Secure Sign Out with confirmation dialog (`ConfirmDialog`) (working)

## Student Onboarding
- [x] Two-step Onboarding Modal for new users (`OnboardingModal.tsx`) (working)
- [x] Step 1: Branch selection (CSE / Other), Semester (1 to 8), Section, Roll Number input (working)
- [x] Step 2: Auto-filled CSE subject detection (Semesters 1–5) and custom subject management (working)
- [x] Profile & subject persistence to Supabase `profiles` table and local session cache (working)

## Dashboard (`DashboardPage.tsx`)
- [x] Overall Attendance percentage stat card with progress bar (working)
- [x] Pending Tasks counter with direct link to Assignments tab (working)
- [x] Next Class widget calculating first unmarked class today or showing "All Done" status (working)
- [x] Today's Class Schedule Cards with Present, Absent, Miss, Leave buttons (working)
- [x] Instant 0ms status updates for Present, Absent, Miss, Leave, Clear (working)
- [x] Automatic Card Re-ordering: marked cards move to bottom, unmarked stay at top (working)
- [x] Mini Calendar widget with month navigation (Prev/Next) and today highlight (working)
- [x] Past Date Attendance Log Modal trigger from Mini Calendar clicks (working)
- [x] Timetable preview section (working)

## Attendance Management (`AttendancePage.tsx`)
- [x] Overall Attendance Summary (Total Attended, Total Held, Aggregate %) (working)
- [x] Target attendance threshold selector (75%, 80%, 85%, 90%) (working)
- [x] Dynamic calculation of classes required to reach target / classes allowed to miss (working)
- [x] Component Filter Tabs (All, Theory, Lab, Tutorial) (working)
- [x] Unified Subject Cards grouping Theory, Lab, and Tutorial components (working)
- [x] Manual attendance adjustment buttons: Present (+1/+1), Absent (+0/+1), Undo (-1/-1), Extra (+1/+0) (working)
- [x] Isolated manual attendance adjustments using unique timestamp identifiers separate from today's dashboard status (working)
- [x] Detailed Subject Attendance History Modal (working)
- [x] Bulk Attendance actions (Mark all present / absent for today) (working)

## Calendar Attendance Log Modal
- [x] Date-specific scheduled class list modal for past dates (working)
- [x] P / A / M / L buttons to mark/unmark attendance for specific dates (working)
- [x] Instant 0ms local status update and background Supabase sync (working)
- [x] Record deletion for specific date entries (working)
- [x] Synchronized real-time state across Dashboard, Attendance Page, Analytics, and Calendar (Dashboard tracks today's date attendance, Attendance Page tracks total count across all dates) (working)

## Timetable (`TimetablePage.tsx`)
- [x] Semester 1 official timetable grid (`timetableSem1.ts`) (working)
- [x] Semester 3 official timetable grid (`timetableSem3.ts`) (working)
- [x] Semester 5 official timetable grid (`timetableSem5.ts`) (working)
- [x] Semester 7 official timetable grid (`timetableSem7.ts`) (working)
- [ ] Semesters 2, 4, 6, 8 official timetables (broken/incomplete — awaiting official release)
- [x] View Mode Switcher: Full Week Grid vs Day-by-Day View (working)
- [x] Lab Group Filter (All, G1, G2, G3) (working)
- [x] Timetable Search bar (filtering by subject, code, teacher, room) (working)
- [x] Real-time Supabase custom admin timetable overrides subscription (`timetable` table) (working)

## Academic Resources (`ResourcesPage.tsx` & `SubjectResourcesPage.tsx`)
- [x] Subject Resources Grid with search filtering (working)
- [x] Dedicated Subject Resource Page route (`/resources/:subjectName`) (working)
- [x] Dynamic Resource Tabs loaded from Supabase `resources` table (PYQs, Notes, Labs, Tutorials, Assignments, Videos) (working)
- [x] Year-grouped PYQ display (working)
- [x] Video Lecture YouTube Embed integration (working)
- [x] File download and external link navigation (working)

## Assignments Tracker (`AssignmentsPage.tsx`)
- [x] Add new assignment with title, subject, due date, description (working)
- [x] Dynamic Task Status indicators (COMPLETED, URGENT, UPCOMING) (working)
- [x] Filter Tabs (All, Pending, Overdue) (working)
- [x] Search bar for assignment filtering (working)
- [x] Checkbox toggle for completed status (working)
- [x] Delete assignment with confirmation dialog (working)

## Academic Analytics (`AnalyticsPage.tsx`)
- [x] Subject Attendance Overview Bar Chart with 75% threshold line (working)
- [x] Visual status indicators (Safe vs Danger < 75%) (working)
- [x] Danger Zone summary listing subjects below 75% and exact classes needed (working)
- [x] "What-If" Attendance Simulator (simulating attendance percentage after N future classes) (working)

## Admin Panel (`AdminPanel.tsx`)
- [x] Restricted route (`/admin`) gated by `isAdminEmail()` (working)
- [x] Resource Management: Add/delete study materials in Supabase `resources` table (working)
- [x] Timetable Management: Custom admin slot editor for Semesters 1–8 (working)
- [x] Subject Management: Custom subject list editor per semester (working)
- [x] SQL Setup script display for Supabase configuration (working)

## User Profile, Security & UI Settings
- [x] Profile Drawer / Modal displaying student details (Name, Roll No, Branch, Semester, Section) (working)
- [x] Edit Profile functionality with semester change subject migration (working)
- [x] Dark / Light Mode theme toggle with persistent storage (working)
- [x] User Feedback Modal submitting to Supabase (working)
- [x] Confirmation Dialog component for destructive actions (`ConfirmDialog.tsx`) (working)
- [x] Application-level security utilities (rate limiting, input sanitization, URL sanitization) (working)

## Navigation & Fallbacks
- [x] Single-page React Router navigation (`/dashboard`, `/attendance`, `/resources`, `/assignments`, `/timetable`, `/analytics`, `/admin`) (working)
- [x] Mobile responsive drawer sidebar and top header (working)
- [x] Generic 404 Not Found page (`NotFoundPage.tsx`) (working)

---
## AGENT RULES - READ BEFORE EVERY CHANGE
1. Read this file completely before touching any code
2. Identify which features your change could affect
3. Make MINIMAL surgical changes only - never rewrite whole files
4. Never touch unrelated components
5. After every change verify affected features still work
6. Update this file when adding new features
7. If unsure about impact - ASK before changing

This file is the source of truth for this project.
