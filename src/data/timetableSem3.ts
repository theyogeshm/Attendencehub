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
          "10-11": "TH-Digital Logic Design [TBD]",
          "11-12": "TH-Operating System Design CS207 [Dr Prashant G S]",
          "12-1": "Tutorial-Software Engineering CS209 G1 [Ms Shristi Achari]",
          "3-4": "Lab-Digital Logic Design Lab-G1 [TBD] / Lab-CS205 DAA Lab-G3 [Prof Manoj Kumar][Computer Network Lab]"
        },
        "TUE": {
          "10-12": "Lab-Digital Logic Design Lab-G2 [TBD] / Lab-CS205 DAA Lab-G1 [Prof Manoj Kumar][Computer Network Lab]",
          "1-2": "TH-CS205 DAA [Prof Manoj Kumar]",
          "2-3": "TH-Operating System Design CS207 [Dr Prashant G S][AB4-205]",
          "3-4": "TH-Digital Logic Design [TBD]",
          "4-5": "Tutorial-Software Engineering CS209 G2 [Ms Neha Kumari]"
        },
        "WED": {
          "9-10": "TH-Software Engineering CS209C [Prof Rahul Katarya][AB4-203]",
          "10-1": "Lab-CS207 OS Lab-A1/G1 [Dr Prashant G S][Computation Lab] / Lab-CS203 OOP Lab-G3 [Ms Anukriti Kaushal][BDA Lab] / Lab-CS205 DAA Lab-G2 [Prof Manoj Kumar][Computer Network Lab]",
          "2-3": "TH-Object Oriented Design CS203 [Ms Anukriti Kaushal]",
          "3-4": "TH-Digital Logic Design [TBD]"
        },
        "THUR": {
          "10-11": "TH-CS205 DAA [Prof Manoj Kumar]",
          "11-12": "TH-Operating System Design CS207 [Dr Prashant G S]",
          "12-1": "TH-Software Engineering CS209-C [Prof Rahul Katarya]",
          "2-3": "TH-Object Oriented Design CS203 [Ms Anukriti Kaushal]",
          "2-4": "Lab-CS207 OS Lab-G2 [Dr Prashant G S][Computation Lab] / Lab-CS203 OOP Lab-G1 [Mr Nikhil Gupta][BDA Lab] / Lab-Digital Logic Design Lab-G3 [TBD]",
          "4-5": "TH-Operating System Design CS207 [Dr Prashant G S]"
        },
        "FRI": {
          "9-10": "TH-CS205 DAA [Prof Manoj Kumar]",
          "10-12": "Lab-CS207 OS Lab-G3 [Dr Prashant G S][A1 Lab] / Lab-CS203 OOP Lab-G2 [Ms Anukriti Kaushal][BDA Lab]",
          "11-12": "TH-Object Oriented Design CS203 [Ms Anukriti Kaushal]",
          "2-3": "TH-Digital Logic Design [TBD]",
          "3-4": "Tutorial-Software Engineering CS209 G3 [Ms Anushree Awasthi][AB4-421]"
        }
      }
    },
    "A2": {
      "room": "AB4-204",
      "timetable": {
        "MON": {
          "10-12": "Lab-Digital Logic Design Lab-G1 [TBD] / Lab-CS205 DAA Lab-G2 [Dr Sanjay Kumar][Computer Network Lab]",
          "1-2": "TH-CS203 OOPC [Dr Manoj Sethi]",
          "2-3": "TH-CS205 DAA [Dr Sanjay Kumar]",
          "3-4": "TH-CS207 OS [Dr Rohit Beniwal]",
          "4-5": "TH-CS209 SE [Prof Daya Gupta]"
        },
        "TUE": {
          "10-11": "TH-CS203 OOPC [Dr Manoj Sethi]",
          "11-12": "TH-Digital Logic Design [TBD]",
          "2-4": "Lab-CS207 OS Lab-A2/G3 [Dr Rohit Beniwal][DBMS Lab] / Lab-CS203 OOP Lab-A2/G2 [Dr Manoj Sethi][AI Lab] / Lab-CS205 DAA Lab-G1 [Dr Sanjay Kumar][CN Lab]"
        },
        "WED": {
          "9-10": "TH-Digital Logic Design [TBD]",
          "10-11": "TH-CS207 OS [Dr Rohit Beniwal]",
          "11-12": "TH-CS209 SE [Prof Daya Gupta]",
          "12-1": "Tutorial-Software Engineering CS209 G2 [Ms Shreya Shukla][AB4-201]",
          "2-3": "TH-CS205 DAA [Dr Sanjay Kumar][AB4-203]",
          "3-4": "TH-CS203 OOPC [Dr Manoj Sethi][AB4-203]"
        },
        "THUR": {
          "10-12": "Lab-CS207 OS Lab-A2/G1 [Dr Rohit Beniwal][CA Lab] / Lab-CS203 OOP Lab-A2/G3 [Dr Manoj Sethi][Computation Lab] / Lab-Digital Logic Design Lab-G2 [TBD]",
          "1-2": "TH-CS205 DAA [Dr Sanjay Kumar]",
          "2-4": "Lab-CS207 OS Lab-A2/G2 [TBD - VERIFY][CA Lab] / Lab-CS203 OOP Lab-A2/G1 [Ms Neeraj Sagar][AI Lab] / Lab-Digital Logic Design Lab-G3 [TBD]"
        },
        "FRI": {
          "9-10": "Lab-CS205 DAA Lab-G3 [Dr Sanjay Kumar][Computer Network Lab]",
          "10-11": "TH-Digital Logic Design [TBD]",
          "11-12": "TH-CS209 SE [Prof Daya Gupta]",
          "12-1": "Tutorial-Software Engineering CS209 G1 [Ms Shreya Shukla][AB4-221]",
          "2-3": "TH-CS207 OS [Dr Rohit Beniwal]",
          "3-4": "Tutorial-Software Engineering CS209 G3 [Ms Shreya Shukla]"
        }
      }
    },
    "A3": {
      "room": "AB4-205",
      "timetable": {
        "MON": {
          "9-10": "Tutorial-Software Engineering CS209 G3 [Mr Gautam Kumar Jha]",
          "10-11": "TH-CS203 Oops [Dr Gunjan Chugh]",
          "11-12": "TH-CS207 OS [Dr Minni Jain]",
          "12-1": "TH-Digital Logic Design [TBD]",
          "2-3": "TH-CS209 SE [Prof Daya Gupta][AB4-515]"
        },
        "TUE": {
          "10-11": "TH-CS207 OS [Dr Minni Jain]",
          "11-12": "TH-CS203 Oops [Dr Gunjan Chugh]",
          "12-1": "TH-CS205 DAA [Prof Manoj Kumar]",
          "2-4": "Lab-Digital Logic Design Lab-G1 [TBD] / Lab-CS205 DAA Lab-G2 [Mr Gautam Kumar Jha][Computer Network Lab]"
        },
        "WED": {
          "9-10": "TH-CS205 DAA [Prof Manoj Kumar][AB4-404]",
          "10-1": "Lab-CS207 OS Lab-A3/G1 [Dr Minni Jain][CA Lab] / Lab-CS203 OOP Lab-G3 [Dr Gunjan Chugh][AI Lab] / Lab-Digital Logic Design Lab-G2 [TBD]",
          "12-1": "TH-CS209 SE [Prof Daya Gupta]",
          "2-4": "Lab-CS207 OS Lab-A3/G2 [Dr Minni Jain][BDA Lab] / Lab-CS203 OOP Lab-G1 [Dr Gunjan Chugh][AI Lab] / Lab-Digital Logic Design Lab-G3 [TBD]"
        },
        "THUR": {
          "10-11": "Tutorial-Software Engineering CS209 G1 [Ms Kanchan Sharma][AB4-416]",
          "11-12": "Tutorial-Software Engineering CS209 G2 [Ms Kanchan Sharma][AB4-416]",
          "12-1": "Lab-CS205 DAA Lab-G3 [Mr Immanni Ganesh][Computer Network Lab]",
          "1-2": "TH-CS207 OS [Dr Minni Jain]",
          "2-3": "TH-CS205 DAA [Prof Manoj Kumar]",
          "3-4": "TH-CS201 Digital Logic Design [TBD]"
        },
        "FRI": {
          "10-11": "TH-CS203 Oops [Dr Gunjan Chugh]",
          "11-12": "TH-Digital Logic Design [TBD]",
          "1-2": "TH-CS209 SE [Prof Daya Gupta]",
          "2-4": "Lab-CS207 OS Lab-A3/G3 [Dr Minni Jain][BDA Lab] / Lab-CS203 OOP Lab-G2 [Dr Gunjan Chugh][AI Lab] / Lab-CS205 DAA Lab-G1 [Dr Gautam Kumar Jha][Computer Network Lab]"
        }
      }
    },
    "A4": {
      "room": "AB4-205",
      "timetable": {
        "MON": {
          "10-12": "Lab-Digital Logic Design Lab-G1 [TBD] / Lab-CS205 DAA Lab-G2 [Dr N Anand][Computer Network Lab] / Lab-CS203 OOP Lab-A4/G3 [Dr Aditi Zear][ML Lab]",
          "12-1": "TH-CS207 SE [Dr Ravin Ahuja][AB4-303]",
          "2-3": "TH-CS203 Oops [Dr Aditi Zear]",
          "3-4": "TH-CS207 OS [Dr Nipun Bansal]"
        },
        "TUE": {
          "10-12": "Lab-CS205 DAA Lab-G1 [Dr N Anand][Computer Network Lab]",
          "1-2": "TH-Digital Logic Design [TBD]",
          "2-4": "Lab-CS207 OS Lab-A4/G1 [Dr Nipun Bansal][Data Mining Lab] / Lab-Digital Logic Design Lab-G2 [TBD] / Lab-CS205 DAA Lab-G3 [Ms Monika][CA Lab]"
        },
        "WED": {
          "9-10": "TH-CS207 SE [Dr Ravin Ahuja]",
          "10-11": "Tutorial-Software Engineering CS209 G3 [Ms Kiran Bala]",
          "11-12": "TH-CS207 OS [Dr Nipun Bansal]",
          "1-2": "TH-Digital Logic Design [TBD]",
          "2-3": "TH-CS203 Oops [Dr Aditi Zear]",
          "3-4": "TH-CS205 DAA [Dr N Anand]"
        },
        "THUR": {
          "10-11": "TH-CS207 OS [Dr Nipun Bansal]",
          "11-12": "TH-CS205 DAA [Dr N Anand]",
          "12-1": "TH-Digital Logic Design [TBD]",
          "2-4": "Lab-CS207 OS Lab-A4/G2 [Dr Nipun Bansal][Data Mining Lab] / Lab-CS203 OOP Lab-G1 [Dr Aditi Zear][DBMS Lab] / Lab-Digital Logic Design Lab-G3 [TBD]"
        },
        "FRI": {
          "9-10": "Tutorial-Software Engineering CS209 G2 [Ms Kiran Bala][AB4-203]",
          "10-11": "TH-CS205 DAA [Dr N Anand][AB4-203]",
          "11-12": "TH-CS207 SE [Dr Ravin Ahuja][AB4-203]",
          "12-1": "TH-CS203 Oops [Dr Aditi Zear]",
          "2-3": "Tutorial-Software Engineering CS209 G1 [Ms Kiran Bala][AB4-205]",
          "3-4": "Lab-CS207 OS Lab-A4/G3 [Dr Nipun Bansal][IPM Lab] / Lab-CS203 OOP Lab-G2 [Dr Aditi Zear][DBMS Lab]"
        }
      }
    },
    "A5": {
      "room": "AB4-303",
      "timetable": {
        "MON": {
          "9-10": "TH-Software Engineering CS209C [Mr Pooja Kamboj]",
          "10-11": "TH-Digital Logic Design [TBD]",
          "11-12": "TH-Object Oriented Design CS203 [Dr Snigdha Agarwal]",
          "12-1": "Lab-CS205 DAA Lab-G3 [Dr Yeshwant Singh][Computer Network Lab]",
          "3-4": "Lab-Digital Logic Design Lab-G1 [TBD] / Lab-CS205 DAA Lab-G2 [Dr Yeshwant Singh][IPM Lab]"
        },
        "TUE": {
          "9-10": "Tutorial-Software Engineering CS209 G1 [Mr Sankalp Khera][AB4-221]",
          "10-11": "Lab-Digital Logic Design Lab-G3 [TBD]",
          "1-2": "TH-CS205 DAA [Dr Yeshwant Singh]",
          "2-3": "TH-Operating System Design CS207 [Ms Gull Kaur]",
          "3-4": "Tutorial-Software Engineering CS209 G2 [Mr Sankalp Khera][AB4-205]"
        },
        "WED": {
          "9-10": "Tutorial-Software Engineering CS209 G1 [Dr Gull Kaur][AB4-221]",
          "10-1": "Lab-CS207 OS Lab-A5/G1 [Dr Gull Kaur][DBMS Lab] / Lab-CS203 OOP Lab-G3 [Dr Snigdha Agarwal][Data Mining Lab]",
          "12-1": "TH-CS205 DAA [Dr Yeshwant Singh]",
          "2-3": "TH-Object Oriented Design CS203 [Dr Snigdha Agarwal]",
          "3-4": "TH-Digital Logic Design [TBD]"
        },
        "THUR": {
          "10-11": "TH-Software Engineering CS209C [Mr Pooja Kamboj]",
          "11-12": "TH-Operating System Design CS207 [Ms Gull Kaur]",
          "12-1": "TH-CS205 DAA [Dr Yeshwant Singh]",
          "2-4": "Lab-CS207 OS Lab-A5/G2 [Dr Minni Jain][IPM Lab] / Lab-CS203 OOP Lab-A5/G1 [Dr Snigdha Agarwal][IOT Lab] / Lab-Digital Logic Design Lab-A5/G3 [TBD]"
        },
        "FRI": {
          "9-10": "TH-Object Oriented Design CS203 [Dr Snigdha Agarwal]",
          "10-1": "Lab-CS207 OS Lab-A5/G3 [Dr Gull Kaur][DBMS Lab] / Lab-CS203 OOP Lab-A5/G2 [Dr Snigdha Agarwal][IPM Lab] / Lab-CS205 DAA Lab-G1 [Ms Poonam Soni][Computer Network Lab]",
          "12-1": "TH-Software Engineering CS209C [Mr Pooja Kamboj]",
          "1-2": "TH-Digital Logic Design [TBD]"
        }
      }
    },
    "A6": {
      "room": "AB4-303",
      "timetable": {
        "MON": {
          "9-10": "Tutorial-Software Engineering CS209 G1 [Ms Monika][AB4-404]",
          "10-12": "Lab-Digital Logic Design Lab-G1 [TBD]",
          "1-2": "TH-CS203 OOPC [Ms Anjali Bansal]",
          "2-3": "TH-CS209 SE [Ms Pooja Kamboj]",
          "3-4": "TH-CS207 OS [Dr Gunjan Chugh]",
          "4-5": "TH-CS205 DAA [Dr Aditi Zear]"
        },
        "TUE": {
          "10-11": "TH-CS207 OS [Dr Gunjan Chugh]",
          "11-12": "TH-CS205 DAA [Dr Aditi Zear]",
          "12-1": "TH-Digital Logic Design [TBD]",
          "2-4": "Lab-CS207 OS Lab-A6/G3 [TBD - VERIFY][IPM Lab] / Lab-CS203 OOP Lab-A6/G2 [Ms Anjali Bansal][IOT Lab] / Lab-CS205 DAA Lab-G1 [Dr Aditi Zear][IS & CI Lab]"
        },
        "WED": {
          "9-10": "TH-Digital Logic Design [TBD]",
          "10-11": "Tutorial-Software Engineering CS209 G2 [Ms Monika]",
          "11-12": "TH-CS205 DAA [Dr Aditi Zear]",
          "1-2": "TH-CS203 OOPC [Ms Anjali Bansal]",
          "2-4": "Lab-CS207 OS Lab-A6/G2 [Dr Prashant G S][DBMS Lab] / Lab-CS203 OOP Lab-G1 [Ms Anjali Bansal][IPM Lab] / Lab-Digital Logic Design Lab-G3 [TBD]"
        },
        "THUR": {
          "10-12": "Lab-CS207 OS Lab-A6/G1 [Dr Gunjan Chugh][DBMS Lab] / Lab-CS203 OOP Lab-A6/G3 [Ms Kiran Bala][BDA Lab] / Lab-Digital Logic Design Lab-G2 [TBD]",
          "1-2": "TH-CS207 OS [Dr Gunjan Chugh]",
          "2-3": "TH-Digital Logic Design [TBD]",
          "3-4": "TH-CS209 SE [Ms Pooja Kamboj]"
        },
        "FRI": {
          "10-12": "Lab-CS205 DAA Lab-G2 [Dr Aditi Zear][Computer Network Lab] / Lab-CS205 DAA Lab-G3 [Ms Aanchal][IOT Lab]",
          "12-1": "Tutorial-Software Engineering CS209 G3 [Ms Monika][AB4-315]",
          "2-3": "TH-CS203 OOPC [Ms Anjali Bansal]",
          "3-4": "TH-CS209 SE [Ms Pooja Kamboj]"
        }
      }
    },
    "A7": {
      "room": "AB4-315",
      "timetable": {
        "MON": {
          "9-10": "TH-Software Engineering CS209 [Dr Amrita Sisodia]",
          "10-11": "TH-Digital Logic Design [TBD]",
          "11-12": "TH-CS205 DAA [Dr Neha Gupta]",
          "12-2": "Lab-CS207 OS Lab-A7/G1 [Prof Rajni Jindal][DBMS Lab] / Lab-CS203 OOP Lab-G3 [Dr Snigdha Agarwal][IPM Lab]",
          "3-4": "Lab-Digital Logic Design Lab-G1 [TBD]"
        },
        "TUE": {
          "10-11": "TH-Object Oriented Design CS203 [Dr Aditi Zear]",
          "11-12": "TH-Operating System Design CS207 [Prof Rajni Jindal]",
          "12-2": "Lab-CS207 OS Lab-A7/G2 [Dr Prashant Giridhar S][DBMS Lab] / Lab-CS203 OOP Lab-A7/G1 [Ms Anjali Bansal][IPM Lab] / Lab-Digital Logic Design Lab-A7/G3 [TBD]",
          "2-3": "Tutorial-Software Engineering CS209 G1 [Mr Vivek][AB4-315]"
        },
        "WED": {
          "10-11": "TH-Object Oriented Design CS203 [Dr Aditi Zear][AB4-203]",
          "11-12": "TH-Operating System Design CS207 [Prof Rajni Jindal][AB4-203]",
          "2-3": "Tutorial-Software Engineering CS209 G1 [Mr Vivek][AB4-315]",
          "3-4": "Lab-Digital Logic Design Lab-G1 [TBD]"
        },
        "THUR": {
          "10-11": "TH-Software Engineering CS209 [Dr Amrita Sisodia]",
          "11-12": "TH-Object Oriented Design CS203 [Dr Aditi Zear]",
          "1-2": "TH-CS205 DAA [Dr Neha Gupta][AB4-315]",
          "2-3": "Lab-Digital Logic Design Lab-G2 [TBD]"
        },
        "FRI": {
          "9-10": "TH-Software Engineering CS209 [Dr Amrita Sisodia]",
          "10-11": "TH-CS205 DAA [Dr Neha Gupta]",
          "11-12": "TH-Operating System Design CS207 [Prof Rajni Jindal]",
          "12-1": "TH-Digital Logic Design [TBD]",
          "2-3": "Lab-CS205 DAA Lab-G2 [Dr Neha Gupta][IOT Lab] / Lab-CS205 DAA Lab-G3 [Dr Sanjay Kumar][IOT Lab]",
          "4-5": "Tutorial-Software Engineering CS209 G3 [Mr Vivek][AB4-106]"
        }
      }
    },
    "CSE-DA_A8": {
      "room": "AB4-315",
      "timetable": {
        "MON": {
          "12-1": "TH-DA205 Linear Algebra [Mr Sarthak Yash Sethi]",
          "1-2": "TH-DA207 Machine Learning [Prof Aruna Bhat]"
        },
        "TUE": {
          "10-11": "Tutorial-DA205 Linear Algebra G2 [Vijay Patidar] [AB4-204]",
          "12-1": "TH-DA203 Foundation to Data Science [Dr Anshika Arora]",
          "1-2": "TH-DA201 Design & Analysis of Algorithm [Dr Rahul Kumar]",
          "2-3": "TH-DA205 Linear Algebra [Mr Sarthak Yash Sethi]",
          "3-4": "TH-DA205 Linear Algebra [Mr Sarthak Yash Sethi]"
        },
        "WED": {
          "9-10": "TH-DA209 Computer Organization & OS Design [Ms Ila Kaushik]",
          "10-11": "TH-DA203 Foundation to Data Science [Dr Anshika Arora]",
          "11-12": "TH-DA201 Design & Analysis of Algorithm [Dr Rahul Kumar]",
          "12-1": "TH-DA207 Foundation in Machine Learning [Prof Aruna Bhat]"
        },
        "THUR": {
          "12-1": "TH-DA201 Design & Analysis of Algorithm [Dr Rahul Kumar]",
          "2-3": "TH-DA203 Foundation to Data Science [Dr Anshika Arora]",
          "3-4": "TH-DA209 Computer Organization & OS Design [Ms Ila Kaushik]"
        },
        "FRI": {
          "9-10": "Tutorial-DA205 Linear Algebra G1 [Vijay Patidar] [AB4-205]",
          "11-12": "Tutorial-DA205 Linear Algebra G3 [Vijay Patidar] [AB4-303]",
          "2-3": "TH-DA207 Foundation in Machine Learning [Prof Aruna Bhat]",
          "3-4": "TH-DA209 Computer Organization & OS Design [Ms Ila Kaushik]"
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
  { id: "CSE-DA_A8", label: "Section A8 (CSE-DA)", room: "AB4-315" },
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
    else if (code.includes("HU301")) baseSubjectName = "Humanities Elective (EE HU301)";
    else if (code.startsWith("DA201")) baseSubjectName = "Design & Analysis of Algorithm";
    else if (code.startsWith("DA203")) baseSubjectName = "Foundation to Data Science";
    else if (code.startsWith("DA205")) baseSubjectName = "Linear Algebra";
    else if (code.startsWith("DA207")) baseSubjectName = "Machine Learning";
    else if (code.startsWith("DA209")) baseSubjectName = "Computer Organization & OS Design";
  }

  if (!baseSubjectName) {
    if (lower.includes("compiler design") || lower.includes("cd")) {
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
    } else if (lower.includes("software engineering") || lower.includes("se")) {
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
