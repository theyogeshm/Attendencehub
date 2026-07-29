/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Subject, Assignment, AttendanceStatus } from "./types";
import { INITIAL_SUBJECTS, INITIAL_ASSIGNMENTS, subjectNamestoSubjects, DTU_CSE_SUBJECTS } from "./data";
import dtuData from "../dtu_subjects.json";
import OnboardingModal from "./components/OnboardingModal";
import { supabase } from "./lib/supabase";
import type { User } from "@supabase/supabase-js";
import { safeLocalStorageGet, sanitizeText, checkRateLimit, FIELD_LIMITS, startIdleTimer, clearIdleTimer, isAdminEmail } from "./lib/security";

// Sub-page components
import DashboardPage from "./components/DashboardPage";
import AttendancePage from "./components/AttendancePage";
import ResourcesPage from "./components/ResourcesPage";
import SubjectResourcesPage from "./components/SubjectResourcesPage";
import AssignmentsPage from "./components/AssignmentsPage";
import TimetablePage from "./components/TimetablePage";
import AnalyticsPage from "./components/AnalyticsPage";
import LoginPage from "./components/LoginPage";
import ConfirmDialog from "./components/ConfirmDialog";
import AdminPanel from "./components/AdminPanel";
import NotFoundPage from "./components/NotFoundPage";
import { TIMETABLE_SEM_3_DATA, parseTimetableEntry } from "./data/timetableSem3";
import { TIMETABLE_SEM_5_DATA, convertSem5SlotToString } from "./data/timetableSem5";

import {
  Sun,
  Moon,
  Bell,
  Search,
  X,
  MessageSquare,
  Save,
  Edit2,
  LogOut,
  Trash2,
} from "lucide-react";

// ── Profile type ───────────────────────────────────────────────────────────
interface StudentProfile {
  name: string;
  rollNo: string;
  branch: string;
  semester: string;
  section: string;
}

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);
  const [initialAuthDone, setInitialAuthDone] = useState(false);

  // Cache key for profile + subjects + assignments snapshot
  const SESSION_CACHE_KEY = 'DTU_HUB_SESSION_CACHE';

  // Start with NO loading screen if we already have a cached session.
  // This runs synchronously before the first render so returning users
  // never see the spinner at all.
  const [authLoading, setAuthLoading] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(SESSION_CACHE_KEY);
      if (raw) { JSON.parse(raw); return false; } // cache hit → skip spinner
    } catch { /* ignore bad cache */ }
    return true; // no cache → show spinner (first-ever login)
  });

  // ── Navigation ────────────────────────────────────────────────────────────
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split("/")[1] || "dashboard";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Live persistent states ────────────────────────────────────────────────
  // safeLocalStorageGet guards against corrupted/tampered data in localStorage
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    safeLocalStorageGet<Subject[]>("ATTENDANCE_HUB_SUBJECTS", INITIAL_SUBJECTS)
  );

  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    safeLocalStorageGet<Assignment[]>("ATTENDANCE_HUB_ASSIGNMENTS", INITIAL_ASSIGNMENTS)
  );

  // ── Dark / Light Mode ─────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("ATTENDANCE_HUB_THEME");
    return saved !== "light";
  });

  // ── Global search ─────────────────────────────────────────────────────────
  const [globalSearch, setGlobalSearch] = useState<string>("");

  // ── Profile ───────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<StudentProfile>(() =>
    safeLocalStorageGet<StudentProfile>("ATTENDANCE_HUB_PROFILE", {
      name: "Student",
      rollNo: "2K24/CSE/01",
      branch: "Computer Science & Engineering",
      semester: "3rd Semester",
      section: "A3",
    })
  );

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAttendanceLogModal, setShowAttendanceLogModal] = useState(false);
  const [attendanceLogDate, setAttendanceLogDate] = useState<number | null>(null);
  const [attendanceLogDateStr, setAttendanceLogDateStr] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // ── Per-date attendance log state (never uses global subjects) ────────────
  interface LogEntry {
    subjectId: string;
    subjectName: string;
    attendanceCount: number;
    totalClasses: number;
    subjectType?: string;
    status?: string; // "present" | "absent" | "miss" | "leave" | undefined
  }
  const [logSubjects, setLogSubjects] = useState<LogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  // ── Onboarding ────────────────────────────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ── Confirm dialogs ───────────────────────────────────────────────────────
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmResetAttendance, setConfirmResetAttendance] = useState(false);
  const [confirmDeleteLog, setConfirmDeleteLog] = useState<{ subjectName: string } | null>(null);

  // ── Toast notification ────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Today's attendance status per subject (dashboard button highlights) ────
  const [todayAttendance, setTodayAttendance] = useState<Record<string, AttendanceStatus>>({});

  // ── Profile editing state ─────────────────────────────────────────────────
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfile, setEditProfile] = useState<StudentProfile>(profile);

  // ── Feedback form ─────────────────────────────────────────────────────────
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");

  // ── Sync localStorage ─────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("ATTENDANCE_HUB_SUBJECTS", JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem("ATTENDANCE_HUB_ASSIGNMENTS", JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem("ATTENDANCE_HUB_PROFILE", JSON.stringify(profile)); }, [profile]);
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark"); root.classList.remove("light");
      localStorage.setItem("ATTENDANCE_HUB_THEME", "dark");
    } else {
      root.classList.remove("dark"); root.classList.add("light");
      localStorage.setItem("ATTENDANCE_HUB_THEME", "light");
    }
  }, [isDarkMode]);

  // ── Auth: listen to session changes ───────────────────────────────────────
  useEffect(() => {
    let stopIdleTimer: (() => void) | null = null;

    const doSignOut = async () => {
      clearIdleTimer();
      if (stopIdleTimer) { stopIdleTimer(); stopIdleTimer = null; }
      await supabase.auth.signOut();
      localStorage.clear(); // wipe all app data on idle expiry
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setInitialAuthDone(true);
      if (u) {
        // If we have a valid cache for THIS user, skip the loading screen
        // and do a silent background refresh instead
        const cached = safeLocalStorageGet<{ userId?: string } | null>(SESSION_CACHE_KEY, null);
        const hasCacheForUser = cached?.userId === u.id;
        loadUserData(u, hasCacheForUser /* backgroundRefresh */);
        stopIdleTimer = startIdleTimer(doSignOut);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setInitialAuthDone(true);
      if (u) {
        const cached = safeLocalStorageGet<{ userId?: string } | null>(SESSION_CACHE_KEY, null);
        const hasCacheForUser = cached?.userId === u.id;
        loadUserData(u, hasCacheForUser);
        if (stopIdleTimer) stopIdleTimer();
        stopIdleTimer = startIdleTimer(doSignOut);
      } else {
        if (stopIdleTimer) { stopIdleTimer(); stopIdleTimer = null; }
        setAuthLoading(false);
        setSubjects(INITIAL_SUBJECTS);
        setAssignments(INITIAL_ASSIGNMENTS);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (stopIdleTimer) stopIdleTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load user data from Supabase ──────────────────────────────────────────
  // backgroundRefresh=true → cache already applied, don't show loading screen,
  //                          just quietly update state when fetch completes.
  const loadUserData = async (u: User, backgroundRefresh = false) => {
    // ── Step 1: apply cached data instantly (zero-latency render) ─────────────
    if (backgroundRefresh) {
      try {
        const raw = localStorage.getItem(SESSION_CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (cached.userId === u.id) {
            if (cached.profile)     setProfile(cached.profile);
            if (cached.subjects)    setSubjects(cached.subjects);
            if (cached.assignments) setAssignments(cached.assignments);
            if (cached.onboardingDone === false) {
              setShowOnboarding(true);
              setAuthLoading(false);
              return; // still need onboarding — don't fetch in background
            }
          }
        }
      } catch { /* ignore bad cache */ }
      // Don't show loading screen — data already rendered from cache
    } else {
      setAuthLoading(true);
    }

    // ── Step 2: fetch fresh data with a 3-second timeout ──────────────────────
    const TIMEOUT_MS = 3000;
    const timeout = new Promise<'timeout'>(resolve => setTimeout(() => resolve('timeout'), TIMEOUT_MS));

    try {
      // 1. Fetch profile — gated on onboarding_done
      const profileFetch = supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      const profileResult = await Promise.race([profileFetch, timeout]);

      // If timed out and we already rendered from cache, just give up quietly
      if (profileResult === 'timeout') {
        setAuthLoading(false);
        return;
      }

      const { data: pData } = profileResult as Awaited<typeof profileFetch>;

      if (pData) {
        const freshProfile: StudentProfile = {
          name:     pData.full_name  || u.user_metadata?.full_name || "Student",
          rollNo:   pData.roll_no    || "2K24/---/---",
          branch:   pData.branch     || "Computer Science & Engineering",
          semester: pData.semester   || "2nd Semester",
          section:  pData.section    || "1",
        };
        setProfile(freshProfile);

        const hasSubjects = pData.subjects && Array.isArray(pData.subjects) && pData.subjects.length > 0;
        if (pData.onboarding_done === false && !hasSubjects) {
          setShowOnboarding(true);
          setAuthLoading(false);
          // Cache minimal state so next load knows onboarding is pending
          try {
            localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
              userId: u.id,
              profile: freshProfile,
              subjects: [],
              assignments: [],
              onboardingDone: false,
            }));
          } catch { /* ignore */ }
          return;
        }

      } else {
        // Brand new user — create profile row, trigger onboarding
        const displayName = u.user_metadata?.full_name || u.email?.split("@")[0] || "Student";
        await supabase.from("profiles").insert({
          id:              u.id,
          email:           u.email,
          full_name:       displayName,
          avatar_url:      u.user_metadata?.avatar_url ?? null,
          onboarding_done: false,
        });
        setProfile(prev => ({ ...prev, name: displayName }));
        setShowOnboarding(true);
        setAuthLoading(false);
        return;
      }

      // 2 & 3. Fetch Attendance and Assignments IN PARALLEL (also with timeout)
      const parallelFetch = Promise.all([
        supabase.from("attendance").select("*").eq("user_id", u.id),
        supabase.from("assignments").select("*").eq("user_id", u.id).order("created_at", { ascending: false })
      ]);
      const parallelResult = await Promise.race([parallelFetch, timeout]);

      // Timed out — use whatever is in state (from cache) and stop loading
      if (parallelResult === 'timeout') {
        setAuthLoading(false);
        return;
      }

      const [attRes, asgRes] = parallelResult as Awaited<typeof parallelFetch>;
      const attData = attRes.data;

      // Merge subjects with attendance aggregates
      let resolvedSubjects: Subject[] = [];
      if (pData.subjects && Array.isArray(pData.subjects) && pData.subjects.length > 0) {
        let expandedSubjectsList: string[] = [];
        for (const name of pData.subjects) {
          const lower = name.toLowerCase().trim();
          if (lower.includes("theory") || lower.includes("lab")) {
            expandedSubjectsList.push(name);
          } else if (lower.includes("operating system") || lower === "os") {
            expandedSubjectsList.push("Operating System Design - Theory", "Operating System Design - Lab");
          } else if (lower.includes("algorithm") || lower.includes("daa")) {
            expandedSubjectsList.push("Design & Analysis of Algorithm - Theory", "Design & Analysis of Algorithm - Lab");
          } else if (lower.includes("object oriented") || lower.includes("oop") || lower.includes("ood")) {
            expandedSubjectsList.push("Object Oriented Design");
          } else if (lower.includes("software engineering") || lower.includes("se")) {
            expandedSubjectsList.push("Software Engineering");
          } else if (lower.includes("digital logic") || lower.includes("digital electronics") || lower.includes("dld")) {
            expandedSubjectsList.push("Digital Logic Design - Theory", "Digital Logic Design - Lab");
          } else {
            expandedSubjectsList.push(name);
          }
        }
        expandedSubjectsList = Array.from(new Set(expandedSubjectsList));
        const baseSubjects = subjectNamestoSubjects(expandedSubjectsList);

        if (attData && attData.length > 0) {
          const agg: Record<string, { attendance_count: number; total_classes: number }> = {};
          for (const row of attData) {
            const key = (row.subject ?? "").toLowerCase().trim();
            if (!key) continue;
            if (!agg[key]) agg[key] = { attendance_count: 0, total_classes: 0 };
            const s = (row.status ?? "").toLowerCase();
            if (s !== "leave") agg[key].total_classes += 1;
            if (s === "present") agg[key].attendance_count += 1;
          }
          const merged = baseSubjects.map(sub => {
            const key = sub.name.toLowerCase().trim();
            const saved = agg[key];
            return saved
              ? { ...sub, attendanceCount: saved.attendance_count, totalClasses: saved.total_classes }
              : { ...sub, attendanceCount: 0, totalClasses: 0 };
          });
          setSubjects(merged);
          resolvedSubjects = merged;
        } else {
          const withZeros = baseSubjects.map(s => ({ ...s, attendanceCount: 0, totalClasses: 0 }));
          setSubjects(withZeros);
          resolvedSubjects = withZeros;
        }
      }

      fetchTodayAttendance(u, resolvedSubjects);

      // Process assignments
      const asgData = asgRes.data;
      const dummyTitles = [
        "Data Structures Lab Report",
        "Discrete Maths Problem Set",
        "Physics Lab Experiment",
        "ML Assignment 1 — Linear Regression"
      ];
      let freshAssignments: Assignment[] = [];
      if (asgData && asgData.length > 0) {
        const validAsgData = asgData.filter(a => {
          if (dummyTitles.includes(a.title)) {
            supabase.from("assignments").delete().eq("id", a.id).then(() => {});
            return false;
          }
          return true;
        });
        if (validAsgData.length > 0) {
          freshAssignments = validAsgData.map(a => ({
            id:          a.id,
            title:       a.title,
            description: a.description,
            subject:     a.subject,
            dueDate:     a.due_date,
            done:        a.done,
          }));
          setAssignments(freshAssignments);
        } else {
          setAssignments([]);
        }
      }

      // ── Step 3: persist fresh snapshot to cache ────────────────────────────
      try {
        const freshProfile: StudentProfile = {
          name:     pData.full_name  || u.user_metadata?.full_name || "Student",
          rollNo:   pData.roll_no    || "2K24/---/---",
          branch:   pData.branch     || "Computer Science & Engineering",
          semester: pData.semester   || "2nd Semester",
          section:  pData.section ? (pData.section.toUpperCase().startsWith("A") ? pData.section.toUpperCase() : `A${pData.section}`) : "A3",
        };
        localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
          userId:         u.id,
          profile:        freshProfile,
          subjects:       resolvedSubjects,
          assignments:    freshAssignments,
          onboardingDone: true,
          cachedAt:       Date.now(),
        }));
      } catch { /* localStorage full — ignore */ }

    } catch (err) {
      // Network error — cache already applied, silently proceed
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Onboarding complete callback ──────────────────────────────────────────
  const handleOnboardingComplete = async (result: {
    branch: string;
    semester: string;
    section: string;
    rollNo: string;
    subjects: string[];
  }) => {
    if (!user) throw new Error("Not authenticated");

    // 1. Update local state immediately — don't wait for Supabase
    setSubjects(subjectNamestoSubjects(result.subjects));
    setProfile(prev => ({
      ...prev,
      branch:   result.branch,
      semester: result.semester,
      section:  result.section,
      rollNo:   result.rollNo,
    }));

    // 2. Redirect to dashboard RIGHT NOW
    setShowOnboarding(false);

    // 3. Save to Supabase in the background — never block the UI
    const saveStart = performance.now();

    supabase
      .from("profiles")
      .upsert({
        id:              user.id,
        email:           user.email,
        branch:          result.branch,
        semester:        result.semester,
        section:         result.section,
        roll_no:         result.rollNo,
        subjects:        result.subjects,
        onboarding_done: true,
        updated_at:      new Date().toISOString(),
      })
      .then(({ error }) => {

        if (error) {

          showToast("Saved locally. Cloud sync failed — check connection.", "error");
        } else {

          showToast("Profile saved! Welcome to Attendance Hub \uD83C\uDF89");
        }
      });
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    clearIdleTimer();
    await supabase.auth.signOut();
    // Clear ALL localStorage — attendance, assignments, profile, theme, idle ts
    localStorage.clear();
    // Reset in-memory state so UI is clean before redirect
    setSubjects(INITIAL_SUBJECTS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setTodayAttendance({});
    setProfile({ name: "Student", rollNo: "2K24/---/---", branch: "Computer Science & Engineering", semester: "2nd Semester", section: "A" });
    setShowProfileModal(false);
    setShowOnboarding(false);
  };

  const handleResetAllAttendance = async () => {
    if (!user) return;
    const { error } = await supabase.from("attendance").delete().eq("user_id", user.id);
    if (error) {
      showToast("Failed to reset attendance", "error");
    } else {
      showToast("All attendance data cleared successfully.", "success");
      loadUserData(user);
    }
  };

  // ── Date and Subject Name Helpers for Supabase Attendance Persistence ──────
  const getTodayDateStr = (): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNormalizedSubjectKeys = (name: string): string[] => {
    const clean = name.toLowerCase().trim();
    if (!clean) return [];
    const keys = new Set<string>();
    keys.add(clean);

    // Remove brackets e.g. "Software Engineering (SE) - Theory" -> "Software Engineering - Theory"
    const noParens = clean.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
    if (noParens && noParens !== clean) keys.add(noParens);

    // Strip " - theory" or " - lab" if present
    const baseName = noParens.replace(/\s*-\s*(theory|lab|tut|lecture|tutorial)$/i, "").trim();
    if (baseName && baseName !== noParens) keys.add(baseName);

    return Array.from(keys);
  };

  // ── Attendance handler (5 statuses) ────────────────────────────────────────────
  const handleMarkAttendance = async (subjectId: string, status: AttendanceStatus, targetDate?: string) => {
    // 1. Resolve exact subject name (name + type)
    const todaySched = getTodayScheduledSubjects();
    const schedMatch = todaySched.find(s => s.id === subjectId || (s as any).rawSubjectId === subjectId);
    let targetSubjectName = "";

    if (schedMatch) {
      targetSubjectName = schedMatch.name;
    } else {
      let currentSub = subjects.find(s => s.id === subjectId);
      if (!currentSub) {
        currentSub = subjects.find(s => s.name.toLowerCase().trim() === subjectId.toLowerCase().trim());
      }
      if (!currentSub && subjectId.startsWith("sub-")) {
        const slug = subjectId.replace(/^sub-/, "");
        currentSub = subjects.find(s => s.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === slug);
      }
      if (currentSub) {
        targetSubjectName = currentSub.name;
      } else {
        targetSubjectName = subjectId.replace(/^sub-/, "").replace(/-+/g, " ").trim();
      }
    }

    const dateStr  = targetDate ?? getTodayDateStr();
    const isToday  = dateStr === getTodayDateStr();

    const labels: Record<AttendanceStatus, string> = {
      present: "✅ Present marked",
      absent:  "❌ Absent marked",
      miss:    "☕ Missed",
      leave:   "✈️ Leave marked",
      clear:   "🗑️ Cleared",
    };

    // ── Clear entry from Supabase ─────────────────────────────────────────────
    if (status === "clear") {
      if (!user) return;
      const { error: delErr } = await supabase.from("attendance")
        .delete()
        .eq("user_id", user.id)
        .eq("subject", targetSubjectName)
        .eq("date", dateStr);
      if (delErr) {
        showToast("Failed to clear attendance.", "error");
      } else {
        showToast(labels.clear, "success");
        await fetchTodayAttendance(user, subjects);
        await refreshAttendanceCounts(user);
      }
      return;
    }

    // Optimistic local update for instant UI feedback
    if (isToday) {
      setTodayAttendance(prev => {
        const next = { ...prev, [subjectId]: status };
        getNormalizedSubjectKeys(targetSubjectName).forEach(k => {
          next[k] = status;
        });
        return next;
      });
    }

    if (!user) {
      showToast("Please log in to save attendance.", "error");
      return;
    }

    // ── Save to Supabase attendance table via Upsert ─────────────────────────
    const { error: attErr } = await supabase.from("attendance").upsert(
      {
        user_id: user.id,
        subject: targetSubjectName,
        date:    dateStr,
        status:  status,
      },
      { onConflict: "user_id,subject,date" }
    );

    if (attErr) {
      console.error("Supabase attendance save error:", attErr);
      showToast("Failed to save attendance. Please try again.", "error");
      // Rollback on failure by re-fetching state from Supabase
      if (user) {
        await fetchTodayAttendance(user, subjects);
      }
    } else {
      showToast(labels[status]);
      // Immediately fetch from Supabase to ensure state is 100% in sync with backend
      await fetchTodayAttendance(user, subjects);
      await refreshAttendanceCounts(user);
    }
  };

  // ── Attendance adjustment (from attendance page) ──────────────────────────
  const handleUpdateSubjectHours = async (id: string, attended: number, total: number) => {
    const newAttended = Math.max(0, attended);
    const newTotal    = Math.max(0, total);

    const targetSub = subjects.find(s => s.id === id);

    setSubjects(prev => {
      const updated = prev.map(sub => sub.id === id ? { ...sub, attendanceCount: newAttended, totalClasses: newTotal } : sub);
      try {
        localStorage.setItem("ATTENDANCE_HUB_SUBJECTS", JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });

    if (user && targetSub) {
      const deltaTotal = newTotal - targetSub.totalClasses;
      const deltaAttended = newAttended - targetSub.attendanceCount;
      const todayStr = new Date().toISOString().split("T")[0];

      if (deltaTotal < 0 || deltaAttended < 0) {
        // UNDO operation: delete latest attendance record for this subject
        const { data: latest } = await supabase
          .from("attendance")
          .select("id")
          .eq("user_id", user.id)
          .eq("subject", targetSub.name)
          .order("created_at", { ascending: false })
          .limit(1);

        if (latest && latest.length > 0) {
          await supabase.from("attendance").delete().eq("id", latest[0].id);
        }
      } else if (deltaAttended > 0) {
        // Manual Present addition
        await supabase.from("attendance").insert({
          user_id: user.id,
          subject: targetSub.name,
          status: "present",
          date: todayStr,
        });
      } else if (deltaTotal > 0 && deltaAttended === 0) {
        // Manual Absent addition
        await supabase.from("attendance").insert({
          user_id: user.id,
          subject: targetSub.name,
          status: "absent",
          date: todayStr,
        });
      }
    }
  };

  // ── Assignments CRUD ──────────────────────────────────────────────────────
  const handleAddAssignment = async (newAsg: Omit<Assignment, "id">) => {
    // Sanitize & enforce length caps before persisting
    const safeAsg = {
      ...newAsg,
      title:       sanitizeText(newAsg.title,       FIELD_LIMITS.assignmentTitle),
      description: sanitizeText(newAsg.description, FIELD_LIMITS.assignmentDescription),
      subject:     sanitizeText(newAsg.subject,     FIELD_LIMITS.assignmentSubject),
    };
    if (!safeAsg.title) { showToast("Assignment title cannot be empty.", "error"); return; }

    if (user) {
      const { data, error } = await supabase
        .from("assignments")
        .insert({
          user_id:      user.id,
          title:        safeAsg.title,
          description:  safeAsg.description,
          subject:      safeAsg.subject,
          due_date:     safeAsg.dueDate,
          done:         safeAsg.done,
        })
        .select()
        .single();
      if (!error && data) {
        setAssignments(prev => [{
          id:          data.id,
          title:       data.title,
          description: data.description,
          subject:     data.subject,
          dueDate:     data.due_date,
          done:        data.done,
        }, ...prev]);
      }
    } else {
      setAssignments(prev => [{ ...safeAsg, id: `asg-${Date.now()}` }, ...prev]);
    }
  };

  const handleToggleAssignment = async (id: string) => {
    const asg = assignments.find(a => a.id === id);
    if (!asg) return;
    const newDone = !asg.done;
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, done: newDone } : a));
    if (user) {
      await supabase.from("assignments").update({ done: newDone }).eq("id", id).eq("user_id", user.id);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    if (user) {
      await supabase.from("assignments").delete().eq("id", id).eq("user_id", user.id);
    }
  };

  // ── Profile Save (+ Supabase upsert) ─────────────────────────────────────
  const handleSaveProfile = async () => {
    // Sanitize profile fields before saving
    const sanitizedProfile: StudentProfile = {
      name:     sanitizeText(editProfile.name,     FIELD_LIMITS.profileName),
      rollNo:   sanitizeText(editProfile.rollNo,   FIELD_LIMITS.profileRollNo),
      branch:   sanitizeText(editProfile.branch,   FIELD_LIMITS.profileBranch),
      semester: editProfile.semester,
      section:  editProfile.section,
    };
    const safeEditProfile = sanitizedProfile;

    const isSemesterChanged = profile.semester !== safeEditProfile.semester;
    const isBranchChanged = profile.branch !== safeEditProfile.branch;

    setProfile(safeEditProfile);
    setIsEditingProfile(false);

    let newSubjectsList: string[] | null = null;

    if (isSemesterChanged || isBranchChanged) {
      const semMatch = editProfile.semester.match(/\d+/);
      const semNum = semMatch ? parseInt(semMatch[0], 10) : 1;
      
      if (editProfile.branch.toLowerCase().includes("computer science") || editProfile.branch.toUpperCase() === "CSE") {
        const cseBranch = dtuData.branches.find((b: any) => b.branch === "CSE");
        const semData = cseBranch?.semesters.find((s: any) => s.sem === semNum);
        const subNames = semData ? [...semData.subjects] : [];

        if (subNames.length > 0) {
          newSubjectsList = subNames;
          setSubjects(subjectNamestoSubjects(subNames));
          showToast(`Profile updated, subjects updated for Sem ${semNum}`);
        } else {
          showToast("Profile updated");
        }
      } else {
        newSubjectsList = [];
        setSubjects([]);
        showToast(`Profile updated. Subjects cleared for ${editProfile.branch}. Please add manually.`);
      }
    } else {
      showToast("Profile updated");
    }

    if (user) {
      const updateData: any = {
        id:         user.id,
        email:      user.email,
        full_name:  editProfile.name,
        roll_no:    editProfile.rollNo,
        branch:     editProfile.branch,
        semester:   editProfile.semester,
        section:    editProfile.section,
        updated_at: new Date().toISOString(),
      };
      
      if (newSubjectsList !== null) {
        updateData.subjects = newSubjectsList;
      }
      
      await supabase.from("profiles").upsert(updateData);
    }
  };

  // ── Header title ──────────────────────────────────────────────────────────
  const getHeaderTitle = () => {
    const m: Record<string, string> = {
      dashboard:   `Welcome back, ${profile.name.split(" ")[0]}`,
      attendance:  "Attendance Tracker",
      resources:   "Academic Resources",
      assignments: "Assignments Timeline",
      timetable:   "Weekly Schedule Grid",
      analytics:   "Academic Analytics",
    };
    return m[activeTab] ?? "Attendance Hub";
  };

  // ── Feedback submit ───────────────────────────────────────────────────────
  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) { showToast("Please enter your feedback.", "error"); return; }

    // Rate-limit feedback to 3 submissions per hour
    if (!checkRateLimit("feedback-submit", 3, 60 * 60_000)) {
      showToast("Too many submissions. Please wait before submitting again.", "error");
      return;
    }

    // Enforce field length caps
    const safeFeedback = sanitizeText(feedbackText, FIELD_LIMITS.feedbackText);
    const safeEmail    = feedbackEmail.slice(0, FIELD_LIMITS.feedbackEmail);
    if (!safeFeedback) { showToast("Please enter your feedback.", "error"); return; }

    // TODO: persist safeFeedback + safeEmail to your feedback table via Supabase
    void safeFeedback; void safeEmail;

    setFeedbackText(""); setFeedbackEmail("");
    setShowFeedbackModal(false);
    showToast("Thank you for your feedback! 🙏");
  };

  // ── Lightweight count refresh — re-fetches ALL attendance, updates only subject
  //    aggregate counts WITHOUT touching todayAttendance (so button highlights stay) ─
  const refreshAttendanceCounts = async (u: User) => {
    if (!u) return;
    const { data: attData } = await supabase
      .from("attendance")
      .select("subject, status")
      .eq("user_id", u.id);
    if (!attData) return;

    const agg: Record<string, { attendance_count: number; total_classes: number }> = {};
    for (const row of attData) {
      const key = (row.subject ?? "").trim();
      if (!key) continue;
      const keys = getNormalizedSubjectKeys(key);
      const mainKey = keys[0] || key.toLowerCase();
      if (!agg[mainKey]) agg[mainKey] = { attendance_count: 0, total_classes: 0 };
      const s = (row.status ?? "").toLowerCase();
      if (s !== "leave") agg[mainKey].total_classes += 1;
      if (s === "present") agg[mainKey].attendance_count += 1;
    }

    setSubjects(prev => prev.map(sub => {
      const keys = getNormalizedSubjectKeys(sub.name);
      let saved: { attendance_count: number; total_classes: number } | undefined = undefined;
      for (const k of keys) {
        if (agg[k]) {
          saved = agg[k];
          break;
        }
      }
      if (!saved) return sub;
      return { ...sub, attendanceCount: saved.attendance_count, totalClasses: saved.total_classes };
    }));
  };

  // ── Fetch today's attendance for dashboard status highlights directly from Supabase ─────────────
  const fetchTodayAttendance = async (u: User, subjectsList: Subject[] = subjects) => {
    if (!u) return;
    const todayStr = getTodayDateStr();
    const { data, error } = await supabase
      .from("attendance")
      .select("subject, status")
      .eq("user_id", u.id)
      .eq("date", todayStr);

    if (error) {
      console.error("Error fetching today attendance from Supabase:", error);
      return;
    }

    const map: Record<string, AttendanceStatus> = {};
    if (data) {
      data.forEach(row => {
        const rowSubName = (row.subject ?? "").trim();
        if (!rowSubName || !row.status) return;

        const keys = getNormalizedSubjectKeys(rowSubName);
        keys.forEach(k => {
          map[k] = row.status as AttendanceStatus;
        });

        // Also map to any subject IDs in subjectsList or scheduled timetable
        const listToSearch = subjectsList && subjectsList.length > 0 ? subjectsList : subjects;
        listToSearch.forEach(s => {
          const sKeys = getNormalizedSubjectKeys(s.name);
          if (keys.some(k => sKeys.includes(k))) {
            map[s.id] = row.status as AttendanceStatus;
          }
        });
      });
    }
    setTodayAttendance(map);
  };

  // ── Fetch attendance for a specific date from Supabase ───────────────────
  const fetchLogForDate = async (dateStr: string) => {
    if (!user) return;
    setLogLoading(true);

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", dateStr);
    if (error) {

    } else {

      const fetched = data ?? [];
      // Schema: (user_id, subject, date, status)
      // Build full subject list; match fetched rows by subject name
      const entries: LogEntry[] = subjects.map(sub => {
        const row = fetched.find(r =>
          (r.subject ?? "").toLowerCase().trim() === sub.name.toLowerCase().trim()
        );
        return {
          subjectId:       sub.id,
          subjectName:     sub.name,
          attendanceCount: row ? (row.status === "present" ? 1 : 0) : 0,
          totalClasses:    row && row.status !== "leave" ? 1 : 0,
          subjectType:     sub.type,
          status:          row?.status ?? undefined,
        };
      });
      setLogSubjects(entries);
    }
    setLogLoading(false);
  };

  // ── Open attendance log modal ─────────────────────────────────────────────
  const handleOpenAttendanceLog = (date?: number) => {
    const d = date ?? null;
    const today = new Date();
    const dateStr = d
      ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      : new Date().toISOString().split('T')[0];
    setAttendanceLogDate(d);
    setAttendanceLogDateStr(dateStr);
    setShowAttendanceLogModal(true);
    fetchLogForDate(dateStr);
  };

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems = [
    { id: "dashboard",   label: "Dashboard",   icon: "dashboard" },
    { id: "attendance",  label: "Attendance",  icon: "event_available" },
    { id: "resources",   label: "Resources",   icon: "menu_book" },
    { id: "assignments", label: "Assignments", icon: "assignment" },
    { id: "timetable",   label: "Timetable",   icon: "calendar_today" },
    { id: "analytics",   label: "Analytics",   icon: "leaderboard" },
  ];

  const getTimeOrder = (timeSlot: string): number => {
    const match = timeSlot.match(/^(\d+)/);
    if (!match) return 99;
    let h = parseInt(match[1], 10);
    if (h >= 1 && h <= 7) h += 12;
    return h;
  };

  const getTodayScheduledSubjects = (): Subject[] => {
    const currentDayIndex = new Date().getDay();
    const daysMap = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];
    const todayId = daysMap[currentDayIndex];
    if (todayId === "SUN" || todayId === "SAT") return subjects;

    const userSecKey = profile.section.toUpperCase().trim().startsWith("A")
      ? profile.section.toUpperCase().trim()
      : `A${profile.section.toUpperCase().trim()}`;
    const semMatch = profile.semester.match(/(\d+)/);
    const semNum = semMatch ? parseInt(semMatch[1], 10) : 0;

    // Only show timetable-based subjects for supported semesters
    if (semNum !== 3 && semNum !== 5) return [];

    const isSem5 = semNum === 5;
    const secData = isSem5
      ? (TIMETABLE_SEM_5_DATA.sections[userSecKey] || TIMETABLE_SEM_5_DATA.sections["A1"])
      : (TIMETABLE_SEM_3_DATA.sections[userSecKey] || TIMETABLE_SEM_3_DATA.sections["A3"]);
    const daySchedule = secData?.timetable[todayId];
    if (!daySchedule) return [];


    const todayList: (Subject & { timeOrder?: number; rawSubjectId?: string })[] = [];

    Object.entries(daySchedule).forEach(([timeSlotKey, rawVal]) => {
      const cleanSlot = timeSlotKey.replace("_lab", "").replace("_alt", "");
      const timeOrder = getTimeOrder(cleanSlot);
      const rawText = typeof rawVal === "string" ? rawVal : convertSem5SlotToString(rawVal);
      if (!rawText) return;

      const parts = rawText.includes(" / ") ? rawText.split(" / ") : [rawText];

      parts.forEach((partText) => {
        const parsed = parseTimetableEntry(partText, secData.room);
        const targetName = parsed.splitSubjectName.toLowerCase().trim();
        const baseLower = parsed.baseSubjectName.toLowerCase().trim();

        // 1. Exact match on splitSubjectName
        let matched = subjects.find(s => s.name.toLowerCase().trim() === targetName);

        // 2. Strict Lab vs Theory component match
        if (!matched) {
          if (parsed.isLab) {
            matched = subjects.find(
              s =>
                s.name.toLowerCase().trim().includes(baseLower) &&
                (s.type === "LAB" || s.name.toLowerCase().includes("lab"))
            );
          } else if (parsed.isTutorial) {
            matched = subjects.find(
              s =>
                s.name.toLowerCase().trim().includes(baseLower) &&
                (s.type === "TUT" || s.name.toLowerCase().includes("tutorial"))
            );
          } else {
            matched = subjects.find(
              s =>
                s.name.toLowerCase().trim().includes(baseLower) &&
                s.type !== "LAB" &&
                s.type !== "TUT" &&
                !s.name.toLowerCase().includes("lab") &&
                !s.name.toLowerCase().includes("tutorial")
            );
          }
        }

        // 3. Fallback matching
        if (!matched) {
          matched = subjects.find(s => s.name.toLowerCase().trim().includes(baseLower));
        }

        if (matched) {
          todayList.push({
            ...matched,
            rawSubjectId: matched.id,
            time: `${cleanSlot} (${parsed.room || secData.room})`,
            prof: parsed.faculty || matched.prof,
            type: parsed.isLab ? "LAB" : (parsed.isTutorial ? "TUT" : "LEC"),
            timeOrder,
          });
        } else {
          // Construct fallback subject entry so all scheduled classes appear
          const fallbackId = `sub-${parsed.splitSubjectName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          todayList.push({
            id: fallbackId,
            rawSubjectId: fallbackId,
            name: parsed.splitSubjectName,
            code: parsed.subjectCode || "CS200",
            prof: parsed.faculty || "Faculty",
            room: parsed.room || secData.room,
            category: "Core",
            description: parsed.splitSubjectName,
            time: `${cleanSlot} (${parsed.room || secData.room})`,
            type: parsed.isLab ? "LAB" : "LEC",
            attendanceCount: 0,
            totalClasses: 0,
            timeOrder,
          });
        }
      });
    });

    if (todayList.length === 0) return subjects;

    todayList.sort((a, b) => (a.timeOrder ?? 0) - (b.timeOrder ?? 0));
    return todayList;
  };

  // ── Google avatar URL ─────────────────────────────────────────────────────
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials  = profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  // ═══════════════════════════════════════════════════════════════════════════
  // Initial Auth Loading Screen — Sleek Skeleton UI while session resolves
  // Preserves current URL without prematurely redirecting to /login or /dashboard
  // ═══════════════════════════════════════════════════════════════════════════
  if (!initialAuthDone || authLoading) {
    return (
      <div className={`min-h-screen flex ${isDarkMode ? "bg-[#0b1326] text-[#dae2fd]" : "bg-[#F8F9FA] text-[#111827]"}`}>
        {/* Sidebar Skeleton */}
        <aside className={`fixed left-0 top-0 h-full w-[260px] border-r flex flex-col py-6 z-40 ${
          isDarkMode ? "bg-[#0b1326] border-[#3b4a42]/30" : "bg-white border-[#E5E7EB]"
        } hidden lg:flex`}>
          <div className="px-6 mb-8 space-y-2">
            <div className="w-40 h-6 bg-surface-variant/70 rounded-lg animate-pulse" />
            <div className="w-24 h-3 bg-surface-variant/40 rounded animate-pulse" />
          </div>
          <div className="flex-1 space-y-3 px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-full h-11 bg-surface-variant/30 rounded-xl animate-pulse" />
            ))}
          </div>
        </aside>

        {/* Content Skeleton */}
        <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
          <header className={`h-16 border-b px-6 flex items-center justify-between ${
            isDarkMode ? "border-[#3b4a42]/30 bg-[#0b1326]" : "border-[#E5E7EB] bg-white"
          }`}>
            <div className="w-36 h-5 bg-surface-variant/60 rounded-lg animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-variant/60 animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-surface-variant/60 animate-pulse" />
            </div>
          </header>
          <main className="flex-1 p-6 space-y-6">
            <div className="w-64 h-8 bg-surface-variant/80 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-surface-container border border-outline-variant/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Unauthenticated User -> Render Login Page
  // ═══════════════════════════════════════════════════════════════════════════
  if (!user) {
    return (
      <LoginPage
        onToast={showToast}
        isDarkMode={isDarkMode}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Main App (Authenticated)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`min-h-screen flex ${isDarkMode ? "bg-[#0b1326] text-[#dae2fd]" : "bg-[#F8F9FA] text-[#111827]"}`}>

      {/* ── SIDEBAR (Desktop Only) ── */}
      <aside className={`fixed left-0 top-0 h-full w-[260px] border-r hidden lg:flex flex-col py-6 z-40 transition-all duration-300 ${
        isDarkMode ? "bg-[#0b1326] border-[#3b4a42]/30" : "bg-white border-[#E5E7EB]"
      }`}>
        <div className="px-6 mb-8">
          <h1 className="text-xl font-extrabold tracking-tight text-primary-container font-sans flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[24px]">terminal</span>
            <span>Attendance Hub</span>
          </h1>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mt-0.5">CSE • SECTION {profile.section.toUpperCase().startsWith("A") ? profile.section.toUpperCase() : `A${profile.section}`}</p>
        </div>

        <nav className="flex-1 space-y-1 select-none">
          {navItems.map((nav) => {
            const isActive = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => { navigate(`/${nav.id}`); }}
                className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-all relative cursor-pointer group active:scale-[0.98] ${
                  isActive
                    ? isDarkMode
                      ? "bg-[#2d3449] text-[#82ffc8] border-l-4 border-[#47ffbc]"
                      : "bg-[#F0FDF9] text-[#1AE7A6] border-l-4 border-[#1AE7A6]"
                    : isDarkMode
                      ? "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20"
                      : "text-[#374151] hover:text-[#111827] hover:bg-[#F0FDF9]/60"
                }`}
              >
                <span className="material-symbols-outlined transition-transform group-hover:scale-105 duration-150">
                  {nav.icon}
                </span>
                <span className="text-sm font-semibold">{nav.label}</span>
                {nav.id === "assignments" && assignments.filter(a => a.status !== "COMPLETED").length > 0 && (
                  <span className="ml-auto text-[9px] bg-error text-white rounded-full px-1.5 py-0.5 font-bold font-mono">
                    {assignments.filter(a => a.status !== "COMPLETED").length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer — attendance summary + logout */}
        <div className="mx-4 mt-4 space-y-3">
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/50">
            <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider mb-1">Overall Attendance</p>
            {(() => {
              const total   = subjects.reduce((s, x) => s + x.totalClasses, 0);
              const attended = subjects.reduce((s, x) => s + x.attendanceCount, 0);
              const pct     = total > 0 ? (attended / total) * 100 : 0;
              return (
                <>
                  <p className={`text-xl font-black font-mono ${pct >= 75 ? "text-primary" : "text-error"}`}>{pct.toFixed(1)}%</p>
                  <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isDarkMode ? "bg-[#2d3449]" : "bg-[#E5E7EB]"}`}>
                    <div className={`h-full rounded-full ${pct >= 75 ? "bg-primary" : "bg-error"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1">{attended}/{total} classes attended</p>
                </>
              );
            })()}
          </div>

          {/* Signed-in user + logout */}
          <div className="flex items-center gap-2 px-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={profile.name} className="w-7 h-7 rounded-full object-cover border border-primary/40" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[9px] font-black text-[#002114]">{initials}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-on-surface truncate">{profile.name}</p>
              <p className="text-[9px] text-on-surface-variant truncate">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={() => setConfirmLogout(true)}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="lg:pl-[260px] flex-1 flex flex-col min-h-screen transition-colors duration-300">

        {/* ── HEADER ── */}
        <header className={`h-16 border-b flex justify-between items-center px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-300 ${
          isDarkMode ? "bg-[#0b1326] border-[#3b4a42]/30" : "bg-white border-[#E5E7EB]"
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center lg:hidden flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
            </div>
            <h2 className="text-sm sm:text-xl font-bold tracking-tight text-on-surface font-sans truncate">{getHeaderTitle()}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search portal..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && globalSearch.trim()) {
                    navigate(`/resources?q=${encodeURIComponent(globalSearch.trim())}`);
                    setGlobalSearch("");
                  }
                }}
                className={`text-xs pl-8 pr-4 py-2 w-52 rounded-full border focus:outline-none transition-all ${
                  isDarkMode
                    ? "bg-[#171f33] border-[#3b4a42]/40 text-white placeholder-on-surface-variant focus:border-primary"
                    : "bg-slate-100 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-400"
                }`}
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification bell */}
            <button
              onClick={() => showToast("All caught up! No new notifications.")}
              className="p-2 rounded-xl text-on-surface-variant hover:text-primary transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              {subjects.filter(s => s.totalClasses > 0 && (s.attendanceCount / s.totalClasses) * 100 < 75).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-pulse" />
              )}
            </button>

            {/* Avatar → Profile */}
            <button
              onClick={() => { setEditProfile(profile); setIsEditingProfile(false); setShowProfileModal(true); }}
              className="w-9 h-9 rounded-full overflow-hidden hover:scale-105 cursor-pointer transition-transform border-2 border-primary-container flex-shrink-0"
              title="View Profile"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-[#002114] text-sm">
                  {initials}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 custom-scrollbar pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <DashboardPage
                  subjects={subjects}
                  assignments={assignments}
                  onMarkAttendance={handleMarkAttendance}
                  onOpenAttendanceLog={handleOpenAttendanceLog}
                  setActiveTab={(tab) => navigate(`/${tab}`)}
                  isDarkMode={isDarkMode}
                  todayAttendance={todayAttendance}
                  isLoadingTimetable={false}
                  todayTimetable={getTodayScheduledSubjects()}
                />
              } />
              <Route path="/attendance" element={
                <AttendancePage subjects={subjects} onUpdateSubjectHours={handleUpdateSubjectHours} isDarkMode={isDarkMode} />
              } />
              <Route path="/resources" element={
                <ResourcesPage subjects={subjects} />
              } />
              <Route path="/resources/:subjectName" element={
                <SubjectResourcesPage subjects={subjects} />
              } />
              <Route path="/assignments" element={
                <AssignmentsPage
                  assignments={assignments}
                  subjects={subjects}
                  onAddAssignment={handleAddAssignment}
                  onToggleAssignment={handleToggleAssignment}
                  onDeleteAssignment={handleDeleteAssignment}
                  onToast={showToast}
                  isDarkMode={isDarkMode}
                />
              } />
              <Route path="/timetable" element={
                <TimetablePage
                  subjects={subjects}
                  userSection={profile.section}
                  userSemester={profile.semester}
                  isDarkMode={isDarkMode}
                  onMarkAttendance={(id, isPresent) => handleMarkAttendance(id, isPresent ? "present" : "absent")}
                  onUpdateSubjectHours={handleUpdateSubjectHours}
                />
              } />
              <Route path="/analytics" element={
                <AnalyticsPage subjects={subjects} isDarkMode={isDarkMode} />
              } />
              <Route path="/login" element={
                <LoginPage onToast={showToast} isDarkMode={isDarkMode} />
              } />
              <Route path="/admin" element={
                <AdminPanel onToast={showToast} isDarkMode={isDarkMode} />
              } />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>

        {/* ── MOBILE BOTTOM NAV (Equidistant 6-Column Grid) ── */}
        <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t grid grid-cols-6 h-16 w-full items-center ${
          isDarkMode ? "bg-[#0b1326]/95 border-[#3b4a42]/30 backdrop-blur-md" : "bg-white/95 border-[#E5E7EB] backdrop-blur-md"
        }`}>
          {navItems.map((nav) => {
            const isActive = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => { navigate(`/${nav.id}`); }}
                className={`flex flex-col items-center justify-center h-full w-full gap-0.5 transition-all cursor-pointer ${
                  isActive ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-primary" : ""}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {nav.icon}
                </span>
                <span className="text-[9px] font-semibold leading-none truncate max-w-full px-0.5">{nav.label.slice(0, 5)}</span>
              </button>
            );
          })}
        </nav>

        {/* ── FLOATING FEEDBACK BUTTON ── */}
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="fixed bottom-20 lg:bottom-6 right-6 w-12 h-12 bg-primary text-[#002114] rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30 group cursor-pointer progress-glow"
          title="Send Feedback"
        >
          <span className="material-symbols-outlined">rate_review</span>
          <span className="absolute right-full mr-3 bg-surface-container border border-outline-variant text-[#dae2fd] text-xs px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-250 pointer-events-none">
            Send Feedback
          </span>
        </button>

        {/* ── MODAL: PROFILE ── */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#090d16]/75 backdrop-blur-sm" onClick={() => { setShowProfileModal(false); setIsEditingProfile(false); }} />
            <div className="glass-card max-w-sm w-full p-6 rounded-2xl border border-outline-variant shadow-2xl relative z-10">
              <button
                onClick={() => { setShowProfileModal(false); setIsEditingProfile(false); }}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profile.name} className="w-20 h-20 rounded-full object-cover border-4 border-primary-container mb-3" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-[#002114] text-3xl border-4 border-primary-container mb-3">
                    {initials}
                  </div>
                )}
                {!isEditingProfile && (
                  <>
                    <h3 className="text-lg font-bold text-on-surface">{profile.name}</h3>
                    <p className="text-primary text-xs font-mono font-bold mt-0.5">{profile.rollNo}</p>
                    {user.email && <p className="text-on-surface-variant text-[10px] mt-0.5">{user.email}</p>}
                  </>
                )}
              </div>

              {isEditingProfile ? (
                /* Edit Form */
                <div className="space-y-3">
                  {[
                    { label: "Full Name",    key: "name",     type: "text" },
                    { label: "Roll Number",  key: "rollNo",   type: "text" },
                    { label: "Branch",       key: "branch",   type: "text" },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">{label}</label>
                      <input
                        type={type}
                        value={editProfile[key as keyof StudentProfile]}
                        onChange={(e) => setEditProfile(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full bg-[#0b1326] border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Semester</label>
                    <div className="grid grid-cols-8 gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => {
                        const semStr = `${s}${s === 1 ? "st" : s === 2 ? "nd" : s === 3 ? "rd" : "th"} Semester`;
                        const isActive = editProfile.semester === semStr;
                        return (
                          <button
                            key={s}
                            onClick={() => setEditProfile(prev => ({ ...prev, semester: semStr }))}
                            className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer select-none ${
                              isActive
                                ? "bg-gradient-to-br from-[#1AE7A6] to-[#00C896] border-transparent text-[#002114] shadow-md shadow-[#1AE7A6]/25"
                                : "bg-[#0b1326] border-outline-variant text-on-surface-variant hover:border-primary/50 hover:text-white"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Section</label>
                    <div className="grid grid-cols-7 gap-1.5">
                      {["A1", "A2", "A3", "A4", "A5", "A6", "A7"].map(s => {
                        const isActive = editProfile.section === s || editProfile.section === s.replace("A", "");
                        return (
                          <button
                            key={s}
                            onClick={() => setEditProfile(prev => ({ ...prev, section: s }))}
                            className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer select-none ${
                              isActive
                                ? "bg-gradient-to-br from-[#1AE7A6] to-[#00C896] border-transparent text-[#002114] shadow-md shadow-[#1AE7A6]/25"
                                : "bg-[#0b1326] border-outline-variant text-on-surface-variant hover:border-primary/50 hover:text-white"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 py-2.5 border border-outline-variant rounded-xl text-xs font-bold text-on-surface-variant hover:text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 py-2.5 bg-primary text-[#002114] rounded-xl text-xs font-bold hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Profile
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-2">
                  {[
                    { label: "Branch",   value: profile.branch },
                    { label: "Semester", value: profile.semester },
                    { label: "Section",  value: profile.section },
                    { label: "Roll No.", value: profile.rollNo },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between border-b border-outline-variant/30 py-1.5">
                      <span className="text-on-surface-variant text-xs font-medium">{label}</span>
                      <span className="font-bold text-on-surface text-xs">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1.5">
                    <span className="text-on-surface-variant text-xs font-medium">Attendance</span>
                    <span className="font-bold text-[#1ae7a6] font-mono text-xs">
                      {(() => {
                        const t = subjects.reduce((s,x) => s+x.totalClasses, 0);
                        const a = subjects.reduce((s,x) => s+x.attendanceCount, 0);
                        return t > 0 ? `${((a/t)*100).toFixed(1)}% ${(a/t)*100 >= 75 ? "✓ Safe" : "⚠ Danger"}` : "N/A";
                      })()}
                    </span>
                  </div>

                  <button
                    onClick={() => { setEditProfile(profile); setIsEditingProfile(true); }}
                    className="mt-4 w-full bg-surface-container border border-outline-variant text-on-surface py-2.5 rounded-xl font-bold text-xs hover:border-primary hover:text-primary transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full border border-error/30 text-error py-2.5 rounded-xl font-bold text-xs hover:bg-error/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>

                  <button
                    onClick={() => setConfirmResetAttendance(true)}
                    className="mt-4 w-full border border-error/50 bg-error/10 text-error py-2.5 rounded-xl font-bold text-xs hover:bg-error hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset All Attendance
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL: ATTENDANCE LOG ── */}
        {showAttendanceLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#090d16]/75 backdrop-blur-sm" onClick={() => setShowAttendanceLogModal(false)} />
            <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-outline-variant shadow-2xl relative z-10">
              <button onClick={() => setShowAttendanceLogModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-bold text-lg text-on-surface mb-1">Attendance Log</h3>
              <p className="text-xs text-on-surface-variant font-mono mb-5">
                {attendanceLogDateStr ?? new Date().toISOString().split('T')[0]}
              </p>

              {logLoading ? (
                <div className="text-center py-8 text-on-surface-variant text-xs">Loading...</div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {logSubjects.map((sub) => {
                    const marked = !!sub.status;
                    const statusColors: Record<string, string> = {
                      present: "bg-primary/20 text-primary border-primary/30",
                      absent:  "bg-error/20 text-error border-error/30",
                      miss:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                      leave:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
                    };
                    const statusLabel: Record<string, string> = {
                      present: "✅ Present",
                      absent:  "❌ Absent",
                      miss:    "☕ Missed",
                      leave:   "✈️ Leave",
                    };
                    return (
                      <div key={sub.subjectId} className={`p-3 rounded-xl border transition-all ${
                        marked ? "bg-surface-container-high border-outline-variant/50" : "bg-surface-container/60 border-outline-variant/20"
                      }`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-on-surface truncate">
                              {sub.subjectName}
                              <span className="font-mono text-[10px] text-on-surface-variant ml-1">({sub.subjectType ?? "LEC"})</span>
                            </p>
                            {marked && sub.status && (
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${statusColors[sub.status] ?? ""}`}>
                                {statusLabel[sub.status] ?? sub.status}
                              </span>
                            )}
                            {!marked && (
                              <p className="text-[10px] text-on-surface-variant mt-0.5 opacity-60">Not marked yet</p>
                            )}
                          </div>
                          <div className="flex gap-1 items-center flex-shrink-0">
                            {!marked ? (
                              <>
                                {(["present", "absent", "miss", "leave"] as AttendanceStatus[]).map(s => (
                                  <button
                                    key={s}
                                    onClick={async () => {
                                      if (!attendanceLogDateStr) return;
                                      await handleMarkAttendance(sub.subjectId, s, attendanceLogDateStr);
                                      await fetchLogForDate(attendanceLogDateStr);
                                      loadUserData(user!);
                                    }}
                                    className={`text-[9px] font-bold px-2 py-1 rounded-lg border cursor-pointer transition-all ${
                                      s === "present" ? "border-primary/30 text-primary bg-[#131b2e] hover:bg-primary hover:text-[#002114]"
                                      : s === "absent" ? "border-error/30 text-error bg-[#131b2e] hover:bg-error hover:text-white"
                                      : s === "miss"   ? "border-yellow-500/30 text-yellow-400 bg-[#131b2e] hover:bg-yellow-500 hover:text-black"
                                      :                  "border-blue-400/30 text-blue-400 bg-[#131b2e] hover:bg-blue-500 hover:text-white"
                                    }`}
                                    title={`Mark ${s}`}
                                  >
                                    {s === "present" ? "P" : s === "absent" ? "A" : s === "miss" ? "M" : "L"}
                                  </button>
                                ))}
                              </>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteLog({ subjectName: sub.subjectName })}
                                className="text-[10px] font-bold border border-error/50 text-error px-2 py-1 bg-error/10 rounded-lg cursor-pointer hover:bg-error hover:text-white transition-all flex items-center gap-1"
                                title="Delete this record for this date"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 text-right">
                <button
                  onClick={() => setShowAttendanceLogModal(false)}
                  className="px-5 py-2 bg-primary text-[#002114] rounded-xl font-bold text-xs cursor-pointer hover:brightness-110 transition-all shadow-md"
                >
                  Close Log
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: FEEDBACK ── */}
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#090d16]/75 backdrop-blur-sm" onClick={() => setShowFeedbackModal(false)} />
            <div className="glass-card max-w-sm w-full p-6 rounded-2xl border border-outline-variant shadow-2xl relative z-10">
              <button onClick={() => setShowFeedbackModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Send Feedback</h3>
                  <p className="text-[10px] text-on-surface-variant">Help improve Attendance Hub</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Your Feedback *</label>
                  <textarea
                    rows={4}
                    placeholder="What do you think? What can be improved?"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full bg-[#0b1326] border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Email (optional)</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    className="w-full bg-[#0b1326] border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleSubmitFeedback}
                  className="w-full py-2.5 bg-primary text-[#002114] rounded-xl font-bold text-xs hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      {/* Confirm: Logout */}
      <ConfirmDialog
        open={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        confirmDanger
        isDarkMode={isDarkMode}
        onConfirm={() => { setConfirmLogout(false); handleSignOut(); }}
        onCancel={() => setConfirmLogout(false)}
      />

      {/* Confirm: Reset all attendance */}
      <ConfirmDialog
        open={confirmResetAttendance}
        title="Reset All Attendance"
        message="This will permanently delete ALL your attendance data. This cannot be undone."
        confirmLabel="Delete All"
        confirmDanger
        isDarkMode={isDarkMode}
        onConfirm={() => { setConfirmResetAttendance(false); handleResetAllAttendance(); }}
        onCancel={() => setConfirmResetAttendance(false)}
      />

      {/* Confirm: Delete single attendance log entry */}
      <ConfirmDialog
        open={!!confirmDeleteLog}
        title="Remove Attendance Entry"
        message={`Remove attendance record for "${confirmDeleteLog?.subjectName}" on this date?`}
        confirmLabel="Remove"
        confirmDanger
        isDarkMode={isDarkMode}
        onConfirm={async () => {
          if (!confirmDeleteLog || !attendanceLogDateStr || !user) { setConfirmDeleteLog(null); return; }
          const { error: delErr } = await supabase.from("attendance")
            .delete()
            .eq("user_id", user.id)
            .eq("subject", confirmDeleteLog.subjectName)
            .eq("date", attendanceLogDateStr);
          if (delErr) {
            showToast("Delete failed", "error");
          } else {
            showToast(`Cleared ${confirmDeleteLog.subjectName} for this date.`, "success");
            await fetchLogForDate(attendanceLogDateStr);
            loadUserData(user);
          }
          setConfirmDeleteLog(null);
        }}
        onCancel={() => setConfirmDeleteLog(null)}
      />

    </div>
  );
}
