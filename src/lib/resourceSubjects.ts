/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Subject utilities specifically for Academic Resources and study material uploads/browsing.
 * Merges Theory and Lab / Tutorial entries into single unified subject entries while preserving
 * compatibility with existing stored resource subjects in the database.
 */

export function stripTheoryLab(name: string): string {
  if (!name) return "";
  return name
    .replace(/\s*-\s*(Theory|Lab|Tutorial|Tut|Lecture)$/i, "")
    .replace(/\s*\((Theory|Lab|Tutorial|Tut|Lecture)\)$/i, "")
    .replace(/\s+(Theory|Lab|Tutorial|Tut|Lecture)$/i, "")
    .trim();
}

export function getResourceCanonicalSubject(name: string): string {
  if (!name) return "";
  const cleaned = stripTheoryLab(name);
  const lower = cleaned.toLowerCase().trim();

  // Sem 3 subjects
  if (lower.includes("object oriented") || lower.includes("oop") || lower.includes("ood")) {
    return "Object Oriented Programming (OOP)";
  }
  if (lower.includes("operating system") || lower === "os" || lower === "os design") {
    return "Operating System Design (OS)";
  }
  if (lower.includes("algorithm") || lower.includes("daa")) {
    return "Algorithm Design and Analysis (DAA)";
  }
  if (lower.includes("digital logic") || lower.includes("digital electronics") || lower.includes("dld")) {
    return "Digital Electronics";
  }
  if (lower.includes("software engineering") || lower === "se") {
    return "Software Engineering (SE)";
  }

  // Sem 2 / common subjects
  if (lower.includes("maths ii") || lower.includes("maths 2") || lower.includes("mathematics ii") || lower.includes("mathematics 2")) {
    return "Mathematics II";
  }
  if (lower.includes("data structure") && !lower.includes("advance")) {
    return "Data Structure";
  }
  if (lower.includes("discrete structure") || lower.includes("discrete math")) {
    return "Discrete Structure";
  }
  if (lower.includes("basic ml") || lower.includes("basics of ml")) {
    return "Basic ML";
  }

  // Sem 1 subjects
  if (lower.includes("am101") || lower.includes("mathematics-i") || (lower.includes("mathematics") && (lower.includes(" i") || lower.includes("-1")) && !lower.includes("ii"))) {
    return "Mathematics-I";
  }
  if (lower.includes("co101") || lower.includes("programming fundamentals")) {
    return "Programming Fundamentals";
  }
  if (lower.includes("ec101") || lower.includes("basic electronics")) {
    return "Basic Electronics & Communication Engineering";
  }
  if (lower.includes("me105") || lower.includes("engineering graphics")) {
    return "Computer Aided Engineering Graphics-2";
  }
  if (lower.includes("cs103") || lower.includes("web designing") || lower.includes("web design")) {
    return "Web Designing";
  }

  // Sem 5 / higher sem subjects
  if (lower.includes("compiler design") || lower.includes("cd")) {
    return "Compiler Design";
  }
  if (lower.includes("machine learning") || lower.includes("ml")) {
    return "Machine Learning";
  }
  if (lower.includes("information and network security") || lower.includes("ins")) {
    return "Information and Network Security";
  }
  if (lower.includes("distributed system") || lower.includes("dis")) {
    return "Distributed Systems";
  }
  if (lower.includes("cyber vulnerability") || lower.includes("ethical hacking") || lower.includes("cs411")) {
    return "Cyber Vulnerability & Ethical Hacking";
  }
  if (lower.includes("cloud computing") || lower.includes("cs425")) {
    return "Cloud Computing";
  }
  if (lower.includes("advance web technology") || lower.includes("cs421")) {
    return "Advance Web Technology";
  }
  if (lower.includes("big data") || lower.includes("cs423")) {
    return "Big Data Analytics";
  }
  if (lower.includes("information theory")) {
    return "Information Theory and Coding";
  }
  if (lower.includes("quantum computing")) {
    return "Quantum Computing";
  }
  if (lower.includes("advance data structure")) {
    return "Advance Data Structure";
  }

  return cleaned;
}

export function areResourceSubjectsMatching(a: string, b: string): boolean {
  if (!a || !b) return false;
  const canonicalA = getResourceCanonicalSubject(a).toLowerCase().trim();
  const canonicalB = getResourceCanonicalSubject(b).toLowerCase().trim();
  if (canonicalA === canonicalB) return true;

  const cleanA = stripTheoryLab(a).toLowerCase().trim();
  const cleanB = stripTheoryLab(b).toLowerCase().trim();
  if (cleanA && cleanB && cleanA === cleanB) return true;

  return false;
}

const KNOWN_CODES: Record<string, string> = {
  "object oriented programming (oop)": "CS203",
  "operating system design (os)": "CS207",
  "algorithm design and analysis (daa)": "CS205",
  "digital electronics": "EC201",
  "software engineering (se)": "CS209",
  "mathematics-i": "AM101",
  "programming fundamentals": "CO101",
  "basic electronics & communication engineering": "EC101",
  "computer aided engineering graphics-2": "ME105",
  "web designing": "CS103",
  "mathematics ii": "AM102",
  "data structure": "CS201",
  "discrete structure": "CS202",
  "compiler design": "CS301",
  "machine learning": "CS303",
  "information and network security": "CS305",
  "distributed systems": "CS309",
  "information theory and coding": "CS311",
  "quantum computing": "CS313",
  "advance data structure": "CS315",
  "cyber vulnerability & ethical hacking": "CS411",
  "cloud computing": "CS425",
  "advance web technology": "CS421",
  "big data analytics": "CS423",
  "database management system": "CS204",
  "probability and statistics": "AM202",
  "theory of computation": "CS206",
  "computer communication networks": "CS208",
  "computer organisation and architecture": "CS210",
};

export function getKnownSubjectCode(canonicalName: string): string {
  const key = canonicalName.toLowerCase().trim();
  return KNOWN_CODES[key] ?? "";
}
