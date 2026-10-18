import React, { useState, useEffect } from 'react';
import MemberSelector from './MemberSelector.jsx';
import { EXPENSE_CATEGORIES } from '../utils/constants.js';

export default function ExpenseForm({
  group,
  initialValues = null,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save Expense',
  onCancel,
}) {
  const members = group?.members || [];

  const [title, setTitle] = useState(initialValues?.title || '');
  const [amount, setAmount] = useState(
    initialValues ? (initialValues.amountMinor / 100).toString() : ''
  );
  const [payerId, setPayerId] = useState(
    initialValues?.paidByMemberId?.toString() || (members[0]?._id?.toString() || '')
  );
  const [participantIds, setParticipantIds] = useState(
    initialValues?.participantShares
      ? initialValues.participantShares.map((p) => p.memberId.toString())
      : members.map((m) => m._id.toString())
  );
  const [category, setCategory] = useState(initialValues?.category || 'Food');
  const [date, setDate] = useState(
    initialValues?.date
      ? new Date(initialValues.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState(initialValues?.note || '');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (members.length > 0 && !payerId) {
      setPayerId(members[0]._id.toString());
    }
    if (members.length > 0 && (!participantIds || participantIds.length === 0)) {
      setParticipantIds(members.map((m) => m._id.toString()));
    }
  }, [members]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter an expense title');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter an amount greater than zero');
      return;
    }

    if (!payerId) {
      setFormError('Select who paid');
      return;
    }

    if (!participantIds || participantIds.length === 0) {
      setFormError('Select at least one participant sharing this expense');
      return;
    }

    onSubmit({
      title: title.trim(),
      amount: numAmount,
      payerId,
      participantIds,
      category,
      date,
      note: note.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {formError && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {formError}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="expense-title">
          Description
        </label>
        <input
          id="expense-title"
          type="text"
          className="form-input"
          placeholder="e.g. Dinner, Taxi, Groceries"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="expense-amount">
            Amount (INR)
          </label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              ₹
            </span>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0.01"
              className="form-input num"
              style={{ paddingLeft: '26px' }}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="expense-category">
            Category
          </label>
          <select
            id="expense-category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="expense-payer">
            Paid by
          </label>
          <select
            id="expense-payer"
            className="form-select"
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            required
          >
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="expense-date">
            Date
          </label>
          <input
            id="expense-date"
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <MemberSelector
          members={members}
          selectedMemberIds={participantIds}
          onChange={setParticipantIds}
          amountInRupees={amount}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="expense-note">
          Notes (optional)
        </label>
        <textarea
          id="expense-note"
          rows={2}
          className="form-textarea"
          placeholder="Add details, payment reference, etc."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
