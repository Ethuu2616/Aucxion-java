import React, { useState, useEffect } from 'react';
import { AlertOctagon, Lightbulb, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { threatApi } from '../api/aucxionApi';
import ThreatTable from '../components/ThreatTable';

const TABS = ['ALL', 'DDOS', 'RANSOMWARE', 'ZERO_DAY', 'PHISHING'];
const TAB_ACTIVE = { DDOS:'#f85149', RANSOMWARE:'#bc8cff', ZERO_DAY:'#d29922', PHISHING:'#58a6ff', ALL:'#58a6ff' };
const PRIORITY_COLOR = { CRITICAL:'#f85149', HIGH:'#f0883e', MEDIUM:'#d29922' };

export default function ThreatDetails() {
  const [threats, setThreats]       = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [activeTab, setActiveTab]   = useState('ALL');
  const [loading, setLoading]       = useState(true);

  const fetchData = async () => {
    try {
      const [tRes, sRes] = await Promise.all([threatApi.getAll(), threatApi.getAllSuggestions()]);
      setThreats(tRes.data);
      setSuggestions(sRes.data);
    } catch { toast.error('Failed to load threat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleClear = async () => {
    if (!window.confirm('Clear all threat logs? This cannot be undone.')) return;
    try { await threatApi.clear(); toast.success('Threat logs cleared'); setThreats([]); }
    catch { toast.error('Failed to clear logs'); }
  };

  const filtered = activeTab === 'ALL' ? threats : threats.filter(t => t.attackType === activeTab);
  const activeSuggestions = activeTab !== 'ALL' ? (suggestions[activeTab] || []) : [];

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600, color:'#e6edf3', margin:0 }}>Threat Intelligence</h1>
          <p style={{ fontSize:13, color:'#8b949e', margin:'4px 0 0' }}>Full threat log with detailed analysis and fix guidance</p>
        </div>
        <button onClick={handleClear} style={{
          display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:7,
          background:'rgba(248,81,73,0.06)', border:'1px solid rgba(248,81,73,0.2)',
          color:'#f85149', fontSize:13, fontWeight:500, cursor:'pointer',
        }}>
          <Trash2 size={14} /> Clear Logs
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {TABS.map(tab => {
          const count = tab === 'ALL' ? threats.length : threats.filter(t => t.attackType === tab).length;
          const isActive = activeTab === tab;
          const c = TAB_ACTIVE[tab];
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding:'6px 14px', borderRadius:7, fontSize:13, fontWeight:500, cursor:'pointer',
              background: isActive ? `rgba(${c === '#f85149' ? '248,81,73' : c === '#bc8cff' ? '188,140,255' : c === '#d29922' ? '210,153,34' : '88,166,255'},0.1)` : '#1c2333',
              border: `1px solid ${isActive ? c + '44' : '#30363d'}`,
              color: isActive ? c : '#8b949e',
            }}>
              {tab === 'ALL' ? 'All Threats' : tab}
              <span style={{ marginLeft:6, fontSize:11, opacity:0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background:'#161b22', border:'1px solid #30363d', borderRadius:10, padding:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <AlertOctagon size={15} style={{ color:'#f0883e' }} strokeWidth={2} />
          <p style={{ fontSize:14, fontWeight:600, color:'#e6edf3', margin:0 }}>
            {activeTab === 'ALL' ? 'All Threats' : `${activeTab} Threats`}
          </p>
          <span style={{ marginLeft:'auto', fontSize:12, color:'#8b949e' }}>{filtered.length} entries</span>
        </div>
        {loading
          ? <p style={{ color:'#8b949e', fontSize:13, textAlign:'center', padding:'32px 0' }}>Loading...</p>
          : <ThreatTable threats={filtered} onResolve={fetchData} />
        }
      </div>

      {/* Suggestions */}
      {activeTab !== 'ALL' && activeSuggestions.length > 0 && (
        <div style={{ background:'#161b22', border:'1px solid #30363d', borderRadius:10, padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <Lightbulb size={15} style={{ color:'#d29922' }} strokeWidth={2} />
            <p style={{ fontSize:14, fontWeight:600, color:'#e6edf3', margin:0 }}>Remediation Guide — {activeTab}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {activeSuggestions.map((s, i) => (
              <div key={i} style={{ background:'#1c2333', border:'1px solid #30363d', borderRadius:9, padding:16 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:6 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#e6edf3', margin:0 }}>{s.title}</p>
                  <span style={{ fontSize:11, fontWeight:600, color: PRIORITY_COLOR[s.priority] || '#8b949e', whiteSpace:'nowrap' }}>
                    {s.priority}
                  </span>
                </div>
                <p style={{ fontSize:12, color:'#8b949e', margin:0, lineHeight:1.6 }}>{s.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
