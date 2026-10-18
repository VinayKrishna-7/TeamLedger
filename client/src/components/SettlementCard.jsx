import React from 'react';
import { ArrowRight, CheckCheck, IndianRupee } from 'lucide-react';
import { formatRupees } from '../utils/formatters.js';

export default function SettlementCard({ transfer, onRecordSettlement }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 18px',
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--red-50)',
              border: '1px solid var(--red-200)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--red-700)',
            }}
          >
            {transfer.fromMemberName}
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>pays</span>
          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--green-50)',
              border: '1px solid var(--green-200)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--green-700)',
            }}
          >
            {transfer.toMemberName}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="num" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {formatRupees(transfer.amountMinor)}
        </div>
        {onRecordSettlement && (
          <button
            type="button"
            onClick={() => onRecordSettlement(transfer)}
            className="btn btn-sm btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCheck size={14} />
            <span>Mark as Paid</span>
          </button>
        )}
      </div>
    </div>
  );
}
