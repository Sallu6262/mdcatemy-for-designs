# LucidAI ER Diagram Prompt — MDCATEMY Database

---

## Prompt to paste into LucidAI:

Generate a Chen-notation ER diagram for a Pakistani MDCAT exam preparation website called MDCATEMY. Use PostgreSQL types. Minimize the number of entities — prefer adding columns to existing entities over creating new tables. Here is the complete schema:

---

### ENTITY 1: STUDENT
Primary entity representing a registered user.

Attributes:
- id (PK, UUID)
- name (VARCHAR)
- email (VARCHAR, unique)
- password_hash (VARCHAR)
- age (INT)
- gender (VARCHAR)
- academic_status (VARCHAR) — e.g. "FSc Year 1", "Repeater"
- photo_url (VARCHAR, nullable)
- target_mdcat_date (DATE)
- created_at (TIMESTAMP)

---

### ENTITY 2: MCQ_BANK
Stores all exam questions. Subject, chapter, and topic are stored directly as columns (denormalized for simplicity).

Attributes:
- id (PK, UUID)
- subject (VARCHAR) — "Biology", "Chemistry", "Physics", "English", "Logical Reasoning"
- chapter (VARCHAR)
- topic (VARCHAR, nullable)
- difficulty (VARCHAR) — "Easy", "Medium", "Hard"
- question_text (TEXT)
- option_a (VARCHAR)
- option_b (VARCHAR)
- option_c (VARCHAR)
- option_d (VARCHAR)
- correct_answer (CHAR) — "A", "B", "C", or "D"
- explanation (TEXT)
- is_simulation_eligible (BOOLEAN) — true if this MCQ can appear in full simulation

---

### ENTITY 3: QUIZ_SESSION
One record per quiz attempt. Stores the configuration the student chose for that quiz.

Attributes:
- id (PK, UUID)
- student_id (FK → STUDENT.id)
- subjects (VARCHAR) — comma-separated e.g. "Biology,Chemistry"
- difficulty_easy_pct (INT) — e.g. 34
- difficulty_medium_pct (INT) — e.g. 33
- difficulty_hard_pct (INT) — e.g. 33
- total_count (INT) — how many MCQs in this quiz
- timer_on (BOOLEAN)
- timer_minutes (INT, nullable)
- reveal_mode (VARCHAR) — "after_each" or "end_of_quiz"
- status (VARCHAR) — "completed" or "abandoned"
- started_at (TIMESTAMP)
- finished_at (TIMESTAMP, nullable)

Relationship: STUDENT (1) ——< QUIZ_SESSION (many)

---

### ENTITY 4: QUIZ_RESPONSE
One record per MCQ per quiz session. Tracks exactly what happened on each question.

Attributes:
- id (PK, UUID)
- session_id (FK → QUIZ_SESSION.id)
- mcq_id (FK → MCQ_BANK.id)
- position (INT) — order of this question in the quiz
- selected_answer (CHAR, nullable) — "A", "B", "C", "D" or null if skipped
- is_correct (BOOLEAN, nullable)
- is_skipped (BOOLEAN)
- is_flagged (BOOLEAN)
- is_bookmarked (BOOLEAN)
- time_spent_sec (INT)
- answered_at (TIMESTAMP, nullable)

Relationships:
- QUIZ_SESSION (1) ——< QUIZ_RESPONSE (many)
- MCQ_BANK (1) ——< QUIZ_RESPONSE (many)

---

### ENTITY 5: DAILY_ACTIVITY
Pre-aggregated daily summary per student. Used for the heatmap widget and streak calculation. One row per student per calendar date.

Attributes:
- student_id (FK → STUDENT.id)
- activity_date (DATE) — e.g. "2026-04-06"
- mcqs_attempted (INT)
- mcqs_correct (INT)

Primary Key: composite (student_id, activity_date)

Relationship: STUDENT (1) ——< DAILY_ACTIVITY (many)

---

### ENTITY 6: BOOKMARKS
Junction table. A student can bookmark any MCQ for later review.

Attributes:
- student_id (FK → STUDENT.id)
- mcq_id (FK → MCQ_BANK.id)
- created_at (TIMESTAMP)

Primary Key: composite (student_id, mcq_id)

Relationships:
- STUDENT (M) ——— BOOKMARKS ——— MCQ_BANK (N)

---

## Relationships Summary (for diagram):

1. STUDENT (1) to QUIZ_SESSION (many) — one student has many quiz sessions
2. QUIZ_SESSION (1) to QUIZ_RESPONSE (many) — one session has many responses
3. MCQ_BANK (1) to QUIZ_RESPONSE (many) — one MCQ appears in many responses
4. STUDENT (1) to DAILY_ACTIVITY (many) — one student has one row per day
5. STUDENT (M) to MCQ_BANK (N) via BOOKMARKS — many-to-many through junction table

## Notes for the diagram:
- Use crow's foot notation for cardinality
- Primary keys should be underlined
- Foreign keys should be labeled with FK
- Composite primary keys should be double-underlined or marked clearly
- QUIZ_RESPONSE is the central fact table — it connects sessions and MCQs
- BOOKMARKS is a pure junction/associative entity with no extra payload except created_at
