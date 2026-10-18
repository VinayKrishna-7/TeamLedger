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
  Edit2,
  Trash2,
  Eye,
  User,
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

export default function ExpenseTable({ expenses, onEdit, onDelete, showGroupName = false }) {
  if (!expenses || expenses.length === 0) {
    return null;
  }

  return (
    <div className="expense-ledger">
      {expenses.map((exp) => {
        const IconComponent = CATEGORY_ICONS[exp.category] || Receipt;
        const participantCount = exp.participantShares ? exp.participantShares.length : 0;
        const perPerson = participantCount > 0 ? Math.round(exp.amountMinor / participantCount) : exp.amountMinor;

        const dateObj = new Date(exp.date);
        const day = dateObj.toLocaleDateString('en-IN', { day: 'numeric' });
        const month = dateObj.toLocaleDateString('en-IN', { month: 'short' });

        return (
          <div key={exp._id} className="expense-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="date-badge">
                <span className="date-month">{month}</span>
                <span className="date-day">{day}</span>
              </div>

              <div className="category-avatar">
                <IconComponent size={17} />
              </div>

              <div>
                <Link to={`/expenses/${exp._id}`} className="expense-title-link">
                  {exp.title}
                </Link>
                <div className="expense-meta">
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {exp.paidByName || 'Member'}
                  </span>
                  <span>paid</span>
                  <span>•</span>
                  <span>split across {participantCount} {participantCount === 1 ? 'person' : 'people'}</span>
                  {showGroupName && exp.groupName && (
                    <>
                      <span>•</span>
                      <span style={{ color: 'var(--teal-700)', fontWeight: 600 }}>{exp.groupName}</span>
                    </>
                  )}
                  {exp.note && (
                    <>
                      <span>•</span>
                      <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>"{exp.note}"</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div className="num expense-amount-display">
                  {formatRupees(exp.amountMinor)}
                </div>
                {participantCount > 1 && (
                  <div className="num expense-per-person">
                    {formatRupees(perPerson)} / person
                  </div>
                )}
              </div>

              <div className="expense-actions">
                <Link
                  to={`/expenses/${exp._id}`}
                  className="row-action-btn"
                  title="View Details"
                >
                  <Eye size={14} />
                </Link>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(exp)}
                    className="row-action-btn"
                    title="Edit Expense"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(exp)}
                    className="row-action-btn row-action-danger"
                    title="Delete Expense"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
