import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading details...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', gap: '12px' }}>
      <Loader2 className="animate-spin" size={28} style={{ color: 'var(--teal-600)', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {message}
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
