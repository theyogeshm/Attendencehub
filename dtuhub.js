const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, bold: true, size: 36, color: "1A4A7A" })],
  spacing: { before: 400, after: 200 }
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, bold: true, size: 28, color: "2E75B6" })],
  spacing: { before: 300, after: 150 }
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, bold: true, size: 24, color: "404040" })],
  spacing: { before: 200, after: 100 }
});

const p = (text) => new Paragraph({
  children: [new TextRun({ text, size: 22 })],
  spacing: { before: 80, after: 80 }
});

const bullet = (text, bold = false) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  children: [new TextRun({ text, size: 22, bold })],
  spacing: { before: 60, after: 60 }
});

const subbullet = (text) => new Paragraph({
  numbering: { reference: "subbullets", level: 0 },
  children: [new TextRun({ text, size: 21, color: "444444" })],
  spacing: { before: 40, after: 40 }
});

const divider = () => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6", space: 1 } },
  spacing: { before: 200, after: 200 }
});

const makeTable = (headers, rows, colWidths) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: colWidths,
  rows: [
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => new TableCell({
        borders,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: "2E75B6", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 22, color: "FFFFFF" })] })]
      }))
    }),
    ...rows.map((row, ri) => new TableRow({
      children: row.map((cell, ci) => new TableCell({
        borders,
        width: { size: colWidths[ci], type: WidthType.DXA },
        shading: { fill: ri % 2 === 0 ? "F5F8FF" : "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: cell, size: 21 })] })]
      }))
    }))
  ]
});

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "subbullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u25E6",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }]
      },
      {
        reference: "numbered",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1A4A7A" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "404040" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [

      // ── TITLE PAGE ──
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440, after: 200 },
        children: [new TextRun({ text: "DTU Hub", bold: true, size: 72, color: "1AE7A6" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: "All-in-One Student Platform for DTU CSE 1st Year", size: 30, color: "444444" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 800 },
        children: [new TextRun({ text: "Complete Project Blueprint & Development Guide", size: 24, color: "888888", italics: true })]
      }),
      divider(),

      // ── SECTION 1: VISION ──
      h1("1. Project Vision"),
      p("DTU Hub is a single platform for DTU CSE 1st year students that combines everything they currently hunt across multiple websites. Today students use Fresources for study material, ResultHub for results, and have no dedicated attendance tracker. DTU Hub brings all of this together in one clean, fast, mobile-friendly web app."),
      p("Target audience: DTU CSE 1st year students (Sections A, B, C, D — approximately 300-400 students)."),
      p("Built by a 2nd year CSE student who knows exactly what 1st years need."),
      divider(),

      // ── SECTION 2: TECH STACK ──
      h1("2. Tech Stack"),
      h2("2.1 Frontend"),
      bullet("3 files only: index.html, style.css, jss.js — no frameworks, no build tools"),
      bullet("Poppins font from Google Fonts"),
      bullet("Font Awesome 6.5 for icons"),
      bullet("Dark mode default with green accent #1AE7A6"),
      bullet("Light/Dark toggle in header"),
      bullet("Fully mobile responsive with collapsible sidebar"),

      h2("2.2 Backend"),
      bullet("Supabase — free tier, handles 300-400 students easily"),
      bullet("Supabase Auth — Google OAuth for login"),
      bullet("Supabase Database — attendance records, assignments, user profiles"),
      bullet("PDFs stored on Google Drive — only links stored in Supabase (saves storage quota)"),

      h2("2.3 AI Integration"),
      bullet("Claude API (claude-sonnet-4-20250514) — for AI Notes feature in Resources section"),
      bullet("Timetable PDF upload: AI extracts schedule, user confirms before saving"),
      divider(),

      // ── SECTION 3: PAGES ──
      h1("3. Pages & Features"),

      h2("3.1 Dashboard"),
      p("The main landing page after login. Shows everything a student needs at a glance for the day."),
      bullet("Welcome message with student name"),
      bullet("Top stat cards: Overall Attendance %, Pending Assignments, Next Class, Academic Week"),
      bullet("Today's Schedule — subject cards with Present / Absent / Miss / Leave buttons"),
      subbullet("Each card shows: subject name, professor, time, room, current attendance %"),
      subbullet("LEC or LAB badge on each card"),
      bullet("Right panel: Mini calendar (dates are clickable — see Calendar feature below)"),
      bullet("Right panel: Timetable preview (current day highlighted)"),
      bullet("Bottom strip: Quick links — DTU Notices, ResultHub, Unstop, Coding platforms"),
      bullet("Upcoming events/hackathons strip (Unstop embed or manual links)"),

      h2("3.2 Attendance"),
      p("Detailed attendance tracking per subject."),
      bullet("Subject-wise cards showing: attendance count (present/total), percentage, progress bar, Safe/Danger badge"),
      bullet("Safe = above 75%, Danger = below 75%"),
      bullet("Can Miss Calculator on right panel: select subject, drag slider for classes to miss, shows projected percentage"),
      bullet("Calendar with clickable dates: click any past date to see that day's attendance log and edit if needed"),

      h2("3.3 Resources"),
      p("Replaces and improves upon Fresources. Subject-wise organized study material."),
      bullet("Grid of subject cards: Mathematics IV, Engineering Physics, Discrete Maths, Data Structures, EVS, Basic ML"),
      bullet("Search bar at top — searches across all subjects and resources"),
      bullet("Clicking a subject opens detail view with:"),
      subbullet("Year-wise rows: 2023, 2022, 2021"),
      subbullet("Each year row has two buttons side by side: PYQ PDF (opens PDF) and Solution (opens HTML solution page)"),
      subbullet("Notes section below: Handwritten Notes button and AI Notes button"),
      bullet("AI Notes: sends subject syllabus to Claude API, generates structured notes on demand"),

      h2("3.4 Assignments"),
      p("Track all pending assignments in one place."),
      bullet("Manual add form: Subject (dropdown), Title, Due Date, Description"),
      bullet("Assignment list sorted by due date (soonest first)"),
      bullet("Mark as Done option on each card"),
      bullet("Overdue assignments highlighted in red"),
      bullet("Google Classroom OAuth integration — Phase 2 (auto-fetch assignments from Classroom)"),

      h2("3.5 Timetable"),
      p("Full weekly schedule in a clean grid format."),
      bullet("Mon to Fri period-wise grid: time slots 8-9, 9-10, 10-11, 11-12, 12-1, 1-2, 2-3, 3-4"),
      bullet("Current day row highlighted in green (#1AE7A6)"),
      bullet("Subjects: Maths, Physics, Discrete, Data Structures, EVS, Basic ML, Physics Lab, Data Lab, Basic ML Lab"),
      bullet("Section-wise timetables: A, B, C, D — student selects section during onboarding"),
      bullet("Manual entry by admin (you) initially"),

      h2("3.6 Analytics"),
      p("Meaningful attendance insights, not redundant data."),
      bullet("Week-by-week attendance trend graph — bar or line chart showing if attendance is improving or dropping"),
      bullet("Subject-wise danger alerts — subjects approaching 75% threshold highlighted"),
      bullet("Projection calculator: if I miss next N classes across all subjects, what happens?"),
      bullet("Quick links section: DTU Website, ResultHub, Unstop, Leetcode, Codeforces, Coding Ninjas, GeeksforGeeks"),

      h2("3.7 Profile"),
      p("Accessible by clicking top-right avatar, NOT in sidebar."),
      bullet("Fields: Name, Roll Number, Branch, Semester, Section"),
      bullet("Edit option"),
      bullet("Profile photo support"),
      divider(),

      // ── SECTION 4: KEY FEATURES ──
      h1("4. Key Features Detail"),

      h2("4.1 Clickable Calendar"),
      p("This is a unique feature not found in any existing attendance tool."),
      bullet("Every date in the calendar is clickable"),
      bullet("Clicking a past date opens a modal"),
      bullet("Modal shows: which subjects had class that day, what was marked for each"),
      bullet("Edit option in modal — student can correct a wrong entry"),
      bullet("Useful when student forgets to mark attendance and wants to update later"),

      h2("4.2 Dark / Light Mode"),
      bullet("Dark mode is default (existing design uses #0E1117 background, #1AE7A6 accent)"),
      bullet("Toggle button in header switches between modes"),
      bullet("Preference saved in localStorage"),

      h2("4.3 Floating Feedback Button"),
      bullet("Fixed bottom-right button on all pages"),
      bullet("Opens a small form: feedback text + optional email"),
      bullet("Submits to Supabase feedback table"),
      bullet("You review feedback to improve the product"),

      h2("4.4 Search Bar"),
      bullet("Works on Resources page — searches subject names, topics, PYQ years"),
      bullet("Header search bar — global search across all sections"),

      h2("4.5 Mobile Responsive"),
      bullet("Sidebar collapses to hamburger menu on mobile"),
      bullet("Bottom navigation bar on mobile for quick access"),
      bullet("Cards stack vertically on small screens"),
      divider(),

      // ── SECTION 5: FILE STRUCTURE ──
      h1("5. File Structure"),
      p("Keep everything minimal — 3 main files only:"),
      new Paragraph({
        children: [new TextRun({
          text: "index.html   — All HTML structure, all page sections\nstyle.css    — All styling including dark/light mode\njss.js       — All JavaScript logic and Supabase integration",
          font: "Courier New", size: 20, color: "1A1A1A"
        })],
        spacing: { before: 100, after: 100 }
      }),
      p("No frameworks. No build tools. No node_modules. Pure HTML/CSS/JS."),
      divider(),

      // ── SECTION 6: DATABASE ──
      h1("6. Supabase Database Schema"),

      h2("6.1 Tables"),
      makeTable(
        ["Table", "Key Columns", "Purpose"],
        [
          ["users", "id, name, roll_no, branch, section, semester", "Student profile data"],
          ["attendance", "id, user_id, subject, date, status (present/absent/miss/leave)", "Daily attendance records"],
          ["assignments", "id, user_id, subject, title, due_date, description, done", "Assignment tracker"],
          ["feedback", "id, user_id, message, email, created_at", "User feedback submissions"],
          ["resources", "id, subject, year, pyq_link, solution_link, notes_link", "Admin-managed resource links"],
        ],
        [2500, 4000, 2860]
      ),

      new Paragraph({ spacing: { before: 200 } }),
      h2("6.2 Storage"),
      bullet("PDFs hosted on Google Drive — free, fast, no storage limit issues"),
      bullet("Only Google Drive share links stored in Supabase resources table"),
      bullet("Profile photos: Supabase Storage (small files, free tier is enough)"),
      divider(),

      // ── SECTION 7: PHASES ──
      h1("7. Development Phases"),

      h2("Phase 1 — Core (Build First)"),
      bullet("Dashboard with today's schedule and attendance buttons", true),
      bullet("Attendance page with subject cards and can-miss calculator", true),
      bullet("Timetable page", true),
      bullet("Supabase auth (Google login)", true),
      bullet("Attendance data saving to Supabase", true),
      bullet("Light/Dark mode toggle", true),
      bullet("Mobile responsive layout", true),

      h2("Phase 2 — Resources & Assignments"),
      bullet("Resources page with PYQ PDFs and solution links", true),
      bullet("Notes section with handwritten notes links", true),
      bullet("Assignments manual add feature", true),
      bullet("Clickable calendar with attendance history and edit", true),
      bullet("Floating feedback button", true),

      h2("Phase 3 — Advanced"),
      bullet("Analytics page with trend graphs", true),
      bullet("AI Notes via Claude API", true),
      bullet("Google Classroom OAuth integration for assignments", true),
      bullet("Search bar (global)", true),
      bullet("Timetable PDF upload with AI extraction", true),
      divider(),

      // ── SECTION 8: STITCH PROMPT ──
      h1("8. Stitch / AI Builder Prompt"),
      p("Use this prompt in Stitch, Bolt, or v0 to generate the frontend. Paste as-is:"),
      new Paragraph({
        spacing: { before: 100, after: 300 },
        border: {
          top: { style: BorderStyle.SINGLE, size: 4, color: "1AE7A6" },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: "1AE7A6" },
          left: { style: BorderStyle.SINGLE, size: 4, color: "1AE7A6" },
          right: { style: BorderStyle.SINGLE, size: 4, color: "1AE7A6" },
        },
        children: [new TextRun({
          text:
`Keep the existing DTU Hub layout, color scheme (dark mode, background #0E1117, green accent #1AE7A6), and overall design exactly as is. Output only 3 files: index.html, style.css, jss.js. No frameworks, no build tools, no package.json.

SIDEBAR NAVIGATION (in this order):
Dashboard, Attendance, Resources, Assignments, Timetable, Analytics.
Remove Profile from sidebar — it opens only on clicking top-right avatar.

DASHBOARD PAGE:
- Top stat cards: Overall Attendance %, Pending Assignments count, Next Class name+time, Academic Week number
- Today Schedule section: subject cards with Present / Absent / Miss / Leave buttons. Each card shows subject name, professor name, time, room, LEC/LAB badge, current attendance %
- Right panel: mini calendar with clickable dates. Clicking any past date opens a modal showing that day attendance log with edit option
- Right panel: timetable preview showing today row highlighted
- Bottom strip: quick links row with icons for DTU Notices, ResultHub, Unstop, Leetcode

ATTENDANCE PAGE:
- Subject cards: name, count (present/total), percentage, progress bar, Safe/Danger badge
- Right panel: Can Miss Calculator — select subject dropdown, slider for classes to miss, shows projected percentage and status

RESOURCES PAGE:
- Search bar at top (functional)
- Grid of 6 subject cards: Mathematics IV, Engineering Physics, Discrete Maths, Data Structures, EVS, Basic ML
- Clicking subject opens detail view inside same page
- Detail view shows year rows: 2023, 2022, 2021. Each row has two side-by-side buttons: PYQ PDF and Solution
- Below years: Notes section with Handwritten Notes and AI Notes buttons

ASSIGNMENTS PAGE:
- Add assignment form: Subject (dropdown of 6 subjects), Title, Due Date, Description, Submit button
- List of assignments sorted by due date, each with Mark Done button
- Overdue items highlighted in red

TIMETABLE PAGE:
- Full Mon-Fri grid table. Time slots: 8-9, 9-10, 10-11, 11-12, 12-1, 1-2, 2-3, 3-4
- Current day row highlighted in green (#1AE7A6)
- Prefill with: MO: Discrete(8-10), Data Lab(12-2), Physics(2-4) | TU: EVS(8-10), Discrete(10-11), Physics Lab(12-2), Maths(2-3) | WE: Maths(10-11), Physics(12-1), Data(1-3) | TH: Data(10-11), Maths(1-3) | FR: Discrete(10-11), Basic ML(12-1), Basic ML Lab(2-4)

ANALYTICS PAGE:
- Week by week attendance trend chart (bar chart, one bar per subject per week)
- Danger zone cards: subjects below 75% shown with red alert
- What-if calculator: miss N more classes projection for each subject
- Quick links grid: DTU Website, ResultHub, Unstop, Leetcode, Codeforces, GeeksforGeeks, Coding Ninjas

PROFILE (avatar click only):
- Fields: Name, Roll Number, Section (A/B/C/D), Semester, Branch
- Edit and Save button

GENERAL:
- Light/Dark mode toggle in header (dark is default)
- Floating feedback button bottom-right corner
- Mobile responsive: collapsible sidebar, bottom nav bar on mobile
- Poppins font throughout
- All card hover effects and animations preserved
- Green (#1AE7A6) as primary accent for active states, badges, highlights`,
          font: "Courier New", size: 18, color: "1A1A1A"
        })]
      }),
      divider(),

      // ── SECTION 9: CONTENT TO FILL ──
      h1("9. Content You Need to Fill"),
      p("This is the manual work required from your side as admin:"),

      h2("9.1 Resources (One-Time Setup)"),
      bullet("Collect PYQ PDFs for each subject (2021, 2022, 2023) — check DTU Telegram groups"),
      bullet("Upload PDFs to Google Drive, get shareable links"),
      bullet("Enter links in Supabase resources table"),
      bullet("HTML solution pages — create simple HTML files hosted on GitHub Pages"),
      bullet("Handwritten notes — collect from seniors, upload to Drive"),

      h2("9.2 Timetable"),
      bullet("Enter section-wise timetables (A, B, C, D) manually in Supabase or hardcode in jss.js"),
      bullet("One-time setup, update only if DTU changes schedule"),

      h2("9.3 Ongoing Maintenance"),
      bullet("DTU notices link — update when new semester starts"),
      bullet("New PYQs — add after each exam cycle"),
      bullet("Monitor feedback from students"),
      divider(),

      // ── SECTION 10: LAUNCH ──
      h1("10. Launch Strategy"),
      bullet("Host frontend on GitHub Pages (free, fast)"),
      bullet("Supabase backend — free tier handles your audience size"),
      bullet("Share in DTU CSE 1st year WhatsApp/Telegram groups"),
      bullet("Get 2-3 juniors as early testers — they find bugs you won't"),
      bullet("Collect feedback via the in-app feedback button"),
      bullet("Iterate based on real usage"),
      new Paragraph({ spacing: { before: 200 } }),
      p("Good luck bhai — DTU juniors will genuinely appreciate this."),

    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/mnt/user-data/outputs/DTU_Hub_Blueprint.docx', buffer);
  console.log('Done!');
});
