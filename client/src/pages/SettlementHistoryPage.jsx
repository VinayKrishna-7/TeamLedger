import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { settlementService } from '../services/settlementService.js';
import { groupService } from '../services/groupService.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import SettlementModal from '../components/SettlementModal.jsx';
import { formatRupees, formatDate } from '../utils/formatters.js';

export default function SettlementHistoryPage() {
  const { groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupRes, setRes, balRes] = await Promise.all([
        groupService.getGroupById(groupId),
        settlementService.getGroupSettlements(groupId),
        settlementService.getBalances(groupId),
      ]);
      setGroup(groupRes.data);
      setSettlements(setRes.data);
      setBalances(balRes.data.balances || []);
    } catch (err) {
      setError(err.message || 'Failed to load settlement history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [groupId]);

  if (loading) return <LoadingSpinner message="Loading settlements..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          <span>Back to {group?.name || 'Group'} Ledger</span>
        </Link>
      </div>

      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">Completed Settlements</h1>
          <p className="page-subtitle">
            Historical record of all settled repayments in {group?.name}.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={15} />
          <span>Record Payment</span>
        </button>
      </div>

      {settlements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            No settlements have been recorded in this group yet.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Paid By (Debtor)</th>
                <th>Received By (Creditor)</th>
                <th>Note</th>
                <th style={{ textAlign: 'right' }}>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
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
      )}

      <SettlementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        group={group}
        balances={balances}
        onRecordSettlement={async (data) => {
          await settlementService.recordSettlement(groupId, data);
          loadData();
        }}
      />
    </div>
  );
}
