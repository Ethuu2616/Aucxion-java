import React from 'react';
import { Zap, Lock, ShieldAlert, Fish } from 'lucide-react';

const META = {
  DDOS:       { label: 'DDoS',       sub: 'Network Flood',        icon: Zap,        color: '#f85149', bg: 'rgba(248,81,73,0.08)',   border: 'rgba(248,81,73,0.2)'   },
  RANSOMWARE: { label: 'Ransomware', sub: 'File Encryption',      icon: Lock,       color: '#bc8cff', bg: 'rgba(188,140,255,0.08)', border: 'rgba(188,140,255,0.2)' },
  ZERO_DAY:   { label: 'Zero-Day',   sub: 'Unknown Exploit',      icon: ShieldAlert, color: '#d29922', bg: 'rgba(210,153,34,0.08)',  border: 'rgba(210,153,34,0.2)'  },
  PHISHING:   { label: 'Phishing',   sub: 'Social Engineering',   icon: Fish,       color: '#58a6ff', bg: 'rgba(88,166,255,0.08)',  border: 'rgba(88,166,255,0.2)'  },
};

export default function AttackCard({ type, count }) {
  const m = META[type] || META.DDOS;
  const Icon = m.icon;
  const hasThreats = count > 0;

  return (
    <div style={{
      background: hasThreats ? m.bg : '#1c2333',
      border: `1px solid ${hasThreats ? m.border : '#30363d'}`,
      borderRadius: '10px',
      padding: '16px',
      transition: 'all 0.2s ease',
    }}>
      <div className="flex items-start justify-between mb-3">
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: m.bg, border: `1px solid ${m.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={17} style={{ color: m.color }} strokeWidth={2} />
        </div>
        {hasThreats && (
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
            background: m.bg, border: `1px solid ${m.border}`, color: m.color
          }}>DETECTED</span>
        )}
      </div>
      <p style={{ fontSize: 28, fontWeight: 700, color: hasThreats ? m.color : '#e6edf3', lineHeight: 1, marginBottom: 4 }}>
        {count ?? 0}
      </p>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>{m.label}</p>
      <p style={{ fontSize: 11, color: '#8b949e' }}>{m.sub}</p>
    </div>
  );
}
