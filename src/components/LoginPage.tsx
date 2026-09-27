/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import LandingPage from "./LandingPage";

interface LoginPageProps {
  onToast?: (msg: string, type: "success" | "error" | "info") => void;
  isDarkMode?: boolean;
}

export default function LoginPage({ onToast, isDarkMode = true }: LoginPageProps) {
  return <LandingPage onToast={onToast} isDarkMode={isDarkMode} />;
}
