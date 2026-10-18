import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { groupService } from '../services/groupService.js';
import { expenseService } from '../services/expenseService.js';
import ExpenseForm from '../components/ExpenseForm.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function AddExpensePage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const res = await groupService.getGroupById(groupId);
        setGroup(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load group');
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  const handleSubmit = async (expenseData) => {
    try {
      setIsSubmitting(true);
      setError('');
      await expenseService.createExpense(groupId, expenseData);
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.message || 'Failed to save expense');
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading group members..." />;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to={`/groups/${groupId}`}
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
          <span>Back to {group?.name || 'Group'}</span>
        </Link>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Add Shared Expense
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Record a shared bill or payment for {group?.name}.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <ExpenseForm
        group={group}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Record Expense"
        onCancel={() => navigate(`/groups/${groupId}`)}
      />
    </div>
  );
}
