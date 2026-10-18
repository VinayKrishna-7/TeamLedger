import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import { groupService } from '../services/groupService.js';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function EditGroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const res = await groupService.getGroupById(groupId);
        setName(res.data.name || '');
        setDescription(res.data.description || '');
      } catch (err) {
        setError(err.message || 'Failed to fetch group details');
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await groupService.updateGroup(groupId, {
        name: name.trim(),
        description: description.trim(),
      });
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.message || 'Failed to update group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      setIsDeleting(true);
      await groupService.deleteGroup(groupId);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to delete group');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading group..." />;

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
          <span>Back to Group Ledger</span>
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Edit Group Settings
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Update group name or description.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-name">
              Group Name *
            </label>
            <input
              id="edit-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-desc">
              Description
            </label>
            <textarea
              id="edit-desc"
              rows={3}
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <Link to={`/groups/${groupId}`} className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div
        className="card"
        style={{
          borderColor: 'var(--red-200)',
          backgroundColor: 'var(--red-50)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--red-700)' }}>
              Delete Group
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Permanently remove this group, along with all its recorded expenses and settlements.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn btn-sm btn-danger"
          >
            <Trash2 size={14} />
            <span>Delete Group</span>
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Entire Group?"
        message={`Are you sure you want to delete "${name}"? This action is permanent and will cascade delete all expenses and settlement records in this group.`}
        confirmText="Yes, Delete Group"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteGroup}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
