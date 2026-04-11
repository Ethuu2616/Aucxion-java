import React, { useState } from 'react';
import { CheckCircle2, Eye, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { threatApi } from '../api/aucxionApi';
import ThreatDetailModal from './ThreatDetailModal';

const SEV = {
  CRITICAL: { color:'#f85149', bg:'rgba(248,81,73,0.1)',   border:'rgba(248,81,73,0.25)'   },
  HIGH:     { color:'#f0883e', bg:'rgba(240,136,62,0.1)',  border:'rgba(240,136,62,0.25)'  },
  MEDIUM:   { color:'#d29922', bg:'rgba(210,153,34,0.1)',  border:'rgba(210,153,34,0.25)'  },
  LOW:      { color:'#3fb950', bg:'rgba(63,185,80,0.1)',   border:'rgba(63,185,80,0.25)'   },
};

const TYPE_COLOR = {
  DDOS:'#f85149', RANSOMWARE:'#bc8cff', ZERO_DAY:'#d29922', PHISHING:'#58a6ff'
};

export default function ThreatTable({ threats, onResolve }) {
  const [selected, setSelected] = useState(null);

  const handleResolve = async (e, id) => {
    e.stopPropagation();
    try {
      await threatApi.resolve(id);
      toast.success('Threat marked as resolved');
      onResolve?.();
    } catch { toast.error('Failed to resolve threat'); }
  };

  if (!threats?.length) {
    return (
      <div style={{ textAlign:'center', padding:'48px 0' }}>
        <CheckCircle2 size={36} style={{ color:'rgba(63,185,80,0.4)', margin:'0 auto 12px' }} />
        <p style={{ color:'#8b949e', fontSize:14 }}>No threats detected</p>
        <p style={{ color:'#484f58', fontSize:12, marginTop:4 }}>Run a scan to check your system</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #21262d' }}>
              {['Type','Severity','Description','Source','Detected','Status',''].map(h => (
                <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:600, color:'#8b949e', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {threats.map(t => {
              const s = SEV[t.severity] || SEV.LOW;
              return (
                <tr key={t.id} onClick={() => setSelected(t)}
                  style={{ borderBottom:'1px solid #21262d', cursor:'pointer', transition:'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1c2333'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding:'12px 12px' }}>
                    <span style={{ fontSize:12, fontWeight:700, color: TYPE_COLOR[t.attackType] || '#e6edf3' }}>
                      {t.attackType}
                    </span>
                  </td>
                  <td style={{ padding:'12px 12px' }}>
                    <span style={{
                      fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20,
                      background: s.bg, border:`1px solid ${s.border}`, color: s.color,
                    }}>{t.severity}</span>
                  </td>
                  <td style={{ padding:'12px 12px', maxWidth:240 }}>
                    <p style={{ fontSize:13, color:'#c9d1d9', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
                      title={t.description}>{t.description}</p>
                  </td>
                  <td style={{ padding:'12px 12px', maxWidth:140 }}>
                    <p style={{ fontSize:12, color:'#3fb950', fontFamily:'monospace', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
                      title={t.source}>{t.source}</p>
                  </td>
                  <td style={{ padding:'12px 12px', whiteSpace:'nowrap' }}>
                    <p style={{ fontSize:12, color:'#8b949e', margin:0 }}>{new Date(t.detectedAt).toLocaleString()}</p>
                  </td>
                  <td style={{ padding:'12px 12px' }}>
                    {t.status === 'ACTIVE'
                      ? <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:'rgba(248,81,73,0.1)', border:'1px solid rgba(248,81,73,0.25)', color:'#f85149' }}>Active</span>
                      : <span style={{ fontSize:11, color:'#8b949e' }}>{t.status}</span>
                    }
                  </td>
                  <td style={{ padding:'12px 12px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={e => { e.stopPropagation(); setSelected(t); }}
                        style={{ padding:'5px 8px', borderRadius:6, background:'rgba(88,166,255,0.08)', border:'1px solid rgba(88,166,255,0.2)', color:'#58a6ff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
                        <Eye size={12} /> View
                      </button>
                      {t.status === 'ACTIVE' && (
                        <button onClick={e => handleResolve(e, t.id)}
                          style={{ padding:'5px 8px', borderRadius:6, background:'rgba(63,185,80,0.08)', border:'1px solid rgba(63,185,80,0.2)', color:'#3fb950', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
                          <ShieldOff size={12} /> Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selected && <ThreatDetailModal threat={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
