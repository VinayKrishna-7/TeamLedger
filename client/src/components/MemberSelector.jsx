import React from 'react';
import { Check, CheckSquare, Square } from 'lucide-react';
import { formatRupees } from '../utils/formatters.js';

export default function MemberSelector({
  members = [],
  selectedMemberIds = [],
  onChange,
  amountInRupees = 0,
}) {
  const allSelected = members.length > 0 && selectedMemberIds.length === members.length;
  const count = selectedMemberIds.length;

  const handleToggle = (id) => {
    if (selectedMemberIds.includes(id)) {
      onChange(selectedMemberIds.filter((mId) => mId !== id));
    } else {
      onChange([...selectedMemberIds, id]);
    }
  };

  const handleSelectAll = () => {
    onChange(members.map((m) => m._id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Live split estimate
  const amountMinor = Math.round((parseFloat(amountInRupees) || 0) * 100);
  const shareMinor = count > 0 ? Math.floor(amountMinor / count) : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Participants Sharing This Expense ({count}/{members.length})
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={allSelected ? handleClearAll : handleSelectAll}
            className="btn btn-secondary btn-sm"
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
          >
            {allSelected ? 'Clear All' : 'Select All'}
          </button>
        </div>
      </div>

      {amountMinor > 0 && count > 0 && (
        <div
          style={{
            fontSize: '0.82rem',
            color: 'var(--teal-700)',
            backgroundColor: 'var(--teal-50)',
            border: '1px solid var(--teal-200)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '10px',
            fontWeight: 500,
          }}
        >
          Each participant pays approximately <strong className="num">{formatRupees(shareMinor)}</strong>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '8px',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          backgroundColor: 'var(--surface-color)',
        }}
      >
        {members.map((member) => {
          const isSelected = selectedMemberIds.includes(member._id);
          return (
            <label
              key={member._id}
              onClick={(e) => {
                e.preventDefault();
                handleToggle(member._id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isSelected ? 'var(--teal-50)' : 'var(--surface-alt)',
                border: `1px solid ${isSelected ? 'var(--teal-200)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  border: `1px solid ${isSelected ? 'var(--teal-600)' : 'var(--border-color)'}`,
                  backgroundColor: isSelected ? 'var(--teal-600)' : 'var(--surface-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                {isSelected && <Check size={12} strokeWidth={3} />}
              </div>
              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--teal-800)' : 'var(--text-primary)',
                }}
              >
                {member.name}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
