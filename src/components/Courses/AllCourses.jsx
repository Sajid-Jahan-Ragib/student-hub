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

export function AllCourses() {
  const { courses, setCurrentScreen } = useAppContext();

  const courseList = courses?.courses || [];
  const semesterGroups = courseList.reduce((acc, course) => {
    if (!acc[course.semester]) {
      acc[course.semester] = [];
    }
    acc[course.semester].push(course);
    return acc;
  }, {});

  const getResultClass = (result) => {
    if (!result || result === '--') return '';
    return result === 'F' ? 'course-result--fail' : 'course-result--pass';
  };

  return (
    <div className="page-container">
      <TopBar title="All Courses" onBack={() => setCurrentScreen('home')} />

      <div className="page-content">
        <SectionTitle eyebrow="Course Catalog" title="All Available Courses" />

        {courseList.length === 0 ? (
          <EmptyState message="No courses available." />
        ) : (
          Object.entries(semesterGroups)
            .sort(([a], [b]) => compareSemesterDesc(a, b))
            .map(([semester, semesterCourses]) => (
              <section key={semester} className="semester-group">
                <div className="semester-group__head">
                  <h2 className="semester-group__title">{semester}</h2>
                  <p className="semester-group__count">{semesterCourses.length} Courses</p>
                </div>

                <div className="course-list">
                  {semesterCourses.map((course) => (
                    <article key={`${course.code}-${semester}`} className="course-item">
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
                          <p className="course-meta-chip__label">Result</p>
                          <p className={`course-meta-chip__value ${getResultClass(course.result)}`}>
                            {course.result || '--'}
                          </p>
                        </div>
                        <div className="course-meta-chip">
                          <p className="course-meta-chip__label">Take As</p>
                          <p className="course-meta-chip__value">{course.takeAs || 'Regular'}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
        )}
      </div>
    </div>
  );
}
