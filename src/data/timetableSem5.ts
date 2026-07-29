/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Sem 5 Timetable — DTU CSE/CO Odd Semester 2026-27
 * Effective: 28-07-2026
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
  effective_from: string;
  elective_legend: {
    note: string;
    known_mappings: Record<string, string>;
  };
  sections: Record<string, Sem5SectionTimetable>;
}

export const TIMETABLE_SEM_5_DATA: TimetableSem5Data = {
  semester: "CSE-V / CO-V (Odd 2026-27)",
  effective_from: "28-07-2026",
  elective_legend: {
    note: "E1-E6 are generic elective/period placeholder labels. Configure your elective in the panel above to see your subject.",
    known_mappings: {
      CS313: "DEC3 Quantum Computing",
      CS309: "DEC1 Distributed Systems",
      CS311: "DEC2 Information Theory and Coding",
      CS315: "DEC4 Advance Data Structure",
    },
  },
  sections: {

    // ── A1 ──────────────────────────────────────────────────────────────────
    A1: {
      room: "AB4-015",
      course_codes: {
        CS301: { title: "Compiler Design (CD)", faculty: "Dr R K Yadav" },
        CS303: { title: "Machine Learning (ML)", faculty: "Dr Ambika Arora" },
        CS305: { title: "Information and Network Security (INS)", faculty: "Prof Shailender Kumar" },
        CS309: { title: "DEC1 Distributed Systems", faculty: "Dr Prashant G Shanbhorkar" },
        CS311: { title: "DEC2 Information Theory and Coding", faculty: "Prof Vinod Kumar" },
        CS313: { title: "DEC3 Quantum Computing", faculty: "Dr Pawan Singh Mehra" },
        CS315: { title: "DEC4 Advance Data Structure", faculty: "Mr Pulkit Jain" },
      },
      timetable: {
        MON: {
          "8-9":   { subject: "E1-Sec1 CS313 Quantum Computing", faculty: "Dr Pawan Singh Mehra", venue: "AB4-015" },
          "9-10":  { subject: "Compiler Design CS301", faculty: "Dr R K Yadav", venue: "AB4-015" },
          "10-11": { subject: "Information and Network Security CS305", faculty: "Prof Shailender Kumar", venue: "AB4-015" },
          "11-1_lab": [
            { subject: "Machine Learning Lab", group: "G1", faculty: "Dr Ambika Arora", venue: "Machine Learning Lab" },
            { subject: "Information and Network Security Lab", group: "G2", faculty: "Prof Shailender Kumar", venue: "Data Mining Lab" },
            { subject: "Compiler Design Lab", group: "G3", faculty: "Dr R K Yadav", venue: "BDA Lab" },
          ],
          "2-3":   { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-016" },
          "3-4":   { subject: "E2-Sec1 CS309 Distributed System", faculty: "Dr Prashant Girdhar Shanbhorkar", venue: "AB4-015" },
          "4-6":   { subject: "E2-Sec1 CS309 Distributed System", faculty: "Dr Prashant Girdhar Shanbhorkar", venue: "AB4-015" },
        },
        TUE: {
          "8-10":  { subject: "E5 Advance Data Structure CS315", faculty: "Mr Pulkit Jain", venue: "AB4-015" },
          "10-12_lab": [
            { subject: "Information and Network Security Lab", group: "G1", faculty: "Prof Shailender Kumar", venue: "Data Mining Lab" },
            { subject: "Compiler Design Lab", group: "G2", faculty: "Dr R K Yadav", venue: "BDA Lab" },
            { subject: "Machine Learning Lab", group: "G3", faculty: "Dr Ambika Arora", venue: "IPM Lab" },
          ],
          "12-1":  { subject: "Information and Network Security CS305", faculty: "Prof Shailender Kumar", venue: "AB4-015" },
          "2-3":   { subject: "Machine Learning CS303", faculty: "Dr Ambika Arora", venue: "AB4-015" },
          "3-4":   { subject: "Compiler Design CS301", faculty: "Dr R K Yadav", venue: "AB4-015" },
          "4-6":   { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "AB4-015" },
        },
        WED: {
          "8-9":   { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "9-10":  { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-12": { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "12-1":  { subject: "Machine Learning CS303", faculty: "Dr Ambika Arora", venue: "AB4-015" },
          "1-2":   { subject: "Compiler Design CS301", faculty: "Dr R K Yadav", venue: "AB4-015" },
          "2-4":   { subject: "E3-Sec1 Information Theory & Encoding CS311", faculty: "Prof Vinod Kumar", venue: "AB4-015" },
        },
        THUR: {
          "8-9": {
            subject: "Tutorial-E3 Advance Data Structure CS315",
            groups: [
              { group: "G1", faculty: "Mr Kartesh Mahajan", venue: "AB4-015" },
              { group: "G2", faculty: "Mr Anish Bhatia", venue: "AB4-203" },
              { group: "G3", faculty: "Mr Nikhil Gupta", venue: "AB4-204" },
            ],
          },
          "9-10":  { subject: "E5 Advance Data Structure CS315", faculty: "Mr Pulkit Jain", venue: "AB4-015" },
          "10-12": { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "12-1":  { subject: "Machine Learning CS303", faculty: "Dr Ambika Arora", venue: "AB4-015" },
          "1-2":   { subject: "Information and Network Security CS305", faculty: "Prof Shailender Kumar", venue: "AB4-015" },
          "2-3":   { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-015" },
          "3-4":   { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "4-6":   { subject: "E6 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        FRI: {
          "8-9": {
            subject: "Tutorial-E1-Sec1 CS313 Quantum Computing",
            groups: [
              { group: "G1", faculty: "Ms Yati Piplani", venue: "AB4-015" },
              { group: "G2", faculty: "Mr Imamani Ganesh", venue: "AB4-203" },
              { group: "G3", faculty: "Mr Shubham Seval", venue: "AB4-204" },
            ],
          },
          "9-10":  { subject: "E1-Sec1 CS313 Quantum Computing", faculty: "Dr Pawan Singh Mehra", venue: "AB4-015" },
          "10-12": { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "12-1":  { subject: "Compiler Design CS301", faculty: "Dr R K Yadav", venue: "AB4-015" },
          "1-2":   { subject: "Machine Learning CS303", faculty: "Dr Ambika Arora", venue: "AB4-015" },
          "2-3":   { subject: "E3-Sec1 Information Theory & Encoding CS311", faculty: "Prof Vinod Kumar", venue: "AB4-015" },
          "3-4": {
            subject: "Tutorial-E3-Sec1 Information Theory & Encoding CS311",
            groups: [
              { group: "G1", faculty: "Saumitha", venue: "AB4-015" },
              { group: "G2", faculty: "Mr Ajit Kumar Yadav", venue: "AB4-203" },
              { group: "G3", faculty: "Ms Anjali Singh", venue: "AB4-204" },
            ],
          },
          "4-5":   { subject: "E2-Sec1 CS309 Distributed System", faculty: "Dr Prashant Girdhar Shanbhorkar", venue: "AB4-015" },
          "5-6": {
            subject: "Tutorial-E2-Sec1 CS309 Distributed System",
            groups: [
              { group: "G1", faculty: "Ms Nooraj Sagar", venue: "AB4-015" },
              { group: "G2", faculty: "Ms Anjali Singh", venue: "AB4-203" },
              { group: "G3", faculty: "Mr Prince Chaudhary", venue: "AB4-204" },
            ],
          },
        },
      },
    },

    // ── A2 ──────────────────────────────────────────────────────────────────
    A2: {
      room: "AB4-015",
      course_codes: {
        CS301: { title: "Compiler Design (CD)", faculty: "Ms Ankita Kaushal" },
        CS303: { title: "Machine Learning (ML)", faculty: "Dr Kavinder Singh" },
        CS305: { title: "Information and Network Security", faculty: "Dr Piyush Rawat" },
        CS309: { title: "DEC1 Distributed Systems", faculty: "Dr Prashant G Shanbhorkar" },
        CS311: { title: "DEC2 Information Theory and Encoding", faculty: "Prof Vinod Kumar" },
        CS313: { title: "DEC3 Quantum Computing", faculty: "Dr Pavan Singh Mehra" },
        CS315: { title: "DEC4 Advance Data Structure", faculty: "Mr Pulkit Jain" },
      },
      timetable: {
        MON: {
          "8-9":   { subject: "E1-Sec1 CS313 Quantum Computing", faculty: "Dr Pavan Singh Mehra", venue: "AB4-015" },
          "9-10":  { subject: "Compiler Design CS301", faculty: "Ms Ankita Kaushal", venue: "AB4-015" },
          "10-12_lab": [
            { subject: "Machine Learning Lab", group: "G1", faculty: "Dr Kavinder Singh", venue: "Machine Learning Lab" },
            { subject: "Information and Network Security Lab", group: "G2", faculty: "Dr Piyush Rawat", venue: "Data Mining Lab" },
            { subject: "Compiler Design Lab", group: "G3", faculty: "Ms Ankita Kaushal", venue: "BDA Lab" },
          ],
          "12-1":  { subject: "Compiler Design CS301", faculty: "Ms Ankita Kaushal", venue: "AB4-015" },
          "1-2":   { subject: "EE HU301-CSE-V", faculty: "TBD", venue: "AB4-015" },
          "2-3":   { subject: "EE HU301-CSE-V", faculty: "TBD", venue: "AB4-015" },
          "3-4":   { subject: "Information and Network Security CS305", faculty: "Dr Piyush Rawat", venue: "AB4-015" },
          "4-6":   { subject: "E2-Sec1 CS309 Distributed System", faculty: "Dr Prashant Girdhar Shanbhorkar", venue: "AB4-015" },
        },
        TUE: {
          "8-9":   { subject: "E5 Advance Data Structure CS315", faculty: "Mr Pulkit Jain", venue: "AB4-015" },
          "9-10":  { subject: "Machine Learning CS303", faculty: "Dr Kavinder Singh", venue: "AB4-015" },
          "10-11": { subject: "Compiler Design CS301", faculty: "Ms Ankita Kaushal", venue: "AB4-015" },
          "11-1_lab": [
            { subject: "Compiler Design Lab", group: "G1", faculty: "Ms Ankita Kaushal", venue: "TBD" },
            { subject: "Machine Learning Lab", group: "G2", faculty: "Dr Kavinder Singh", venue: "TBD" },
            { subject: "Information and Network Security Lab", group: "G3", faculty: "Dr Piyush Rawat", venue: "Computation Lab" },
          ],
          "1-2":   { subject: "Information and Network Security CS305", faculty: "Dr Piyush Rawat", venue: "AB4-015" },
          "2-3":   { subject: "EE HU301-CSE-V", faculty: "TBD", venue: "AB4-015" },
          "3-5":   { subject: "E3-Sec1 Information Theory & Encoding CS311", faculty: "Prof Vinod Kumar", venue: "AB4-015" },
        },
        WED: {
          "8-9":   { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "9-10":  { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-12": { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "12-1":  { subject: "Machine Learning CS303", faculty: "Dr Kavinder Singh", venue: "AB4-015" },
          "1-2":   { subject: "EE HU301-CSE-V", faculty: "TBD", venue: "AB4-015" },
          "2-4":   { subject: "E3-Sec1 Information Theory & Encoding CS311", faculty: "Prof Vinod Kumar", venue: "AB4-015" },
        },
        THUR: {
          "8-9": {
            subject: "Tutorial-E3 Advance Data Structure CS315",
            groups: [
              { group: "G1", faculty: "Mr Kartesh Mahajan", venue: "AB4-015" },
              { group: "G2", faculty: "Mr Anish Bhatia", venue: "AB4-203" },
              { group: "G3", faculty: "Mr Nikhil Gupta", venue: "AB4-204" },
            ],
          },
          "9-10":  { subject: "E5 Advance Data Structure CS315", faculty: "Mr Pulkit Jain", venue: "AB4-015" },
          "10-11": { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "11-12": { subject: "Information and Network Security CS305", faculty: "Dr Piyush Rawat", venue: "AB4-016" },
          "12-2_lab": [
            { subject: "INS Lab / Compiler Design Lab", group: "G1", faculty: "Dr Piyush Rawat / Ms Ankita Kaushal", venue: "TBD" },
            { subject: "Machine Learning Lab", group: "G2", faculty: "Dr Kavinder Singh", venue: "TBD" },
          ],
          "2-3":   { subject: "E3-Sec1 Information Theory & Encoding CS311", faculty: "Prof Vinod Kumar", venue: "AB4-015" },
          "3-4": {
            subject: "Tutorial-E3-Sec1 Information Theory & Encoding CS311",
            groups: [
              { group: "G1", faculty: "Saumitha", venue: "E3" },
              { group: "G2", faculty: "Mr Ajit Kumar Yadav", venue: "E3" },
              { group: "G3", faculty: "Ms Anjali Singh", venue: "E3" },
            ],
          },
          "4-6":   { subject: "E2-Sec1 CS309 Distributed System", faculty: "Dr Prashant Girdhar Shanbhorkar", venue: "E6" },
        },
        FRI: {
          "8-9": {
            subject: "Tutorial-E1-Sec1 CS313 Quantum Computing",
            groups: [
              { group: "G1", faculty: "Ms Yati Piplani", venue: "AB4-015" },
              { group: "G2", faculty: "Mr Imamani Ganesh", venue: "AB4-203" },
              { group: "G3", faculty: "Mr Shubham Seval", venue: "AB4-204" },
            ],
          },
          "9-10":  { subject: "E1-Sec1 CS313 Quantum Computing", faculty: "Dr Pavan Singh Mehra", venue: "AB4-015" },
          "10-12": { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "12-1":  { subject: "Information and Network Security CS305", faculty: "Dr Piyush Rawat", venue: "AB4-016" },
          "1-2":   { subject: "Compiler Design CS301", faculty: "Ms Ankita Kaushal", venue: "AB4-016" },
          "2-3":   { subject: "E3-Sec1 Information Theory & Encoding CS311", faculty: "Prof Vinod Kumar", venue: "AB4-015" },
          "4-5":   { subject: "E2-Sec1 CS309 Distributed System", faculty: "Dr Prashant Girdhar Shanbhorkar", venue: "AB4-015" },
          "5-6": {
            subject: "Tutorial-E2-Sec1 CS309 Distributed System",
            groups: [
              { group: "G1", faculty: "Ms Nooraj Sagar", venue: "AB4-015" },
              { group: "G2", faculty: "Ms Anjali Singh", venue: "AB4-203" },
              { group: "G3", faculty: "Mr Prince Chaudhary", venue: "AB4-204" },
            ],
          },
        },
      },
    },

    // ── A3 ──────────────────────────────────────────────────────────────────
    A3: {
      room: "AB4-016",
      course_codes: {
        CS301: { title: "Compiler Design (CD)", faculty: "Dr Saurabhi Mehra" },
        CS303: { title: "Machine Learning (ML)", faculty: "Prof Anil Singh Parihar" },
        CS305: { title: "Information and Network Security (INS)", faculty: "Ms Ila Kaushik" },
        CS309: { title: "DEC1 Distributed Systems", faculty: "Dr Ravin Ahuja" },
        CS311: { title: "DEC2 Information Theory and Coding", faculty: "Mr Naveen Munjal" },
        CS313: { title: "DEC3 Quantum Computing", faculty: "Dr Pavan Singh Mehra" },
        CS315: { title: "DEC4 Advance Data Structure", faculty: "Mr Pulkit Jain" },
      },
      timetable: {
        MON: {
          "8-9":   { subject: "E1-Sec2 Information Theory and Encoding CS311", faculty: "Mr Naveen Munjal", venue: "AB4-016" },
          "9-10":  { subject: "Compiler Design CS301", faculty: "Ms Jyoti Devi", venue: "AB4-016" },
          "10-11": { subject: "Information and Network Security CS305", faculty: "Ms Ila Kaushik", venue: "AB4-016" },
          "11-12": { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-016" },
          "12-1":  { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-016" },
          "1-3_lab": [
            { subject: "Compiler Design Lab", group: "G1", faculty: "Ms Shivani Sharma", venue: "TBD" },
            { subject: "Machine Learning Lab", group: "G2", faculty: "Prof Anil Singh Parihar", venue: "TBD" },
            { subject: "INS Lab", group: "G3", faculty: "Ms Ila Kaushik", venue: "TBD" },
          ],
          "3-4":   { subject: "Compiler Design CS301", faculty: "TBD", venue: "AB4-016" },
          "4-6":   { subject: "E2-Sec2 CS309 Distributed System", faculty: "Dr Ravin Ahuja", venue: "AB4-016" },
        },
        TUE: {
          "8-9":   { subject: "E5 Advance Data Structure CS315", faculty: "Mr Pulkit Jain", venue: "AB4-015" },
          "9-10":  { subject: "Machine Learning CS303", faculty: "Prof Anil Singh Parihar", venue: "AB4-016" },
          "10-11": { subject: "Machine Learning CS303", faculty: "Prof Anil Singh Parihar", venue: "AB4-016" },
          "11-1_lab": [
            { subject: "Machine Learning Lab", group: "G1", faculty: "TBD", venue: "TBD" },
            { subject: "INS Lab", group: "G2", faculty: "Ms Ila Kaushik", venue: "TBD" },
            { subject: "Compiler Design Lab", group: "G3", faculty: "Rohit Bansal", venue: "TBD" },
          ],
          "1-2":   { subject: "Information and Network Security CS305", faculty: "Ms Ila Kaushik", venue: "AB4-016" },
          "2-3":   { subject: "Compiler Design CS301", faculty: "Ms Jyoti Devi", venue: "AB4-016" },
          "3-4":   { subject: "E3-Sec2 Quantum Computing CS313", faculty: "Dr Pavan Singh Mehra", venue: "AB4-016" },
        },
        WED: {
          "8-9":   { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "9-10":  { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-12": { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "12-1":  { subject: "Machine Learning CS303", faculty: "Prof Anil Singh Parihar", venue: "AB4-016" },
          "1-2":   { subject: "Compiler Design CS301", faculty: "Ms Jyoti Devi", venue: "AB4-016" },
          "2-4":   { subject: "E3-Sec2 Quantum Computing CS313", faculty: "Dr Pavan Singh Mehra", venue: "AB4-016" },
        },
        THUR: {
          "8-9": {
            subject: "Tutorial-E3 Advance Data Structure CS315",
            groups: [
              { group: "G1", faculty: "Mr Kartesh Mahajan", venue: "AB4-015" },
              { group: "G2", faculty: "Mr Anish Bhatia", venue: "AB4-203" },
              { group: "G3", faculty: "Mr Nikhil Gupta", venue: "AB4-204" },
            ],
          },
          "9-10":  { subject: "E5 Advance Data Structure CS315", faculty: "Mr Pulkit Jain", venue: "AB4-015" },
          "10-12": { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "12-1":  { subject: "Information and Network Security CS305", faculty: "Ms Ila Kaushik", venue: "AB4-016" },
          "1-2":   { subject: "TBD", faculty: "TBD", venue: "AB4-016" },
          "2-3":   { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "3-4":   { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        FRI: {
          "8-9": {
            subject: "Tutorial-E1-Sec2 Information Theory and Encoding CS311",
            groups: [
              { group: "G1", faculty: "Mr Mohd Aakif", venue: "AB4-016" },
              { group: "G2", faculty: "Mr Naveen Munjal", venue: "AB4-205" },
              { group: "G3", faculty: "TBD", venue: "AB4-309" },
            ],
          },
          "9-10":  { subject: "E1-Sec2 Information Theory and Encoding CS311", faculty: "Mr Naveen Munjal", venue: "AB4-016" },
          "10-12_lab": [
            { subject: "INS Lab", group: "G1", faculty: "Ms Ila Kaushik", venue: "TBD" },
            { subject: "Machine Learning Lab", group: "G2", faculty: "Prof Anil Singh Parihar", venue: "TBD" },
            { subject: "Compiler Design Lab", group: "G3", faculty: "Dr N Anand", venue: "TBD" },
          ],
          "12-1": {
            subject: "Tutorial-Quantum Computing CS313",
            groups: [
              { group: "G1", faculty: "Ms Yati Piplani", venue: "AB4-016" },
              { group: "G2", faculty: "Ms Aanchal", venue: "AB4-203" },
              { group: "G3", faculty: "Dr Pavan Singh Mehra", venue: "AB4-309" },
            ],
          },
          "1-2":   { subject: "E2-Sec2 CS309 Distributed System", faculty: "Dr Ravin Ahuja", venue: "AB4-016" },
          "2-3": {
            subject: "Tutorial-E2-Sec2 CS309 Distributed System",
            groups: [
              { group: "G1", faculty: "Ms Kaki Sreenuja", venue: "AB4-016" },
              { group: "G2", faculty: "Mr Prince Chaudhary", venue: "AB4-305" },
            ],
          },
        },
      },
    },

    // ── A4 ──────────────────────────────────────────────────────────────────
    A4: {
      room: "AB4-106",
      course_codes: {
        CS301: { title: "Compiler Design (CD)", faculty: "Ms Jyoti Devi" },
        CS303: { title: "Machine Learning (ML)", faculty: "Ms Gulli Kaur" },
        CS305: { title: "Information and Network Security (INS)", faculty: "Dr Ashish Kumar" },
        CS309: { title: "DEC1 Distributed Systems", faculty: "Dr Ravin Ahuja" },
        CS311: { title: "DEC2 Information Theory and Coding", faculty: "Mr Naveen Munjal" },
        CS313: { title: "DEC3 Quantum Computing", faculty: "Ms Yati Piplani" },
        CS315: { title: "DEC4 Advance Data Structure", faculty: "Mr Pulkit Jain" },
      },
      timetable: {
        MON: {
          "8-10":  { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-12_lab": [
            { subject: "Compiler Design Lab", group: "G1", faculty: "Dr Saurabhi Mehra", venue: "TBD" },
            { subject: "INS Lab", group: "G2", faculty: "Dr Ashish Kumar", venue: "TBD" },
            { subject: "Machine Learning Lab", group: "G3", faculty: "Ms Gulli Kaur", venue: "TBD" },
          ],
          "12-1":  { subject: "Compiler Design CS301", faculty: "Dr Saurabhi Mehra", venue: "AB4-106" },
          "1-2":   { subject: "Machine Learning CS303", faculty: "Ms Gulli Kaur", venue: "AB4-106" },
          "2-3":   { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-106" },
          "3-4":   { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-106" },
          "4-6":   { subject: "E2 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        TUE: {
          "8-10":  { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-12_lab": [
            { subject: "Machine Learning Lab", group: "G1", faculty: "Ms Gulli Kaur", venue: "TBD" },
            { subject: "Compiler Design Lab / INS Lab", group: "G2", faculty: "Dr Ashish Kumar", venue: "TBD" },
            { subject: "Lab", group: "G3", faculty: "TBD", venue: "TBD" },
          ],
          "12-1":  { subject: "Information and Network Security CS305", faculty: "Dr Ashish Kumar", venue: "AB4-106" },
          "1-2":   { subject: "Machine Learning CS303", faculty: "Ms Gulli Kaur", venue: "AB4-406" },
          "2-3":   { subject: "Compiler Design CS301", faculty: "Dr Saurabhi Mehra", venue: "AB4-106" },
          "3-5":   { subject: "E6 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        WED: {
          "8-10":  { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-1":  { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "1-2":   { subject: "Information and Network Security CS305", faculty: "Dr Ashish Kumar", venue: "AB4-106" },
          "2-3":   { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "TBD" },
          "3-4":   { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        THUR: {
          "8-10":  { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-12": { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "12-1":  { subject: "Information and Network Security CS305", faculty: "Dr Ashish Kumar", venue: "AB4-106" },
          "1-2":   { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "AB4-406" },
          "2-3":   { subject: "E6 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        FRI: {
          "8-10":  { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-12": { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "12-1":  { subject: "Machine Learning CS303", faculty: "Ms Gulli Kaur", venue: "AB4-106" },
          "1-2":   { subject: "Compiler Design CS301", faculty: "Dr Saurabhi Mehra", venue: "AB4-106" },
          "2-3":   { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "3-4":   { subject: "E2 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
      },
    },

    // ── A5 ──────────────────────────────────────────────────────────────────
    A5: {
      room: "AB4-106",
      course_codes: {
        CS301: { title: "Compiler Design (CD)", faculty: "Ms Anjali Bansal" },
        CS303: { title: "Machine Learning (ML)", faculty: "Dr Jyaoti Bahl" },
        CS305: { title: "Information and Network Security (INS)", faculty: "Dr N Anand" },
        CS309: { title: "DEC1 Distributed Systems", faculty: "Dr Ravin Ahuja" },
        CS311: { title: "DEC2 Information Theory and Coding", faculty: "Mr Naveen Munjal" },
        CS313: { title: "DEC3 Quantum Computing", faculty: "Ms Yati Piplani" },
        CS315: { title: "DEC4 Advance Data Structure", faculty: "Mr Pulkit Jain" },
      },
      timetable: {
        MON: {
          "8-10":  { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-11": { subject: "Compiler Design CS301", faculty: "Ms Anjali Bansal", venue: "AB4-106" },
          "11-12": { subject: "Machine Learning CS303", faculty: "Dr Jyaoti Bahl", venue: "AB4-106" },
          "12-2_lab": [
            { subject: "Compiler Design Lab / INS Lab", group: "G1", faculty: "Dr Pavan Singh Mehra / Dr N Anand", venue: "TBD" },
            { subject: "Machine Learning Lab", group: "G2", faculty: "Mr Vinod Kumar", venue: "TBD" },
            { subject: "Lab", group: "G3", faculty: "TBD", venue: "TBD" },
          ],
          "2-3":   { subject: "Information and Network Security CS305", faculty: "Dr N Anand", venue: "AB4-106" },
          "3-4":   { subject: "E2 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        TUE: {
          "8-10":  { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-11": { subject: "Machine Learning CS303", faculty: "Dr Jyaoti Bahl", venue: "AB4-106" },
          "11-12": { subject: "Compiler Design CS301", faculty: "Ms Anjali Bansal", venue: "AB4-106" },
          "12-1":  { subject: "Information and Network Security CS305", faculty: "Dr N Anand", venue: "AB4-106" },
          "1-2":   { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-203" },
          "2-3":   { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-203" },
          "3-5":   { subject: "E6 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        WED: {
          "8-10":  { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-1":  { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "1-3_lab": [
            { subject: "INS Lab / Machine Learning Lab", group: "G1", faculty: "Dr N Anand", venue: "TBD" },
            { subject: "Compiler Design Lab / AI Lab", group: "G2", faculty: "Mr Md Aakif / Dr Pavan Singh Mehra", venue: "TBD" },
            { subject: "Lab", group: "G3", faculty: "TBD", venue: "TBD" },
          ],
          "3-4":   { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        THUR: {
          "8-10":  { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-11": { subject: "Compiler Design CS301", faculty: "Ms Anjali Bansal", venue: "AB4-106" },
          "11-12": { subject: "Machine Learning CS303", faculty: "Dr Jyaoti Bahl", venue: "AB4-106" },
          "12-1":  { subject: "Information and Network Security CS305", faculty: "Dr N Anand", venue: "AB4-106" },
          "1-2":   { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-106" },
          "2-3":   { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "3-4":   { subject: "E6 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        FRI: {
          "8-10":  { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-1_lab": [
            { subject: "Machine Learning Lab / INS Lab", group: "G1", faculty: "Mr Aanish Bardos / Ms Anjali Bansal", venue: "TBD" },
            { subject: "Compiler Design Lab / AI Lab", group: "G2", faculty: "Dr N Anand", venue: "TBD" },
            { subject: "Lab", group: "G3", faculty: "TBD", venue: "TBD" },
          ],
          "1-2":   { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "2-3":   { subject: "E2 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
      },
    },

    // ── A6 ──────────────────────────────────────────────────────────────────
    A6: {
      room: "AB4-203",
      course_codes: {
        CS301: { title: "Compiler Design (CD)", faculty: "Dr Juhee Arora" },
        CS303: { title: "Machine Learning (ML)", faculty: "Mr Tushar Dahiya" },
        CS305: { title: "Information and Network Security (INS)", faculty: "Dr Indu Singh" },
        CS309: { title: "DEC1 Distributed Systems", faculty: "Dr Ravin Ahuja" },
        CS311: { title: "DEC2 Information Theory and Coding", faculty: "Ms Yati Piplani" },
        CS313: { title: "DEC3 Quantum Computing", faculty: "TBD" },
        CS315: { title: "DEC4 Advance Data Structure", faculty: "TBD" },
      },
      timetable: {
        MON: {
          "8-10":  { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-11": { subject: "Compiler Design CS301", faculty: "Dr Juhee Arora", venue: "AB4-203" },
          "11-12": { subject: "Machine Learning CS303", faculty: "Mr Tushar Dahiya", venue: "AB4-203" },
          "12-2_lab": [
            { subject: "Compiler Design Lab / INS Lab / Machine Learning Lab", group: "G1", faculty: "Prof Rahul Kataria / Mr Mohd Sabeen / Dr Kavinder Singh", venue: "TBD" },
            { subject: "Lab", group: "G2", faculty: "TBD", venue: "TBD" },
          ],
          "2-3":   { subject: "Information and Network Security CS305", faculty: "Dr Indu Singh", venue: "AB4-203" },
          "3-4":   { subject: "E2 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        TUE: {
          "8-10":  { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-11": { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-203" },
          "11-12": { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-203" },
          "12-1":  { subject: "Compiler Design CS301", faculty: "Dr Juhee Arora", venue: "AB4-203" },
          "1-3":   { subject: "E6 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        WED: {
          "8-10":  { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-1":  { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "1-2":   { subject: "Compiler Design CS301", faculty: "Dr Juhee Arora", venue: "AB4-203" },
          "2-3":   { subject: "Information and Network Security CS305", faculty: "Dr Indu Singh", venue: "AB4-203" },
        },
        THUR: {
          "8-10":  { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-11": { subject: "Machine Learning CS303", faculty: "Mr Tushar Dahiya", venue: "AB4-203" },
          "11-12": { subject: "Machine Learning CS303", faculty: "Mr Tushar Dahiya", venue: "AB4-203" },
          "12-1":  { subject: "Information and Network Security CS305", faculty: "Dr Indu Singh", venue: "AB4-203" },
          "1-2":   { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-203" },
          "2-3":   { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "3-4":   { subject: "E6 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        FRI: {
          "8-10":  { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-1_lab": [
            { subject: "Machine Learning Lab / Compiler Design Lab / INS Lab", group: "G1", faculty: "Dr Kavinder Singh / Dr Pavan Singh Mehra / Dr Indu Singh", venue: "TBD" },
          ],
          "1-2":   { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "2-3":   { subject: "E2 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
      },
    },

    // ── A7 ──────────────────────────────────────────────────────────────────
    A7: {
      room: "AB4-203",
      course_codes: {
        CS301: { title: "Compiler Design (CD)", faculty: "Prof Rajni Jindal" },
        CS303: { title: "Machine Learning (ML)", faculty: "Prof Vinod Kumar" },
        CS305: { title: "Information and Network Security (INS)", faculty: "Ms Kaki Sreenuja" },
        CS309: { title: "DEC1 Distributed Systems", faculty: "Dr Ravin Ahuja" },
        CS311: { title: "DEC2 Information Theory and Coding", faculty: "Ms Yati Piplani" },
        CS313: { title: "DEC3 Quantum Computing", faculty: "TBD" },
        CS315: { title: "DEC4 Advance Data Structure", faculty: "TBD" },
      },
      timetable: {
        MON: {
          "8-10":  { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-1_lab": [
            { subject: "Compiler Design Lab / INS Lab", group: "G1", faculty: "Prof Rajni Jindal / Dr Indu Singh / Prof Vinod Kumar", venue: "TBD" },
            { subject: "Machine Learning Lab", group: "G2", faculty: "TBD", venue: "TBD" },
            { subject: "Lab", group: "G3", faculty: "TBD", venue: "TBD" },
          ],
          "1-2":   { subject: "Information and Network Security CS305", faculty: "Ms Ila Kaushik", venue: "AB4-203" },
          "2-3":   { subject: "Machine Learning CS303", faculty: "Prof Vinod Kumar", venue: "AB4-203" },
          "3-4":   { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-203" },
          "4-6":   { subject: "E2 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        TUE: {
          "8-10":  { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-11": { subject: "Compiler Design CS301", faculty: "Prof Rajni Jindal", venue: "AB4-203" },
          "11-12": { subject: "Machine Learning CS303", faculty: "Prof Vinod Kumar", venue: "AB4-203" },
          "12-1":  { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-203" },
          "1-3":   { subject: "E6 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        WED: {
          "8-10":  { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-1":  { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "1-2":   { subject: "Machine Learning CS303", faculty: "Prof Vinod Kumar", venue: "AB4-204" },
          "2-3":   { subject: "Information and Network Security CS305", faculty: "Ms Ila Kaushik", venue: "AB4-204" },
        },
        THUR: {
          "8-10":  { subject: "E5 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-1_lab": [
            { subject: "Machine Learning Lab / Compiler Design Lab", group: "G1", faculty: "Prof Vinod Kumar / Prof Rajni Jindal / Dr Pavan Singh Mehra", venue: "TBD" },
          ],
          "1-2":   { subject: "Information and Network Security CS305", faculty: "Ms Ila Kaushik", venue: "AB4-204" },
          "2-3":   { subject: "E3 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "3-4":   { subject: "E6 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
        },
        FRI: {
          "8-10":  { subject: "E1 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "10-1":  { subject: "E4 (Elective - unresolved)", faculty: "TBD", venue: "TBD" },
          "1-2":   { subject: "EE HU301 (Humanities Elective)", faculty: "TBD", venue: "AB4-203" },
          "2-3":   { subject: "Compiler Design CS301", faculty: "Prof Rajni Jindal", venue: "AB4-203" },
        },
      },
    },
  },
};

// ── Section options ──────────────────────────────────────────────────────────
export const SECTION_OPTIONS_SEM_5 = [
  { id: "A1", label: "Section A1 (CSE-V)", room: "AB4-015" },
  { id: "A2", label: "Section A2 (CSE-V)", room: "AB4-015" },
  { id: "A3", label: "Section A3 (CO-V)",  room: "AB4-016" },
  { id: "A4", label: "Section A4 (CO-V)",  room: "AB4-106" },
  { id: "A5", label: "Section A5 (CO-V)",  room: "AB4-106" },
  { id: "A6", label: "Section A6 (CO-V)",  room: "AB4-203" },
  { id: "A7", label: "Section A7 (CO-V)",  room: "AB4-203" },
];

// ── Slot-to-string converter (used by dashboard & timetable page) ─────────────
export function convertSem5SlotToString(slotVal: any): string {
  if (!slotVal) return "";

  if (Array.isArray(slotVal)) {
    return slotVal
      .map((item) => {
        const roomPart = item.venue ? `[${item.venue}]` : item.room ? `[${item.room}]` : "";
        const groupPart = item.group ? `-${item.group}` : "";
        const fac = item.faculty || "Faculty TBD";
        return `Lab-${item.subject}${groupPart} [${fac}]${roomPart}`;
      })
      .join(" / ");
  }

  if (slotVal.groups && Array.isArray(slotVal.groups)) {
    return slotVal.groups
      .map((gItem: any) => {
        const roomPart = gItem.venue ? `[${gItem.venue}]` : gItem.room ? `[${gItem.room}]` : "";
        const groupPart = gItem.group ? `-${gItem.group}` : "";
        const fac = gItem.faculty || "Faculty TBD";
        return `${slotVal.subject}${groupPart} [${fac}]${roomPart}`;
      })
      .join(" / ");
  }

  if (typeof slotVal === "object" && slotVal.subject) {
    const roomPart = slotVal.venue ? `[${slotVal.venue}]` : slotVal.room ? `[${slotVal.room}]` : "";
    const sub = slotVal.subject;
    const fac = slotVal.faculty || "Faculty TBD";
    const prefix =
      !sub.toLowerCase().startsWith("tutorial") && !sub.toLowerCase().includes("lab")
        ? "TH-"
        : "";
    return `${prefix}${sub} [${fac}]${roomPart}`;
  }

  return String(slotVal);
}

// ── Backward-compat export used by data.ts ───────────────────────────────────
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
