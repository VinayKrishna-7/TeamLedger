import React from 'react';

export default function SummaryCard({ label, value, subtext, icon: Icon, color = 'teal' }) {
  const colorMap = {
    teal: { bg: 'var(--teal-50)', color: 'var(--teal-700)', border: 'var(--teal-200)' },
    green: { bg: 'var(--green-50)', color: 'var(--green-700)', border: 'var(--green-200)' },
    red: { bg: 'var(--red-50)', color: 'var(--red-700)', border: 'var(--red-200)' },
    amber: { bg: 'var(--amber-50)', color: 'var(--amber-700)', border: 'var(--amber-200)' },
  };

  const scheme = colorMap[color] || colorMap.teal;

  return (
    <div className="summary-card">
      <div className="summary-card-top">
        <span className="summary-label">{label}</span>
        {Icon && (
          <div
            className="summary-icon"
            style={{
              backgroundColor: scheme.bg,
              color: scheme.color,
              border: `1px solid ${scheme.border}`,
            }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>
      <div>
        <div className="summary-value num">{value}</div>
        {subtext && <div className="summary-subtext">{subtext}</div>}
      </div>
    </div>
  );
}
