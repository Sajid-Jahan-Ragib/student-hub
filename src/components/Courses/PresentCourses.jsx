import React from 'react';
import { TopBar, SectionTitle, EmptyState } from '../Common/index';
import { useAppContext } from '../../hooks/useAppContext';

const SEMESTER_ORDER = {
  WINTER: 0,
  SPRING: 1,
  SUMMER: 2,
  FALL: 3,
  AUTUMN: 3,
};

function parseSemester(semesterText = '') {
  const raw = String(semesterText).trim();
  const match = raw.match(/^([A-Za-z]+)\s*,?\s*(\d{4})$/);

  if (!match) {
    return { year: -1, termRank: -1 };
  }

  return {
    year: Number(match[2]),
    termRank: SEMESTER_ORDER[match[1].toUpperCase()] ?? -1,
  };
}

function compareSemesterDesc(a, b) {
  const left = parseSemester(a);
  const right = parseSemester(b);

  if (left.year !== right.year) {
    return right.year - left.year;
  }

  return right.termRank - left.termRank;
}

export function PresentCourses() {
  const { courses, setCurrentScreen } = useAppContext();

  const courseList = Array.isArray(courses?.courses) ? courses.courses : [];
  const semesterList = [
    ...new Set(courseList.map((course) => course.semester).filter(Boolean)),
  ].sort(compareSemesterDesc);
  const latestSemester = semesterList[0] || '';
  const presentCourses = latestSemester
    ? courseList.filter((course) => course.semester === latestSemester)
    : [];

  return (
    <div className="page-container">
      <TopBar title="Present Courses" onBack={() => setCurrentScreen('home')} />

      <div className="page-content">
        <SectionTitle
          eyebrow="Current Semester"
          title={latestSemester ? `Your Active Courses (${latestSemester})` : 'Your Active Courses'}
        />

        {presentCourses.length === 0 ? (
          <EmptyState message="No active courses at the moment." />
        ) : (
          <div className="course-list">
            {presentCourses.map((course) => (
              <article key={`${course.code}-${course.semester}`} className="course-item">
                <div className="course-item__head">
                  <h3 className="course-item__name">{course.name}</h3>
                  <p className="course-item__code">{course.code}</p>
                </div>

                <div className="course-meta-grid">
                  <div className="course-meta-chip">
                    <p className="course-meta-chip__label">Type</p>
                    <p className="course-meta-chip__value">{course.type || 'Theory'}</p>
                  </div>
                  <div className="course-meta-chip">
                    <p className="course-meta-chip__label">Credit</p>
                    <p className="course-meta-chip__value">{course.credits}</p>
                  </div>
                  <div className="course-meta-chip">
                    <p className="course-meta-chip__label">Intake</p>
                    <p className="course-meta-chip__value">{course.intake || '-'}</p>
                  </div>
                  <div className="course-meta-chip">
                    <p className="course-meta-chip__label">Section</p>
                    <p className="course-meta-chip__value">{course.section || '-'}</p>
                  </div>
                  <div className="course-meta-chip">
                    <p className="course-meta-chip__label">Semester</p>
                    <p className="course-meta-chip__value">{course.semester || '-'}</p>
                  </div>
                  <div className="course-meta-chip">
                    <p className="course-meta-chip__label">Take As</p>
                    <p className="course-meta-chip__value">{course.takeAs || 'Regular'}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
