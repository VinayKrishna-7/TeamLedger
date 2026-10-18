import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { formatRupees } from '../utils/formatters.js';

export default function SettlementModal({
  isOpen,
  onClose,
  group,
  balances = [],
  prefill = null,
  onRecordSettlement,
}) {
  const [payerId, setPayerId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const members = group?.members || [];
  const debtors = balances.filter((b) => b.netBalanceMinor < 0);
  const creditors = balances.filter((b) => b.netBalanceMinor > 0);

  useEffect(() => {
    if (prefill) {
      setPayerId(prefill.fromMemberId || '');
      setReceiverId(prefill.toMemberId || '');
      setAmount(prefill.amountMinor ? (prefill.amountMinor / 100).toString() : '');
      setNote('');
    } else {
      if (debtors.length > 0) setPayerId(debtors[0].memberId);
      if (creditors.length > 0) setReceiverId(creditors[0].memberId);
      setAmount('');
      setNote('');
    }
    setError('');
  }, [prefill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!payerId) {
      setError('Select who paid');
      return;
    }
    if (!receiverId) {
      setError('Select who received the payment');
      return;
    }
    if (payerId === receiverId) {
      setError('Payer and receiver cannot be the same person');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      await onRecordSettlement({
        paidByMemberId: payerId,
        receivedByMemberId: receiverId,
        amount: numAmount,
        date,
        note: note.trim(),
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Could not record payment');
    }
  };

  const selectedDebtor = balances.find((b) => b.memberId === payerId);
  const maxOwedMinor = selectedDebtor && selectedDebtor.netBalanceMinor < 0
    ? Math.abs(selectedDebtor.netBalanceMinor)
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Record Payment
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Document cash or transfer made between members.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '14px', fontSize: '0.84rem' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="settle-payer">
              From (payer)
            </label>
            <select
              id="settle-payer"
              className="form-select"
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              required
            >
              <option value="">Select member</option>
              {members.map((m) => {
                const b = balances.find((bal) => bal.memberId === m._id.toString());
                const debt = b && b.netBalanceMinor < 0 ? ` (Owes ${formatRupees(Math.abs(b.netBalanceMinor))})` : '';
                return (
                  <option key={m._id} value={m._id}>
                    {m.name} {debt}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settle-receiver">
              To (receiver)
            </label>
            <select
              id="settle-receiver"
              className="form-select"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              required
            >
              <option value="">Select member</option>
              {members.map((m) => {
                const b = balances.find((bal) => bal.memberId === m._id.toString());
                const cred = b && b.netBalanceMinor > 0 ? ` (Owed ${formatRupees(b.netBalanceMinor)})` : '';
                return (
                  <option key={m._id} value={m._id}>
                    {m.name} {cred}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="settle-amount">
                Amount (INR)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  ₹
                </span>
                <input
                  id="settle-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input num"
                  style={{ paddingLeft: '24px' }}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              {maxOwedMinor > 0 && (
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Max: {formatRupees(maxOwedMinor)}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settle-date">
                Date
              </label>
              <input
                id="settle-date"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settle-note">
              Note (optional)
            </label>
            <input
              id="settle-note"
              type="text"
              className="form-input"
              placeholder="e.g. UPI, cash, bank transfer"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
            >
              {isSubmitting ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
