import React from 'react';
import { TopBar, SectionTitle, EmptyState } from '../Common/index';
import { useAppContext } from '../../hooks/useAppContext';

export function Attendance() {
  const { attendance, setCurrentScreen } = useAppContext();

  const getAttendanceStatus = (percentage) => {
    const value = Number(percentage);
    if (!Number.isFinite(value)) return 'mid';
    if (value >= 80) return 'high';
    if (value >= 60) return 'mid';
    return 'low';
  };

  return (
    <div className="page-container">
      <TopBar title="Attendance" onBack={() => setCurrentScreen('home')} />

      <div className="page-content">
        {attendance.length === 0 ? (
          <EmptyState message="Sorry, you've no Attendance details." />
        ) : (
          <>
            <SectionTitle eyebrow="Course Attendance" title="Your Attendance Records" />
            {attendance.map((record, index) => (
              <article key={index} className="semester-card">
                <div className="attendance-card__head">
                  <h2 className="semester-card__term attendance-card__term">{record.course}</h2>
                  <span
                    className={`result-badge result-badge--${getAttendanceStatus(record.percentage)}`}
                  >
                    {record.percentage}%
                  </span>
                </div>

                <div
                  className="attendance-bar"
                  aria-label={`Attendance progress ${record.percentage}%`}
                >
                  <div
                    className={`attendance-bar__fill attendance-bar__fill--${getAttendanceStatus(record.percentage)}`}
                    style={{
                      width: `${Math.max(0, Math.min(100, Number(record.percentage) || 0))}%`,
                    }}
                  ></div>
                </div>

                <div className="fees-table">
                  <p className="fees-row">
                    <span>Present</span>
                    <span>{record.present}</span>
                  </p>
                  <p className="fees-row">
                    <span>Absent</span>
                    <span>{record.absent}</span>
                  </p>
                  <p className="fees-row">
                    <span>Percentage</span>
                    <span
                      className={`attendance-percent attendance-percent--${getAttendanceStatus(record.percentage)}`}
                    >
                      {record.percentage}%
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
