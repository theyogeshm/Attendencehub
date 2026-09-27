/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Privacy Policy Page
 * Required for Google AdSense compliance and user data transparency.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Database, Cookie, Mail } from "lucide-react";

interface PrivacyPolicyPageProps {
  isDarkMode?: boolean;
}

export default function PrivacyPolicyPage({ isDarkMode = true }: PrivacyPolicyPageProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#0b1326] text-[#dae2fd]" : "bg-[#F8F9FA] text-[#111827]"
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors ${
          isDarkMode
            ? "bg-[#0b1326]/90 border-[#3b4a42]/30"
            : "bg-white/90 border-[#E5E7EB]"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              isDarkMode
                ? "border-[#3b4a42]/40 hover:bg-[#162035] text-[#dae2fd]"
                : "border-gray-200 hover:bg-gray-100 text-gray-700"
            }`}
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-2xl">
              shield_with_heart
            </span>
            <span className="font-extrabold text-base tracking-tight">
              Attendance <span className="text-primary-container">Hub</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs font-semibold text-primary-container hover:underline cursor-pointer"
        >
          Return to Portal
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-container/10 text-primary-container border border-primary-container/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy &amp; Data Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Privacy Policy
          </h1>
          <p
            className={`text-xs sm:text-sm max-w-xl mx-auto ${
              isDarkMode ? "text-[#bacbbf]" : "text-gray-600"
            }`}
          >
            Last updated: September 2026. This policy explains what information Attendance Hub
            collects, how it is used, and your rights regarding your data.
          </p>
        </div>

        {/* Card: Core Commitment */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border ${
            isDarkMode
              ? "bg-[#10192e] border-[#3b4a42]/40"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary-container/15 text-primary-container shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold">1. Overview &amp; Purpose</h2>
              <p
                className={`text-sm leading-relaxed ${
                  isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"
                }`}
              >
                Attendance Hub (attendancehub.me) is an academic utility created for college
                students to log attendance, calculate minimum attendance targets, review timetable
                schedules, and access academic resource links. We are committed to transparency and
                respecting your privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Card: Data Collection */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
            isDarkMode
              ? "bg-[#10192e] border-[#3b4a42]/40"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#7bd0ff]/15 text-[#7bd0ff]">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">2. Information We Collect</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-xl border ${
                isDarkMode
                  ? "bg-[#0b1326]/60 border-[#3b4a42]/30"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <h3 className="font-semibold text-sm mb-1.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary-container">
                  badge
                </span>
                Google Account &amp; Profile
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isDarkMode ? "text-[#bacbbf]" : "text-gray-600"
                }`}
              >
                When you sign in using Google OAuth, we receive your name, email address, and profile
                avatar image. This is used solely to identify your account and personalize your
                dashboard.
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDarkMode
                  ? "bg-[#0b1326]/60 border-[#3b4a42]/30"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <h3 className="font-semibold text-sm mb-1.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#7bd0ff]">
                  school
                </span>
                Academic &amp; Attendance Records
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isDarkMode ? "text-[#bacbbf]" : "text-gray-600"
                }`}
              >
                Your marked attendance (present/absent entries, dates, lab/theory status), custom
                course selections, and semester preferences are stored in our secure database
                powered by Supabase with Row Level Security (RLS).
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border md:col-span-2 ${
                isDarkMode
                  ? "bg-[#0b1326]/60 border-[#3b4a42]/30"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <h3 className="font-semibold text-sm mb-1.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#f5a623]">
                  analytics
                </span>
                Analytics &amp; Usage Telemetry
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isDarkMode ? "text-[#bacbbf]" : "text-gray-600"
                }`}
              >
                We use Google Analytics (GA4) to collect aggregated, anonymized metrics such as page
                views, browser type, and general geographic region. This data assists us in
                diagnosing performance issues and improving user navigation.
              </p>
            </div>
          </div>
        </div>

        {/* Card: Google AdSense & Cookies */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border space-y-4 ${
            isDarkMode
              ? "bg-[#10192e] border-[#3b4a42]/40"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#f5a623]/15 text-[#f5a623]">
              <Cookie className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">3. Advertising &amp; Cookies (Google AdSense)</h2>
          </div>

          <div
            className={`space-y-3 text-sm leading-relaxed ${
              isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"
            }`}
          >
            <p>
              To keep Attendance Hub free and support server and hosting infrastructure, this website
              may display advertisements served by <strong>Google AdSense</strong> and affiliated
              advertising partners.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong>Third-Party Vendor Cookies:</strong> Third-party vendors, including Google,
                use cookies to serve ads based on a user&apos;s prior visits to this website or other
                websites on the Internet.
              </li>
              <li>
                <strong>Personalized Advertising:</strong> Google&apos;s use of advertising cookies
                enables it and its partners to serve ads to users based on their visit to this site
                and/or other sites on the web.
              </li>
              <li>
                <strong>Google Advertising Technologies:</strong> To understand how Google manages and serves ads across partner sites, review{" "}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-container font-semibold underline hover:brightness-120"
                >
                  Google's Advertising Privacy &amp; Technologies Policy
                </a>.
              </li>
              <li>
                <strong>Opt-Out Options:</strong> Users may opt out of personalized advertising at any
                time by visiting{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-container font-semibold underline hover:brightness-120"
                >
                  Google Ads Settings
                </a>
                . Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for
                personalized advertising by visiting{" "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-container font-semibold underline hover:brightness-120"
                >
                  www.aboutads.info
                </a>
                .
              </li>
            </ul>
          </div>
        </div>

        {/* Card: Data Security & Storage */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border space-y-4 ${
            isDarkMode
              ? "bg-[#10192e] border-[#3b4a42]/40"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-container/15 text-primary-container">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">4. Data Storage &amp; Protection</h2>
          </div>

          <p
            className={`text-sm leading-relaxed ${
              isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"
            }`}
          >
            We implement strict security practices to protect your information:
          </p>
          <ul
            className={`list-disc pl-5 space-y-2 text-xs sm:text-sm ${
              isDarkMode ? "text-[#bacbbf]" : "text-gray-600"
            }`}
          >
            <li>
              <strong>PostgreSQL Row Level Security (RLS):</strong> Every user record in Supabase is
              isolated cryptographically by user ID. No student can query, view, or alter another
              student&apos;s attendance logs or profile settings.
            </li>
            <li>
              <strong>No Sale of Data:</strong> We never sell, rent, or trade your personal or
              academic information to third parties.
            </li>
            <li>
              <strong>Client-Side Storage:</strong> Local device settings (such as dark mode theme
              preferences and temporary offline caches) are stored locally in your browser&apos;s
              localStorage and never transmitted to external servers.
            </li>
          </ul>
        </div>

        {/* Card: User Control & Contact */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border space-y-4 ${
            isDarkMode
              ? "bg-[#10192e] border-[#3b4a42]/40"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#7bd0ff]/15 text-[#7bd0ff]">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">5. Your Rights &amp; Contact Us</h2>
          </div>

          <p
            className={`text-sm leading-relaxed ${
              isDarkMode ? "text-[#c2d0c6]" : "text-gray-600"
            }`}
          >
            You have full control over your academic data. You can reset or clear all attendance
            records at any time via the Profile modal inside the application.
          </p>

          <div
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              isDarkMode
                ? "bg-[#0b1326]/60 border-[#3b4a42]/30"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <Mail className="w-5 h-5 text-primary-container shrink-0" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold">Have questions or want your account data removed?</p>
              <p className={isDarkMode ? "text-[#bacbbf]" : "text-gray-600"}>
                Reach out to us at{" "}
                <a
                  href="mailto:contact@attendancehub.me"
                  className="text-primary-container font-semibold underline"
                >
                  contact@attendancehub.me
                </a>{" "}
                or use the in-app feedback channel.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-12 text-xs text-on-surface-variant/60 font-mono">
          © {new Date().getFullYear()} Attendance Hub · All rights reserved.
        </div>
      </main>
    </div>
  );
}
