import React from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  ShoppingCart,
  Film,
  Zap,
  Receipt,
} from 'lucide-react';
import { formatRupees, formatDate } from '../utils/formatters.js';

const CATEGORY_ICONS = {
  Food: Utensils,
  Transport: Car,
  Accommodation: Home,
  Shopping: ShoppingBag,
  Groceries: ShoppingCart,
  Entertainment: Film,
  Utilities: Zap,
  Other: Receipt,
};

export default function ExpenseCard({ expense, showGroupName = true }) {
  const IconComponent = CATEGORY_ICONS[expense.category] || Receipt;
  const participantCount = expense.participantShares ? expense.participantShares.length : 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background-color 0.12s ease',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="category-avatar" style={{ width: '32px', height: '32px' }}>
          <IconComponent size={15} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to={`/expenses/${expense._id}`}
              style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}
            >
              {expense.title}
            </Link>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{expense.paidByName || 'Member'}</span>
            <span>paid</span>
            <span>•</span>
            <span>{formatDate(expense.date)}</span>
            {showGroupName && expense.groupName && (
              <>
                <span>•</span>
                <span style={{ color: 'var(--teal-700)', fontWeight: 500 }}>{expense.groupName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div className="num" style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
          {formatRupees(expense.amountMinor)}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {participantCount} {participantCount === 1 ? 'person' : 'people'}
        </div>
      </div>
    </div>
  );
}
