import React from 'react';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2, User } from 'lucide-react';
import { formatRupees } from '../utils/formatters.js';

export default function BalanceList({ balances = [], onRecordSettlement }) {
  if (!balances || balances.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
        No member balances calculated yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {balances.map((member) => {
        const net = member.netBalanceMinor;
        const isCreditor = net > 0;
        const isDebtor = net < 0;
        const isSettled = net === 0;

        return (
          <div
            key={member.memberId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color 0.12s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isCreditor
                    ? 'var(--green-50)'
                    : isDebtor
                    ? 'var(--red-50)'
                    : 'var(--surface-alt)',
                  border: `1px solid ${
                    isCreditor
                      ? 'var(--green-200)'
                      : isDebtor
                      ? 'var(--red-200)'
                      : 'var(--border-color)'
                  }`,
                  color: isCreditor
                    ? 'var(--green-700)'
                    : isDebtor
                    ? 'var(--red-700)'
                    : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isCreditor && <ArrowDownLeft size={18} />}
                {isDebtor && <ArrowUpRight size={18} />}
                {isSettled && <CheckCircle2 size={18} />}
              </div>

              <div>
                <div style={{ fontWeight: 600, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                  {member.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '10px' }}>
                  <span>Paid: <strong className="num">{formatRupees(member.paidExpensesMinor)}</strong></span>
                  <span>•</span>
                  <span>Share: <strong className="num">{formatRupees(member.owedSharesMinor)}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                className="num"
                style={{
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: isCreditor
                    ? 'var(--green-700)'
                    : isDebtor
                    ? 'var(--red-700)'
                    : 'var(--text-muted)',
                }}
              >
                {isCreditor ? `+${formatRupees(net)}` : formatRupees(net)}
              </div>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {isCreditor && <span style={{ color: 'var(--green-700)' }}>Gets back</span>}
                {isDebtor && <span style={{ color: 'var(--red-700)' }}>Owes group</span>}
                {isSettled && <span style={{ color: 'var(--text-muted)' }}>Settled up</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
