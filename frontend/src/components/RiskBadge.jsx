import React from 'react';

const S = {
  CRITICAL: { color: '#f85149', bg: 'rgba(248,81,73,0.1)',   border: 'rgba(248,81,73,0.3)'   },
  HIGH:     { color: '#f0883e', bg: 'rgba(240,136,62,0.1)',  border: 'rgba(240,136,62,0.3)'  },
  MEDIUM:   { color: '#d29922', bg: 'rgba(210,153,34,0.1)',  border: 'rgba(210,153,34,0.3)'  },
  LOW:      { color: '#3fb950', bg: 'rgba(63,185,80,0.1)',   border: 'rgba(63,185,80,0.3)'   },
  SAFE:     { color: '#3fb950', bg: 'rgba(63,185,80,0.1)',   border: 'rgba(63,185,80,0.3)'   },
  UNKNOWN:  { color: '#8b949e', bg: 'rgba(139,148,158,0.1)', border: 'rgba(139,148,158,0.3)' },
};

export default function RiskBadge({ level, large }) {
  const s = S[level] || S.UNKNOWN;
  return (
    <span style={{
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 6, fontWeight: 600,
      padding: large ? '6px 14px' : '3px 8px',
      fontSize: large ? 13 : 11,
      letterSpacing: '0.03em',
    }}>
      {level || 'UNKNOWN'}
    </span>
  );
}
