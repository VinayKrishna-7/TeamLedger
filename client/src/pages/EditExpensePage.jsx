import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { groupService } from '../services/groupService.js';
import { expenseService } from '../services/expenseService.js';
import ExpenseForm from '../components/ExpenseForm.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function EditExpensePage() {
  const { groupId, expenseId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const expRes = await expenseService.getExpenseById(expenseId);
        const currentExp = expRes.data;
        setExpense(currentExp);

        const targetGroupId = groupId || currentExp.groupId;
        const groupRes = await groupService.getGroupById(targetGroupId);
        setGroup(groupRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load expense details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId, expenseId]);

  const handleSubmit = async (expenseData) => {
    try {
      setIsSubmitting(true);
      setError('');
      await expenseService.updateExpense(expenseId, expenseData);
      navigate(`/groups/${group?._id || groupId}`);
    } catch (err) {
      setError(err.message || 'Failed to update expense');
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading expense details..." />;

  const targetGroupId = group?._id || groupId;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to={`/groups/${targetGroupId}`}
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
          Edit Expense
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Modify details or participant shares for "{expense?.title}".
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {expense && group && (
        <ExpenseForm
          group={group}
          initialValues={expense}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
          onCancel={() => navigate(`/groups/${targetGroupId}`)}
        />
      )}
    </div>
  );
}
