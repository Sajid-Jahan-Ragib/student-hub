import React from 'react';

export function ClassModal({ visible, classes, courseNameMap, onClose }) {
  return (
    <>
      {visible && <div className="modal-overlay active" onClick={onClose}></div>}
      <div
        className={`modal ${visible ? 'active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Today classes"
      >
        <div className="modal__header">
          <div className="modal__title-wrap">
            <h2 className="modal__title">Today&apos;s Classes</h2>
            <p className="modal__subtitle">
              {classes.length} class{classes.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <button className="modal__close" type="button" onClick={onClose} aria-label="Close modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <ul className="modal__list">
          {classes.length === 0 ? (
            <li className="modal__item modal__item--empty">No classes scheduled for today.</li>
          ) : (
            classes.map((classItem, index) => {
              const longName = courseNameMap[classItem.course];
              const displayName = longName ? `${longName} (${classItem.course})` : classItem.course;

              return (
                <li key={index} className="modal__item">
                  <article className="modal__item-card">
                    <div className="class-modal__head">
                      <p className="class-modal__title">{displayName}</p>
                      <span className="modal__chip">#{index + 1}</span>
                    </div>
                    <p className="class-modal__line">
                      <span className="class-modal__label">Time</span>
                      <span className="class-modal__value">{classItem.time || '-'}</span>
                    </p>
                    <p className="class-modal__line">
                      <span className="class-modal__label">Faculty</span>
                      <span className="class-modal__value">{classItem.fc || '-'}</span>
                    </p>
                    <p className="class-modal__line">
                      <span className="class-modal__label">Room</span>
                      <span className="class-modal__value">{classItem.room || '-'}</span>
                    </p>
                  </article>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </>
  );
}
