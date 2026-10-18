import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { groupService } from '../services/groupService.js';

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState(['', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const removeMemberField = (index) => {
    if (members.length <= 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a group name');
      return;
    }

    const cleanedMembers = members.map((m) => m.trim()).filter((m) => m.length > 0);

    if (cleanedMembers.length === 0) {
      setError('Please add at least one member name');
      return;
    }

    const seen = new Set();
    for (const m of cleanedMembers) {
      const lower = m.toLowerCase();
      if (seen.has(lower)) {
        setError(`"${m}" is listed more than once. Member names must be unique.`);
        return;
      }
      seen.add(lower);
    }

    try {
      setIsSubmitting(true);
      const res = await groupService.createGroup({
        name: name.trim(),
        description: description.trim(),
        memberNames: cleanedMembers,
      });
      navigate(`/groups/${res.data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto' }}>
      <div style={{ marginBottom: '18px' }}>
        <Link
          to="/"
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
          <span>Dashboard</span>
        </Link>
      </div>

      <div className="card">
        <div style={{ marginBottom: '18px' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            New Group
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Create a shared expense ledger and add participants.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '18px' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="group-name">
              Name
            </label>
            <input
              id="group-name"
              type="text"
              className="form-input"
              placeholder="e.g. Trip to Kerala, Flat Bills"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="group-desc">
              Description (optional)
            </label>
            <input
              id="group-desc"
              type="text"
              className="form-input"
              placeholder="What is this group for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label">
              Members
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {members.map((member, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Member ${index + 1}`}
                    value={member}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMemberField(index)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '7px 9px', color: 'var(--text-muted)' }}
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addMemberField}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '10px' }}
            >
              <Plus size={13} />
              <span>Add member</span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
