import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '480px', margin: '0 auto' }}>
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--surface-alt)',
          color: 'var(--text-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Compass size={28} />
      </div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        The page or ledger resource you are looking for does not exist or has been removed.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
}
