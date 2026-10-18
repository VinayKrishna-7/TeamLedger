import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, CheckCircle2, Plus } from 'lucide-react';
import { settlementService } from '../services/settlementService.js';
import { groupService } from '../services/groupService.js';
import SettlementCard from '../components/SettlementCard.jsx';
import SettlementModal from '../components/SettlementModal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatRupees } from '../utils/formatters.js';

export default function SettlementPlanPage() {
  const { groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPrefill, setModalPrefill] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const loadPlan = async () => {
    try {
      setLoading(true);
      const [groupRes, planRes] = await Promise.all([
        groupService.getGroupById(groupId),
        settlementService.getSettlementPlan(groupId),
      ]);
      setGroup(groupRes.data);
      setPlan(planRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load settlement plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [groupId]);

  const handleRecordPayment = (transfer) => {
    setModalPrefill(transfer);
    setIsModalOpen(true);
  };

  const handleSaveSettlement = async (data) => {
    await settlementService.recordSettlement(groupId, data);
    setSuccessMsg('Settlement recorded successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
    loadPlan();
  };

  if (loading) return <LoadingSpinner message="Calculating settlement plan..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadPlan} />;

  const transfers = plan?.transfers || [];

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
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
          <h1 className="page-title">Settlement Plan</h1>
          <p className="page-subtitle">
            Calculated transfers to settle all group debts with minimal payments.
          </p>
        </div>

        <button
          onClick={() => {
            setModalPrefill(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={15} />
          <span>Record Payment</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '18px' }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div
        className="card"
        style={{
          marginBottom: '22px',
          backgroundColor: 'var(--surface-alt)',
          borderColor: 'var(--border-color)',
          fontSize: '0.86rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
          Simplified Debt Settlement
        </div>
        <p style={{ lineHeight: 1.45 }}>
          Debts are netted out across the group so you only make direct payments to clear remaining balances.
        </p>
      </div>

      {transfers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <CheckCircle2 size={36} style={{ color: 'var(--green-600)', margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>All Debts Fully Settled!</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            No one in this group owes anything.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {transfers.map((t, index) => (
            <SettlementCard
              key={index}
              transfer={t}
              onRecordSettlement={handleRecordPayment}
            />
          ))}
        </div>
      )}

      <SettlementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        group={group}
        balances={plan?.balances || []}
        prefill={modalPrefill}
        onRecordSettlement={handleSaveSettlement}
      />
    </div>
  );
}
