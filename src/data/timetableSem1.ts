/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Sem 1 Timetable — DTU CSE B.Tech I Semester (Odd Semester 2026-27)
 * Effective: August 03, 2026
 */

import { SectionTimetable } from "./timetableSem3";

export interface TimetableSem1Data {
  semester: string;
  effective_from: string;
  sections: {
    [sectionId: string]: SectionTimetable;
  };
}

export interface SectionOption {
  id: string;
  label: string;
}

export const SECTION_OPTIONS_SEM_1: SectionOption[] = [
  { id: "A01", label: "Section A01 (Sec 1)" },
  { id: "A02", label: "Section A02 (Sec 2)" },
  { id: "A03", label: "Section A03 (Sec 3)" },
  { id: "A04", label: "Section A04 (Sec 4)" },
  { id: "A05", label: "Section A05 (Sec 5)" },
  { id: "A06", label: "Section A06 (Sec 6)" },
];

export const DTU_CSE_SEM1_SUBJECTS: string[] = [
  "Mathematics-I - Theory",
  "Mathematics-I - Tutorial",
  "Programming Fundamentals - Theory",
  "Programming Fundamentals - Lab",
  "Basic Electronics & Communication Engineering - Theory",
  "Basic Electronics & Communication Engineering - Lab",
  "Computer Aided Engineering Graphics-2 - Theory",
  "Computer Aided Engineering Graphics-2 - Lab",
  "Web Designing - Theory",
  "Web Designing - Lab",
  "Mathematics-I",
  "Programming Fundamentals",
  "Basic Electronics & Communication Engineering",
  "Computer Aided Engineering Graphics-2",
  "Web Designing",
];

export const TIMETABLE_SEM_1_DATA: TimetableSem1Data = {
  semester: "B.Tech I Semester (CSE)",
  effective_from: "August 03, 2026",
  sections: {
    "A01": {
      room: "PB-FF-04",
      timetable: {
        MON: {
          "9-10": "TH-Computer Aided Engineering Graphics-2 ME105 [Prof. Kapil Kumar] [PB-FF-04]",
          "10-11": "TH-Computer Aided Engineering Graphics-2 ME105 [Prof. Kapil Kumar] [PB-FF-04]",
          "11-12": "TH-Mathematics-I AM101 [Dr. Mamta Rani] [PB-FF-04]",
          "12-1": "TH-Mathematics-I AM101 [Dr. Mamta Rani] [PB-FF-04]",
          "2-4": "Lab-Programming Fundamentals CO101-G1 [Dr. Anurag Goel] [AB4-B06] / Lab-Web Designing CS103-G2 [Mr. Ravikant Gupta] [AB3-716]",
          "4-6": "Lab-Basic Electronics & Communication Engineering EC101-G1 [CF Lab(PhD2)] / Lab-Basic Electronics & Communication Engineering EC101-G2 [EDC-I Lab(SK)] / Lab-Basic Electronics & Communication Engineering EC101-G3 [BE Lab(RK)]"
        },
        TUE: {
          "12-2": "Lab-Computer Aided Engineering Graphics-2 ME105-G1/G2/G3 [Prof. Kapil Kumar]",
          "2-3": "TH-Basic Electronics & Communication Engineering EC101 [Prof. O. P. Verma] [PB-FF-04]",
          "3-4": "TH-Basic Electronics & Communication Engineering EC101 [Prof. O. P. Verma] [PB-FF-04]"
        },
        WED: {
          "10-12": "TH-Programming Fundamentals CO101 [Dr. Anurag Goel] [PB-FF-04]",
          "12-1": "Tutorial-Mathematics-I AM101-G1/G2 [Dr. Mamta Rani] [PB-FF-04]",
          "2-4": "Lab-Programming Fundamentals CO101-G2 [Dr. Anurag Goel] [AB4-B06] / Lab-Web Designing CS103-G3 [Mr. Ravikant Gupta] [AB3-716]"
        },
        THUR: {
          "10-12": "Lab-Programming Fundamentals CO101-G3 [Dr. Anurag Goel] [AB4-B06] / Lab-Web Designing CS103-G1 [Mr. Ravikant Gupta] [AB3-716]",
          "2-3": "TH-Basic Electronics & Communication Engineering EC101 [Prof. O. P. Verma] [PB-FF-04]"
        },
        FRI: {
          "9-10": "TH-Mathematics-I AM101 [Dr. Mamta Rani] [PB-FF-04]",
          "10-11": "TH-Computer Aided Engineering Graphics-2 ME105 [Prof. Kapil Kumar] [PB-FF-04]",
          "11-12": "TH-Web Designing CS103 [Mr. Ravikant Gupta] [PB-FF-04]",
          "12-1": "TH-Programming Fundamentals CO101 [Dr. Anurag Goel] [PB-FF-04]"
        }
      }
    },
    "A02": {
      room: "PB-FF-04",
      timetable: {
        MON: {
          "8-10": "Lab-Computer Aided Engineering Graphics-2 ME105-G1/G2/G3 [Sh. Tarun Pratap Singh]",
          "10-12": "Lab-Programming Fundamentals CO101-G1 [Dr. Rajeev Kumar] [AB4-B06] / Lab-Web Designing CS103-G2 [Ms. Bharati Verma] [AB4-B06]",
          "1-2": "TH-Mathematics-I AM101 [Dr. Anshu] [PB-FF-04]",
          "2-3": "TH-Computer Aided Engineering Graphics-2 ME105 [Sh. Tarun Pratap Singh] [PB-FF-04]",
          "3-5": "TH-Programming Fundamentals CO101 [Dr. Rajeev Kumar] [PB-FF-04]"
        },
        TUE: {
          "10-12": "TH-Computer Aided Engineering Graphics-2 ME105 [Sh. Tarun Pratap Singh] [PB-FF-04]",
          "12-1": "TH-Basic Electronics & Communication Engineering EC101 [Prof. O. P. Verma] [PB-FF-04]",
          "2-4": "Lab-Basic Electronics & Communication Engineering EC101-G1 [EDC-II Lab(LT)] / Lab-Basic Electronics & Communication Engineering EC101-G2 [EDC-I Lab(SM)] / Lab-Basic Electronics & Communication Engineering EC101-G3 [BE Lab(YS)]"
        },
        WED: {
          "10-12": "Lab-Programming Fundamentals CO101-G2 [Dr. Rajeev Kumar] [AB4-B06] / Lab-Web Designing CS103-G3 [Ms. Bharati Verma] [AB3-708]",
          "1-2": "TH-Programming Fundamentals CO101 [Dr. Rajeev Kumar] [PB-FF-04]",
          "2-4": "TH-Basic Electronics & Communication Engineering EC101 [Prof. O. P. Verma] [PB-FF-04]"
        },
        THUR: {
          "10-12": "TH-Mathematics-I AM101 [Dr. Anshu] [PB-FF-04]",
          "12-1": "TH-Web Designing CS103 [Ms. Bharati Verma] [PB-FF-04]"
        },
        FRI: {
          "8-9": "Tutorial-Mathematics-I AM101-G1/G2 [Dr. Anshu] [PB-FF-04]",
          "10-12": "Lab-Programming Fundamentals CO101-G3 [Dr. Rajeev Kumar] [AB4-B06] / Lab-Web Designing CS103-G1 [Ms. Bharati Verma] [AB4-B06]"
        }
      }
    },
    "A03": {
      room: "PB-FF-05",
      timetable: {
        MON: {
          "9-11": "TH-Mathematics-I AM101 [Dr. Neha] [PB-FF-05]",
          "11-12": "TH-Computer Aided Engineering Graphics-2 ME105 [Dr. Ankur Sharma] [PB-FF-05]",
          "12-1": "TH-Web Designing CS103 [Mr. Ravikant Gupta] [PB-FF-05]"
        },
        TUE: {
          "10-12": "TH-Programming Fundamentals CO101 [Dr. Rahul Kumar] [PB-FF-05]",
          "12-1": "TH-Basic Electronics & Communication Engineering EC101 [Dr. Sumit Kale] [PB-FF-05]",
          "2-4": "Lab-Programming Fundamentals CO101-G1 [Dr. Rahul Kumar] [AB4-B06] / Lab-Web Designing CS103-G2 [Mr. Ravikant Gupta] [AB3-716]"
        },
        WED: {
          "8-10": "TH-Basic Electronics & Communication Engineering EC101 [Dr. Sumit Kale] [PB-FF-04]",
          "11-1": "Lab-Computer Aided Engineering Graphics-2 ME105-G1/G2/G3 [Dr. Ankur Sharma] [PB-FF-05]",
          "1-2": "TH-Programming Fundamentals CO101 [Dr. Rahul Kumar] [PB-FF-05]"
        },
        THUR: {
          "10-12": "Lab-Programming Fundamentals CO101-G3 [Dr. Rahul Kumar] [AB4-B06] / Lab-Web Designing CS103-G1 [Mr. Ravikant Gupta] [AB3-716]",
          "1-2": "Tutorial-Mathematics-I AM101-G1/G2 [Dr. Neha] [PB-FF-04]"
        },
        FRI: {
          "10-12": "Lab-Programming Fundamentals CO101-G2 [Dr. Rahul Kumar] [AB4-B06] / Lab-Web Designing CS103-G3 [Mr. Ravikant Gupta] [AB3-716]",
          "1-2": "TH-Mathematics-I AM101 [Dr. Neha] [PB-FF-04]",
          "2-4": "TH-Computer Aided Engineering Graphics-2 ME105 [Dr. Ankur Sharma] [PB-FF-04]",
          "4-6": "Lab-Basic Electronics & Communication Engineering EC101-G1 [CF Lab(NJ)] / Lab-Basic Electronics & Communication Engineering EC101-G2 [EDC-I Lab(RK)] / Lab-Basic Electronics & Communication Engineering EC101-G3 [BE Lab(PHD19)]"
        }
      }
    },
    "A04": {
      room: "PB-FF-05",
      timetable: {
        MON: {
          "10-12": "Lab-Basic Electronics & Communication Engineering EC101-G1 [CF Lab(PhD7)] / Lab-Basic Electronics & Communication Engineering EC101-G2 [EDC-I Lab(SS)] / Lab-Basic Electronics & Communication Engineering EC101-G3 [BE Lab(KRS)]",
          "1-3": "TH-Computer Aided Engineering Graphics-2 ME105 [Dr. Sandeep Kumar] [PB-FF-05]",
          "3-5": "TH-Basic Electronics & Communication Engineering EC101 [Dr. Sonal Singh] [PB-FF-05]"
        },
        TUE: {
          "1-3": "TH-Mathematics-I AM101 [Mr. Jamkhongam Touthang] [PB-FF-05]",
          "3-4": "TH-Computer Aided Engineering Graphics-2 ME105 [Dr. Sandeep Kumar] [PB-FF-05]"
        },
        WED: {
          "8-10": "TH-Programming Fundamentals CO101 [Dr Yeshwant Singh] [PB-FF-05]",
          "11-12": "TH-Mathematics-I AM101 [Mr. Jamkhongam Touthang] [PB-FF-05]",
          "12-1": "TH-Basic Electronics & Communication Engineering EC101 [Dr. Sonal Singh] [PB-FF-05]",
          "2-4": "Lab-Programming Fundamentals CO101-G2 [Dr Yeshwant Singh] [AB4-B06] / Lab-Web Designing CS103-G3 [Ms. Bharati Verma] [AB3-716]"
        },
        THUR: {
          "10-11": "Tutorial-Mathematics-I AM101-G1/G2 [Mr. Jamkhongam Touthang] [PB-FF-05]",
          "11-12": "TH-Programming Fundamentals CO101 [Dr Yeshwant Singh] [PB-FF-05]",
          "12-2": "Lab-Computer Aided Engineering Graphics-2 ME105-G1/G2/G3 [Dr. Sandeep Kumar]"
        },
        FRI: {
          "8-10": "Lab-Programming Fundamentals CO101-G3 [Dr Yeshwant Singh] [AB3-708] / Lab-Web Designing CS103-G1 [Ms. Bharati Verma] [AB3-716]",
          "11-12": "TH-Web Designing CS103 [Ms. Bharati Verma] [PB-FF-03]",
          "12-2": "Lab-Programming Fundamentals CO101-G1 [Dr Yeshwant Singh] [AB4-004] / Lab-Web Designing CS103-G2 [Ms. Bharati Verma] [AB3-716]"
        }
      }
    },
    "A05": {
      room: "PB-FF-06",
      timetable: {
        MON: {
          "10-12": "Lab-Computer Aided Engineering Graphics-2 ME105-G1/G2/G3 [Dr. Abhishek Kumar] [PB-FF-06]",
          "1-3": "TH-Programming Fundamentals CO101 [Dr. Neha Gupta] [PB-FF-06]",
          "4-6": "Lab-Programming Fundamentals CO101-G2 [Dr. Neha Gupta] [AB4-004] / Lab-Web Designing CS103-G3 [Mr. Ravikant Gupta] [AB3-716]"
        },
        TUE: {
          "10-12": "Lab-Programming Fundamentals CO101-G1 [Dr. Neha Gupta] [AB4-B06] / Lab-Web Designing CS103-G2 [Mr. Ravikant Gupta] [AB4-B06]",
          "12-1": "TH-Computer Aided Engineering Graphics-2 ME105 [Dr. Abhishek Kumar] [PB-FF-05]"
        },
        WED: {
          "10-12": "Lab-Programming Fundamentals CO101-G3 [Dr. Neha Gupta] [AB4-716] / Lab-Web Designing CS103-G1 [Mr. Ravikant Gupta] [AB3-716]",
          "2-3": "TH-Web Designing CS103 [Mr. Ravikant Gupta] [PB-FF-05]",
          "3-4": "TH-Programming Fundamentals CO101 [Dr. Neha Gupta] [PB-FF-05]"
        },
        THUR: {
          "10-12": "TH-Mathematics-I AM101 [Dr. Neha] [PB-FF-06]",
          "1-2": "TH-Basic Electronics & Communication Engineering EC101 [Visiting Faculty] [PB-FF-05]",
          "2-4": "TH-Computer Aided Engineering Graphics-2 ME105 [Dr. Abhishek Kumar] [PB-FF-05]"
        },
        FRI: {
          "10-12": "TH-Basic Electronics & Communication Engineering EC101 [Visiting Faculty] [PB-FF-05]",
          "12-1": "TH-Mathematics-I AM101 [Dr. Neha] [PB-FF-05]",
          "3-4": "Lab-Basic Electronics & Communication Engineering EC101-G1 [CF Lab(RK)] / Lab-Basic Electronics & Communication Engineering EC101-G2 [EDC-I Lab(SM)] / Lab-Basic Electronics & Communication Engineering EC101-G3 [BE Lab(YS)]",
          "4-5": "Tutorial-Mathematics-I AM101-G1/G2 [Dr. Neha] [PB-FF-03]"
        }
      }
    },
    "A06": {
      room: "PB-FF-06",
      timetable: {
        MON: {
          "9-11": "TH-Computer Aided Engineering Graphics-2 ME105 [Prof. Jyotsna Gupta] [PB-FF-06]",
          "11-12": "TH-Basic Electronics & Communication Engineering EC101 [Prof. Poornima Mittal] [PB-FF-06]",
          "12-1": "TH-Web Designing CS103 [Ms. Bharati Verma] [PB-FF-06]",
          "2-4": "Lab-Programming Fundamentals CO101-G1 [Dr. Manoj Sethi] [AB4-B06] / Lab-Web Designing CS103-G2 [Ms. Bharati Verma] [AB3-716]",
          "4-6": "Lab-Computer Aided Engineering Graphics-2 ME105-G1/G2/G3 [Prof. Jyotsna Gupta] [PB-FF-06]"
        },
        TUE: {
          "12-2": "Lab-Programming Fundamentals CO101-G2 [Dr. Manoj Sethi] [AB4-B06] / Lab-Web Designing CS103-G3 [Ms. Bharati Verma] [AB4-B06]",
          "2-4": "TH-Mathematics-I AM101 [Dr. Mridula Mundalia] [PB-FF-06]"
        },
        WED: {
          "8-10": "TH-Basic Electronics & Communication Engineering EC101 [Prof. Poornima Mittal] [PB-FF-06]",
          "10-12": "Lab-Programming Fundamentals CO101-G3 [Dr. Manoj Sethi] [AB4-006] / Lab-Web Designing CS103-G1 [Ms. Bharati Verma] [AB3-716]"
        },
        THUR: {
          "12-1": "TH-Mathematics-I AM101 [Dr. Mridula Mundalia] [PB-FF-06]",
          "2-3": "TH-Programming Fundamentals CO101 [Dr. Manoj Sethi] [PB-FF-06]"
        },
        FRI: {
          "8-9": "Tutorial-Mathematics-I AM101-G1/G2 [Dr. Mridula Mundalia] [PB-FF-05]",
          "9-10": "TH-Computer Aided Engineering Graphics-2 ME105 [Prof. Jyotsna Gupta] [PB-FF-05]",
          "10-12": "Lab-Basic Electronics & Communication Engineering EC101-G1 [CF Lab(DS)] / Lab-Basic Electronics & Communication Engineering EC101-G2 [EDC-I Lab(PHD6)] / Lab-Basic Electronics & Communication Engineering EC101-G3 [BE Lab(SS)]",
          "2-4": "TH-Programming Fundamentals CO101 [Dr. Manoj Sethi] [PB-FF-05]"
        }
      }
    }
  }
};
