CREATE TYPE fee_status AS ENUM ('ok', 'due');
CREATE TYPE sgpa_band AS ENUM ('high', 'mid', 'low');

CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  program TEXT NOT NULL,
  intake TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  gender TEXT,
  blood_group TEXT,
  admission_semester TEXT,
  avatar TEXT,
  avatar_small TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  semester TEXT NOT NULL,
  type TEXT NOT NULL,
  credits DOUBLE PRECISION NOT NULL,
  intake TEXT,
  section TEXT,
  result TEXT,
  take_as TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX courses_code_semester_section_key
  ON courses(code, semester, section);
CREATE INDEX courses_semester_idx ON courses(semester);

CREATE TABLE pending_courses (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  credits DOUBLE PRECISION NOT NULL,
  reason TEXT,
  status TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX pending_courses_status_idx ON pending_courses(status);

CREATE TABLE present_courses (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  credits DOUBLE PRECISION NOT NULL,
  instructor TEXT,
  status TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX present_courses_status_idx ON present_courses(status);

CREATE TABLE fees (
  id TEXT PRIMARY KEY,
  semester TEXT NOT NULL,
  demand INTEGER NOT NULL,
  waiver INTEGER NOT NULL,
  paid INTEGER NOT NULL,
  status fee_status NOT NULL,
  status_text TEXT,
  status_amount INTEGER NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX fees_semester_key ON fees(semester);

CREATE TABLE calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date_text TEXT NOT NULL,
  tag_type TEXT NOT NULL,
  tag_text TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX calendar_events_start_date_idx ON calendar_events(start_date);

CREATE TABLE downloads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX downloads_date_idx ON downloads(date);

CREATE TABLE attendance (
  id TEXT PRIMARY KEY,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  present INTEGER NOT NULL,
  absent INTEGER NOT NULL,
  percentage DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX attendance_course_code_idx ON attendance(course_code);

CREATE TABLE results (
  id TEXT PRIMARY KEY,
  semester TEXT NOT NULL,
  sgpa DOUBLE PRECISION NOT NULL,
  cgpa DOUBLE PRECISION NOT NULL,
  sgpa_grade sgpa_band NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX results_semester_key ON results(semester);

CREATE TABLE routine_semesters (
  id TEXT PRIMARY KEY,
  semester TEXT NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX routine_semesters_semester_key ON routine_semesters(semester);

CREATE TABLE routine_entries (
  id TEXT PRIMARY KEY,
  routine_semester_id TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  course_code TEXT NOT NULL,
  faculty_code TEXT NOT NULL,
  room TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT routine_entries_semester_id_fkey
    FOREIGN KEY (routine_semester_id)
    REFERENCES routine_semesters(id)
    ON DELETE CASCADE
);

CREATE INDEX routine_entries_semester_id_idx ON routine_entries(routine_semester_id);

CREATE TABLE marks_semesters (
  id TEXT PRIMARY KEY,
  semester TEXT NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX marks_semesters_semester_key ON marks_semesters(semester);

CREATE TABLE mark_subjects (
  id TEXT PRIMARY KEY,
  marks_semester_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  mark INTEGER,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT mark_subjects_semester_id_fkey
    FOREIGN KEY (marks_semester_id)
    REFERENCES marks_semesters(id)
    ON DELETE CASCADE
);

CREATE INDEX mark_subjects_semester_id_idx ON mark_subjects(marks_semester_id);
CREATE UNIQUE INDEX mark_subjects_semester_code_key
  ON mark_subjects(marks_semester_id, code);
