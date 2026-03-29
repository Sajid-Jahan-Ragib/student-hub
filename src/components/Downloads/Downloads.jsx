import React from 'react';
import { TopBar, SectionTitle, EmptyState } from '../Common/index';
import { useAppContext } from '../../hooks/useAppContext';

export function Downloads() {
  const { downloads, setCurrentScreen } = useAppContext();

  return (
    <div className="page-container">
      <TopBar title="Downloads" onBack={() => setCurrentScreen('home')} />

      <div className="page-content">
        <SectionTitle eyebrow="Resource Library" title="Download Course Materials" />

        {downloads.length === 0 ? (
          <EmptyState message="No downloads available." />
        ) : (
          downloads.map((download, index) => (
            <article key={index} className="semester-card" style={{ cursor: 'pointer' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}
              >
                <div>
                  <h2 className="semester-card__term" style={{ marginBottom: '8px' }}>
                    {download.title}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--fs-2)',
                      color: 'var(--muted)',
                    }}
                  >
                    {download.category} • {new Date(download.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                  download
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
