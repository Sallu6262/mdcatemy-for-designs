# MDCATEMY — Complete Website Documentation

## What is MDCATEMY?

MDCATEMY is a Pakistani MDCAT preparation web application. MDCAT (Medical and Dental College Admission Test) is the national entry test for medical colleges in Pakistan, conducted by PMDC (Pakistan Medical & Dental Council). MDCATEMY helps students prepare through a structured quiz system, full simulations, performance tracking, and mistake review tools.

---

## Tech Stack

- **Frontend:** Next.js 16.2 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS, custom dark warrior theme
- **Animations:** Framer Motion
- **Database (planned):** PostgreSQL
- **Deployment:** Netlify / Vercel

### Design Theme
- Dark warrior theme: warrior-black (#181A18), dark-charcoal (#222422)
- Accent: mdcat-yellow (#FFC600)
- Font: Poppins (headings), Inter (body)

---

## Pages & User Flow

### 1. Landing Page (`/`)
- Hero section with MDCATEMY branding
- Features overview
- CTA buttons → Login / Register

### 2. Auth Pages
- `/login` — Email + password login
- `/register` — Name, email, password, confirm password

### 3. Dashboard (`/dashboard`) — My Camp
Main hub after login. Contains:
- **Greeting header** with user name and date
- **Countdown widget** — days remaining until MDCAT (target: August 8, 2026)
- **Recent Activity Widget (Heatmap)**
  - Shows last 5 / 7 / 10 days (user toggles)
  - Each day box shows: day name, date, MCQs solved count
  - Color intensity based on MCQ count (none / low / medium / high)
  - Streak counter (consecutive days studied)
- **Quick Stats row**
  - Total MCQs attempted (all time)
  - Accuracy % (correct / attempted)
  - Current streak (days)
  - Simulations completed
- **Recent Quiz Activity**
  - Last 3 quiz sessions: subject, chapter, score (correct/total), date, duration, delta vs previous

### 4. Quiz Builder (`/dashboard/quiz`)
The core study tool. Multi-step builder then taking screen.

#### Step 1 — Builder (Desktop: 3-column layout)
**Column 1: Subjects**
- 5 subjects: Biology, Chemistry, Physics, English, Logical Reasoning
- Multi-select (toggle on/off)

**Column 2: Chapters**
- Shows chapters for selected subjects
- If 2+ subjects selected → subject tabs appear on top
- Each chapter is a checkbox
- Answered count badge per tab

**Column 3: Topics**
- Shows topics for chapters that have been selected
- Subject tabs appear when 2+ subjects have selected chapters
- Each topic is a checkbox

**Mobile:** Same 3 columns but as steps (Step 1 → Chapters, Step 2 → Topics) with Prev/Next navigation between steps

#### Step 2 — Settings Panel (right side / bottom drawer on mobile)
- **MCQ Count slider** (5–100)
- **Difficulty Distribution**
  - Three sliders: Easy %, Medium %, Hard % — always sum to 100%
  - Auto-balance: when one slider moves, others redistribute proportionally
  - Visual segmented bar shows the split
- **Timer toggle** + minute input (if on)
- **Reveal Mode:** After each question OR End of quiz

#### Step 3 — Taking Screen
Full-screen exam interface:
- **Top bar:** Section/subject tabs (each shows done/total), timer (color changes: white→amber→orange→red), noise indicator, Q counter
- **Progress bar** (thin yellow bar below top bar)
- **Question area:** Difficulty badge, subject·chapter label, question text, 4 options (A/B/C/D)
  - Selected answer shows Lock Answer button → locks it
  - After locking: reveals correct/wrong styling (if "after each" mode)
  - "Reveal answer & explanation" button appears after lock (after each mode)
- **Bottom bar:** Prev | [Nav button (mobile)] [Submit button] | Next
- **Desktop Navigator panel** (right sidebar): section-grouped question grid, answered/flagged/blank color coding, legend
- **Mobile Navigator sheet** (slides up from bottom): same grid
- **Submit button** → confirmation modal (Answered / Unanswered stats → Keep Going / Submit)

#### Step 4 — Results Screen
After quiz submission:
- Score (correct / total), accuracy %
- Section breakdown (per subject)
- Correct answers review
- Option to retake or go back

### 5. Saved (`/dashboard/saved`)
- Bookmarked MCQs saved for later review
- User can bookmark any MCQ during quiz

### 6. Challenges (`/dashboard/challenges`)
- Placeholder for future challenge/competition features

### 7. Mistake Copy (`/dashboard/mistakes`)
- All MCQs the student answered incorrectly
- Filter by: All / Wrong / Bookmarked
- Shows correct answer and explanation for each
- Helps targeted revision

### 8. IF MDCAT WAS TODAY — Simulation (`/dashboard/simulation`)
The flagship feature. A full PMDC-pattern timed simulation.

#### Screen 1: Briefing
- PMDC subject distribution display (Bio 68, Chem 54, Phys 54, Eng 18, LR 6 = 200 total)
- Visual proportional bar
- Rules of engagement
- **Battlefield Conditions (Noise Mode):**
  - Silent, Exam Hall (brown noise), Focus Rain (white noise + lowpass), Full Chaos
  - Generated via Web Audio API — no audio files needed
- **Blind Mode toggle** (Advanced):
  - Hides question navigator during exam
  - Warning callout shown when enabled
- Acknowledge checkbox → "Enter the Arena" CTA

#### Screen 2: Manual (Pre-exam rules popup)
Shown before countdown. Contains:
- ☝️ Selecting an Answer is FINAL — cannot change after clicking
- 🚩 Flag & Review — flag uncertain Qs, but once answered it's locked
- ⏱️ Timer Runs Continuously — 150 min, no pausing
- ⚡ Auto-Submit at Zero
- 📵 Tab Switches Are Monitored (logged, 3 warnings)
- 🔇 Blind Mode Is Active (only shown if blind mode enabled)
- "I understand — Begin Exam" CTA

#### Screen 3: Countdown
- 5 → 4 → 3 → 2 → 1 → BEGIN animation
- Noise starts when exam opens

#### Screen 4: Exam
- **Top bar:** Subject section tabs (Bio / Chem / Phys / Eng / LR), each with done/total count, timer, noise indicator, Q counter (hidden in blind mode)
- **Progress bar**
- **Question area:** Selecting = FINAL (no undo). After selection: "Locked" badge on chosen option, others fade out, "Answer locked · Press Next to continue" hint
- **Bottom bar:** Prev | [Nav button (hidden in blind mode)] [Flag button] [Submit button] | Next
  - Flag button: marks Q orange in navigator, toggleable anytime
  - Submit: opens confirmation modal
- **Desktop Navigator** (hidden entirely in blind mode): same grid as quiz builder, yellow=answered, orange=flagged, dark=blank
- **Mobile Navigator sheet** (hidden in blind mode)
- **Milestone toasts:** At 90min, 60min, 30min, 15min, 10min, 5min remaining; at 50/100/150 answered
- **Tab switch detection:** Banner warning after each tab switch, escalates at 3
- **Auto-submit** when timer hits 0

#### Screen 5: Results
- Score out of 200, percentage, grade label (Warrior / Solid / Keep Going / Needs Work / Battle Stations)
- Percentile estimate (e.g. Top 12%)
- Section breakdown: each subject with correct/total, accuracy %, color bar
- Best section / Worst section highlight cards
- Time analytics: total time taken, avg time per question
- MDCATEMY analysis verdict (text based on score range)
- Actions: Retake Simulation / Review Mistakes / Dashboard

---

## Analytics & Data Tracked

| Metric | Source | Used In |
|--------|--------|---------|
| Daily MCQs solved | daily_activity table | Heatmap widget |
| Streak (consecutive days) | Computed from daily_activity | Dashboard stats |
| Total MCQs attempted | Sum of quiz responses | Dashboard stats |
| Overall accuracy | correct / attempted | Dashboard stats |
| Subject-wise accuracy | Filter responses by subject | Quiz results, Dashboard |
| Chapter-wise accuracy | Filter responses by chapter | Mistake Copy |
| Per-question time | time_spent_sec on response | Simulation results |
| Simulation score history | simulation_attempts | Dashboard stats |
| Flagged questions | is_flagged on response | Navigator, Submit modal |
| Bookmarked MCQs | bookmarks table | Saved page |
| Wrong MCQs | responses where selected ≠ correct | Mistake Copy |
| Percentile estimate | Compare score vs score table | Simulation results |
| Tab switch count | Client-side, not persisted | Warning banner only |

---

## Subjects & PMDC Pattern

| Subject | MCQs in Simulation | Short |
|---|---|---|
| Biology | 68 | Bio |
| Chemistry | 54 | Chem |
| Physics | 54 | Phys |
| English | 18 | Eng |
| Logical Reasoning | 6 | LR |
| **Total** | **200** | |

---

## Key UX Decisions

- **Selecting = Final (Simulation only):** Once an option is clicked in simulation, it cannot be changed. This mirrors real MDCAT behavior.
- **Flag is non-destructive:** Flagging a question never locks it — it just marks it orange in the navigator for review.
- **Blind Mode:** Removes navigator entirely. The student only sees one question at a time, navigating with Prev/Next. Designed to reduce anxiety.
- **Noise Engine:** Ambient sounds generated programmatically via Web Audio API. No audio file downloads. Brown noise for hall/chaos, white noise + lowpass for rain.
- **Auto-balance difficulty sliders:** When one difficulty % changes, the other two redistribute proportionally. Always sums to 100%.
- **Bottom-anchored mobile modals:** Submission confirmation modals anchor to bottom of screen on mobile (not centered, which overflows on small screens).
- **Subject tabs in Quiz Builder:** When 2+ subjects are selected, the chapters and topics columns show subject tabs so the user isn't overwhelmed with a mixed list.

---

## Navigation Structure

```
/ (Landing)
├── /login
├── /register
└── /dashboard (requires auth)
    ├── /dashboard          → My Camp (home)
    ├── /dashboard/quiz     → Quiz Builder
    ├── /dashboard/saved    → Saved MCQs
    ├── /dashboard/challenges → Challenges
    ├── /dashboard/mistakes → Mistake Copy
    └── /dashboard/simulation → IF MDCAT WAS TODAY
```

Mobile: Bottom tab bar with Home / Quiz / Saved / Challenges / Mistakes
Desktop: Left sidebar with same links + collapsed/expanded state

---

## Planned but Not Yet Built

- Backend API (Node/Express or Next.js API routes)
- PostgreSQL database
- Real MCQ bank (currently uses hardcoded sample questions)
- User authentication (JWT/session)
- Real-time streak tracking
- Challenges/competition feature
- Admin panel for MCQ management
- Push notifications for study reminders
