/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Sem5ClassEntry {
  subject: string;
  faculty?: string;
  venue?: string;
  room?: string;
  group?: string;
  groups?: Array<{
    group: string;
    faculty: string;
    venue?: string;
  }>;
}

export type Sem5SlotValue = Sem5ClassEntry | Sem5ClassEntry[];

export interface Sem5SectionTimetable {
  room: string;
  course_codes: Record<string, { title: string; faculty: string }>;
  timetable: {
    [day: string]: {
      [timeSlot: string]: Sem5SlotValue;
    };
  };
  note?: string;
}

export interface TimetableSem5Data {
  semester: string;
  elective_legend: {
    note: string;
    known_mappings: Record<string, string>;
  };
  sections: Record<string, Sem5SectionTimetable>;
}

export const TIMETABLE_SEM_5_DATA: TimetableSem5Data = {
  "semester": "CSE-V / CO-V (Odd 2026-27)",
  "elective_legend": {
    "note": "E1-E6 are elective time-slots. Actual subject shown only on some days as full name. Cross-check DEC allotment for your own group.",
    "known_mappings": {
      "CS313": "DEC3 Quantum Computing",
      "CS309": "DEC1 Distributed Systems",
      "CS311": "DEC2 Information Theory and Coding",
      "CS315": "DEC4 Advance Data Structure"
    }
  },
  "sections": {
    "A1": {
      "room": "AB4-015",
      "course_codes": {
        "CS301": { "title": "Compiler Design (CD)", "faculty": "Dr R K Yadav" },
        "CS303": { "title": "Machine Learning (ML)", "faculty": "Dr Anshika Arora" },
        "CS305": { "title": "Information and Network Security (INS)", "faculty": "Prof Shailender Kumar" },
        "CS309": { "title": "DEC1 Distributed Systems (DIS)", "faculty": "Dr Prashant G Shanbhorkar" },
        "CS311": { "title": "DEC2 Information Theory and Coding (ITC)", "faculty": "Prof Vinod Kumar" },
        "CS313": { "title": "DEC3 Quantum Computing (QC)", "faculty": "Dr Pavan Singh Mehra" },
        "CS315": { "title": "DEC4 Advance Data Structure", "faculty": "Mr Pulkit Jain" }
      },
      "timetable": {
        "MON": {
          "9-10": { "subject": "E1-Sec1 CS313 Quantum Computing", "faculty": "Dr Pavan Singh Mehra", "venue": "AB4-015" },
          "10-11": { "subject": "Compiler Design CS301", "faculty": "Dr R K Yadav", "venue": "AB4-015" },
          "11-12": { "subject": "Information and Network Security CS305", "faculty": "Prof Shailender Kumar", "venue": "AB4-015" },
          "12-2_lab": [
            { "subject": "Machine Learning Lab", "group": "G1", "faculty": "Dr Anshika Arora", "venue": "Machine Learning Lab" },
            { "subject": "Information and Network Security Lab", "group": "G2", "faculty": "Prof Shailender Kumar", "venue": "Data Mining Lab" },
            { "subject": "Compiler Design Lab", "group": "G3", "faculty": "Dr R K Yadav", "venue": "BDA Lab" }
          ],
          "2-3": { "subject": "EE HU301 (Humanities Elective)", "faculty": "TBD", "venue": "AB4-016" },
          "3-5": { "subject": "E2-Sec1 CS309 Distributed System", "faculty": "Dr Prashant Giridhar Shanbhorkar", "venue": "AB4-015" }
        },
        "TUE": {
          "8-10": { "subject": "E5 Advance Data Structure CS315", "faculty": "Mr Pulkit Jain", "venue": "AB4-015" },
          "10-12_lab": [
            { "subject": "Information and Network Security Lab", "group": "G1", "faculty": "Prof Shailender Kumar", "venue": "Data Mining Lab" },
            { "subject": "Compiler Design Lab", "group": "G2", "faculty": "Dr R K Yadav", "venue": "BDA Lab" },
            { "subject": "Machine Learning Lab", "group": "G3", "faculty": "Dr Anshika Arora", "venue": "IPM Lab" }
          ],
          "12-1": { "subject": "Information and Network Security CS305", "faculty": "Prof Shailender Kumar", "venue": "AB4-015" },
          "2-3": { "subject": "Machine Learning CS303-CO5", "faculty": "Dr Anshika Arora", "venue": "AB4-015" },
          "3-4": { "subject": "Compiler Design CS301", "faculty": "Dr R K Yadav", "venue": "AB4-015" },
          "4-6": { "subject": "E6 (Elective - unresolved)", "faculty": "TBD", "venue": "TBD" }
        },
        "WED": {
          "8-9": { "subject": "E1 (Elective - unresolved)", "faculty": "TBD", "venue": "TBD" },
          "9-10": { "subject": "E5 (Elective - unresolved)", "faculty": "TBD", "venue": "TBD" },
          "10-12": { "subject": "E4 (Elective - unresolved)", "faculty": "TBD", "venue": "TBD" },
          "12-1_lab": [
            { "subject": "Compiler Design Lab", "group": "G1", "faculty": "Dr R K Yadav", "venue": "AB4-015 area" },
            { "subject": "Machine Learning Lab", "group": "G2", "faculty": "Dr Anshika Arora", "venue": "AB4-015 area" },
            { "subject": "Information and Network Security Lab", "group": "G3", "faculty": "VERIFY (scan shows 'Dr Piyush Rawat' - conflicts with Prof Shailender Kumar elsewhere, confirm)", "venue": "AB4-015 area" }
          ],
          "2-4": { "subject": "E3-Sec1 Information Theory & Encoding CS311", "faculty": "Prof Vinod Kumar", "venue": "AB4-015" }
        },
        "THUR": {
          "9-10": {
            "subject": "Tutorial-E3 Advance Data Structure CS315",
            "groups": [
              { "group": "G1", "faculty": "Ms Kavlesh Mahajan", "venue": "AB4-015" },
              { "group": "G2", "faculty": "Mr Anish Bhatia", "venue": "AB4-203" },
              { "group": "G3", "faculty": "Mr Nikhil Gupta", "venue": "AB4-204" }
            ]
          },
          "10-11": { "subject": "E5 Advance Data Structure CS315", "faculty": "Mr Pulkit Jain", "venue": "AB4-015" },
          "11-12": { "subject": "E4 (Elective - unresolved)", "faculty": "TBD", "venue": "TBD" },
          "12-1": { "subject": "Machine Learning CS303-CO5", "faculty": "Dr Anshika Arora", "venue": "AB4-015" },
          "1-2": { "subject": "Information and Network Security CS305", "faculty": "Prof Shailender Kumar", "venue": "AB4-015" },
          "2-3": { "subject": "EE HU301 (Humanities Elective)", "faculty": "TBD", "venue": "TBD" },
          "3-4": { "subject": "E3 (Elective - unresolved)", "faculty": "TBD", "venue": "TBD" }
        },
        "FRI": {
          "8-9": {
            "subject": "Tutorial-E1-Sec1 CS313 Quantum Computing",
            "groups": [
              { "group": "G1", "faculty": "Ms Yati Piplani", "venue": "AB4-015" },
              { "group": "G2", "faculty": "Mr Immanni Ganesh", "venue": "AB4-203" },
              { "group": "G3", "faculty": "Mr Shubham Sonal", "venue": "AB4-204" }
            ]
          },
          "9-10": { "subject": "E1-Sec1 CS313 Quantum Computing", "faculty": "Dr Pavan Singh Mehra", "venue": "AB4-015" },
          "10-12": { "subject": "E4 (Elective - unresolved)", "faculty": "TBD", "venue": "TBD" },
          "12-1": { "subject": "Compiler Design CS301", "faculty": "Dr R K Yadav", "venue": "AB4-015" },
          "1-2": { "subject": "Machine Learning CS303-CO5", "faculty": "Dr Anshika Arora", "venue": "AB4-015" },
          "2-3": { "subject": "E3-Sec1 Information Theory & Encoding CS311", "faculty": "Prof Vinod Kumar", "venue": "TBD" },
          "3-4": {
            "subject": "Tutorial-E3-Sec1 Information Theory & Encoding CS311",
            "groups": [
              { "group": "G1", "faculty": "Saumitha", "venue": "AB4-015" },
              { "group": "G2", "faculty": "Mr Ajit Kumar Yadav", "venue": "AB4-203" },
              { "group": "G3", "faculty": "Ms Anjali Singh", "venue": "AB4-205" }
            ]
          },
          "4-5": { "subject": "E2-Sec1 CS309 Distributed System", "faculty": "Dr Prashant Giridhar", "venue": "AB4-015" },
          "5-6": {
            "subject": "Tutorial-E2-Sec1 CS309 Distributed System",
            "groups": [
              { "group": "G1", "faculty": "Ms Neeraj Sagar", "venue": "AB4-015" },
              { "group": "G2", "faculty": "Ms Anjali Singh", "venue": "AB4-106" },
              { "group": "G3", "faculty": "Kalikam", "venue": "AB4-204" }
            ]
          }
        }
      }
    },
    "A2": {
      "room": "AB4-015",
      "course_codes": {
        "CS301": { "title": "Compiler Design (CD)", "faculty": "Ms Anukriti Kaushal" },
        "CS303": { "title": "Machine Learning (ML)", "faculty": "Dr Kavinder Singh" },
        "CS305": { "title": "Information and Network Security", "faculty": "Dr Piyush Rawat" },
        "CS309": { "title": "DEC1 Sec1 Distributed Systems", "faculty": "Dr Prashant G Shanbhorkar" },
        "CS311": { "title": "DEC2 Sec1 Information Theory and Coding", "faculty": "Prof Vinod Kumar" },
        "CS313": { "title": "DEC3 Sec1 Quantum Computing", "faculty": "Dr Pavan Singh Mehra" },
        "CS315": { "title": "DEC4 Advance Data Structure", "faculty": "Mr Pulkit Jain" }
      },
      "timetable": {
        "MON": {
          "9-10": { "subject": "E1-Sec1 CS313 Quantum Computing", "faculty": "Dr Pavan Singh Mehra", "venue": "AB4-015" },
          "10-12_lab": [
            { "subject": "Machine Learning Lab", "group": "G1", "faculty": "Dr Kavinder Singh", "venue": "Machine Learning Lab" },
            { "subject": "Information and Network Security Lab", "group": "G2", "faculty": "Dr Piyush Rawat", "venue": "Computation Lab" },
            { "subject": "Compiler Design Lab", "group": "G3", "faculty": "Ms Anukriti Kaushal", "venue": "BDA Lab" }
          ],
          "12-1": { "subject": "Compiler Design CS301", "faculty": "Ms Anukriti Kaushal", "venue": "AB4-015" },
          "1-2": { "subject": "EE HU301-CSE-V", "faculty": "TBD", "venue": "AB4-015" },
          "2-3": { "subject": "EE HU301-CSE-V", "faculty": "TBD", "venue": "AB4-015" },
          "3-4": { "subject": "Information and Network Security CS305", "faculty": "Dr Piyush Rawat", "venue": "AB4-015" },
          "4-6": { "subject": "E2-Sec1 CS309 Distributed System", "faculty": "Dr Prashant Giridhar Shanbhorkar", "venue": "AB4-015" }
        },
        "TUE": {
          "8-10": { "subject": "E5 Advance Data Structure CS315", "faculty": "Mr Pulkit Jain", "venue": "AB4-015" },
          "10-11": { "subject": "Machine Learning CS303", "faculty": "Dr Kavinder Singh", "venue": "AB4-015" },
          "1-2": { "subject": "Compiler Design CS301", "faculty": "Ms Anukriti Kaushal", "venue": "AB4-015" },
          "2-3": { "subject": "EE HU301-CSE-V", "faculty": "TBD", "venue": "AB4-015" },
          "2-4_lab": [
            { "subject": "Compiler Design Lab", "group": "G1", "faculty": "Ms Anukriti Kaushal", "venue": "TBD" },
            { "subject": "Machine Learning Lab", "group": "G2", "faculty": "Dr Kavinder Singh", "venue": "TBD" },
            { "subject": "Information and Network Security Lab", "group": "G3", "faculty": "Dr Piyush Rawat", "venue": "TBD" }
          ],
          "3-6": { "subject": "E3-Sec1 Information Theory & Encoding CS311", "faculty": "Prof Vinod Kumar", "venue": "TBD" }
        },
        "WED": {
          "8-9": { "subject": "E1 (Elective - unresolved)", "faculty": "TBD" },
          "9-10": { "subject": "E5 (Elective - unresolved)", "faculty": "TBD" },
          "10-12": { "subject": "E4 (Elective - unresolved)", "faculty": "TBD" },
          "12-1": { "subject": "Machine Learning CS303", "faculty": "Dr Kavinder Singh", "venue": "AB4-015" },
          "1-2": { "subject": "EE HU301-CSE-V", "faculty": "TBD", "venue": "AB4-015" },
          "2-4": { "subject": "E3-Sec1 Information Theory & Encoding CS311", "faculty": "Prof Vinod Kumar", "venue": "AB4-015" }
        },
        "THUR": {
          "9-10": {
            "subject": "Tutorial-E3 Advance Data Structure CS315",
            "groups": [
              { "group": "G1", "faculty": "Ms Kavlesh Mahajan", "venue": "AB4-015" },
              { "group": "G2", "faculty": "Mr Anish Bhatia", "venue": "AB4-203" },
              { "group": "G3", "faculty": "Mr Nikhil Gupta", "venue": "AB4-204" }
            ]
          },
          "10-11": { "subject": "E5 Advance Data Structure CS315", "faculty": "Mr Pulkit Jain", "venue": "AB4-015" },
          "11-12": { "subject": "Information and Network Security CS305", "faculty": "Dr Piyush Rawat", "venue": "TBD" },
          "12-2_lab": [
            { "subject": "Information and Network Security Lab", "group": "G1", "faculty": "Dr Piyush Rawat", "venue": "TBD" },
            { "subject": "Compiler Design Lab", "group": "G2", "faculty": "Ms Anukriti Kaushal", "venue": "TBD" },
            { "subject": "Machine Learning Lab", "group": "G3", "faculty": "Dr Kavinder Singh", "venue": "TBD" }
          ],
          "2-3": { "subject": "TBD", "faculty": "TBD" },
          "3-4": { "subject": "E3 (Elective - unresolved)", "faculty": "TBD" }
        },
        "FRI": {
          "8-9": {
            "subject": "Tutorial-E1-Sec1 CS313 Quantum Computing",
            "groups": [
              { "group": "G1", "faculty": "Ms Yati Piplani", "venue": "AB4-015" },
              { "group": "G2", "faculty": "Mr Immanni Ganesh", "venue": "AB4-203" },
              { "group": "G3", "faculty": "Mr Shubham Sonal", "venue": "AB4-204" }
            ]
          },
          "9-10": { "subject": "E1-Sec1 CS313 Quantum Computing", "faculty": "Dr Pavan Singh Mehra", "venue": "AB4-015" },
          "10-12": { "subject": "E4 (Elective - unresolved)", "faculty": "TBD" },
          "1-2": { "subject": "Information and Network Security CS305", "faculty": "Dr Piyush Rawat", "venue": "AB4-016" },
          "2-3": { "subject": "Compiler Design CS301", "faculty": "Ms Anukriti Kaushal", "venue": "AB4-016" },
          "3-4": { "subject": "Prof Vinod Kumar block (Info Theory)", "faculty": "Prof Vinod Kumar", "venue": "AB4-015" },
          "3-4_alt": {
            "subject": "Tutorial-E3-Sec1 Information Theory & Encoding CS311",
            "groups": [
              { "group": "G1", "faculty": "Saumitha", "venue": "AB4-015" },
              { "group": "G2", "faculty": "Mr Ajit Kumar Yadav", "venue": "AB4-203" },
              { "group": "G3", "faculty": "Ms Anjali Singh", "venue": "AB4-205" }
            ]
          },
          "4-5": { "subject": "E2-Sec1 CS309 Distributed System", "faculty": "Dr Prashant Giridhar", "venue": "AB4-015" },
          "5-6": {
            "subject": "Tutorial-E2-Sec1 CS309 Distributed System",
            "groups": [
              { "group": "G1", "faculty": "Ms Neeraj Sagar", "venue": "AB4-015" },
              { "group": "G2", "faculty": "Ms Anjali Singh", "venue": "AB4-106" },
              { "group": "G3", "faculty": "Kalikam", "venue": "AB4-204" }
            ]
          }
        }
      }
    },
    "A3": {
      "room": "AB4-016",
      "course_codes": {
        "CS301": { "title": "Compiler Design (CD)", "faculty": "Dr Sourabh Mehra" },
        "CS303": { "title": "Machine Learning (ML)", "faculty": "Prof Anil Singh Parihar" },
        "CS305": { "title": "Information and Network Security", "faculty": "Ms Ila Kaushik" },
        "CS309": { "title": "DEC1 Sec2 Distributed Systems", "faculty": "Dr Ravin Ahuja" },
        "CS311": { "title": "DEC2 Sec2 Information Theory and Coding", "faculty": "Mr Naveen Munjal" },
        "CS313": { "title": "DEC3 Sec2 Quantum Computing", "faculty": "Dr Pavan Singh Mehra" },
        "CS315": { "title": "DEC4 Advance Data Structure", "faculty": "Mr Pulkit Jain" }
      },
      "timetable": {
        "MON": {
          "9-10": { "subject": "E1-Sec2 Information Theory and Encoding CS311", "faculty": "Mr Naveen Munjal", "venue": "AB4-016" },
          "10-11": { "subject": "Compiler Design CS301", "faculty": "Ms Jyoti Devi", "venue": "AB4-016 (VERIFY: table lists Dr Sourabh Mehra as CD faculty, but grid shows Ms Jyoti Devi)" },
          "11-12": { "subject": "INS CS305", "faculty": "Ms Ila Kaushik", "venue": "AB4-016" },
          "12-1": { "subject": "EE HU301", "faculty": "TBD", "venue": "AB4-016" },
          "2-4_lab": [
            { "subject": "Compiler Design Lab", "group": "G1", "faculty": "Ms Shivani Sharma", "venue": "TBD" },
            { "subject": "Machine Learning Lab", "group": "G2", "faculty": "Prof Anil Singh Parihar", "venue": "TBD" },
            { "subject": "INS Lab", "group": "G3", "faculty": "Ms Ila Kaushik", "venue": "TBD" }
          ],
          "4-6": { "subject": "E2-Sec2 Distributed System CS309", "faculty": "Dr Ravin Ahuja", "venue": "AB4-016" }
        },
        "TUE": {
          "8-9": { "subject": "E5-Advance Data structure CS315", "faculty": "Mr Pulkit Jain", "venue": "AB4-015" },
          "9-10": { "subject": "Machine Learning CS303", "faculty": "Prof Anil Singh Parihar", "venue": "AB4-016" },
          "10-11_lab": [
            { "subject": "Machine Learning Lab", "group": "G1", "faculty": "Mr Avresh", "venue": "TBD" },
            { "subject": "INS Lab", "group": "G2", "faculty": "Ms Ila Kaushik", "venue": "TBD" },
            { "subject": "Compiler Design Lab", "group": "G3", "faculty": "Rohit Barnwal", "venue": "TBD" }
          ],
          "2-3": { "subject": "INS CS305", "faculty": "Ms Ila Kaushik", "venue": "AB4-016" },
          "3-4": { "subject": "Compiler Design CS301", "faculty": "Ms Jyoti Devi", "venue": "AB4-016" }
        },
        "WED": {
          "8-9": { "subject": "E1 (Elective - unresolved)", "faculty": "TBD" },
          "9-10": { "subject": "E5 (Elective - unresolved)", "faculty": "TBD" },
          "10-12": { "subject": "E4 (Elective - unresolved)", "faculty": "TBD" },
          "12-1": { "subject": "Machine Learning CS303", "faculty": "Prof Anil Singh Parihar", "venue": "AB4-016" },
          "1-2": { "subject": "Compiler Design CS301", "faculty": "Ms Jyoti Devi", "venue": "AB4-016" },
          "2-4": { "subject": "E3-Sec2 Quantum Computing CS313", "faculty": "Dr Pavan Singh Mehra", "venue": "AB4-016" }
        },
        "THUR": {
          "9-10": {
            "subject": "Tutorial-E3 Advance Data Structure CS315",
            "groups": [
              { "group": "G1", "faculty": "Mr Kailesh Mahajan", "venue": "AB4-015" },
              { "group": "G2", "faculty": "Anish Bhatia", "venue": "AB4-203" },
              { "group": "G3", "faculty": "Mr Nikhil Gupta", "venue": "AB4-204" }
            ]
          },
          "10-11": { "subject": "E5 Advance Data Structure CS315", "faculty": "Pulkit Jain", "venue": "AB4-015" },
          "12-1": { "subject": "INS CS309", "faculty": "Ms Ila Kaushik", "venue": "AB4-016" }
        },
        "FRI": {
          "9-10": {
            "subject": "E1-Sec2 Information Theory and Encoding CS311",
            "groups": [
              { "group": "G1", "faculty": "Mr Mohd. Ankit", "venue": "TBD" },
              { "group": "G2", "faculty": "Mr Avresh", "venue": "TBD" },
              { "group": "G3", "faculty": "Mr Naveen Munjal", "venue": "TBD" }
            ]
          },
          "10-11": { "subject": "E1-Sec2 Information Theory and Encoding CS311", "faculty": "Mr Naveen Munjal", "venue": "AB4-016" },
          "12-2_lab": [
            { "subject": "INS Lab", "group": "G1", "faculty": "Ms Ila Kaushik", "venue": "TBD" },
            { "subject": "Compiler Design Lab", "group": "G2", "faculty": "Ms Shivani Sharma", "venue": "TBD" },
            { "subject": "Machine Learning Lab", "group": "G3", "faculty": "Prof Anil Singh Parihar", "venue": "TBD" }
          ],
          "3-4": { "subject": "E2-Sec2 CS309 Distributed System", "faculty": "Dr Ravin Ahuja", "venue": "AB4-016" },
          "4-5": {
            "subject": "Tutorial E2-Sec2 CS309 Distributed System",
            "groups": [
              { "group": "G1", "faculty": "Ms Kaki Sreenuja", "venue": "AB4-016" },
              { "group": "G2", "faculty": "Ms Prince", "venue": "AB4-303" },
              { "group": "G3", "faculty": "Mr Prince Chaudhary", "venue": "AB4-204" }
            ]
          }
        }
      }
    },
    "A4": {
      "room": "AB4-106",
      "course_codes": {
        "CS301": { "title": "Compiler Design (CD)", "faculty": "Ms Jyoti Devi" },
        "CS303": { "title": "Machine Learning (ML)", "faculty": "Ms Gull Kaur" },
        "CS305": { "title": "Information and Network Security", "faculty": "Dr Ashish Kumar" },
        "CS309": { "title": "DEC1 Sec2 Distributed Systems", "faculty": "Dr Ravin Ahuja" },
        "CS311": { "title": "DEC2 Sec2 Information Theory", "faculty": "Mr Naveen Munjal" },
        "CS313": { "title": "DEC3 Sec2 Quantum Computing", "faculty": "Ms Yati Piplani" },
        "CS315": { "title": "DEC4 Advance Data Structure", "faculty": "Mr Pulkit Jain" }
      },
      "timetable": {
        "MON": {
          "9-10": { "subject": "E1 (Elective - unresolved, spans 8-10)", "faculty": "TBD" },
          "10-12_lab": [
            { "subject": "Compiler Design Lab", "group": "G1", "faculty": "Dr Saukshi Mehra", "venue": "TBD" },
            { "subject": "INS Lab", "group": "G2", "faculty": "Dr Ashish Kumar", "venue": "TBD" },
            { "subject": "Machine Learning Lab", "group": "G3", "faculty": "Ms Gull Kaur", "venue": "TBD" }
          ],
          "12-1": { "subject": "Compiler Design CS301", "faculty": "Dr Saukshi Mehra", "venue": "AB4-106" },
          "1-2": { "subject": "Machine Learning CS305", "faculty": "Ms Gull Kaur", "venue": "AB4-106" },
          "2-3": { "subject": "EE HU301", "faculty": "TBD", "venue": "AB4-106" },
          "3-4": { "subject": "EE HU301", "faculty": "TBD", "venue": "AB4-106" }
        },
        "TUE": {
          "9-10": { "subject": "E5 (Elective - unresolved)", "faculty": "TBD" },
          "10-11": { "subject": "INS CS309", "faculty": "Dr Ashish Kumar", "venue": "AB4-016" },
          "11-12": { "subject": "Machine Learning CS305", "faculty": "Ms Gull Kaur", "venue": "AB4-106" },
          "3-4": { "subject": "Compiler Design CS301", "faculty": "Dr Saukshi Mehra", "venue": "AB4-106" }
        },
        "WED": {
          "8-9": { "subject": "E1 (Elective)", "faculty": "TBD" },
          "9-10": { "subject": "E5 (Elective)", "faculty": "TBD" },
          "10-12": { "subject": "E4 (Elective)", "faculty": "TBD" },
          "12-1": { "subject": "INS CS305", "faculty": "Dr Ashish Kumar", "venue": "AB4-106" }
        },
        "THUR": {
          "10-12": { "subject": "E4 (Elective)", "faculty": "TBD" },
          "12-2_lab": [
            { "subject": "INS Lab", "group": "G1", "faculty": "Dr Ashish Kumar", "venue": "TBD" },
            { "subject": "Machine Learning Lab", "group": "G2", "faculty": "Ms Gull Kaur", "venue": "TBD" },
            { "subject": "Compiler Design Lab", "group": "G3", "faculty": "Dr Saukshi Mehra", "venue": "TBD" }
          ],
          "1-2": { "subject": "INS CS305", "faculty": "Dr Ashish Kumar", "venue": "AB4-106" }
        },
        "FRI": {
          "9-10": { "subject": "E1 (Elective)", "faculty": "TBD" },
          "10-12": { "subject": "E4 (Elective)", "faculty": "TBD" },
          "12-1": { "subject": "Machine Learning CS305", "faculty": "Ms Gull Kaur", "venue": "AB4-106" },
          "1-2": { "subject": "Compiler Design CS301", "faculty": "Dr Saukshi Mehra", "venue": "AB4-106" }
        }
      },
      "note": "This section's grid is heavily condensed/merged in scan (many single-line E-blocks spanning multiple hours). Cross-verify hour boundaries against your official copy."
    },
    "A5": {
      "room": "AB4-106",
      "course_codes": {
        "CS301": { "title": "Compiler Design (CD)", "faculty": "Ms Anjali Bansal" },
        "CS303": { "title": "Machine Learning (ML)", "faculty": "Dr Jyoti Bahl" },
        "CS305": { "title": "Information and Network Security", "faculty": "Dr N Anand" },
        "CS309": { "title": "DEC1 Sec2 Distributed Systems", "faculty": "Dr Ravin Ahuja" },
        "CS311": { "title": "DEC2 Sec2 Information Theory", "faculty": "Mr Naveen Munjal" },
        "CS313": { "title": "DEC3 Sec2 Quantum Computing", "faculty": "Ms Yati Piplani" },
        "CS315": { "title": "DEC4 Advance Data Structure", "faculty": "Mr Pulkit Jain" }
      },
      "timetable": {
        "MON": {
          "10-11": { "subject": "Compiler Design CS301", "faculty": "Ms Anjali Bansal", "venue": "AB4-106" },
          "11-12": { "subject": "Machine Learning CS305", "faculty": "Dr Jyoti Bahl", "venue": "AB4-106" },
          "12-2_lab": [
            { "subject": "Compiler Design Lab", "group": "G1", "faculty": "TBD", "venue": "TBD" },
            { "subject": "INS Lab", "group": "G2", "faculty": "Dr Pavan Singh Mehra", "venue": "TBD" },
            { "subject": "Machine Learning Lab", "group": "G3", "faculty": "Dr N Anand / Vinod Kumar (VERIFY)", "venue": "TBD" }
          ],
          "2-3": { "subject": "INS CS305", "faculty": "Dr N Anand", "venue": "AB4-016" }
        },
        "TUE": {
          "10-11": { "subject": "Machine Learning CS305", "faculty": "Dr Jyoti Bahl", "venue": "AB4-106" },
          "11-12": { "subject": "Compiler Design CS301", "faculty": "Ms Anjali Bansal", "venue": "AB4-106" },
          "12-1": { "subject": "INS CS305", "faculty": "Dr N Anand", "venue": "AB4-106" }
        },
        "WED": {
          "10-12": { "subject": "E4 (Elective)", "faculty": "TBD" },
          "12-2_lab": [
            { "subject": "INS Lab", "group": "G1", "faculty": "Dr N Anand", "venue": "TBD" },
            { "subject": "Machine Learning Lab", "group": "G2", "faculty": "Mr Md. Ankit", "venue": "TBD" },
            { "subject": "Compiler Design Lab", "group": "G3", "faculty": "Dr Pavan Singh Mehra", "venue": "TBD" }
          ]
        },
        "THUR": {
          "10-11": { "subject": "Compiler Design CS301", "faculty": "Ms Anjali Bansal", "venue": "AB4-106" },
          "11-12": { "subject": "Machine Learning CS305", "faculty": "Dr Jyoti Bahl", "venue": "AB4-106" },
          "12-1": { "subject": "INS CS305", "faculty": "Dr N Anand", "venue": "AB4-106" }
        },
        "FRI": {
          "10-12": { "subject": "E4 (Elective)", "faculty": "TBD" },
          "12-2_lab": [
            { "subject": "Machine Learning Lab", "group": "G1", "faculty": "Mr Anish Bardia", "venue": "TBD" },
            { "subject": "Compiler Design Lab", "group": "G2", "faculty": "Ms Anjali Bansal", "venue": "TBD" },
            { "subject": "INS Lab", "group": "G3", "faculty": "Dr N Anand", "venue": "TBD" }
          ]
        }
      }
    },
    "A6": {
      "room": "AB4-203",
      "course_codes": {
        "CS301": { "title": "Compiler Design (CD)", "faculty": "Dr Bhawana" },
        "CS303": { "title": "Machine Learning (ML)", "faculty": "Mr Avneesh" },
        "CS305": { "title": "Information and Network Security", "faculty": "Dr Indu Singh" },
        "CS309": { "title": "DEC1 Sec2 Distributed Systems", "faculty": "Dr Ravin Ahuja" },
        "CS311": { "title": "DEC2 Sec2 Information Theory", "faculty": "Ms Yati Piplani" },
        "CS313": { "title": "DEC3 Sec2 Quantum Computing", "faculty": "TBD (blank in scan)" },
        "CS315": { "title": "DEC4 Advance Data Structure", "faculty": "TBD (blank in scan)" }
      },
      "timetable": {
        "MON": {
          "10-11": { "subject": "Compiler Design CS301", "faculty": "Dr Juhee Arora", "venue": "AB4-203" },
          "11-12": { "subject": "Machine Learning CS309", "faculty": "Mr Tushar Dahiya", "venue": "AB4-203" },
          "12-1": { "subject": "INS CS305", "faculty": "Dr Indu Singh", "venue": "AB4-203" },
          "2-4_lab": [
            { "subject": "Compiler Design Lab", "group": "G1", "faculty": "Prof Rahul Katariya", "venue": "TBD" },
            { "subject": "Machine Learning Lab", "group": "G2", "faculty": "Mr Mohd. Sabaan", "venue": "TBD" },
            { "subject": "INS Lab", "group": "G3", "faculty": "Dr Kavinder Singh", "venue": "TBD" }
          ]
        },
        "TUE": {
          "10-11": { "subject": "Compiler Design CS301", "faculty": "Dr Juhee Arora", "venue": "AB4-204" }
        },
        "WED": {
          "12-1": { "subject": "Compiler Design CS301", "faculty": "Dr Juhee Arora", "venue": "AB4-203" },
          "1-2": { "subject": "INS CS305", "faculty": "Dr Indu Singh", "venue": "AB4-203" }
        },
        "THUR": {
          "10-11": { "subject": "Machine Learning CS305", "faculty": "Mr Tushar Dahiya", "venue": "AB4-203" },
          "11-12": { "subject": "Machine Learning CS305", "faculty": "Mr Tushar Dahiya", "venue": "AB4-203" },
          "12-1": { "subject": "INS CS305", "faculty": "Dr Indu Singh", "venue": "AB4-203" }
        },
        "FRI": {
          "2-4_lab": [
            { "subject": "Machine Learning Lab", "group": "G1", "faculty": "Dr Kavinder Singh", "venue": "IPM Lab" },
            { "subject": "Compiler Design Lab", "group": "G2", "faculty": "Dr Pavan Singh Mehra", "venue": "IPM Lab" },
            { "subject": "INS Lab", "group": "G3", "faculty": "Dr Indu Singh", "venue": "DBMS Lab" }
          ]
        }
      },
      "note": "Faculty for CS313 (Quantum Computing) and CS315 (Advance Data Structure) blank in scan for this section — genuinely missing, not an extraction error."
    },
    "A7": {
      "room": "AB4-203",
      "course_codes": {
        "CS301": { "title": "Compiler Design (CD)", "faculty": "Prof Rajni Jindal" },
        "CS303": { "title": "Machine Learning (ML)", "faculty": "Prof Vinod Kumar" },
        "CS305": { "title": "Information and Network Security", "faculty": "Ms Kaki Sreenuja" },
        "CS309": { "title": "DEC1 Sec2 Distributed Systems", "faculty": "Dr Ravin Ahuja" },
        "CS311": { "title": "DEC2 Sec2 Information Theory", "faculty": "Ms Yati Piplani" },
        "CS313": { "title": "DEC3 Quantum Computing", "faculty": "TBD (blank in scan)" }
      },
      "timetable": {
        "MON": {
          "10-12_lab": [
            { "subject": "Compiler Design Lab", "group": "G1", "faculty": "Prof Rajni Jindal", "venue": "TBD" },
            { "subject": "INS Lab", "group": "G2", "faculty": "Dr Indu Singh", "venue": "IOT Lab" },
            { "subject": "Machine Learning Lab", "group": "G3", "faculty": "Prof Vinod Kumar", "venue": "IPM Lab" }
          ],
          "1-2": { "subject": "INS CS305", "faculty": "Ms Ila Kaushik", "venue": "AB4-203" },
          "2-3": { "subject": "Machine Learning CS305", "faculty": "Prof Vinod Kumar", "venue": "AB4-203" }
        },
        "TUE": {
          "10-12_lab": [
            { "subject": "INS Lab", "group": "G1", "faculty": "Ms Manjeeza", "venue": "TBD" },
            { "subject": "Machine Learning Lab", "group": "G2", "faculty": "Prof Vinod Kumar", "venue": "TBD" },
            { "subject": "Compiler Design Lab", "group": "G3", "faculty": "Prof Rajni Jindal", "venue": "DBMS Lab" }
          ],
          "12-1": { "subject": "Compiler Design CS301", "faculty": "Prof Rajni Jindal", "venue": "AB4-203" },
          "1-2": { "subject": "Machine Learning CS305", "faculty": "Prof Vinod Kumar", "venue": "AB4-204" }
        },
        "WED": {
          "12-1": { "subject": "Machine Learning CS305", "faculty": "Prof Vinod Kumar", "venue": "AB4-204" },
          "1-2": { "subject": "INS CS305", "faculty": "Ms Ila Kaushik", "venue": "AB4-204" }
        },
        "THUR": {
          "12-2_lab": [
            { "subject": "Machine Learning Lab", "group": "G1", "faculty": "Prof Vinod Kumar", "venue": "TBD" },
            { "subject": "Compiler Design Lab", "group": "G2", "faculty": "Prof Rajni Jindal", "venue": "TBD" },
            { "subject": "INS Lab", "group": "G3", "faculty": "Dr Pavan Singh Mehra", "venue": "IOT Lab" }
          ],
          "1-2": { "subject": "INS CS305", "faculty": "Ms Ila Kaushik", "venue": "AB4-204" }
        },
        "FRI": {
          "1-2": { "subject": "Compiler Design CS301", "faculty": "Prof Rajni Jindal", "venue": "AB4-203" }
        }
      },
      "note": "CS313 faculty blank in scan for A7."
    }
  }
};

export const DTU_CSE_SEM5_SUBJECTS: string[] = [
  "Compiler Design - Theory",
  "Compiler Design - Lab",
  "Machine Learning - Theory",
  "Machine Learning - Lab",
  "Information and Network Security - Theory",
  "Information and Network Security - Lab",
  "Distributed Systems - Theory",
  "Distributed Systems - Tutorial",
  "Information Theory and Coding - Theory",
  "Information Theory and Coding - Tutorial",
  "Quantum Computing - Theory",
  "Quantum Computing - Tutorial",
  "Advance Data Structure - Theory",
  "Advance Data Structure - Tutorial",
  "Humanities Elective (EE HU301)",
];

export const SECTION_OPTIONS_SEM_5 = [
  { id: "A1", label: "Section A1", room: "AB4-015" },
  { id: "A2", label: "Section A2", room: "AB4-015" },
  { id: "A3", label: "Section A3", room: "AB4-016" },
  { id: "A4", label: "Section A4", room: "AB4-106" },
  { id: "A5", label: "Section A5", room: "AB4-106" },
  { id: "A6", label: "Section A6", room: "AB4-203" },
  { id: "A7", label: "Section A7", room: "AB4-203" },
];

export function convertSem5SlotToString(slotVal: any): string {
  if (!slotVal) return "";

  if (Array.isArray(slotVal)) {
    const formattedParts = slotVal.map(item => {
      const roomPart = item.venue ? `[${item.venue}]` : (item.room ? `[${item.room}]` : "");
      const groupPart = item.group ? `-${item.group}` : "";
      const fac = item.faculty ? item.faculty : "Faculty TBD";
      return `Lab-${item.subject}${groupPart} [${fac}]${roomPart}`;
    });
    return formattedParts.join(" / ");
  }

  if (slotVal.groups && Array.isArray(slotVal.groups)) {
    const formattedParts = slotVal.groups.map((gItem: any) => {
      const roomPart = gItem.venue ? `[${gItem.venue}]` : (gItem.room ? `[${gItem.room}]` : "");
      const groupPart = gItem.group ? `-${gItem.group}` : "";
      const fac = gItem.faculty ? gItem.faculty : "Faculty TBD";
      return `${slotVal.subject}${groupPart} [${fac}]${roomPart}`;
    });
    return formattedParts.join(" / ");
  }

  if (typeof slotVal === "object" && slotVal.subject) {
    const roomPart = slotVal.venue ? `[${slotVal.venue}]` : (slotVal.room ? `[${slotVal.room}]` : "");
    const sub = slotVal.subject;
    const fac = slotVal.faculty ? slotVal.faculty : "Faculty TBD";
    let prefix = "";
    if (!sub.toLowerCase().startsWith("tutorial") && !sub.toLowerCase().includes("lab")) {
      prefix = "TH-";
    }
    return `${prefix}${sub} [${fac}]${roomPart}`;
  }

  return String(slotVal);
}
