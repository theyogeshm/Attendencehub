/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TimetableEntry {
  raw: string;
  subjectName: string;      // Full display name e.g. "Operating System Design (OS) [CS207]"
  baseSubjectName: string;  // Base name e.g. "Operating System Design (OS)"
  splitSubjectName: string; // Enrolled split name e.g. "Operating System Design (OS) - Theory" or "... - Lab"
  subjectCode: string;      // e.g. "CS207"
  faculty: string;
  room: string;
  group?: string;           // e.g. "G1", "G2", "G3"
  isLab: boolean;
  isTutorial: boolean;
  componentType: "Theory" | "Lab";
}

export interface DaySchedule {
  [timeSlot: string]: string;
}

export interface SectionTimetable {
  room: string;
  timetable: {
    MON?: DaySchedule;
    TUE?: DaySchedule;
    WED?: DaySchedule;
    THUR?: DaySchedule;
    FRI?: DaySchedule;
    [day: string]: DaySchedule | undefined;
  };
}

export interface TimetableSem3Data {
  semester: string;
  effective_from: string;
  sections: {
    [sectionId: string]: SectionTimetable;
  };
}

export const TIMETABLE_SEM_3_DATA: TimetableSem3Data = {
  "semester": "CO-III (Odd 2026-27)",
  "effective_from": "28/07/2026 (Section A1: 27/07/2026)",
  "sections": {
    "A1": {
      "room": "AB4-204",
      "timetable": {
        "MON": {
          "9-10": "TH-Software Engineering CS209C [Prof Rahul Katarya]",
          "10-11": "TH-Digital Logic Design [ECE-Deptt]",
          "11-12": "TH-Operating System Design CS207 [Dr Prashant G S]",
          "12-1": "Tutorial-CS209 Software Engineering G1 [Ms. Shristo Achari]",
          "2-4": "Lab-Digital Logic Design-G1 [ECE-Deptt] / Lab-CS205 DAA-G3 [Prof Manoj Kumar] [Computer Network Lab]"
        },
        "TUE": {
          "10-12": "Lab-Digital Logic Design-G2 [ECE-Deptt] / Lab-CS205 DAA-G1 [Prof Manoj Kumar] [Computer Network Lab]",
          "1-2": "TH-CS205 DAA [Prof Manoj Kumar]",
          "2-3": "TH-Operating System Design CS207 [Dr Prashant G S] [AB4-205]",
          "4-5": "Tutorial-CS209 Software Engineering G2 [Ms. Neha Kumari]"
        },
        "WED": {
          "9-10": "TH-Software Engineering CS209C [Prof Rahul Katarya] [AB4-203]",
          "10-1": "Lab-Operating System Design CS207-A1/G1 [Dr Prashant G S] [Computation Lab] / Lab-Object Oriented Design CS203-G3 [Ms Anukriti Kaushal] [BDA Lab] / Lab-CS205 DAA-G2 [Prof Manoj Kumar] [Computer Network Lab]",
          "2-3": "TH-Object Oriented Design CS203 [Ms. Anukriti Kaushal]",
          "3-4": "TH-Digital Logic Design [ECE-Deptt]",
          "4-5": "TH-Operating System Design CS207 [Ms. Anukriti Kaushal]"
        },
        "THUR": {
          "10-11": "TH-CS205 DAA [Prof Manoj Kumar]",
          "11-12": "TH-Object Oriented Design CS203 [Ms. Anukriti Kaushal]",
          "12-1": "TH-Software Engineering CS209C [Prof Rahul Katarya]",
          "2-4": "Lab-Operating System Design CS207-G2 [Dr Prashant G S] [Computation Lab] / Lab-Object Oriented Design CS203-G1 [Mr. Nikhil Gupta] [BDA Lab] / Lab-Digital Logic Design-G3 [ECE-Deptt]"
        },
        "FRI": {
          "9-10": "TH-CS205 DAA [Prof Manoj Kumar]",
          "10-12": "Lab-Operating System Design CS207-G3 [Dr Prashant G S] [A1 Lab] / Lab-Object Oriented Design CS203-G2 [Ms Anukriti Kaushal] [BDA Lab]",
          "12-1": "TH-Object Oriented Design CS203 [Ms. Anukriti Kaushal]",
          "1-2": "TH-Digital Logic Design [ECE-Deptt]",
          "3-4": "Tutorial-CS209 Software Engineering G3 [Ms. Anushree Awasthi] [AB4-421]"
        }
      }
    },
    "A2": {
      "room": "AB4-204",
      "timetable": {
        "MON": {
          "10-12": "Lab-Digital Logic Design-G1 [ECE Department] / Lab-CS205 DAA-G2 [Dr. Sanjay Kumar] [Computer Network Lab]",
          "12-1": "TH-CS203 OOPC [Dr Manoj Sethi]",
          "2-3": "TH-CS205 DAA [Dr. Sanjay Kumar]",
          "3-4": "TH-CS207 OS [Dr. Rohit Beniwal]",
          "4-5": "TH-CS209 SE [Prof Daya Gupta]"
        },
        "TUE": {
          "11-12": "TH-CS203 OOPC [Dr Manoj Sethi]",
          "12-1": "TH-Digital Logic Design [ECE-Deptt]",
          "2-3": "TH-CS205 DAA [Dr. Sanjay Kumar] [AB4-203] [⚠️ VERIFY]",
          "3-4": "TH-CS203 OOPC [Dr Manoj Sethi] [AB4-203] [⚠️ VERIFY]"
        },
        "WED": {
          "9-10": "TH-Digital Logic Design [ECE-Deptt]",
          "10-11": "TH-CS207 OS [Dr. Rohit Beniwal]",
          "11-12": "TH-CS209 SE [Prof Daya Gupta]",
          "12-1": "Tutorial-CS209 Software Engineering G2 [Ms. Shreya Shukla] [AB4-201]",
          "2-3": "TH-CS205 DAA [Dr. Sanjay Kumar] [AB4-203]",
          "3-4": "TH-CS203 OOPC [Dr Manoj Sethi] [AB4-203]"
        },
        "THUR": {
          "10-12": "Lab-Operating System Design CS207-A2/G1 [Dr Rohit Beniwal] [CA Lab] / Lab-Object Oriented Design CS203-A2/G3 [Dr Manoj Sethi] [Computation Lab] / Lab-Digital Logic Design-G2 [ECE Department]",
          "1-2": "TH-CS205 DAA [Dr. Sanjay Kumar]",
          "2-4": "Lab-Operating System Design CS207-A2/G2 [Dr Rohit Beniwal] [CA Lab] / Lab-Object Oriented Design CS203-A2/G1 [Ms. Neeraj Sagar] [A1 Lab] / Lab-Digital Logic Design-G3 [ECE Department]"
        },
        "FRI": {
          "8-10": "Lab-CS205 DAA-G3 [Dr. Sanjay Kumar] [Computer Network Lab]",
          "10-11": "TH-Digital Logic Design [ECE-Deptt]",
          "11-12": "TH-CS209 SE [Prof Daya Gupta]",
          "12-1": "Tutorial-CS209 Software Engineering G1 [Ms. Shreya Shukla] [AB4-221]",
          "2-3": "TH-CS207 OS [Dr. Rohit Beniwal]",
          "3-4": "Tutorial-CS209 Software Engineering G3 [Ms. Shreya Shukla]"
        }
      }
    },
    "A3": {
      "room": "AB4-205",
      "timetable": {
        "MON": {
          "9-10": "Tutorial-CS209 Software Engineering G3 [Mr. Gautam Kumar Jha]",
          "10-11": "TH-CS203 Oops [Dr. Gunjan Chugh]",
          "11-12": "TH-CS207 OS [Dr. Minni Jain]",
          "12-1": "TH-Digital Logic Design [ECE-Deptt]",
          "2-3": "TH-CS209 SE [Prof Daya Gupta] [AB4-515]"
        },
        "TUE": {
          "10-11": "TH-CS207 OS [Dr. Minni Jain]",
          "11-12": "TH-CS203 Oops [Dr. Gunjan Chugh]",
          "12-1": "TH-CS205 DAA [Prof. Manoj Kumar]",
          "2-4": "Lab-Digital Logic Design-G1 [ECE Department] / Lab-CS205 DAA-G2 [Mr. Gautam Kumar Jha] [Computer Network Lab]"
        },
        "WED": {
          "9-10": "TH-CS205 DAA [Prof. Manoj Kumar] [AB4-404]",
          "10-12": "Lab-Operating System Design CS207-A3/G1 [Dr. Minni Jain] [CA Lab] / Lab-Object Oriented Design CS203-G3 [Dr Gunjan Chugh] [A1 Lab] / Lab-Digital Logic Design-G2 [ECE Department]",
          "12-1": "TH-CS209 SE [Prof Daya Gupta]",
          "2-4": "Lab-Operating System Design CS207-A3/G2 [Dr Minni Jain] [BDA Lab] / Lab-Object Oriented Design CS203-G1 [Dr Gunjan Chugh] [A1 Lab] / Lab-Digital Logic Design-G3 [ECE Department]"
        },
        "THUR": {
          "10-12": "Tutorial-CS209 Software Engineering G1&G2 [Ms Kanchan Sharma] [AB4-416] / Lab-CS205 DAA-G3 [Mr. Immanni Ganesh] [Computer Network Lab]",
          "1-2": "TH-CS207 OS [Dr. Minni Jain]",
          "2-3": "TH-CS205 DAA [Prof. Manoj Kumar]",
          "3-4": "TH-CS201 Digital Logic Design [ECE-Deptt]"
        },
        "FRI": {
          "10-11": "TH-CS203 Oops [Dr. Gunjan Chugh]",
          "11-12": "TH-Digital Logic Design [ECE-Deptt]",
          "1-2": "TH-CS209 SE [Prof Daya Gupta]",
          "2-3": "TH-CS205 DAA [Prof. Manoj Kumar]",
          "3-4": "TH-CS201 Digital Logic Design [ECE-Deptt]",
          "2-4": "Lab-Operating System Design CS207-A3/G3 [Dr Minni Jain] [BDA Lab] / Lab-Object Oriented Design CS203-G1 [Dr Gunjan Chugh] [A1 Lab] / Lab-CS205 DAA-G1 [Dr. Gautam Kumar Jha] [Computer Network Lab] [⚠️ VERIFY]"
        }
      }
    },
    "A4": {
      "room": "AB4-205",
      "timetable": {
        "MON": {
          "10-12": "Lab-Digital Logic Design-G1 [ECE Department] / Lab-CS205 DAA-G2 [Dr N Anand] [Computer Network Lab] / Lab-Object Oriented Design CS203-A4/G3 [Dr Aditi Zear] [ML Lab]",
          "12-1": "TH-CS209 SE [Dr Ravin Ahuja][AB4-303]",          "2-3": "TH-CS203 Oops [Dr. Aditi Zear]",
          "3-4": "TH-CS207 OS [Dr. Nipun Bansal]"
        },
        "TUE": {
          "10-12": "Lab-CS205 DAA-G1 [Dr. N Anand] [Computer Network Lab]",
          "1-2": "TH-Digital Logic Design [ECE-Deptt]",
          "2-4": "Lab-Operating System Design CS207-A4/G1 [Dr. Nipun Bansal] [Data Mining Lab] / Lab-Digital Logic Design-G2 [ECE Department] / Lab-CS205 DAA-G3 [Ms. Monika] [CA Lab]"
        },
        "WED": {
          "9-10": "TH-CS207 SE [Dr. Ravin Ahuja]",
          "10-11": "Tutorial-CS209 Software Engineering G3 [Ms. Kiran Bala]",
          "11-12": "TH-CS207 OS [Dr. Nipun Bansal]",
          "1-2": "TH-Digital Logic Design [ECE-Deptt]",
          "2-3": "TH-CS203 Oops [Dr. Aditi Zear]",
          "3-4": "TH-CS205 DAA [Dr N Anand]"
        },
        "THUR": {
          "10-11": "TH-CS207 OS [Dr. Nipun Bansal]",
          "11-12": "TH-CS205 DAA [Dr N Anand]",
          "12-1": "TH-Digital Logic Design [ECE-Deptt]",
          "2-4": "Lab-Operating System Design CS207-A4/G2 [Dr. Nipun Bansal] [Data Mining Lab] / Lab-Object Oriented Design CS203-G1 [Dr Aditi Zear] [DBMS Lab] / Lab-Digital Logic Design-G3 [ECE Department]"
        },
        "FRI": {
          "9-10": "Tutorial-CS209 Software Engineering G2 [Ms Kiran Bala] [AB4-203]",
          "10-11": "TH-CS205 DAA [Dr N Anand] [AB4-203]",
          "11-12": "TH-CS209 SE [Dr. Ravin Ahuja] [AB4-303]",
          "12-1": "TH-CS203 Oops [Dr. Aditi Zear]",
          "2-4": "Lab-Operating System Design CS207-A4/G3 [Dr. Nipun Bansal] [IPM Lab] / Lab-Object Oriented Design CS203-G2 [Dr Aditi Zear] [DBMS Lab]"
        }
      }
    },
    "A5": {
      "room": "AB4-303",
      "timetable": {
        "MON": {
          "9-10": "TH-Software Engineering CS209C [Ms. Pooja Kamboj]",
          "10-11": "TH-Digital Logic Design [ECE-Deptt]",
          "11-12": "TH-Object Oriented Design CS203 [Dr Snigdha Agarwal]",
          "12-2": "Lab-CS205 DAA-G3 [Dr. Yeshwant Singh] [Computer Network Lab]",
          "2-4": "Lab-Digital Logic Design-G1 [ECE-Deptt] / Lab-CS205 DAA-G2 [Dr. Yeshwant Singh] [IPM Lab]"
        },
        "TUE": {
          "10-11": "Tutorial-CS209 Software Engineering G3 [Mr Sankalp Khera] [AB4-221]",
          "10-12": "Lab-Digital Logic Design-G3 [ECE-Deptt]",
          "1-2": "TH-CS205 DAA [Dr Yeshwant Singh]",
          "2-3": "TH-Operating System Design CS207 [Ms. Gull Kaur]",
          "3-4": "Tutorial-CS209 Software Engineering G2 [Mr Sankalp Khera] [AB4-205]"
        },
        "WED": {
          "9-10": "Tutorial-CS209 Software Engineering G1 [Mr Sankalp Khera] [AB4-221]",
          "10-12": "Lab-Operating System Design CS207-A5/G1 [Dr Gull Kaur] [DBMS Lab] / Lab-Object Oriented Design CS203-G3 [Dr. Snigdha Agarwal] [Data Mining Lab]",
          "12-1": "TH-CS205 DAA [Dr Yeshwant Singh]",
          "2-3": "TH-Object Oriented Design CS203 [Dr Snigdha Agarwal]",
          "3-4": "TH-Digital Logic Design [ECE-Deptt]",
          "4-5": "TH-Operating System Design CS207 [Ms. Gull Kaur]"
        },
        "THUR": {
          "10-11": "TH-Software Engineering CS209C [Ms. Pooja Kamboj]",
          "11-12": "TH-Operating System Design CS207 [Ms. Gull Kaur]",
          "12-1": "TH-CS205 DAA [Dr Yeshwant Singh]",
          "2-4": "TH-Object Oriented Design CS203 [Dr Snigdha Agarwal] / TH-Digital Logic Design [ECE-Deptt]"
        },
        "FRI": {
          "9-10": "TH-Object Oriented Design CS203 [Dr Snigdha Agarwal]",
          "10-12": "Lab-Operating System Design CS207-A5/G3 [Dr Gull Kaur] [DBMS Lab] / Lab-Object Oriented Design CS203-A5/G2 [Dr. Snigdha Agarwal] [IPM Lab] / Lab-CS205 DAA-G1 [Ms.Poonam Soni] [Computer Network Lab]",
          "1-2": "TH-Digital Logic Design [ECE-Deptt]"
        }
      }
    },
    "A6": {
      "room": "AB4-303",
      "timetable": {
        "MON": {
          "9-10": "Tutorial-CS209 Software Engineering G1 [Ms.Monika] [AB4-404]",
          "10-12": "Lab-Digital Logic Design-G1 [ECE Department]",
          "1-2": "TH-CS203 OOPC [Ms. Anjali Bansal]",
          "2-3": "TH-CS209 SE [Ms Pooja Kamboj]",
          "3-4": "TH-CS207 OS [Dr. Gunjan Chugh]",
          "4-5": "TH-CS205 DAA [Dr. Aditi Zear]"
        },
        "TUE": {
          "10-11": "TH-CS207 OS [Dr. Gunjan Chugh]",
          "11-12": "TH-CS205 DAA [Dr. Aditi Zear]",
          "12-1": "TH-Digital Logic Design [ECE-Deptt]",
          "2-4": "Lab-Operating System Design CS207-A6/G3 [Dr Gunjan Chugh] [IPM Lab] / Lab-Object Oriented Design CS203-A6/G2 [Ms. Anjali Bansal] [IOT Lab] / Lab-Digital Logic Design-G1 [Dr Aditi Zear] [IS & CI Lab]"
        },
        "WED": {
          "9-10": "TH-Digital Logic Design [ECE-Deptt]",
          "10-11": "Tutorial-CS209 Software Engineering G2 [Ms. Monika]",
          "11-12": "TH-CS205 DAA [Dr. Aditi Zear]",
          "1-2": "TH-CS203 OOPC [Ms. Anjali Bansal]",
          "2-4": "Lab-Operating System Design CS207-A6/G2 [Dr Prashant G S] [DBMS Lab] / Lab-Object Oriented Design CS203-G1 [Ms. Anjali Bansal] [IPM Lab] / Lab-Digital Logic Design-G3 [ECE Department]"
        },
        "THUR": {
          "10-12": "Lab-Operating System Design CS207-A6/G1 [Dr. Gunjan Chugh] [DBMS Lab] / Lab-Object Oriented Design CS203-A6/G3 [Ms. Kiran Bala] [BDA Lab] / Lab-Digital Logic Design-G2 [ECE Department]",
          "1-2": "TH-CS207 OS [Dr. Gunjan Chugh]",
          "2-3": "TH-Digital Logic Design [ECE-Deptt]",
          "3-4": "TH-CS209 SE [Ms Pooja Kamboj]"
        },
        "FRI": {
          "10-12": "Lab-CS205 DAA-G2 [Dr. Aditi Zear] [Computer Network Lab] / Lab-CS205 DAA-G3 [Ms. Aanchal] [IOT Lab]",
          "1-2": "TH-CS209 SE [Ms Pooja Kamboj]",
          "2-3": "TH-CS203 OOPC [Ms. Anjali Bansal]",
          "3-4": "TH-CS209 SE [Ms Pooja Kamboj]"
        }
      }
    },
    "A7": {
      "room": "AB4-315",
      "timetable": {
        "MON": {
          "10-11": "TH-Software Engineering CS209 [Dr. Amrita Sisodia]",
          "11-12": "TH-CS205 Design & Analysis of Algorithm [Dr. Neha Gupta]",
          "12-2": "Lab-Operating System Design CS207-A7/G1-III Sem [Prof Rajni Jindal] [DBMS Lab] / Lab-Object Oriented Design CS203-G3-III Sem [Dr. Snigdha Agarwal] [IPM Lab]",
          "4-6": "Digital Logic Design Lab (G1) [VLSI Lab, ECE] // Digital Logic Design Lab (G2) [Digital Logic Lab, ECE] // Digital Logic Design Lab (G3) [MP2 Lab, ECE]"
        },
        "TUE": {
          "10-11": "TH-Object Oriented Design CS203 [Dr. Aditi Zear]",
          "11-12": "TH-Operating System Design CS207 [Prof Rajni Jindal]",
          "12-2": "Lab-Operating System Design CS207-A7/G2 [Dr. Prashant Giridhar S] [DBMS Lab] / Lab-Object Oriented Design CS203-A7/G1-III Sem [Ms. Anjali Bansal] [IPM Lab]",
          "2-4": "Digital Logic Design [ECE-Deptt] [Ms. Lavi Tanwar] [AB4-515]"
        },
        "WED": {
          "10-11": "TH-Object Oriented Design CS203 [Dr. Aditi Zear] [AB4-203]",
          "11-12": "Tutorial-CS209 Software Engineering G1 [Mr Vivek] [AB4-203/AB4-315]",
          "12-2": "Lab-Operating System Design CS207-A7/G3-III Sem [Prof Rajni Jindal] [DBMS Lab] / Lab-Object Oriented Design CS203-A7/G2-III Sem [Dr. Manoj Sethi] [IPM Lab]",
          "3-4": "TH-Operating System Design CS207 [Prof Rajni Jindal]",
          "4-5": "Tutorial-CS209 Software Engineering G2 [Mr Vivek] [AB4-315]"
        },
        "THUR": {
          "10-11": "TH-Software Engineering CS209 [Dr. Amrita Sisodia]",
          "11-12": "TH-Object Oriented Design CS203 [Dr. Aditi Zear]",
          "1-2": "TH-CS205 Design & Analysis of Algorithm [Dr. Neha Gupta]",
          "2-3": "Lab-CS205 Design & Analysis of Algorithm-G1 [Dr. Neha Gupta] [CN Lab]"
        },
        "FRI": {
          "9-10": "TH-Software Engineering CS209 [Dr. Amrita Sisodia]",
          "10-11": "TH-CS205 Design & Analysis of Algorithm [Dr. Neha Gupta]",
          "11-12": "TH-Operating System Design CS207 [Prof Rajni Jindal]",
          "12-1": "Digital Logic Design [Ms. Lavi Tanwar]",
          "2-4": "Lab-CS205 Design & Analysis of Algorithm-G2 [Dr. Neha Gupta] [IOT Lab] / Lab-CS205 Design & Analysis of Algorithm-G3 [Dr. Sanjay Kumar] [IOT Lab]",
          "4-5": "Tutorial-CS209 Software Engineering G3 [Mr Vivek] [AB4-106]"
        }
      }
    },
  }
};

/**
 * Standard list of display sections
 */
export const SECTION_OPTIONS = [
  { id: "A1", label: "Section A1", room: "AB4-204" },
  { id: "A2", label: "Section A2", room: "AB4-204" },
  { id: "A3", label: "Section A3", room: "AB4-205" },
  { id: "A4", label: "Section A4", room: "AB4-205" },
  { id: "A5", label: "Section A5", room: "AB4-303" },
  { id: "A6", label: "Section A6", room: "AB4-303" },
  { id: "A7", label: "Section A7", room: "AB4-315" },

];

/**
 * Standard order of time slots across all sections
 */
export const ALL_TIME_SLOTS = [
  "9-10",
  "10-11",
  "11-12",
  "12-1",
  "1-2",
  "2-3",
  "3-4",
  "4-5",
  "10-12",
  "10-1",
  "12-2",
  "2-4",
  "4-6",
  "10-12_lab",
  "10-11_lab"
];

/**
 * Helper to parse a slot entry string into structured metadata with mapped full names & Theory/Lab split names
 */
export function parseTimetableEntry(raw: string, defaultRoom: string = ""): TimetableEntry {
  if (!raw) {
    return {
      raw: "",
      subjectName: "",
      baseSubjectName: "",
      splitSubjectName: "",
      subjectCode: "",
      faculty: "",
      room: "",
      isLab: false,
      isTutorial: false,
      componentType: "Theory",
    };
  }

  const lower = raw.toLowerCase();
  const isLab = lower.includes("lab");
  const isTutorial = lower.includes("tutorial");
  const componentType: "Theory" | "Lab" = isLab ? "Lab" : "Theory";

  // Extract bracket content for faculty and room
  const bracketMatches = Array.from(raw.matchAll(/\[([^\]]+)\]/g)).map(m => m[1]);
  let faculty = "";
  let room = defaultRoom;

  // A bracket is a "room" if it matches a known room pattern (block code, lab number, etc.)
  const isRoomBracket = (text: string): boolean => {
    const t = text.trim();
    // AB4-xxx, Lab-x, Deptt, digit-only strings (e.g. "204")
    if (/^AB[0-9][-\s]/i.test(t)) return true;
    if (/^Lab[-\s]?\d/i.test(t)) return true;
    if (/^deptt/i.test(t)) return true;
    if (/^\d+$/.test(t)) return true;
    // Room patterns like "204", "AB4-204", "CSE Deptt"
    if (/^[A-Z]{2,3}\d[-\s]\d{3}/i.test(t)) return true;
    return false;
  };

  if (bracketMatches.length > 0) {
    for (const text of bracketMatches) {
      if (isRoomBracket(text)) {
        room = text;
      } else if (!faculty) {
        faculty = text;
      }
    }
  }

  if (!faculty || faculty.trim() === "") {
    faculty = "Faculty TBD";
  }

  // Extract subject code
  const codeMatch = raw.match(/\b(CS\d{3}[A-Z]?|DA\d{3}|HU301|EE HU301)\b/i);
  const subjectCode = codeMatch ? codeMatch[1].toUpperCase() : "";

  // Map to standardized full subject name
  let baseSubjectName = "";
  if (codeMatch) {
    const code = codeMatch[1].toUpperCase();
    if (code.startsWith("CS203")) baseSubjectName = "Object Oriented Design";
    else if (code.startsWith("CS205")) baseSubjectName = "Design & Analysis of Algorithm";
    else if (code.startsWith("CS207")) baseSubjectName = "Operating System Design";
    else if (code.startsWith("CS209")) baseSubjectName = "Software Engineering";
    else if (code.startsWith("CS301")) baseSubjectName = "Compiler Design";
    else if (code.startsWith("CS303")) baseSubjectName = "Machine Learning";
    else if (code.startsWith("CS305")) baseSubjectName = "Information and Network Security";
    else if (code.startsWith("CS309")) baseSubjectName = "Distributed Systems";
    else if (code.startsWith("CS311")) baseSubjectName = "Information Theory and Coding";
    else if (code.startsWith("CS313")) baseSubjectName = "Quantum Computing";
    else if (code.startsWith("CS315")) baseSubjectName = "Advance Data Structure";
    else if (code.startsWith("CS411")) baseSubjectName = "Cyber Vulnerability & Ethical Hacking";
    else if (code.startsWith("CS425")) baseSubjectName = "Cloud Computing";
    else if (code.startsWith("CS421")) baseSubjectName = "Advance Web Technology";
    else if (code.startsWith("CS423")) baseSubjectName = "Big Data Analytics";
    else if (code.includes("HU301")) baseSubjectName = "Humanities Elective (EE HU301)";
    else if (code.startsWith("DA201")) baseSubjectName = "Design & Analysis of Algorithm";
    else if (code.startsWith("DA203")) baseSubjectName = "Foundation to Data Science";
    else if (code.startsWith("DA205")) baseSubjectName = "Linear Algebra";
    else if (code.startsWith("DA207")) baseSubjectName = "Machine Learning";
    else if (code.startsWith("DA209")) baseSubjectName = "Computer Organization & OS Design";
  }

  if (!baseSubjectName) {
    if (lower.includes("cyber vulnerability") || lower.includes("ethical hacking") || lower.includes("cs411")) {
      baseSubjectName = "Cyber Vulnerability & Ethical Hacking";
    } else if (lower.includes("cloud computing") || lower.includes("cs425")) {
      baseSubjectName = "Cloud Computing";
    } else if (lower.includes("advance web technology") || lower.includes("web technology") || lower.includes("cs421")) {
      baseSubjectName = "Advance Web Technology";
    } else if (lower.includes("big data analytics") || lower.includes("big data") || lower.includes("cs423")) {
      baseSubjectName = "Big Data Analytics";
    } else if (lower.includes("compiler design") || lower.includes("cd")) {
      baseSubjectName = "Compiler Design";
    } else if (lower.includes("machine learning") || lower.includes("ml")) {
      baseSubjectName = "Machine Learning";
    } else if (lower.includes("information and network security") || lower.includes("ins")) {
      baseSubjectName = "Information and Network Security";
    } else if (lower.includes("distributed system") || lower.includes("dis")) {
      baseSubjectName = "Distributed Systems";
    } else if (lower.includes("information theory") || lower.includes("itc")) {
      baseSubjectName = "Information Theory and Coding";
    } else if (lower.includes("quantum computing") || lower.includes("qc")) {
      baseSubjectName = "Quantum Computing";
    } else if (lower.includes("advance data structure") || lower.includes("ads")) {
      baseSubjectName = "Advance Data Structure";
    } else if (lower.includes("humanities") || lower.includes("hu301")) {
      baseSubjectName = "Humanities Elective (EE HU301)";
    } else if (lower.includes("digital logic") || lower.includes("digital electronics") || lower.includes("ece")) {
      baseSubjectName = "Digital Logic Design";
    } else if (lower.includes("operating system") || lower.includes("os")) {
      baseSubjectName = "Operating System Design";
    } else if (lower.includes("algorithm") || lower.includes("daa")) {
      baseSubjectName = "Design & Analysis of Algorithm";
    } else if (lower.includes("software engineering") || lower === "se" || /\bse\b/i.test(lower)) {
      baseSubjectName = "Software Engineering";
    } else if (lower.includes("object oriented") || lower.includes("oop") || lower.includes("ood")) {
      baseSubjectName = "Object Oriented Design";
    } else {
      baseSubjectName = raw.replace(/\[[^\]]+\]/g, "").replace(/^(TH-|Lab-|Tutorial-)/i, "").trim();
    }
  }

  // Extract group (e.g. G1, G2, G3, A1/G1)
  const groupMatch = raw.match(/\b(A\d\/G[1-3]|G[1-3])\b/i);
  let group = "";
  if (groupMatch) {
    const rawGrp = groupMatch[1].toUpperCase();
    const gNum = rawGrp.match(/G[1-3]/);
    group = gNum ? gNum[0] : rawGrp;
  }

  // Handle Faculty TBD
  if (!faculty || faculty.includes("NOT CLEAR") || faculty.includes("VERIFY")) {
    faculty = "Faculty TBD";
  }

  const splitSubjectName = `${baseSubjectName} - ${componentType}`;
  const subjectName = subjectCode
    ? `${baseSubjectName} [${subjectCode}]`
    : baseSubjectName;

  return {
    raw,
    subjectName,
    baseSubjectName,
    splitSubjectName,
    subjectCode,
    faculty,
    room,
    group,
    isLab,
    isTutorial,
    componentType,
  };
}
