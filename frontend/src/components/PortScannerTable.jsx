import React from 'react';

const EXP = {
  HIGH:   { color:'#f85149', bg:'rgba(248,81,73,0.1)',   border:'rgba(248,81,73,0.25)'   },
  MEDIUM: { color:'#d29922', bg:'rgba(210,153,34,0.1)',  border:'rgba(210,153,34,0.25)'  },
  LOW:    { color:'#3fb950', bg:'rgba(63,185,80,0.1)',   border:'rgba(63,185,80,0.25)'   },
};

export default function PortScannerTable({ ports }) {
  if (!ports?.length) {
    return (
      <div style={{ textAlign:'center', padding:'48px 0' }}>
        <p style={{ color:'#8b949e', fontSize:14 }}>No port data available</p>
        <p style={{ color:'#484f58', fontSize:12, marginTop:4 }}>Click "Run Scan" to scan open ports</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ borderBottom:'1px solid #21262d' }}>
            {['Port','Service','Protocol','Status','Exposure','Risk Description'].map(h => (
              <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:600, color:'#8b949e', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ports.map(p => {
            const exp = EXP[p.exposureLevel] || EXP.LOW;
            return (
              <tr key={p.id} style={{ borderBottom:'1px solid #21262d', transition:'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1c2333'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding:'12px 12px' }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'#58a6ff', fontFamily:'monospace' }}>{p.portNumber}</span>
                </td>
                <td style={{ padding:'12px 12px', fontSize:13, color:'#e6edf3' }}>{p.serviceName}</td>
                <td style={{ padding:'12px 12px', fontSize:12, color:'#8b949e' }}>{p.protocol}</td>
                <td style={{ padding:'12px 12px' }}>
                  <span style={{
                    fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20,
                    background: p.open ? 'rgba(248,81,73,0.1)' : 'rgba(139,148,158,0.1)',
                    border: `1px solid ${p.open ? 'rgba(248,81,73,0.3)' : 'rgba(139,148,158,0.2)'}`,
                    color: p.open ? '#f85149' : '#8b949e',
                  }}>
                    {p.open ? 'Open' : 'Closed'}
                  </span>
                </td>
                <td style={{ padding:'12px 12px' }}>
                  <span style={{
                    fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20,
                    background: exp.bg, border:`1px solid ${exp.border}`, color: exp.color,
                  }}>{p.exposureLevel}</span>
                </td>
                <td style={{ padding:'12px 12px', fontSize:12, color:'#8b949e', maxWidth:280 }}>
                  <span title={p.riskDescription} style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>
                    {p.riskDescription}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
