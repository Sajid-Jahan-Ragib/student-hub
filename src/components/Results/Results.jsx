import React from 'react';
import { TopBar, SectionTitle, EmptyState } from '../Common/index';
import { useAppContext } from '../../hooks/useAppContext';

export function Results() {
  const { results, setCurrentScreen } = useAppContext();

  return (
    <div className="page-container">
      <TopBar title="Results" onBack={() => setCurrentScreen('home')} />

      <div className="page-content">
        <SectionTitle eyebrow="Academic Performance" title="Summary Results" />

        {results.length === 0 ? (
          <EmptyState message="No results available." />
        ) : (
          results.map((result, index) => (
            <article key={index} className="semester-card">
              <h2 className="semester-card__term">{result.semester}</h2>
              <div className="semester-card__stats">
                <p className="result-item">
                  <span className="result-item__label">SGPA</span>
                  <span className={`result-badge result-badge--${result.sgpaGrade || 'mid'}`}>
                    {result.sgpa}
                  </span>
                </p>
                <p className="result-item">
                  <span className="result-item__label">CGPA</span>
                  <span className={`result-badge result-badge--${result.sgpaGrade || 'mid'}`}>
                    {result.cgpa}
                  </span>
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
