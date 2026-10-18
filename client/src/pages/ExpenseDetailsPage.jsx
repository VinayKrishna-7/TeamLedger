import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, User, Tag, FileText } from 'lucide-react';
import { expenseService } from '../services/expenseService.js';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatRupees, formatDate } from '../utils/formatters.js';

export default function ExpenseDetailsPage() {
  const { expenseId } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const res = await expenseService.getExpenseById(expenseId);
        setExpense(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load expense details');
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [expenseId]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await expenseService.deleteExpense(expenseId);
      navigate(`/groups/${expense.groupId}`);
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading expense details..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => navigate(-1)} />;
  if (!expense) return null;

  const shares = expense.participantShares || [];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to={`/groups/${expense.groupId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Group Ledger</span>
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '18px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-neutral">{expense.category}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {formatDate(expense.date)}
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {expense.title}
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="num" style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--teal-700)' }}>
              {formatRupees(expense.amountMinor)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Paid by <strong>{expense.paidByName}</strong>
            </div>
          </div>
        </div>

        {expense.note && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--surface-alt)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '22px',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <FileText size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--text-muted)' }} />
            <div>{expense.note}</div>
          </div>
        )}

        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Participant Shares ({shares.length})
          </h2>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th style={{ textAlign: 'right' }}>Share Amount</th>
                  <th style={{ textAlign: 'right' }}>Split %</th>
                </tr>
              </thead>
              <tbody>
                {shares.map((share, idx) => {
                  const pct = expense.amountMinor > 0
                    ? ((share.shareAmountMinor / expense.amountMinor) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>
                        {share.memberName || 'Member'}
                        {share.memberId?.toString() === expense.paidByMemberId?.toString() && (
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '0.72rem',
                              backgroundColor: 'var(--teal-50)',
                              color: 'var(--teal-700)',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--teal-200)',
                            }}
                          >
                            Payer
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }} className="num">
                        <strong>{formatRupees(share.shareAmountMinor)}</strong>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn btn-sm btn-outline-danger"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={14} />
            <span>Delete Expense</span>
          </button>

          <Link
            to={`/groups/${expense.groupId}/expenses/${expense._id}/edit`}
            className="btn btn-sm btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit2 size={14} />
            <span>Edit Expense</span>
          </Link>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Expense?"
        message={`Are you sure you want to delete "${expense.title}"? This will update group balances and settlement calculations immediately.`}
        confirmText="Delete Expense"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
