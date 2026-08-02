# PROJECT RULES — DTU HUB / AttendanceHub

1. SCOPE DISCIPLINE
   - When asked to fix/update ONE semester's timetable (Sem 1 through Sem 8) or ONE specific feature, touch ONLY that data/component. Never modify other semesters, other features, or shared/common code as a side effect — even if it looks related or "could be improved while I'm here."
   - If a requested fix genuinely requires touching shared code that other semesters/features depend on, STOP before making the change. List exactly what shared code needs touching and what else could be affected, and wait for explicit confirmation before proceeding.
   - Never do unprompted refactoring, renaming, restructuring, or "cleanup" alongside a requested fix.

2. DATA INTEGRITY ACROSS ALL SEMESTERS (1 through 8)
   - Timetable data for EVERY semester (Sem 1, 2, 3, 4, 5, 6, 7, 8) is independent and must stay isolated. A patch/correction to any one semester must never alter, reset, or restructure any other semester's data — this applies across all 8 semesters, not just the ones currently populated with data.
   - This rule applies even to semesters that don't have data yet — when they're added later, the same isolation rule applies immediately, automatically, without needing to be told again.
   - Attendance tracking data (Theory/Lab/Tutorial splits, Present/Absent/Undo counts) must never be reset, merged, or recalculated as a side effect of unrelated changes, for any semester.
   - Before applying any data patch, produce a diff-style summary of exactly which fields/slots will change, and confirm nothing outside the requested scope is included.

3. REGRESSION PREVENTION
   - After every change, do a quick self-check: verify that previously working features/pages/other semesters still function exactly as before. Do not just check the thing you changed — check adjacent/related areas too.
   - If you are not fully sure whether a change could break something else, say so explicitly instead of silently proceeding and hoping it's fine.

4. MANDATORY END-OF-TASK REPORT
   - At the end of every task, list every single file/section/data-entry you modified.
   - Explicitly confirm: "No other semester, feature, or shared component was altered outside this list."
   - If you're unsure about something, flag it instead of guessing.

5. AMBIGUOUS/UNCLEAR DATA
   - If source data (scanned PDFs, handwritten notes, etc.) is unclear or ambiguous, mark it as "TBD" or "VERIFY" rather than guessing a plausible-sounding value. Never silently resolve ambiguity with a best guess presented as fact.

6. ALWAYS COMMIT AFTER EVERY CHANGE
   - After every code change (no matter how small), always run: git add <changed files>; git commit -m "<descriptive message>"; git push origin main
   - Do this automatically — never wait to be asked. Committing is part of completing a task, not a separate step.
   - Use PowerShell semicolon syntax (;) to chain git commands, never && which is not valid in PowerShell.

7. BROWSER TESTING DISCIPLINE
   - Never launch or open browser subagents/tools automatically on your own.
   - Only use browser testing if the user explicitly requests you to open or test in the browser.
