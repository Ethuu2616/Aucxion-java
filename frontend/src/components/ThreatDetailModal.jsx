import React from 'react';
import { X, MapPin, Clock, Tag, Zap, Lock, ShieldAlert, Fish, AlertTriangle, Wrench } from 'lucide-react';

const SEV_STYLE = {
  CRITICAL: { color: '#f85149', bg: 'rgba(248,81,73,0.1)',   border: 'rgba(248,81,73,0.25)'   },
  HIGH:     { color: '#f0883e', bg: 'rgba(240,136,62,0.1)',  border: 'rgba(240,136,62,0.25)'  },
  MEDIUM:   { color: '#d29922', bg: 'rgba(210,153,34,0.1)',  border: 'rgba(210,153,34,0.25)'  },
  LOW:      { color: '#3fb950', bg: 'rgba(63,185,80,0.1)',   border: 'rgba(63,185,80,0.25)'   },
};

const TYPE_META = {
  DDOS:       { icon: Zap,        color: '#f85149', label: 'DDoS Attack',         desc: 'A Distributed Denial of Service attack floods your system with traffic from multiple sources, exhausting network resources and causing service disruption or complete unavailability.' },
  RANSOMWARE: { icon: Lock,       color: '#bc8cff', label: 'Ransomware',          desc: 'Malicious software that encrypts your files and demands payment for the decryption key. Often spreads via phishing emails or unpatched vulnerabilities.' },
  ZERO_DAY:   { icon: ShieldAlert, color: '#d29922', label: 'Zero-Day Exploit',   desc: 'An attack exploiting an unknown or unpatched vulnerability. Detected through behavioral anomalies rather than known signatures — indicating a novel or advanced threat.' },
  PHISHING:   { icon: Fish,       color: '#58a6ff', label: 'Phishing Attack',     desc: 'A social engineering attack designed to steal credentials or deliver malware through deceptive links, fake domains, or manipulated system configurations.' },
};

const FIXES = {
  DDOS:       ['Block source IPs via firewall rules immediately', 'Enable rate limiting on all network interfaces', 'Contact your ISP for upstream traffic filtering', 'Close all non-essential open ports', 'Enable a DDoS mitigation service (Cloudflare, AWS Shield)'],
  RANSOMWARE: ['Disconnect the system from the network immediately', 'Do NOT pay the ransom — recovery is not guaranteed', 'Terminate all suspicious processes via Task Manager', 'Restore files from the most recent clean backup', 'Run a full antivirus scan in Safe Mode', 'Report the incident to CISA or local cybersecurity authority'],
  ZERO_DAY:   ['Isolate and terminate the suspicious process immediately', 'Revoke elevated privileges from affected user accounts', 'Enable verbose system and event logging', 'Apply all pending OS and software security patches', 'Enable application whitelisting to block unknown executables', 'Monitor all outbound network connections for anomalies'],
  PHISHING:   ['Do not click any suspicious links or open attachments', 'Block the malicious domain in your DNS or hosts file', 'Notify all users about the active phishing campaign', 'Enable multi-factor authentication on all critical accounts', 'Audit and remove unknown browser extensions', 'Report the phishing URL to Google Safe Browsing or PhishTank'],
};

export default function ThreatDetailModal({ threat, onClose }) {
  if (!threat) return null;
  const sev = SEV_STYLE[threat.severity] || SEV_STYLE.LOW;
  const meta = TYPE_META[threat.attackType] || TYPE_META.DDOS;
  const Icon = meta.icon;
  const fixes = FIXES[threat.attackType] || [];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={onClose}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)' }} />
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{
        position:'relative', width:'100%', maxWidth:620,
        background:'#161b22', border:'1px solid #30363d',
        borderRadius:12, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #21262d', background:'#1c2333' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{
                width:40, height:40, borderRadius:9,
                background: `rgba(${meta.color === '#f85149' ? '248,81,73' : meta.color === '#bc8cff' ? '188,140,255' : meta.color === '#d29922' ? '210,153,34' : '88,166,255'},0.12)`,
                border:`1px solid ${meta.color}33`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Icon size={19} style={{ color: meta.color }} strokeWidth={1.8} />
              </div>
              <div>
                <h2 style={{ fontSize:16, fontWeight:600, color:'#e6edf3', margin:0 }}>{meta.label}</h2>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                  <span style={{
                    fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20,
                    background: sev.bg, border:`1px solid ${sev.border}`, color: sev.color,
                  }}>{threat.severity}</span>
                  <span style={{ fontSize:11, color:'#8b949e' }}>ID #{threat.id}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#8b949e', padding:4, borderRadius:6 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:24, maxHeight:'65vh', overflowY:'auto', display:'flex', flexDirection:'column', gap:16 }}>

          {/* What is this attack */}
          <Section icon={AlertTriangle} title="About This Attack" iconColor="#d29922">
            <p style={{ fontSize:13, color:'#c9d1d9', lineHeight:1.7, margin:0 }}>{meta.desc}</p>
          </Section>

          {/* Detection info grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <InfoBox icon={MapPin} label="Source / Origin" iconColor="#3fb950">
              <p style={{ fontSize:13, color:'#3fb950', fontFamily:'monospace', wordBreak:'break-all', margin:0 }}>
                {threat.source || 'Unknown'}
              </p>
            </InfoBox>
            <InfoBox icon={Clock} label="Detected At" iconColor="#58a6ff">
              <p style={{ fontSize:13, color:'#e6edf3', margin:0 }}>{new Date(threat.detectedAt).toLocaleString()}</p>
            </InfoBox>
            <InfoBox icon={Tag} label="Current Status" iconColor="#8b949e">
              <span style={{
                fontSize:12, fontWeight:600, padding:'3px 9px', borderRadius:20,
                background: threat.status === 'ACTIVE' ? 'rgba(248,81,73,0.1)' : threat.status === 'RESOLVED' ? 'rgba(63,185,80,0.1)' : 'rgba(210,153,34,0.1)',
                border: `1px solid ${threat.status === 'ACTIVE' ? 'rgba(248,81,73,0.3)' : threat.status === 'RESOLVED' ? 'rgba(63,185,80,0.3)' : 'rgba(210,153,34,0.3)'}`,
                color: threat.status === 'ACTIVE' ? '#f85149' : threat.status === 'RESOLVED' ? '#3fb950' : '#d29922',
              }}>{threat.status}</span>
            </InfoBox>
            <InfoBox icon={Icon} label="Attack Category" iconColor={meta.color}>
              <p style={{ fontSize:13, fontWeight:600, color: meta.color, margin:0 }}>{threat.attackType}</p>
            </InfoBox>
          </div>

          {/* Detection details */}
          <Section icon={AlertTriangle} title="Detection Details" iconColor="#8b949e">
            <p style={{ fontSize:13, color:'#c9d1d9', lineHeight:1.7, margin:0, fontFamily:'monospace', background:'#0f1117', padding:'12px 14px', borderRadius:7, border:'1px solid #21262d' }}>
              {threat.description}
            </p>
          </Section>

          {/* Remediation */}
          <Section icon={Wrench} title="Recommended Actions" iconColor="#f0883e">
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {fixes.map((fix, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <span style={{
                    minWidth:22, height:22, borderRadius:6, background:'rgba(240,136,62,0.1)',
                    border:'1px solid rgba(240,136,62,0.2)', color:'#f0883e',
                    fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', marginTop:1,
                  }}>{i + 1}</span>
                  <p style={{ fontSize:13, color:'#c9d1d9', margin:0, lineHeight:1.6 }}>{fix}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, iconColor, children }) {
  return (
    <div style={{ background:'#1c2333', border:'1px solid #30363d', borderRadius:9, padding:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:12 }}>
        <Icon size={14} style={{ color: iconColor }} strokeWidth={2} />
        <p style={{ fontSize:12, fontWeight:600, color:'#8b949e', margin:0, textTransform:'uppercase', letterSpacing:'0.05em' }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

function InfoBox({ icon: Icon, label, iconColor, children }) {
  return (
    <div style={{ background:'#1c2333', border:'1px solid #30363d', borderRadius:9, padding:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
        <Icon size={12} style={{ color: iconColor }} strokeWidth={2} />
        <p style={{ fontSize:11, fontWeight:600, color:'#8b949e', margin:0, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>
      </div>
      {children}
    </div>
  );
}
