/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Subject, Assignment, AttendanceStatus } from "./types";
import { INITIAL_SUBJECTS, INITIAL_ASSIGNMENTS, subjectNamestoSubjects } from "./data";
import OnboardingModal from "./components/OnboardingModal";
import { supabase } from "./lib/supabase";
import type { User } from "@supabase/supabase-js";

// Sub-page components
import DashboardPage from "./components/DashboardPage";
import AttendancePage from "./components/AttendancePage";
import ResourcesPage from "./components/ResourcesPage";
import AssignmentsPage from "./components/AssignmentsPage";
import TimetablePage from "./components/TimetablePage";
import AnalyticsPage from "./components/AnalyticsPage";
import LoginPage from "./components/LoginPage";

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
  const [authLoading, setAuthLoading] = useState(true);

  // ── Navigation ────────────────────────────────────────────────────────────
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split("/")[1] || "dashboard";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Live persistent states ────────────────────────────────────────────────
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("ATTENDANCE_HUB_SUBJECTS");
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem("ATTENDANCE_HUB_ASSIGNMENTS");
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  // ── Dark / Light Mode ─────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("ATTENDANCE_HUB_THEME");
    return saved !== "light";
  });

  // ── Global search ─────────────────────────────────────────────────────────
  const [globalSearch, setGlobalSearch] = useState<string>("");

  // ── Profile ───────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("ATTENDANCE_HUB_PROFILE");
    return saved ? JSON.parse(saved) : {
      name: "Student",
      rollNo: "2K24/---/---",
      branch: "Computer Science & Engineering",
      semester: "2nd Semester",
      section: "A",
    };
  });

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAttendanceLogModal, setShowAttendanceLogModal] = useState(false);
  const [attendanceLogDate, setAttendanceLogDate] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // ── Onboarding ────────────────────────────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ── Toast notification ────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadUserData(u);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadUserData(u);
      else {
        setAuthLoading(false);
        setSubjects(INITIAL_SUBJECTS);
        setAssignments(INITIAL_ASSIGNMENTS);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load user data from Supabase ──────────────────────────────────────────
  const loadUserData = async (u: User) => {
    setAuthLoading(true);
    console.log("[Attendance Hub] loadUserData started...");
    const t0 = performance.now();
    try {
      // 1. Fetch profile FIRST — gate everything on onboarding_done
      const pStart = performance.now();
      const { data: pData, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();
      console.log(`[Attendance Hub] Profile fetch took ${(performance.now() - pStart).toFixed(2)}ms`);

      console.log("[Attendance Hub] Profile loaded:", pData, pErr);

      if (pData) {
        setProfile({
          name:     pData.full_name  || u.user_metadata?.full_name || "Student",
          rollNo:   pData.roll_no    || "2K24/---/---",
          branch:   pData.branch     || "Computer Science & Engineering",
          semester: pData.semester   || "2nd Semester",
          section:  pData.section    || "1",
        });

        // Load subjects saved from onboarding (if any)
        if (pData.subjects && Array.isArray(pData.subjects) && pData.subjects.length > 0) {
          setSubjects(subjectNamestoSubjects(pData.subjects));
        }

        // If onboarding not completed, show it and STOP — don't load other data yet
        if (pData.onboarding_done !== true) {
          console.log("[Attendance Hub] Onboarding not done — showing modal");
          setShowOnboarding(true);
          setAuthLoading(false);
          return;
        }

        console.log("[Attendance Hub] Onboarding done — going to dashboard");
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
        console.log("[Attendance Hub] New user — profile created, showing onboarding");
        setProfile(prev => ({ ...prev, name: displayName }));
        setShowOnboarding(true);
        setAuthLoading(false);
        return; // don't load attendance/assignments for new users
      }

      // 2 & 3. Fetch Attendance and Assignments IN PARALLEL
      const parallelStart = performance.now();
      const [attRes, asgRes] = await Promise.all([
        supabase.from("attendance").select("*").eq("user_id", u.id),
        supabase.from("assignments").select("*").eq("user_id", u.id).order("created_at", { ascending: false })
      ]);
      console.log(`[Attendance Hub] Parallel fetch took ${(performance.now() - parallelStart).toFixed(2)}ms`);

      const attData = attRes.data;
      if (attData && attData.length > 0) {
        setSubjects(prev =>
          prev.map(sub => {
            const saved = attData.find(a => a.subject_id === sub.id);
            return saved
              ? { ...sub, attendanceCount: saved.attendance_count, totalClasses: saved.total_classes }
              : sub;
          })
        );
      }

      const asgData = asgRes.data;
      if (asgData && asgData.length > 0) {
        setAssignments(
          asgData.map(a => ({
            id:          a.id,
            title:       a.title,
            description: a.description,
            subjectId:   a.subject_id,
            subjectName: a.subject_name,
            dueDate:     a.due_date,
            status:      a.status as "URGENT" | "UPCOMING" | "COMPLETED",
          }))
        );
      }

      console.log(`[Attendance Hub] loadUserData done in ${(performance.now() - t0).toFixed(2)}ms`);
    } catch (err) {
      console.error("[Attendance Hub] loadUserData error:", err);
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
    console.log("[Attendance Hub] Saving to Supabase in background...");
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
        console.log(`[Attendance Hub] Background save took ${(performance.now() - saveStart).toFixed(0)}ms`);
        if (error) {
          console.error("[Attendance Hub] Background save FAILED:", error);
          showToast("Saved locally. Cloud sync failed — check connection.", "error");
        } else {
          console.log("[Attendance Hub] \u2705 Supabase save confirmed — onboarding_done=true");
          showToast("Profile saved! Welcome to Attendance Hub \uD83C\uDF89");
        }
      });
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSubjects(INITIAL_SUBJECTS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setProfile({ name: "Student", rollNo: "2K24/---/---", branch: "Computer Science & Engineering", semester: "2nd Semester", section: "A" });
    setShowProfileModal(false);
    setShowOnboarding(false);
  };

  // ── Attendance handler (4 statuses) ──────────────────────────────────────
  const handleMarkAttendance = async (subjectId: string, status: AttendanceStatus) => {
    const currentSub = subjects.find(s => s.id === subjectId);
    if (!currentSub) return;

    let updated = { ...currentSub };
    switch (status) {
      case "present": updated = { ...currentSub, attendanceCount: currentSub.attendanceCount + 1, totalClasses: currentSub.totalClasses + 1 }; break;
      case "absent":
      case "miss":    updated = { ...currentSub, totalClasses: currentSub.totalClasses + 1 }; break;
      case "leave":   break; // no change
    }

    setSubjects(prev => prev.map(sub => sub.id === subjectId ? updated : sub));

    if (user && status !== "leave") {
      const saveStart = performance.now();
      await supabase.from("attendance").upsert({
        user_id:          user.id,
        subject_id:       updated.id,
        subject_name:     updated.name,
        attendance_count: updated.attendanceCount,
        total_classes:    updated.totalClasses,
        updated_at:       new Date().toISOString(),
      }, { onConflict: "user_id,subject_id" });
      console.log(`[Attendance Hub] Mark attendance save took ${(performance.now() - saveStart).toFixed(2)}ms`);
    }

    const labels: Record<AttendanceStatus, string> = {
      present: "✅ Present marked",
      absent:  "❌ Absent marked",
      miss:    "☕ Missed (counted as absent)",
      leave:   "✈️ Leave — not counted",
    };
    console.log(`${labels[status]} for ${currentSub.name}`);
  };

  // ── Attendance adjustment (from attendance page) ──────────────────────────
  const handleUpdateSubjectHours = async (id: string, attended: number, total: number) => {
    const newAttended = Math.max(0, attended);
    const newTotal    = Math.max(0, total);

    setSubjects(prev =>
      prev.map(sub => sub.id === id ? { ...sub, attendanceCount: newAttended, totalClasses: newTotal } : sub)
    );

    if (user) {
      const sub = subjects.find(s => s.id === id);
      if (sub) {
        await supabase.from("attendance").upsert({
          user_id:          user.id,
          subject_id:       id,
          subject_name:     sub.name,
          attendance_count: newAttended,
          total_classes:    newTotal,
          updated_at:       new Date().toISOString(),
        }, { onConflict: "user_id,subject_id" });
      }
    }
  };

  // ── Assignments CRUD ──────────────────────────────────────────────────────
  const handleAddAssignment = async (newAsg: Omit<Assignment, "id">) => {
    if (user) {
      const { data, error } = await supabase
        .from("assignments")
        .insert({
          user_id:      user.id,
          title:        newAsg.title,
          description:  newAsg.description,
          subject_id:   newAsg.subjectId,
          subject_name: newAsg.subjectName,
          due_date:     newAsg.dueDate,
          status:       newAsg.status,
        })
        .select()
        .single();
      if (!error && data) {
        setAssignments(prev => [{
          id:          data.id,
          title:       data.title,
          description: data.description,
          subjectId:   data.subject_id,
          subjectName: data.subject_name,
          dueDate:     data.due_date,
          status:      data.status,
        }, ...prev]);
      }
    } else {
      setAssignments(prev => [{ ...newAsg, id: `asg-${Date.now()}` }, ...prev]);
    }
  };

  const handleToggleAssignment = async (id: string) => {
    const asg = assignments.find(a => a.id === id);
    if (!asg) return;
    const newStatus = asg.status === "COMPLETED" ? "UPCOMING" : "COMPLETED";
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    if (user) {
      await supabase.from("assignments").update({ status: newStatus }).eq("id", id).eq("user_id", user.id);
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
    setProfile(editProfile);
    setIsEditingProfile(false);
    if (user) {
      await supabase.from("profiles").upsert({
        id:         user.id,
        email:      user.email,
        full_name:  editProfile.name,
        roll_no:    editProfile.rollNo,
        branch:     editProfile.branch,
        semester:   editProfile.semester,
        section:    editProfile.section,
        updated_at: new Date().toISOString(),
      });
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
    if (!feedbackText.trim()) { alert("Please enter feedback."); return; }
    console.log("Feedback:", feedbackText, feedbackEmail);
    setFeedbackText(""); setFeedbackEmail("");
    setShowFeedbackModal(false);
    alert("Thank you for your feedback! 🙏");
  };

  // ── Open attendance log modal ─────────────────────────────────────────────
  const handleOpenAttendanceLog = (date?: number) => {
    setAttendanceLogDate(date ?? null);
    setShowAttendanceLogModal(true);
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

  // ── Google avatar URL ─────────────────────────────────────────────────────
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials  = profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  // ═══════════════════════════════════════════════════════════════════════════
  // Loading screen
  // ═══════════════════════════════════════════════════════════════════════════
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b1326] flex flex-col items-center justify-center gap-5">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#1AE7A6] to-[#00C896] flex items-center justify-center shadow-2xl shadow-[#1AE7A6]/30">
          <span className="material-symbols-outlined text-[#002114] text-3xl">school</span>
        </div>
        <div className="w-7 h-7 border-2 border-[#1AE7A6] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#bacbbf] text-sm font-mono">Loading your workspace...</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Route Guards — Enforce auth and onboarding status
  // ═══════════════════════════════════════════════════════════════════════════
  if (!user && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }
  if (user && location.pathname === "/login") {
    return <Navigate to="/dashboard" replace />;
  }
  if (user && showOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  if (user && !showOnboarding && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }
  if (location.pathname === "/") {
    return <Navigate to="/dashboard" replace />;
  }

  // ── Public layout (Login) ─────────────────────────────────────────────────
  if (!user) {
    return <LoginPage />;
  }

  // ── Onboarding Modal overlay ──────────────────────────────────────────────
  if (showOnboarding) {
    return <OnboardingModal userName={profile.name} onComplete={handleOnboardingComplete} />;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Main App
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`min-h-screen flex ${isDarkMode ? "bg-[#0b1326] text-[#dae2fd]" : "bg-[#F8F9FA] text-[#111827]"}`}>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Toast notification ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all duration-300 ${
            toast.type === "success"
              ? "bg-[#0d1e17] border-[#1AE7A6]/40 text-[#1AE7A6]"
              : "bg-[#1e0d0d] border-red-500/40 text-red-300"
          }`}
          style={{ minWidth: "260px" }}
        >
          <span className="material-symbols-outlined text-xl flex-shrink-0">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed left-0 top-0 h-full w-[260px] border-r flex flex-col py-6 z-40 transition-all duration-300 ${
        isDarkMode ? "bg-[#0b1326] border-[#3b4a42]/30" : "bg-white border-[#E5E7EB]"
      } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>

        <div className="px-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-primary-container font-sans flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[24px]">terminal</span>
              <span>Attendance Hub</span>
            </h1>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mt-0.5">CSE • Section {profile.section}</p>
          </div>
          <button
            className="lg:hidden p-1 text-on-surface-variant hover:text-primary cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 select-none">
          {navItems.map((nav) => {
            const isActive = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => { navigate(`/${nav.id}`); setSidebarOpen(false); }}
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
              <p className="text-[9px] text-on-surface-variant truncate">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
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
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile) */}
            <button
              className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-on-surface font-sans truncate">{getHeaderTitle()}</h2>
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
              onClick={() => alert("All caught up! No new notifications.")}
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
              className="w-9 h-9 rounded-full overflow-hidden hover:scale-105 cursor-pointer transition-transform border-2 border-primary-container"
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar pb-24">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/dashboard" element={
                <DashboardPage
                  subjects={subjects}
                  assignments={assignments}
                  onMarkAttendance={handleMarkAttendance}
                  onOpenAttendanceLog={handleOpenAttendanceLog}
                  setActiveTab={(tab) => navigate(`/${tab}`)}
                  isDarkMode={isDarkMode}
                />
              } />
              <Route path="/attendance" element={
                <AttendancePage subjects={subjects} onUpdateSubjectHours={handleUpdateSubjectHours} isDarkMode={isDarkMode} />
              } />
              <Route path="/resources" element={
                <ResourcesPage subjects={subjects} />
              } />
              <Route path="/assignments" element={
                <AssignmentsPage
                  assignments={assignments}
                  onAddAssignment={handleAddAssignment}
                  onToggleAssignment={handleToggleAssignment}
                  onDeleteAssignment={handleDeleteAssignment}
                />
              } />
              <Route path="/timetable" element={
                <TimetablePage onMarkAttendance={(id, isPresent) => handleMarkAttendance(id, isPresent ? "present" : "absent")} />
              } />
              <Route path="/analytics" element={
                <AnalyticsPage subjects={subjects} isDarkMode={isDarkMode} />
              } />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t flex items-center justify-around h-16 px-2 ${isDarkMode ? "bg-[#0b1326] border-[#3b4a42]/30" : "bg-white border-[#E5E7EB]"}`}>
          {navItems.slice(0, 5).map((nav) => {
            const isActive = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => { navigate(`/${nav.id}`); }}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all cursor-pointer ${
                  isActive ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isActive ? "text-primary" : ""}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {nav.icon}
                </span>
                <span className="text-[9px] font-bold font-mono">{nav.label.slice(0, 5)}</span>
              </button>
            );
          })}
          <button
            onClick={() => { navigate('/analytics'); }}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === "analytics" ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-xl">leaderboard</span>
            <span className="text-[9px] font-bold font-mono">Stats</span>
          </button>
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
                    { label: "Semester",     key: "semester", type: "text" },
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
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Section</label>
                    <select
                      value={editProfile.section}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, section: e.target.value }))}
                      className="w-full bg-[#0b1326] border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface focus:border-primary outline-none"
                    >
                      {["A", "B", "C", "D"].map(s => <option key={s}>{s}</option>)}
                    </select>
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
                {attendanceLogDate
                  ? `${attendanceLogDate} ${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`
                  : "Recent entries"}
              </p>

              <div className="space-y-3">
                {subjects.slice(0, 4).map((sub) => {
                  const pct = sub.totalClasses > 0 ? ((sub.attendanceCount / sub.totalClasses) * 100).toFixed(0) : "0";
                  return (
                    <div key={sub.id} className="bg-surface-container-high p-4 rounded-xl flex justify-between items-center border border-outline-variant/50">
                      <div>
                        <p className="font-bold text-xs text-on-surface">{sub.name} <span className="font-mono text-[10px] text-on-surface-variant">({sub.type ?? "LEC"})</span></p>
                        <p className={`text-[10px] font-mono font-bold mt-0.5 ${Number(pct) >= 75 ? "text-primary" : "text-error"}`}>
                          {pct}% — {Number(pct) >= 75 ? "Safe ✔" : "Danger ⚠"}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleMarkAttendance(sub.id, "present")}
                          className="text-[10px] font-bold border border-primary/30 text-primary px-2.5 py-1 bg-[#131b2e] rounded-lg cursor-pointer hover:bg-primary hover:text-[#002114] transition-all"
                        >+P</button>
                        <button
                          onClick={() => handleMarkAttendance(sub.id, "absent")}
                          className="text-[10px] font-bold border border-error/30 text-error px-2.5 py-1 bg-[#131b2e] rounded-lg cursor-pointer hover:bg-error hover:text-white transition-all"
                        >-A</button>
                      </div>
                    </div>
                  );
                })}
              </div>

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
    </div>
  );
}
