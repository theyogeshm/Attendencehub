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
          "9-10": "TH-Software Engineering CS209C [Prof. Rahul Katarya]",
          "10-11": "Digital Logic Design [ECE-Deptt]",
          "11-12": "TH-Operating System Design CS207 [Dr Prashant G S]",
          "12-1": "Tutorial-CS209 Software Engineering G1 [Ms. Shristi Achari]",
          "2-4": "Digital Logic Design Lab (G1)/Lab CS205 DAA-G3 [Prof Manoj Kumar] [Computer Network Lab]"
        },
        "TUE": {
          "10-12": "Digital Logic Design Lab (G2)/Lab CS205 DAA-G1 [Prof Manoj Kumar] [Computer Network Lab]",
          "1-2": "TH-CS205 DAA [Prof Manoj Kumar]",
          "2-3": "TH-Operating System Design CS207 [Dr Prashant G S] [AB4-205]",
          "3-4": "Digital Logic Design [ECE-Deptt]",
          "4-5": "Tutorial-CS209 Software Engineering G2 [Ms. Neha Kumari]"
        },
        "WED": {
          "9-10": "TH-Software Engineering CS209C [Prof. Rahul Katarya] [AB4-203]",
          "10-1": "Lab-Operating System Design CS207-A1/G1 [Dr Prashant G S][Computation Lab] / Lab Object Oriented Design CS203 G3 [Ms Anukriti Kaushal][BDA Lab] / Lab CS205 DAA-G2 [Prof Manoj Kumar][Computer Network Lab]",
          "2-3": "TH-Object Oriented Design CS203 [Ms. Anukriti Kaushal]",
          "3-4": "Digital Logic Design [ECE-Deptt]"
        },
        "THUR": {
          "10-11": "TH-CS205 DAA [Prof Manoj Kumar]",
          "11-12": "TH-Operating System Design CS207 [Dr Prashant G S]",
          "12-1": "TH-Software Engineering CS209-C [Prof. Rahul Katarya]",
          "2-3": "TH-Object Oriented Design CS203 [Ms. Anukriti Kaushal]",
          "3-4": "Lab-Operating System Design CS207-G2 [Computation Lab][Dr Prashant G S] / Lab Object Oriented Design CS203 G1 [Mr Nikhil Gupta][BDA Lab] / Digital Logic Design Lab (G3)",
          "4-5": "TH-Operating System Design CS207 [Dr Prashant G S]"
        },
        "FRI": {
          "9-10": "TH-CS205 DAA [Prof Manoj Kumar]",
          "10-12": "Lab-Operating System Design CS207-G3 [Dr Prashant G S][A1 Lab] / Lab Object Oriented Design CS203 G2 [Ms Anukriti Kaushal][BDA Lab]",
          "11-12": "TH-Object Oriented Design CS203 [Ms. Anukriti Kaushal]",
          "2-3": "Digital Logic Design [ECE-Deptt]",
          "3-4": "Tutorial-CS209 Software Engineering G3 [Ms. Anushree Awasthi] [AB4-421]"
        }
      }
    },
    "A2": {
      "room": "AB4-204",
      "timetable": {
        "MON": {
          "10-12": "Lab-Digital Logic Design-G1 [ECE Department] / Lab CS205 DAA-G2 [Dr Sanjay Kumar] [Computer Network Lab]",
          "1-2": "TH-CS203 OOPC [Dr Manoj Sethi]",
          "2-3": "TH-CS205-DAA [Dr Sanjay Kumar]",
          "3-4": "TH-CS207-OS [Dr Rohit Beniwal]",
          "4-5": "TH-CS209-SE [Prof Daya Gupta]"
        },
        "TUE": {
          "10-11": "TH-CS203 OOPC [Dr Manoj Sethi]",
          "11-12": "TH-Digital Logic Design [ECE]",
          "2-4": "Lab-Operating System Design CS207-A2/G3 [Dr Rohit Beniwal][DBMS Lab] / Lab Object Oriented Design CS203 A2/G2 [Dr Manoj Sethi][AI Lab] / Lab CS205 DAA-G1 [Dr Sanjay Kumar] [CN Lab]"
        },
        "WED": {
          "9-10": "TH-Digital Logic Design [ECE]",
          "10-11": "TH-CS207-OS [Dr Rohit Beniwal]",
          "11-12": "TH-CS209-SE [Prof Daya Gupta]",
          "12-1": "Tutorial-CS209 Software Engineering G2 [Ms. Shreya Shukla][AB4-201]",
          "2-3": "TH-CS205-DAA [Dr Sanjay Kumar][AB4-203]",
          "3-4": "TH-CS203 OOPC [Dr Manoj Sethi][AB4-203]"
        },
        "THUR": {
          "10-12": "Lab-Operating System Design CS207-A2/G1 [Dr Rohit Beniwal][CA Lab] / Lab Object Oriented Design CS203 A2/G3 [Dr Manoj Sethi][Computation Lab] / Lab Digital Logic Design-G2 [ECE Department]",
          "1-2": "TH-CS205-DAA [Dr Sanjay Kumar]",
          "2-4": "Lab-Operating System Design CS207-A2/G2 [CA Lab] / Lab Object Oriented Design CS203 A2/G1 [Ms Neeraj Sagar][AI Lab] / Lab-Digital Logic Design-G3 [ECE Department]"
        },
        "FRI": {
          "9-10": "Lab CS205 DAA-G3 [Dr Sanjay Kumar][Computer Network Lab]",
          "10-11": "TH-Digital Logic Design [ECE]",
          "11-12": "TH-CS209-SE [Prof Daya Gupta]",
          "12-1": "Tutorial-CS209 Software Engineering G1 [Ms. Shreya Shukla][AB4-221]",
          "2-3": "TH-CS207-OS [Dr Rohit Beniwal]",
          "3-4": "Tutorial-CS209 Software Engineering G3 [Ms. Shreya Shukla]"
        }
      }
    },
    "A3": {
      "room": "AB4-205",
      "timetable": {
        "MON": {
          "9-10": "Tutorial-CS209 Software Engineering G3 [Mr. Gautam Kumar Jha]",
          "10-11": "TH-CS203 Oops [Dr Gunjan Chugh]",
          "11-12": "TH-CS207 OS [Dr Minni Jain]",
          "12-1": "TH-Digital Logic Design",
          "2-3": "TH-CS209-SE [Prof Daya Gupta][AB4-515]"
        },
        "TUE": {
          "10-11": "TH-CS207 OS [Dr Minni Jain]",
          "11-12": "TH-CS203 Oops [Dr Gunjan Chugh]",
          "12-1": "TH-CS205 DAA [Prof Manoj Kumar]",
          "2-4": "Lab-Digital Logic Design-G1 [ECE Department] / Lab CS205 DAA-G2 [Mr. Gautam Kumar Jha] [Computer Network Lab]"
        },
        "WED": {
          "9-10": "TH-CS205 DAA [Prof Manoj Kumar][AB4-404]",
          "10-1": "Lab-Operating System Design CS207-A3/G1 [Dr Minni Jain][CA Lab] / Lab Object Oriented Design CS203 G3 [Dr Gunjan Chugh][AI Lab] / Lab-Digital Logic Design-G2 [ECE Department]",
          "12-1": "TH-CS209-SE [Prof Daya Gupta]",
          "2-4": "Lab-Operating System Design CS207-A3/G2 [Dr Minni Jain][BDA Lab] / Lab Object Oriented Design CS203 G1 [Dr Gunjan Chugh][AI Lab] / Lab-Digital Logic Design-G3 [ECE Department]"
        },
        "THUR": {
          "10-11": "Tutorial-CS209 Software Engineering G1 [Ms Kanchan Sharma][AB4-416]",
          "11-12": "Tutorial-CS209 Software Engineering G2 [Ms Kanchan Sharma][AB4-416]",
          "10-12_lab": "Lab CS205 DAA-G3 [Mr. Immanni Ganesh][Computer Network Lab]",
          "1-2": "TH-CS207 OS [Dr Minni Jain]",
          "2-3": "TH-CS205 DAA [Prof Manoj Kumar]",
          "3-4": "TH-CS201 Digital Logic Design"
        },
        "FRI": {
          "10-11": "TH-CS203 Oops [Dr Gunjan Chugh]",
          "11-12": "TH-Digital Logic Design",
          "1-2": "TH-CS209-SE [Prof Daya Gupta]",
          "2-4": "Lab-Operating System Design CS207-A3/G3 [Dr Minni Jain][BDA Lab] / Lab Object Oriented Design CS203 G2 [Dr Gunjan Chugh][AI Lab] / Lab CS205 DAA-G1 [Dr Gautam Kumar Jha][Computer Network Lab]"
        }
      }
    },
    "A4": {
      "room": "AB4-205",
      "timetable": {
        "MON": {
          "10-12": "Lab-Digital Logic Design-G1 [ECE Department] / Lab CS205 DAA-G2 [Dr N Anand][Computer Network Lab] / Lab Object Oriented Design CS203 A4/G3 [Dr Aditi Zear][ML Lab]",
          "12-1": "TH-CS207 SE [Dr Ravin Ahuja][AB4-303]",
          "2-3": "TH-CS203 Oops [Dr Aditi Zear]",
          "3-4": "TH-CS207 OS [Dr Nipun Bansal]"
        },
        "TUE": {
          "10-12": "Lab CS205 DAA-G1 [Dr N Anand][Computer Network Lab]",
          "1-2": "TH-Digital Logic Design [ECE Department]",
          "2-4": "Lab-Operating System Design CS207-A4/G1 [Dr Nipun Bansal][Data Mining Lab] / Lab-Digital Logic Design-G2 [ECE Department] / Lab CS205 DAA-G3 [Ms. Monika][CA Lab]"
        },
        "WED": {
          "9-10": "TH-CS207 SE [Dr Ravin Ahuja]",
          "10-11": "Tutorial-CS209 Software Engineering G3 [Ms. Kiran Bala]",
          "11-12": "TH-CS207 OS [Dr Nipun Bansal]",
          "1-2": "TH-Digital Logic Design [ECE Department]",
          "2-3": "TH-CS203 Oops [Dr Aditi Zear]",
          "3-4": "TH-CS205 DAA [Dr N Anand]"
        },
        "THUR": {
          "10-11": "TH-CS207 OS [Dr Nipun Bansal]",
          "11-12": "TH-CS205 DAA [Dr N Anand]",
          "12-1": "TH-Digital Logic Design [ECE Department]",
          "2-4": "Lab-Operating System Design CS207-A4/G2 [Dr Nipun Bansal][Data Mining Lab] / Lab Object Oriented Design CS203 G1 [Dr Aditi Zear][DBMS Lab] / Lab-Digital Logic Design-G3 [ECE Department]"
        },
        "FRI": {
          "9-10": "Tutorial-CS209 Software Engineering G2 [Ms. Kiran Bala][AB4-203]",
          "10-11": "TH-CS205 DAA [Dr N Anand][AB4-203]",
          "11-12": "TH-CS207 SE [Dr Ravin Ahuja][AB4-203]",
          "12-1": "TH-CS203 Oops [Dr Aditi Zear]",
          "2-3": "Tutorial-CS209 Software Engineering G1 [Ms. Kiran Bala][AB4-205]",
          "3-4": "Lab-Operating System Design CS207-A4/G3 [Dr Nipun Bansal][IPM Lab] / Lab Object Oriented Design CS203 G2 [Dr Aditi Zear][DBMS Lab]"
        }
      }
    },
    "A5": {
      "room": "AB4-303",
      "timetable": {
        "MON": {
          "9-10": "TH-Software Engineering CS209C [Mr. Pooja Kamboj]",
          "10-11": "TH-Digital Logic Design [ECE-Deptt]",
          "11-12": "TH-Object Oriented Design CS203 [Dr Snigdha Agarwal]",
          "12-1": "Lab CS205 DAA-G3 [Dr Yeshwant Singh][Computer Network Lab]",
          "2-4": "Digital Logic Design Lab (G1) / Lab CS205 DAA-G2 [Dr Yeshwant Singh][IPM Lab]"
        },
        "TUE": {
          "9-10": "Tutorial-CS209 Software Engineering G1 [Mr Sankulp Khera][AB4-221]",
          "10-11_lab": "Digital Logic Design Lab (G3)",
          "1-2": "TH-CS205 DAA [Dr Yeshwant Singh]",
          "2-3": "TH-Operating System Design CS207 [Ms. Gull Kaur]",
          "3-4": "Tutorial-CS209 Software Engineering G2 [Mr Sankulp Khera][AB4-205]"
        },
        "WED": {
          "9-10": "Tutorial-CS209 Software Engineering G1 [Dr Gull Kaur][AB4-221]",
          "10-1": "Lab-Operating System Design CS207-A5/G1 [Dr Gull Kaur][DBMS Lab] / Lab Object Oriented Design CS203 G3 [Dr Snigdha Agarwal][Data Mining Lab]",
          "12-1": "TH-CS205 DAA [Dr Yeshwant Singh]",
          "2-3": "TH-Object Oriented Design CS203 [Dr Snigdha Agarwal]",
          "3-4": "TH-Digital Logic Design [ECE-Deptt]"
        },
        "THUR": {
          "10-11": "TH-Software Engineering CS209C [Mr. Pooja Kamboj]",
          "11-12": "TH-Operating System Design CS207 [Ms. Gull Kaur]",
          "12-1": "TH-CS205 DAA [Dr Yeshwant Singh]",
          "2-4": "Lab-Operating System Design CS207-A5/G2 [Dr Minni Jain][IPM Lab] / Lab Object Oriented Design CS203 A5/G1 [Dr Snigdha Agarwal][IOT Lab] / Digital Logic Design Lab (A5/G3)"
        },
        "FRI": {
          "9-10": "TH-Object Oriented Design CS203 [Dr Snigdha Agarwal]",
          "10-1": "Lab-Operating System Design CS207-A5/G3 [Dr Gull Kaur][DBMS Lab] / Lab Object Oriented Design CS203 A5/G2 [Dr Snigdha Agarwal][IPM Lab] / Lab CS205 DAA-G1 [Ms. Poonam Soni][Computer Network Lab]",
          "12-1": "TH-Software Engineering CS209C [Mr. Pooja Kamboj]",
          "1-2": "TH-Digital Logic Design [ECE-Deptt]"
        }
      }
    },
    "A6": {
      "room": "AB4-303",
      "timetable": {
        "MON": {
          "9-10": "Tutorial-CS209 Software Engineering G1 [Ms Monika][AB4-404]",
          "10-12": "Lab-Digital Logic Design-G1 [ECE Department]",
          "1-2": "TH-CS203 OOPC [Ms. Anjali Bansal]",
          "2-3": "TH-CS209-SE [Ms Pooja Kamboj]",
          "3-4": "TH-CS207-OS [Dr Gunjan Chugh]",
          "4-5": "TH-CS205-DAA [Dr Aditi Zear]"
        },
        "TUE": {
          "10-11": "TH-CS207-OS [Dr Gunjan Chugh]",
          "11-12": "TH-CS205-DAA [Dr Aditi Zear]",
          "12-1": "TH-Digital Logic Design [ECE]",
          "2-4": "Lab-Operating System Design CS207-A6/G3 [IPM Lab] / Lab Object Oriented Design CS203 A6/G1 [Ms. Anjali Bansal][IOT Lab] / Lab CS205 DAA-G1 [Dr Aditi Zear][IS & CI Lab]"
        },
        "WED": {
          "9-10": "TH-Digital Logic Design [ECE]",
          "10-11": "Tutorial-CS209 Software Engineering G2 [Ms. Monika]",
          "11-12": "TH-CS205-DAA [Dr Aditi Zear]",
          "1-2": "TH-CS203 OOPC [Ms. Anjali Bansal]",
          "2-4": "Lab-Operating System Design CS207-A6/G2 [Dr Prashant G S][DBMS Lab] / Lab Object Oriented Design CS203 G1 [Ms. Anjali Bansal][IPM Lab] / Lab-Digital Logic Design-G3 [ECE Department]"
        },
        "THUR": {
          "10-12": "Lab-Operating System Design CS207-A6/G1 [Dr Gunjan Chugh][DBMS Lab] / Lab Object Oriented Design CS203 A6/G3 [Ms Kiran Bala][BDA Lab] / Lab-Digital Logic Design-G2 [ECE Department]",
          "1-2": "TH-CS207-OS [Dr Gunjan Chugh]",
          "2-3": "TH-Digital Logic Design [ECE]",
          "3-4": "TH-CS209-SE [Ms Pooja Kamboj]"
        },
        "FRI": {
          "10-12": "Lab CS205 DAA-G2 [Dr Aditi Zear][Computer Network Lab] / Lab CS205 DAA-G3 [Ms. Aanchal][IOT Lab]",
          "12-1": "Tutorial-CS209 Software Engineering G3 [Ms. Monika][AB4-315]",
          "2-3": "TH-CS203 OOPC [Ms. Anjali Bansal]",
          "3-4": "TH-CS209-SE [Ms Pooja Kamboj]"
        }
      }
    },
    "A7": {
      "room": "AB4-315",
      "timetable": {
        "MON": {
          "9-10": "TH-Software Engineering CS209 [Dr. Amrita Sisodia]",
          "10-11": "TH-Digital Logic Design [ECE-Deptt]",
          "11-12": "TH-CS205 DAA [Dr Neha Gupta]",
          "12-2": "Lab-Operating System Design CS207-A7/G1 [Prof Rajni Jindal][DBMS Lab] / Lab Object Oriented Design CS203 G3 [Dr Snigdha Agarwal][IPM Lab]",
          "3-4": "Digital Logic Design Lab (G1)"
        },
        "TUE": {
          "10-11": "TH-Object Oriented Design CS203 [Dr Aditi Zear]",
          "11-12": "TH-Operating System Design CS207 [Prof Rajni Jindal]",
          "12-2": "Lab-Operating System Design CS207-A7/G2 [DBMS Lab][Dr Prashant Giridhar S] / Lab Object Oriented Design CS203 A7/G1 [Ms. Anjali Bansal][IPM Lab] / Digital Logic Design Lab (A7/G3)",
          "2-3": "Tutorial-CS209 Software Engineering G1 [AB4-315][Mr Vivek]",
          "3-4": "Digital Logic Design Lab (G2) [ECE-Deptt]"
        },
        "WED": {
          "10-11": "TH-Object Oriented Design CS203 [Dr Aditi Zear][AB4-203]",
          "11-12": "TH-Operating System Design CS207 [Prof Rajni Jindal][AB4-203]",
          "12-2": "Lab-Operating System Design CS207-A7/G3 [Prof Rajni Jindal][DBMS Lab] / Lab Object Oriented Design CS203 A7/G2 [Ms. Yati][IPM Lab]",
          "2-3": "Tutorial-CS209 Software Engineering G1 [AB4-315][Mr Vivek]",
          "3-4": "Digital Logic Design Lab (G1) [ECE-Deptt]"
        },
        "THUR": {
          "10-11": "TH-Software Engineering CS209 [Dr. Amrita Sisodia]",
          "11-12": "TH-Object Oriented Design CS203 [Dr Aditi Zear]",
          "1-2": "TH-CS205 DAA [Dr Neha Gupta][AB4-315]",
          "2-3": "Lab CS205 DAA-G2 [Dr Neha Gupta][IOT Lab]/Lab CS205 DAA-G3 [Dr Sanjay Kumar][IOT Lab]",
          "3-4": "Digital Logic Design Lab (G2)"
        },
        "FRI": {
          "9-10": "TH-Software Engineering CS209 [Dr. Amrita Sisodia]",
          "10-11": "TH-CS205 DAA [Dr Neha Gupta]",
          "11-12": "TH-Operating System Design CS207 [Prof Rajni Jindal]",
          "12-1": "TH-Digital Logic Design [ECE-Deptt]",
          "4-5": "Tutorial-CS209 Software Engineering G3 [AB4-106][Mr Vivek]"
        }
      }
    }
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

  if (bracketMatches.length > 0) {
    for (const text of bracketMatches) {
      if (text.startsWith("AB4") || text.toLowerCase().includes("lab") || text.toLowerCase().includes("deptt")) {
        room = text;
      } else if (!faculty) {
        faculty = text;
      }
    }
  }

  // Extract subject code
  const codeMatch = raw.match(/\b(CS\d{3}[A-Z]?|DA\d{3})\b/i);
  const subjectCode = codeMatch ? codeMatch[1].toUpperCase() : "";

  // Map to standardized full subject name
  let baseSubjectName = "";
  if (codeMatch) {
    const code = codeMatch[1].toUpperCase();
    if (code.startsWith("CS203")) baseSubjectName = "Object Oriented Programming (OOP)";
    else if (code.startsWith("CS205")) baseSubjectName = "Algorithm Design and Analysis (DAA)";
    else if (code.startsWith("CS207")) baseSubjectName = "Operating System Design (OS)";
    else if (code.startsWith("CS209")) baseSubjectName = "Software Engineering (SE)";
    else if (code.startsWith("DA201")) baseSubjectName = "Design & Analysis of Algorithm (DAA)";
    else if (code.startsWith("DA203")) baseSubjectName = "Foundation to Data Science";
    else if (code.startsWith("DA205")) baseSubjectName = "Linear Algebra";
    else if (code.startsWith("DA207")) baseSubjectName = "Machine Learning";
    else if (code.startsWith("DA209")) baseSubjectName = "Computer Organization & OS Design";
  }

  if (!baseSubjectName) {
    if (lower.includes("digital logic") || lower.includes("digital electronics") || lower.includes("ece")) {
      baseSubjectName = "Digital Electronics";
    } else if (lower.includes("operating system") || lower.includes("os")) {
      baseSubjectName = "Operating System Design (OS)";
    } else if (lower.includes("algorithm") || lower.includes("daa")) {
      baseSubjectName = "Algorithm Design and Analysis (DAA)";
    } else if (lower.includes("software engineering") || lower.includes("se")) {
      baseSubjectName = "Software Engineering (SE)";
    } else if (lower.includes("object oriented") || lower.includes("oop")) {
      baseSubjectName = "Object Oriented Programming (OOP)";
    } else {
      baseSubjectName = raw.replace(/\[[^\]]+\]/g, "").replace(/^(TH-|Lab-|Tutorial-)/i, "").trim();
    }
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
    isLab,
    isTutorial,
    componentType,
  };
}
