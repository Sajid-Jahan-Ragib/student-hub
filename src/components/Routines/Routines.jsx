import React from 'react';
import { TopBar, SectionTitle, EmptyState } from '../Common/index';
import { useAppContext } from '../../hooks/useAppContext';
import { formatCourseLabel, sortRoutineEntries } from '../../utils/dateUtils';

export function Routines() {
  const { routines, routinesSemester, courses, setCurrentScreen } = useAppContext();

  const courseNameMap = courses?.courseNameMap || {};
  const sortedRoutines = sortRoutineEntries(routines || []);

  return (
    <div className="page-container">
      <TopBar title="Routines" onBack={() => setCurrentScreen('home')} />

      <div className="page-content">
        <SectionTitle
          eyebrow="Weekly Schedule"
          title={`Class Routine: ${routinesSemester || ''}`}
        />

        {sortedRoutines.length === 0 ? (
          <EmptyState message="No class routine available." />
        ) : (
          sortedRoutines.map((routine, index) => (
            <article key={index} className="routine-card">
              <div className="routine-card__head">
                <h2 className="routine-card__course">
                  {formatCourseLabel(routine.course, courseNameMap)}
                </h2>
                <p className="routine-card__day">{routine.day}</p>
              </div>
              <div className="routine-card__meta">
                <p className="routine-line">
                  <span>Time</span>
                  <span>{routine.time}</span>
                </p>
                <p className="routine-line">
                  <span>FC</span>
                  <span>{routine.fc}</span>
                </p>
                <p className="routine-line">
                  <span>Room</span>
                  <span>{routine.room}</span>
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
