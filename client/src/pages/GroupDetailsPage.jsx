import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Receipt,
  ArrowRightLeft,
  Plus,
  Settings,
  Search,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Edit,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { groupService } from '../services/groupService.js';
import { expenseService } from '../services/expenseService.js';
import { settlementService } from '../services/settlementService.js';
import ExpenseTable from '../components/ExpenseTable.jsx';
import BalanceList from '../components/BalanceList.jsx';
import SettlementCard from '../components/SettlementCard.jsx';
import SettlementModal from '../components/SettlementModal.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatRupees, formatDate } from '../utils/formatters.js';
import { EXPENSE_CATEGORIES } from '../utils/constants.js';

export default function GroupDetailsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  // 3 simple, focused views: 'expenses' | 'balances' | 'members'
  const [activeTab, setActiveTab] = useState('expenses');
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlementPlan, setSettlementPlan] = useState(null);
  const [settlementsHistory, setSettlementsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Settlement modal
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementPrefill, setSettlementPrefill] = useState(null);

  // Expense deletion
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);

  // Member management
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [editMemberNameVal, setEditMemberNameVal] = useState('');
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberActionError, setMemberActionError] = useState('');

  const fetchAllGroupData = async () => {
    try {
      setLoading(true);
      setError('');

      const [groupRes, expRes, planRes, setRes] = await Promise.all([
        groupService.getGroupById(groupId),
        expenseService.getGroupExpenses(groupId, {
          search: searchQuery,
          category: selectedCategory,
          sort: selectedSort,
        }),
        settlementService.getSettlementPlan(groupId),
        settlementService.getGroupSettlements(groupId),
      ]);

      setGroup(groupRes.data);
      setExpenses(expRes.data);
      setSettlementPlan(planRes.data);
      setSettlementsHistory(setRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllGroupData();
  }, [groupId, selectedCategory, selectedSort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFilteredExpenses();
  };

  const fetchFilteredExpenses = async () => {
    try {
      const expRes = await expenseService.getGroupExpenses(groupId, {
        search: searchQuery,
        category: selectedCategory,
        sort: selectedSort,
      });
      setExpenses(expRes.data);
    } catch (err) {
      setError(err.message || 'Failed to filter expenses');
    }
  };

  const handleRecordSettlementClick = (transfer = null) => {
    setSettlementPrefill(transfer);
    setIsSettlementModalOpen(true);
  };

  const handleSaveSettlement = async (settlementData) => {
    await settlementService.recordSettlement(groupId, settlementData);
    setSuccessMessage('Payment recorded successfully!');
    setTimeout(() => setSuccessMessage(''), 3500);
    fetchAllGroupData();
  };

  const handleDeleteExpenseConfirm = async () => {
    if (!expenseToDelete) return;
    try {
      setIsDeletingExpense(true);
      await expenseService.deleteExpense(expenseToDelete._id);
      setSuccessMessage('Expense deleted');
      setTimeout(() => setSuccessMessage(''), 3500);
      setExpenseToDelete(null);
      fetchAllGroupData();
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    } finally {
      setIsDeletingExpense(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberActionError('');
    if (!newMemberName.trim()) return;

    try {
      await groupService.addMember(groupId, newMemberName.trim());
      setNewMemberName('');
      setIsAddMemberOpen(false);
      setSuccessMessage(`Member "${newMemberName.trim()}" added`);
      setTimeout(() => setSuccessMessage(''), 3500);
      fetchAllGroupData();
    } catch (err) {
      setMemberActionError(err.message);
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    setMemberActionError('');
    if (!editMemberNameVal.trim() || !memberToEdit) return;

    try {
      await groupService.updateMember(groupId, memberToEdit._id, editMemberNameVal.trim());
      setMemberToEdit(null);
      setEditMemberNameVal('');
      setSuccessMessage('Member renamed');
      setTimeout(() => setSuccessMessage(''), 3500);
      fetchAllGroupData();
    } catch (err) {
      setMemberActionError(err.message);
    }
  };

  const handleDeleteMemberConfirm = async () => {
    if (!memberToDelete) return;
    try {
      setMemberActionError('');
      await groupService.deleteMember(groupId, memberToDelete._id);
      setSuccessMessage(`Member "${memberToDelete.name}" removed`);
      setTimeout(() => setSuccessMessage(''), 3500);
      setMemberToDelete(null);
      fetchAllGroupData();
    } catch (err) {
      setMemberActionError(err.message);
      setMemberToDelete(null);
    }
  };

  if (loading && !group) {
    return <LoadingSpinner message="Loading group..." />;
  }

  if (error && !group) {
    return <ErrorMessage message={error} onRetry={fetchAllGroupData} />;
  }

  const balances = group?.memberBalances || [];
  const transfers = settlementPlan?.transfers || [];
  const totalSpendingMinor = group?.totalSpendingMinor || 0;
  const totalUnsettledDebtMinor = group?.totalUnsettledDebtMinor || 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <Link
          to="/"
          style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 500 }}
        >
          ← All Groups
        </Link>
        <Link
          to={`/groups/${groupId}/edit`}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <Settings size={13} />
          <span>Edit Group</span>
        </Link>
      </div>

      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">{group.name}</h1>
          <p className="page-subtitle">
            {group.description || `${group.members.length} members sharing expenses`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleRecordSettlementClick()}
            className="btn btn-secondary"
          >
            <ArrowRightLeft size={14} />
            <span>Settle Up</span>
          </button>
          <Link
            to={`/groups/${groupId}/expenses/new`}
            className="btn btn-primary"
          >
            <Plus size={15} />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {memberActionError && (
        <div className="alert alert-error">
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{memberActionError}</span>
        </div>
      )}

      <div className="stat-bar" style={{ marginBottom: '20px' }}>
        <div className="stat-item">
          <span className="stat-label">Total Spent</span>
          <span className="stat-value num">{formatRupees(totalSpendingMinor)}</span>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)' }} />
        <div className="stat-item">
          <span className="stat-label">Pending Settlements</span>
          <span
            className="stat-value num"
            style={{ color: totalUnsettledDebtMinor > 0 ? 'var(--amber-700)' : 'var(--green-700)' }}
          >
            {totalUnsettledDebtMinor > 0 ? formatRupees(totalUnsettledDebtMinor) : 'All Settled'}
          </span>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)' }} />
        <div className="stat-item">
          <span className="stat-label">Members</span>
          <span className="stat-value">{group.members.length}</span>
        </div>
      </div>

      <div className="tabs-nav" style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
        >
          <Receipt size={14} />
          <span>Expenses ({expenses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={`tab-btn ${activeTab === 'balances' ? 'active' : ''}`}
        >
          <ArrowRightLeft size={14} />
          <span>Balances & Settlements {transfers.length > 0 && `(${transfers.length})`}</span>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
        >
          <Users size={14} />
          <span>Members ({group.members.length})</span>
        </button>
      </div>

      {activeTab === 'expenses' && (
        <div>
          <div
            className="card"
            style={{
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '200px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className="form-input"
                  style={{ paddingLeft: '30px', fontSize: '0.84rem', padding: '7px 10px 7px 30px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '5px 8px', fontSize: '0.82rem' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ width: 'auto', padding: '5px 8px', fontSize: '0.82rem' }}
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>
            </div>
          </div>

          {expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses recorded"
              description="Click Add Expense to record the first shared bill."
              actionText="Add Expense"
              actionLink={`/groups/${groupId}/expenses/new`}
            />
          ) : (
            <ExpenseTable
              expenses={expenses}
              onEdit={(exp) => navigate(`/groups/${groupId}/expenses/${exp._id}/edit`)}
              onDelete={(exp) => setExpenseToDelete(exp)}
            />
          )}
        </div>
      )}

      {activeTab === 'balances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Member Balances
            </h2>
            <BalanceList balances={balances} onRecordSettlement={handleRecordSettlementClick} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Suggested Settlements
              </h2>
              <button
                onClick={() => handleRecordSettlementClick()}
                className="btn btn-secondary btn-sm"
              >
                Record Custom Payment
              </button>
            </div>

            {transfers.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px 18px' }}>
                <CheckCircle2 size={28} style={{ color: 'var(--green-600)', margin: '0 auto 8px auto' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>All Settled Up</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  No pending debts in this group.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {transfers.map((t, idx) => (
                  <SettlementCard
                    key={idx}
                    transfer={t}
                    onRecordSettlement={handleRecordSettlementClick}
                  />
                ))}
              </div>
            )}
          </div>

          {settlementsHistory.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Payment History ({settlementsHistory.length})
              </h2>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Paid By</th>
                      <th>Received By</th>
                      <th>Note</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlementsHistory.map((s) => (
                      <tr key={s._id}>
                        <td style={{ color: 'var(--text-secondary)' }}>{formatDate(s.date)}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--red-700)' }}>
                            {s.paidByName}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--green-700)' }}>
                            {s.receivedByName}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {s.note || 'Direct payment'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="num" style={{ fontWeight: 700, color: 'var(--teal-700)' }}>
                            {formatRupees(s.amountMinor)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Group Members ({group.members.length})
            </h2>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <UserPlus size={13} />
              <span>Add Member</span>
            </button>
          </div>

          {isAddMemberOpen && (
            <form onSubmit={handleAddMember} className="card" style={{ marginBottom: '16px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter member name"
                  className="form-input"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  autoFocus
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {memberToEdit && (
            <div className="modal-overlay" onClick={() => setMemberToEdit(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>
                  Rename Member
                </h3>
                <form onSubmit={handleUpdateMember}>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-input"
                      value={editMemberNameVal}
                      onChange={(e) => setEditMemberNameVal(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setMemberToEdit(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th style={{ textAlign: 'right' }}>Total Paid</th>
                  <th style={{ textAlign: 'right' }}>Expense Share</th>
                  <th style={{ textAlign: 'right' }}>Net Balance</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {group.members.map((member) => {
                  const b = balances.find((bal) => bal.memberId === member._id.toString()) || {
                    paidExpensesMinor: 0,
                    owedSharesMinor: 0,
                    netBalanceMinor: 0,
                  };
                  const isCreditor = b.netBalanceMinor > 0;
                  const isDebtor = b.netBalanceMinor < 0;

                  return (
                    <tr key={member._id}>
                      <td style={{ fontWeight: 600 }}>{member.name}</td>
                      <td style={{ textAlign: 'right' }} className="num">
                        {formatRupees(b.paidExpensesMinor)}
                      </td>
                      <td style={{ textAlign: 'right' }} className="num">
                        {formatRupees(b.owedSharesMinor)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span
                          className="num"
                          style={{
                            fontWeight: 700,
                            color: isCreditor
                              ? 'var(--green-700)'
                              : isDebtor
                              ? 'var(--red-700)'
                              : 'var(--text-muted)',
                          }}
                        >
                          {isCreditor ? `+${formatRupees(b.netBalanceMinor)}` : formatRupees(b.netBalanceMinor)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setMemberToEdit(member);
                              setEditMemberNameVal(member.name);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 6px' }}
                            title="Rename"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => setMemberToDelete(member)}
                            className="btn btn-outline-danger btn-sm"
                            style={{ padding: '3px 6px' }}
                            title="Remove"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        group={group}
        balances={balances}
        prefill={settlementPrefill}
        onRecordSettlement={handleSaveSettlement}
      />

      <ConfirmationModal
        isOpen={!!expenseToDelete}
        title="Delete Expense?"
        message={`Delete "${expenseToDelete?.title}" (${formatRupees(expenseToDelete?.amountMinor || 0)})?`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={isDeletingExpense}
        onConfirm={handleDeleteExpenseConfirm}
        onCancel={() => setExpenseToDelete(null)}
      />

      <ConfirmationModal
        isOpen={!!memberToDelete}
        title={`Remove ${memberToDelete?.name}?`}
        message={`Are you sure you want to remove "${memberToDelete?.name}"? Members with recorded expenses cannot be removed.`}
        confirmText="Remove"
        confirmVariant="danger"
        onConfirm={handleDeleteMemberConfirm}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
}
