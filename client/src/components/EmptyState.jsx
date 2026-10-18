import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, description, actionText, actionLink, onAction }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-icon">
          <Icon size={24} />
        </div>
      )}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-desc">{description}</p>}
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionText}
        </Link>
      )}
      {actionText && !actionLink && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
}
