/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Subject, Assignment, AttendanceStatus } from "./types";
import { INITIAL_SUBJECTS, INITIAL_ASSIGNMENTS } from "./data";

// Sub-page components
import DashboardPage from "./components/DashboardPage";
import AttendancePage from "./components/AttendancePage";
import ResourcesPage from "./components/ResourcesPage";
import AssignmentsPage from "./components/AssignmentsPage";
import TimetablePage from "./components/TimetablePage";
import AnalyticsPage from "./components/AnalyticsPage";

import {
  Sun,
  Moon,
  Bell,
  Search,
  X,
  MessageSquare,
  Save,
  Edit2,
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
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live persistent states
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("DTU_HUB_SUBJECTS");
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem("DTU_HUB_ASSIGNMENTS");
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  // Dark / Light Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("DTU_HUB_THEME");
    return saved !== "light";
  });

  // Global search
  const [globalSearch, setGlobalSearch] = useState<string>("");

  // Profile
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("DTU_HUB_PROFILE");
    return saved ? JSON.parse(saved) : {
      name: "Aryan Sharma",
      rollNo: "2K24/CSE/042",
      branch: "Computer Science & Engineering",
      semester: "2nd Semester",
      section: "A",
    };
  });

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAttendanceLogModal, setShowAttendanceLogModal] = useState(false);
  const [attendanceLogDate, setAttendanceLogDate] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfile, setEditProfile] = useState<StudentProfile>(profile);

  // Feedback form
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");

  // ── Sync localStorage ────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("DTU_HUB_SUBJECTS", JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem("DTU_HUB_ASSIGNMENTS", JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem("DTU_HUB_PROFILE", JSON.stringify(profile)); }, [profile]);
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark"); root.classList.remove("light");
      localStorage.setItem("DTU_HUB_THEME", "dark");
    } else {
      root.classList.remove("dark"); root.classList.add("light");
      localStorage.setItem("DTU_HUB_THEME", "light");
    }
  }, [isDarkMode]);

  // ── Attendance handler (4 statuses) ─────────────────────────────────────
  const handleMarkAttendance = (subjectId: string, status: AttendanceStatus) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        switch (status) {
          case "present":
            return { ...sub, attendanceCount: sub.attendanceCount + 1, totalClasses: sub.totalClasses + 1 };
          case "absent":
            return { ...sub, totalClasses: sub.totalClasses + 1 };
          case "miss":
            // Miss = absent without counting against — totalClasses increments, present doesn't
            return { ...sub, totalClasses: sub.totalClasses + 1 };
          case "leave":
            // Leave = doesn't count at all (medical/sanctioned)
            return sub;
          default:
            return sub;
        }
      })
    );
    const labels: Record<AttendanceStatus, string> = {
      present: "✅ Present marked",
      absent: "❌ Absent marked",
      miss: "☕ Missed (counted as absent)",
      leave: "✈️ Leave — not counted",
    };
    const name = subjects.find(s => s.id === subjectId)?.name ?? subjectId;
    // brief non-blocking toast via title temporarily (avoids alert() blocking)
    console.log(`${labels[status]} for ${name}`);
  };

  // ── Attendance adjustment (from attendance page) ─────────────────────────
  const handleUpdateSubjectHours = (id: string, attended: number, total: number) => {
    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, attendanceCount: Math.max(0, attended), totalClasses: Math.max(0, total) } : sub
      )
    );
  };

  // ── Assignments CRUD ─────────────────────────────────────────────────────
  const handleAddAssignment = (newAsg: Omit<Assignment, "id">) => {
    const id = `asg-${Date.now()}`;
    setAssignments((prev) => [{ ...newAsg, id }, ...prev]);
  };

  const handleToggleAssignment = (id: string) => {
    setAssignments((prev) =>
      prev.map((asg) =>
        asg.id === id ? { ...asg, status: asg.status === "COMPLETED" ? "UPCOMING" : "COMPLETED" } : asg
      )
    );
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((asg) => asg.id !== id));
  };

  // ── Profile Save ─────────────────────────────────────────────────────────
  const handleSaveProfile = () => {
    setProfile(editProfile);
    setIsEditingProfile(false);
  };

  // ── Header title ─────────────────────────────────────────────────────────
  const getHeaderTitle = () => {
    const m: Record<string, string> = {
      dashboard: `Welcome back, ${profile.name.split(" ")[0]}`,
      attendance: "Attendance Tracker",
      resources: "Academic Resources",
      assignments: "Assignments Timeline",
      timetable: "Weekly Schedule Grid",
      analytics: "Academic Analytics",
    };
    return m[activeTab] ?? "DTU Hub";
  };

  // ── Feedback submit ──────────────────────────────────────────────────────
  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) { alert("Please enter feedback."); return; }
    console.log("Feedback:", feedbackText, feedbackEmail);
    setFeedbackText(""); setFeedbackEmail("");
    setShowFeedbackModal(false);
    alert("Thank you for your feedback! 🙏");
  };

  // ── Open attendance log modal ────────────────────────────────────────────
  const handleOpenAttendanceLog = (date?: number) => {
    setAttendanceLogDate(date ?? null);
    setShowAttendanceLogModal(true);
  };

  // ── Nav items ────────────────────────────────────────────────────────────
  const navItems = [
    { id: "dashboard",   label: "Dashboard",   icon: "dashboard" },
    { id: "attendance",  label: "Attendance",  icon: "event_available" },
    { id: "resources",   label: "Resources",   icon: "menu_book" },
    { id: "assignments", label: "Assignments", icon: "assignment" },
    { id: "timetable",   label: "Timetable",   icon: "calendar_today" },
    { id: "analytics",   label: "Analytics",   icon: "leaderboard" },
  ];

  return (
    <div className={`min-h-screen flex ${isDarkMode ? "bg-[#0b1326] text-[#dae2fd]" : "bg-[#f8fafc] text-[#1e293b]"}`}>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed left-0 top-0 h-full w-[260px] border-r flex flex-col py-6 z-40 transition-all duration-300 ${
        isDarkMode ? "bg-[#0b1326] border-[#3b4a42]/30" : "bg-white border-slate-200"
      } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>

        <div className="px-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-primary-container font-sans flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[24px]">terminal</span>
              <span>DTU Hub</span>
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
                onClick={() => { setActiveTab(nav.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-all relative cursor-pointer group active:scale-[0.98] ${
                  isActive
                    ? isDarkMode
                      ? "bg-[#2d3449] text-[#82ffc8] border-l-4 border-[#47ffbc]"
                      : "bg-[#f1f5f9] text-[#006c4b] border-l-4 border-[#006c4b]"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20"
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

        {/* Sidebar footer — attendance summary */}
        <div className="mx-4 mt-4 p-4 rounded-xl bg-surface-container border border-outline-variant/50">
          <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider mb-1">Overall Attendance</p>
          {(() => {
            const total = subjects.reduce((s, x) => s + x.totalClasses, 0);
            const attended = subjects.reduce((s, x) => s + x.attendanceCount, 0);
            const pct = total > 0 ? (attended / total) * 100 : 0;
            return (
              <>
                <p className={`text-xl font-black font-mono ${pct >= 75 ? "text-primary" : "text-error"}`}>{pct.toFixed(1)}%</p>
                <div className="w-full h-1.5 bg-[#2d3449] rounded-full mt-2 overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 75 ? "bg-primary" : "bg-error"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">{attended}/{total} classes attended</p>
              </>
            );
          })()}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="lg:pl-[260px] flex-1 flex flex-col min-h-screen transition-colors duration-300">

        {/* ── HEADER ── */}
        <header className={`h-16 border-b flex justify-between items-center px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-300 ${
          isDarkMode ? "bg-[#0b1326] border-[#3b4a42]/30" : "bg-white border-slate-200"
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
                    setActiveTab("resources");
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
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-[#002114] text-sm hover:scale-105 cursor-pointer transition-transform border-2 border-primary-container"
              title="View Profile"
            >
              {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar pb-24">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <DashboardPage
                subjects={subjects}
                assignments={assignments}
                onMarkAttendance={handleMarkAttendance}
                onOpenAttendanceLog={handleOpenAttendanceLog}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === "attendance" && (
              <AttendancePage subjects={subjects} onUpdateSubjectHours={handleUpdateSubjectHours} />
            )}
            {activeTab === "resources" && (
              <ResourcesPage subjects={subjects} />
            )}
            {activeTab === "assignments" && (
              <AssignmentsPage
                assignments={assignments}
                onAddAssignment={handleAddAssignment}
                onToggleAssignment={handleToggleAssignment}
                onDeleteAssignment={handleDeleteAssignment}
              />
            )}
            {activeTab === "timetable" && (
              <TimetablePage onMarkAttendance={(id, isPresent) => handleMarkAttendance(id, isPresent ? "present" : "absent")} />
            )}
            {activeTab === "analytics" && (
              <AnalyticsPage subjects={subjects} />
            )}
          </div>
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t flex items-center justify-around h-16 bg-[#0b1326] border-[#3b4a42]/30 px-2">
          {navItems.slice(0, 5).map((nav) => {
            const isActive = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all cursor-pointer ${
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
            onClick={() => setActiveTab("analytics")}
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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-[#002114] text-3xl border-4 border-primary-container mb-3">
                  {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                {!isEditingProfile && (
                  <>
                    <h3 className="text-lg font-bold text-on-surface">{profile.name}</h3>
                    <p className="text-primary text-xs font-mono font-bold mt-0.5">{profile.rollNo}</p>
                  </>
                )}
              </div>

              {isEditingProfile ? (
                /* Edit Form */
                <div className="space-y-3">
                  {[
                    { label: "Full Name", key: "name", type: "text" },
                    { label: "Roll Number", key: "rollNo", type: "text" },
                    { label: "Branch", key: "branch", type: "text" },
                    { label: "Semester", key: "semester", type: "text" },
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
                    { label: "Branch", value: profile.branch },
                    { label: "Semester", value: profile.semester },
                    { label: "Section", value: profile.section },
                    { label: "Roll Number", value: profile.rollNo },
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

              <h3 className="font-bold text-lg text-on-surface mb-1">
                Attendance Log
              </h3>
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
                  <p className="text-[10px] text-on-surface-variant">Help improve DTU Hub</p>
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
