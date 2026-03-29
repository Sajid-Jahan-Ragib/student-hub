import React from 'react';
import { TopBar, SectionTitle, EmptyState } from '../Common/index';
import { useAppContext } from '../../hooks/useAppContext';
import { formatCurrency } from '../../utils/dataParser';
import { sortFeesEntries } from '../../utils/dateUtils';

export function Fees() {
  const { fees, setCurrentScreen } = useAppContext();
  const sortedFees = sortFeesEntries(fees);

  const getStatusClass = (status) => (String(status || '').toLowerCase() === 'due' ? 'due' : 'ok');

  return (
    <div className="page-container">
      <TopBar title="Fees & Waivers" onBack={() => setCurrentScreen('home')} />

      <div className="page-content">
        <SectionTitle
          eyebrow="Financial Overview"
          title="Summary Reports of Tuition Fees & Waivers"
        />

        {sortedFees.length === 0 ? (
          <EmptyState message="No fees information available." />
        ) : (
          sortedFees.map((fee, index) => (
            <article key={index} className="semester-card fees-card">
              <h2 className="semester-card__term">{fee.semester}</h2>
              <div className="fees-table">
                <p className="fees-row">
                  <span className="fees-row__label">Demand</span>
                  <span className="fees-row__value">{formatCurrency(fee.demand)}</span>
                </p>
                <p className="fees-row">
                  <span className="fees-row__label">Waiver</span>
                  <span className="fees-row__value">{formatCurrency(fee.waiver)}</span>
                </p>
                <p className="fees-row">
                  <span className="fees-row__label">Paid</span>
                  <span className="fees-row__value">{formatCurrency(fee.paid)}</span>
                </p>
                <p className={`fees-row fees-row--status fees-row--${getStatusClass(fee.status)}`}>
                  <span className="fees-row__label">
                    {fee.statusText || (getStatusClass(fee.status) === 'due' ? 'Due' : 'Paid')}
                  </span>
                  <span className="fees-row__value">{formatCurrency(fee.statusAmount)}</span>
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
