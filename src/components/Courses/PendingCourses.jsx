import React from 'react';
import { TopBar, SectionTitle, EmptyState } from '../Common/index';
import { useAppContext } from '../../hooks/useAppContext';

export function PendingCourses() {
  const { pendingCourses, setCurrentScreen } = useAppContext();

  return (
    <div className="page-container">
      <TopBar title="Pending Courses" onBack={() => setCurrentScreen('home')} />

      <div className="page-content">
        <SectionTitle eyebrow="Course Status" title="Courses to Complete" />

        {pendingCourses.length === 0 ? (
          <EmptyState message="No pending courses. Great job!" />
        ) : (
          pendingCourses.map((course, index) => (
            <article key={index} className="semester-card">
              <div className="pending-course__head">
                <h2 className="semester-card__term pending-course__title">{course.name}</h2>
                <span className="pending-course__code">{course.code}</span>
              </div>
              <p className="pending-course__line">
                <span className="pending-course__label">Reason: </span>
                <span className="pending-course__value">{course.reason}</span>
              </p>
              <p className="pending-course__line">
                <span className="pending-course__label">Credits: </span>
                <span className="pending-course__value">{course.credits}</span>
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
