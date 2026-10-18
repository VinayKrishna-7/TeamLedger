import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, ArrowRight, Clock, Receipt } from 'lucide-react';
import { dashboardService } from '../services/dashboardService.js';
import GroupCard from '../components/GroupCard.jsx';
import ExpenseCard from '../components/ExpenseCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatRupees } from '../utils/formatters.js';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardService.getSummary();
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your ledgers..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboard} />;
  }

  const {
    totalSpendingMinor = 0,
    totalUnsettledDebtMinor = 0,
    groupCount = 0,
    recentExpenses = [],
    groups = [],
  } = data || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Track shared expenses and settle balances.</p>
        </div>
        <Link to="/groups/new" className="btn btn-primary">
          <Plus size={15} />
          <span>New Group</span>
        </Link>
      </div>

      <div className="stat-bar">
        <div className="stat-item">
          <span className="stat-label">Total Spent</span>
          <span className="stat-value num">{formatRupees(totalSpendingMinor)}</span>
        </div>
        <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-subtle)' }} />
        <div className="stat-item">
          <span className="stat-label">Pending Settlements</span>
          <span
            className="stat-value num"
            style={{ color: totalUnsettledDebtMinor > 0 ? 'var(--amber-700)' : 'var(--green-700)' }}
          >
            {totalUnsettledDebtMinor > 0 ? formatRupees(totalUnsettledDebtMinor) : 'All Settled'}
          </span>
        </div>
        <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-subtle)' }} />
        <div className="stat-item">
          <span className="stat-label">Active Groups</span>
          <span className="stat-value">{groupCount}</span>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create your first group for a trip, flatmates, or project to begin tracking shared expenses."
          actionText="Create A Group"
          actionLink="/groups/new"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Your Groups
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {groups.map((group) => (
                <GroupCard key={group._id} group={group} />
              ))}
            </div>
          </div>

          {recentExpenses.length > 0 && (
            <div className="card" style={{ padding: '16px 20px' }}>
              <div className="card-header" style={{ marginBottom: '8px' }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} style={{ color: 'var(--text-muted)' }} />
                  <span>Recent Expenses</span>
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentExpenses.slice(0, 5).map((expense) => (
                  <ExpenseCard key={expense._id} expense={expense} showGroupName={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
