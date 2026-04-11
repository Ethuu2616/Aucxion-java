import React, { useState, useEffect } from 'react';
import { ScanLine, Loader, RotateCcw, ShieldAlert, Wifi, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { portApi } from '../api/aucxionApi';
import PortScannerTable from '../components/PortScannerTable';

const FILTERS = ['ALL', 'OPEN', 'HIGH', 'MEDIUM', 'LOW'];

export default function PortScanner() {
  const [ports, setPorts]     = useState([]);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter]   = useState('ALL');

  useEffect(() => { portApi.getAll().then(r => setPorts(r.data)).catch(() => {}); }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await portApi.scan();
      setPorts(res.data);
      const open = res.data.filter(p => p.open).length;
      const high = res.data.filter(p => p.open && p.exposureLevel === 'HIGH').length;
      high > 0 ? toast.error(`${high} high-risk port(s) detected open`) : toast.success(`Scan complete — ${open} open port(s) found`);
    } catch { toast.error('Port scan failed'); }
    finally { setScanning(false); }
  };

  const filtered = filter === 'ALL'  ? ports
    : filter === 'OPEN' ? ports.filter(p => p.open)
    : ports.filter(p => p.exposureLevel === filter);

  const openCount = ports.filter(p => p.open).length;
  const highRisk  = ports.filter(p => p.open && p.exposureLevel === 'HIGH').length;
  const total     = ports.length;

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600, color:'#e6edf3', margin:0 }}>Port Scanner</h1>
          <p style={{ fontSize:13, color:'#8b949e', margin:'4px 0 0' }}>Scan open ports and identify network exposure risks</p>
        </div>
        <button onClick={handleScan} disabled={scanning} style={{
          display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:7,
          background: scanning ? '#1c2333' : 'linear-gradient(135deg, #1f6feb, #388bfd)',
          border: `1px solid ${scanning ? '#30363d' : 'rgba(88,166,255,0.3)'}`,
          color: scanning ? '#484f58' : '#fff', fontSize:13, fontWeight:500,
          cursor: scanning ? 'not-allowed' : 'pointer',
        }}>
          {scanning ? <Loader size={14} className="spin" /> : <RotateCcw size={14} />}
          {scanning ? 'Scanning...' : 'Run Port Scan'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        <StatCard icon={ScanLine}     label="Total Scanned" value={total}     color="#58a6ff" />
        <StatCard icon={Wifi}         label="Open Ports"    value={openCount} color="#f0883e" />
        <StatCard icon={ShieldAlert}  label="High Risk Open" value={highRisk} color={highRisk > 0 ? '#f85149' : '#8b949e'} highlight={highRisk > 0} />
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'6px 14px', borderRadius:7, fontSize:13, fontWeight:500, cursor:'pointer',
            background: filter === f ? 'rgba(88,166,255,0.1)' : '#1c2333',
            border: `1px solid ${filter === f ? 'rgba(88,166,255,0.3)' : '#30363d'}`,
            color: filter === f ? '#58a6ff' : '#8b949e',
          }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'#161b22', border:'1px solid #30363d', borderRadius:10, padding:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <ScanLine size={15} style={{ color:'#58a6ff' }} strokeWidth={2} />
          <p style={{ fontSize:14, fontWeight:600, color:'#e6edf3', margin:0 }}>Port Scan Results</p>
          <span style={{ marginLeft:'auto', fontSize:12, color:'#8b949e' }}>{filtered.length} ports</span>
        </div>
        <PortScannerTable ports={filtered} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, highlight }) {
  return (
    <div style={{
      background: highlight ? 'rgba(248,81,73,0.05)' : '#1c2333',
      border: `1px solid ${highlight ? 'rgba(248,81,73,0.2)' : '#30363d'}`,
      borderRadius:10, padding:'16px 18px',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <p style={{ fontSize:12, fontWeight:500, color:'#8b949e', margin:0 }}>{label}</p>
        <Icon size={15} style={{ color }} strokeWidth={2} />
      </div>
      <p style={{ fontSize:26, fontWeight:700, color, margin:0, lineHeight:1 }}>{value}</p>
    </div>
  );
}
