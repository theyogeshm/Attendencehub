/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Public Landing & Sign-in Page
 * Serves as the primary public entry point for visitors, DTU students,
 * and search engine / Google AdSense review crawlers.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { checkRateLimit } from "../lib/security";
import {
  Shield,
  Calendar,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Mail,
  MapPin,
  Sparkles,
  HelpCircle,
  Users,
  GraduationCap
} from "lucide-react";

interface LandingPageProps {
  onToast?: (msg: string, type: "success" | "error" | "info") => void;
  isDarkMode?: boolean;
}

export default function LandingPage({ onToast, isDarkMode = true }: LandingPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGoogleLogin = async () => {
    if (!checkRateLimit("google-login", 5, 10 * 60_000)) {
      const msg = "Too many login attempts. Please wait a few minutes before trying again.";
      setError(msg);
      onToast?.(msg, "error");
      return;
    }

    setLoading(true);
    setError(null);

    const safeRedirectOrigin =
      import.meta.env.VITE_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: safeRedirectOrigin,
      },
    });

    if (authError) {
      setError(authError.message);
      onToast?.(authError.message, "error");
      setLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does Attendance Hub calculate my 75% attendance buffer?",
      a: "Attendance Hub continuously compares your attended classes against the total classes held. If your current attendance is 75% or higher, the calculator computes how many consecutive upcoming classes you can miss while keeping your percentage at or above 75%. If your attendance falls below 75%, it calculates the exact number of consecutive classes you must attend without absence to return to safe examination eligibility.",
    },
    {
      q: "Is my personal attendance and timetable data kept private?",
      a: "Yes, completely. Attendance Hub uses Supabase authentication and PostgreSQL Row-Level Security (RLS) policies. Every marked attendance entry, subject preference, and custom assignment is tied cryptographically to your unique user ID. No other student or third party can query or view your academic records.",
    },
    {
      q: "Which branches and semesters are currently supported?",
      a: "Attendance Hub currently includes pre-configured timetables and subject mappings for DTU Computer Science & Engineering (CSE) Semesters 1, 3, 5, and 7, including specific section schedules (A1, A2, A3, A4) and lab practical batches. Students from other branches or semesters can also customize and track their own subjects effortlessly.",
    },
    {
      q: "Is Attendance Hub free to use?",
      a: "Yes, Attendance Hub is 100% free and open for DTU students. It is an educational utility built by students to streamline daily college life.",
    },
    {
      q: "How do I report an incorrect timetable slot or suggest new study materials?",
      a: "You can send us an email directly at contact@attendancehub.me or use the in-app feedback channel once logged in. Our maintainers review course updates every semester.",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#0b1326] text-[#dae2fd]" : "bg-[#F8F9FA] text-[#111827]"
      }`}
    >
      {/* ── STICKY TOP NAVBAR ── */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors ${
          isDarkMode
            ? "bg-[#0b1326]/90 border-[#3b4a42]/30"
            : "bg-white/90 border-[#E5E7EB]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1AE7A6] to-[#00C896] flex items-center justify-center text-[#002114] shadow-md shadow-[#1AE7A6]/20">
            <span className="material-symbols-outlined text-xl font-black">school</span>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight block leading-tight">
              Attendance <span className="text-primary-container">Hub</span>
            </span>
            <span className="text-[10px] text-on-surface-variant font-mono tracking-wider uppercase block">
              DTU Academic Portal
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-on-surface-variant">
          <a href="#features" className="hover:text-primary-container transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-primary-container transition-colors">
            How It Works
          </a>
          <a href="#about" className="hover:text-primary-container transition-colors">
            About
          </a>
          <a href="#faq" className="hover:text-primary-container transition-colors">
            FAQ
          </a>
          <Link to="/privacy-policy" className="hover:text-primary-container transition-colors">
            Privacy Policy
          </Link>
        </nav>

        {/* Sign In CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1AE7A6] to-[#00C896] text-[#002114] rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#1AE7A6]/20 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm font-black">login</span>
            <span>{loading ? "Connecting..." : "Sign In"}</span>
          </button>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Ambient glow orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary-container/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline & Substantial Narrative */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-container/10 text-primary-container border border-primary-container/20">
              <GraduationCap className="w-4 h-4" />
              <span>Designed for Delhi Technological University Students</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]">
              Never Drop Below <span className="text-primary-container">75%</span>. Track Your Classes with Precision.
            </h1>

            <p
              className={`text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 ${
                isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"
              }`}
            >
              Attendance Hub is the smart academic portal built specifically for DTU undergraduates.
              Effortlessly log attendance across theory lectures and lab sessions, calculate your
              exact bunk buffer, access verified semester timetables, review assignment deadlines,
              and download course materials — all in one centralized student dashboard.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
              <div
                className={`p-3 rounded-xl border text-center ${
                  isDarkMode
                    ? "bg-[#10192e]/80 border-[#3b4a42]/30"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="text-xl sm:text-2xl font-black text-primary-container font-mono">
                  75%
                </div>
                <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                  Target Criteria
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border text-center ${
                  isDarkMode
                    ? "bg-[#10192e]/80 border-[#3b4a42]/30"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="text-xl sm:text-2xl font-black text-secondary font-mono">
                  CSE
                </div>
                <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                  Sem 1, 3, 5, 7 Schedules
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border text-center ${
                  isDarkMode
                    ? "bg-[#10192e]/80 border-[#3b4a42]/30"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="text-xl sm:text-2xl font-black text-[#f5a623] font-mono">
                  Free
                </div>
                <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                  Open Educational Tool
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Google Sign In Card */}
          <div className="lg:col-span-5">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl relative ${
                isDarkMode
                  ? "bg-[#10192e]/90 border-primary-container/20"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1AE7A6] to-[#00C896] text-[#002114] mb-3 shadow-lg shadow-[#1AE7A6]/20">
                  <span className="material-symbols-outlined text-2xl font-bold">lock_open</span>
                </div>
                <h2 className="text-xl font-black tracking-tight">Access Your Portal</h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Sign in with your DTU Google account for single sign-on access
                </p>
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-[#111827] font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5 text-[#111827]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>{loading ? "Authenticating..." : "Continue with Google"}</span>
              </button>

              {error && (
                <p className="mt-3 text-center text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl py-2 px-3">
                  {error}
                </p>
              )}

              {/* Security Pill list */}
              <div className="mt-6 pt-5 border-t border-outline-variant/20 space-y-2 text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-container shrink-0" />
                  <span>Individual data isolated via PostgreSQL RLS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-container shrink-0" />
                  <span>Real-time cloud synchronization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-container shrink-0" />
                  <span>Customizable for any DTU branch or section</span>
                </div>
              </div>

              {/* Direct Link to Privacy Policy */}
              <div className="mt-4 text-center">
                <Link
                  to="/privacy-policy"
                  className="text-[11px] text-on-surface-variant/70 hover:text-primary-container underline transition-colors"
                >
                  Read our Privacy Policy &amp; Cookie Notice
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DETAILED FEATURES SECTION ── */}
      <section id="features" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-outline-variant/20">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built Specifically For DTU</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Features Tailored for Engineering Students
          </h2>
          <p
            className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed ${
              isDarkMode ? "text-[#bacbbf]" : "text-gray-600"
            }`}
          >
            Attendance Hub replaces messy spreadsheets and guesswork with intelligent tracking,
            official timetables, and academic utilities designed around Delhi Technological University guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div
            className={`p-6 rounded-2xl border space-y-3 transition-all hover:border-primary-container/40 ${
              isDarkMode ? "bg-[#10192e] border-[#3b4a42]/30" : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">event_available</span>
            </div>
            <h3 className="text-base font-bold">Smart Attendance &amp; 75% Bunk Buffer</h3>
            <p
              className={`text-xs leading-relaxed ${
                isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"
              }`}
            >
              DTU mandates a strict 75% attendance rule for semester exam eligibility. Attendance Hub
              automatically calculates how many consecutive classes you can safely skip, or exactly how
              many you must attend to pull your percentage out of the danger zone.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className={`p-6 rounded-2xl border space-y-3 transition-all hover:border-secondary/40 ${
              isDarkMode ? "bg-[#10192e] border-[#3b4a42]/30" : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">Interactive Semester Timetables</h3>
            <p
              className={`text-xs leading-relaxed ${
                isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"
              }`}
            >
              No more searching through cluttered WhatsApp groups for timetable PDFs. View clean,
              weekday-by-weekday schedules with classroom room numbers, lecture timings, and practical
              lab batch splits (A1, A2, A3, etc.).
            </p>
          </div>

          {/* Feature 3 */}
          <div
            className={`p-6 rounded-2xl border space-y-3 transition-all hover:border-[#f5a623]/40 ${
              isDarkMode ? "bg-[#10192e] border-[#3b4a42]/30" : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#f5a623]/15 text-[#f5a623] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">Curated Subject Resources &amp; PYQs</h3>
            <p
              className={`text-xs leading-relaxed ${
                isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"
              }`}
            >
              Access centralized academic repositories for each subject code. Find syllabus reference
              books, lecture slides, lab manuals, and previous year examination questions (PYQs)
              shared by university faculty and high-scoring seniors.
            </p>
          </div>

          {/* Feature 4 */}
          <div
            className={`p-6 rounded-2xl border space-y-3 transition-all hover:border-primary-container/40 ${
              isDarkMode ? "bg-[#10192e] border-[#3b4a42]/30" : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">assignment</span>
            </div>
            <h3 className="text-base font-bold">Assignment Deadline Manager</h3>
            <p
              className={`text-xs leading-relaxed ${
                isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"
              }`}
            >
              Keep track of continuous assessment milestones, lab file submissions, mid-semester
              assignments, and presentation schedules so you never incur a late penalty or forfeit
              internal marks.
            </p>
          </div>

          {/* Feature 5 */}
          <div
            className={`p-6 rounded-2xl border space-y-3 transition-all hover:border-[#7bd0ff]/40 ${
              isDarkMode ? "bg-[#10192e] border-[#3b4a42]/30" : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#7bd0ff]/15 text-[#7bd0ff] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">Visual Academic Analytics</h3>
            <p
              className={`text-xs leading-relaxed ${
                isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"
              }`}
            >
              Inspect color-coded status badges, subject percentage meters, and attendance trajectories
              to maintain a balanced academic record across the entire 14-week semester cycle.
            </p>
          </div>

          {/* Feature 6 */}
          <div
            className={`p-6 rounded-2xl border space-y-3 transition-all hover:border-secondary/40 ${
              isDarkMode ? "bg-[#10192e] border-[#3b4a42]/30" : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">Privacy-First Cloud Architecture</h3>
            <p
              className={`text-xs leading-relaxed ${
                isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"
              }`}
            >
              Built on PostgreSQL Row Level Security (RLS). Your attendance records are isolated
              exclusively to your authenticated Google account. We do not sell, rent, or trade your
              academic information.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-outline-variant/20">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">How Attendance Hub Works</h2>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto ${isDarkMode ? "text-[#bacbbf]" : "text-gray-600"}`}>
            Three straightforward steps to take control of your university schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`p-6 rounded-2xl border text-center space-y-3 ${
              isDarkMode ? "bg-[#10192e] border-[#3b4a42]/30" : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-primary-container text-[#002114] font-black flex items-center justify-center mx-auto text-base">
              1
            </div>
            <h3 className="font-bold text-sm">Sign in with Google</h3>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"}`}>
              Log in with your college Google account. No manual password creation or tedious sign-up forms required.
            </p>
          </div>

          <div
            className={`p-6 rounded-2xl border text-center space-y-3 ${
              isDarkMode ? "bg-[#10192e] border-[#3b4a42]/30" : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-secondary text-[#002114] font-black flex items-center justify-center mx-auto text-base">
              2
            </div>
            <h3 className="font-bold text-sm">Select Your Semester &amp; Section</h3>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"}`}>
              Choose your semester (e.g. 3rd Semester) and section (e.g. A3). The portal automatically pulls your official subjects and schedule.
            </p>
          </div>

          <div
            className={`p-6 rounded-2xl border text-center space-y-3 ${
              isDarkMode ? "bg-[#10192e] border-[#3b4a42]/30" : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#f5a623] text-[#002114] font-black flex items-center justify-center mx-auto text-base">
              3
            </div>
            <h3 className="font-bold text-sm">Log Classes with One Tap</h3>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"}`}>
              Mark classes present or absent after every lecture. The live bunk buffer recalculates instantly so you always know your standing.
            </p>
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" className="py-16 px-4 sm:px-6 max-w-4xl mx-auto border-t border-outline-variant/20">
        <div
          className={`p-6 sm:p-10 rounded-3xl border space-y-4 ${
            isDarkMode
              ? "bg-[#10192e] border-[#3b4a42]/40"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-container/15 text-primary-container">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black">About Attendance Hub</h2>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"}`}>
            Attendance Hub was founded by students at <strong>Delhi Technological University (formerly Delhi College of Engineering — DCE)</strong> to solve a universal college problem: staying compliant with the university&apos;s rigorous 75% attendance policy while managing competitive exams, internships, project work, and society activities.
          </p>

          <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"}`}>
            Unlike generic habit-tracking apps, Attendance Hub is custom-architected for DTU&apos;s academic structure. It accounts for practical lab hours, tutorial batches, semester-specific course codes, and official time slots. Our goal is to provide a reliable, clean, and ad-supported educational tool that remains freely accessible to every engineering undergraduate.
          </p>

          <div
            className={`p-4 rounded-xl border flex items-center gap-3 mt-4 ${
              isDarkMode ? "bg-[#0b1326]/60 border-[#3b4a42]/30" : "bg-gray-50 border-gray-200"
            }`}
          >
            <MapPin className="w-5 h-5 text-primary-container shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Delhi Technological University (DTU)</p>
              <p className={isDarkMode ? "text-[#bacbbf]" : "text-gray-600"}>
                Shahbad Daulatpur, Main Bawana Road, Delhi, 110042, India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="py-16 px-4 sm:px-6 max-w-4xl mx-auto border-t border-outline-variant/20">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-container/10 text-primary-container border border-primary-container/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className={`rounded-2xl border transition-colors overflow-hidden ${
                  isDarkMode
                    ? "bg-[#10192e] border-[#3b4a42]/30"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-primary-container transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    className={`px-4 sm:px-5 pb-5 pt-1 text-xs leading-relaxed border-t border-outline-variant/10 ${
                      isDarkMode ? "text-[#bacbbf]" : "text-gray-600"
                    }`}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CONTACT / SUPPORT SECTION ── */}
      <section id="contact" className="py-12 px-4 sm:px-6 max-w-4xl mx-auto border-t border-outline-variant/20">
        <div
          className={`p-6 sm:p-8 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
            isDarkMode
              ? "bg-[#10192e] border-[#3b4a42]/40"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base flex items-center gap-2 justify-center sm:justify-start">
              <Mail className="w-4 h-4 text-primary-container" />
              Need Assistance or Have Feedback?
            </h3>
            <p className={`text-xs ${isDarkMode ? "text-[#bacbbf]" : "text-gray-600"}`}>
              Reach out to our maintainers with queries, feature requests, or data corrections.
            </p>
          </div>

          <a
            href="mailto:contact@attendancehub.me"
            className="px-5 py-2.5 rounded-xl bg-primary-container/15 text-primary-container border border-primary-container/30 font-bold text-xs hover:bg-primary-container/25 transition-all flex items-center gap-2"
          >
            <span>contact@attendancehub.me</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className={`border-t py-10 px-4 sm:px-8 transition-colors ${
          isDarkMode ? "bg-[#080d1a] border-[#3b4a42]/30" : "bg-gray-100 border-gray-200"
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-lg">school</span>
            <span className="font-bold text-on-surface">Attendance Hub</span>
            <span className="opacity-50">· DTU Academic Portal</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-medium">
            <a href="#features" className="hover:text-primary-container transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-primary-container transition-colors">
              About
            </a>
            <a href="#faq" className="hover:text-primary-container transition-colors">
              FAQ
            </a>
            <Link to="/privacy-policy" className="hover:text-primary-container transition-colors underline">
              Privacy Policy
            </Link>
            <a
              href="mailto:contact@attendancehub.me"
              className="hover:text-primary-container transition-colors"
            >
              Contact
            </a>
          </div>

          <div className="text-[11px] opacity-60 font-mono text-center md:text-right">
            © {new Date().getFullYear()} Attendance Hub · All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
