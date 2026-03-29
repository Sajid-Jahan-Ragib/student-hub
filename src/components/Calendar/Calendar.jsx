import React from 'react';
import { TopBar, SectionTitle, EmptyState } from '../Common/index';
import { useAppContext } from '../../hooks/useAppContext';

export function Calendar() {
  const { calendarEvents, setCurrentScreen } = useAppContext();

  const getTagClass = (tagType) => {
    if (!tagType) return 'calendar-tag';
    return `calendar-tag calendar-tag--${tagType}`;
  };

  const getDurationLabel = (start, end) => {
    if (!start || !end) return 'Date not available';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (Number.isNaN(diff) || diff <= 0) return 'Date not available';
    return `${diff} day${diff > 1 ? 's' : ''}`;
  };

  return (
    <div className="page-container">
      <TopBar title="Calendar" onBack={() => setCurrentScreen('home')} />

      <div className="page-content">
        <SectionTitle eyebrow="Academic Calendar" title="Important Dates & Events" />

        {calendarEvents.length === 0 ? (
          <EmptyState message="No calendar events available." />
        ) : (
          <div className="calendar-list">
            {calendarEvents.map((event, index) => (
              <article key={`${event.title}-${index}`} className="calendar-entry">
                <div className="calendar-entry__head">
                  <h2 className="calendar-entry__title">{event.title}</h2>
                  <p className={getTagClass(event.tagType)}>{event.tagText}</p>
                </div>

                <p className="calendar-entry__date">{event.dateText}</p>
                <p className="calendar-entry__meta">{getDurationLabel(event.start, event.end)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
