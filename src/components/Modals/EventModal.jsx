import React from 'react';

export function EventModal({ visible, events, onClose }) {
  return (
    <>
      {visible && <div className="modal-overlay active" onClick={onClose}></div>}
      <div
        className={`modal ${visible ? 'active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Running events today"
      >
        <div className="modal__header">
          <div className="modal__title-wrap">
            <h2 className="modal__title">Running Events Today</h2>
            <p className="modal__subtitle">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="modal__close" type="button" onClick={onClose} aria-label="Close modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <ul className="modal__list">
          {events.length === 0 ? (
            <li className="modal__item modal__item--empty">No events running today.</li>
          ) : (
            events.map((event, index) => (
              <li key={index} className="modal__item">
                <article className="modal__item-card">
                  <div className="event-modal__head">
                    <p className="event-modal__title">{event.title || 'Untitled Event'}</p>
                    <span className="modal__chip">#{index + 1}</span>
                  </div>
                  <p className="event-modal__line">
                    <span className="event-modal__label">Date Range</span>
                    <span className="event-modal__value">{event.dateText || '-'}</span>
                  </p>
                  <p
                    className={`event-modal__tag ${event.tagType === 'examination' ? 'event-modal__tag--danger' : 'event-modal__tag--success'}`}
                  >
                    {event.tagText || event.tagType || 'Event'}
                  </p>
                </article>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}
