import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { formatRupees } from '../utils/formatters.js';

export default function GroupCard({ group }) {
  const members = group.members || [];
  const memberCount = group.memberCount || members.length || 0;
  const expenseCount = group.expenseCount || 0;
  const totalSpendingMinor = group.totalSpendingMinor || 0;
  const totalUnsettledDebtMinor = group.totalUnsettledDebtMinor || 0;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 20px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px', gap: '8px' }}>
          <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            <Link to={`/groups/${group._id}`} style={{ color: 'inherit' }}>
              {group.name}
            </Link>
          </h3>
          <span className="badge badge-teal" style={{ flexShrink: 0 }}>
            <Users size={12} />
            <span>{memberCount}</span>
          </span>
        </div>

        {group.description && (
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
            {group.description}
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            backgroundColor: 'var(--surface-alt)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '14px',
            marginTop: group.description ? 0 : '10px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Spent
            </div>
            <div className="num" style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {formatRupees(totalSpendingMinor)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Balance
            </div>
            <div
              className="num"
              style={{
                fontSize: '0.94rem',
                fontWeight: 700,
                color: totalUnsettledDebtMinor > 0 ? 'var(--amber-700)' : 'var(--green-700)',
                marginTop: '2px',
              }}
            >
              {totalUnsettledDebtMinor > 0 ? formatRupees(totalUnsettledDebtMinor) : 'Settled'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
          {members.slice(0, 4).map((m) => (
            <span
              key={m._id}
              style={{
                fontSize: '0.74rem',
                backgroundColor: 'var(--surface-alt)',
                border: '1px solid var(--border-color)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
              }}
            >
              {m.name}
            </span>
          ))}
          {members.length > 4 && (
            <span
              style={{
                fontSize: '0.74rem',
                backgroundColor: 'var(--surface-alt)',
                border: '1px solid var(--border-color)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-muted)',
              }}
            >
              +{members.length - 4}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
        </span>
        <Link to={`/groups/${group._id}`} className="btn btn-sm btn-secondary">
          <span>Open Ledger</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
