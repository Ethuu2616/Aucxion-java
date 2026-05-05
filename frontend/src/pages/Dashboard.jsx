import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { AlertTriangle, ShieldCheck, Server, Wifi, Activity } from 'lucide-react';
import { scanApi } from '../api/aucxionApi';
import AttackCard from '../components/AttackCard';
import ThreatTable from '../components/ThreatTable';
import ScanControls from '../components/ScanControls';
import RiskBadge from '../components/RiskBadge';

const PIE_COLORS = { DDOS:'#f85149', RANSOMWARE:'#bc8cff', ZERO_DAY:'#d29922', PHISHING:'#58a6ff' };

const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1c2333', border:'1px solid #30363d', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
      <p style={{ color:'#e6edf3', margin:0 }}>{payload[0].name}: <strong style={{ color:'#58a6ff' }}>{payload[0].value}</strong></p>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading]   = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      const res = await scanApi.results();
      setData(res.data);
      setScanning(res.data.scanRunning);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchResults();
    const iv = setInterval(fetchResults, 5000);
    return () => clearInterval(iv);
  }, [fetchResults]);

  useEffect(() => {
    if (data?.session?.status === 'COMPLETED' && scanning) {
      setScanning(false);
      const n = data.threats?.length || 0;
      n > 0 ? toast.error(`Scan complete — ${n} threat(s) detected`) : toast.success('Scan complete — No threats found');
    }
  }, [data, scanning]);

  const threats  = data?.threats || [];
  const session  = data?.session;
  const pieData  = data?.attackBreakdown ? Object.entries(data.attackBreakdown).map(([name, value]) => ({ name, value })) : [];
  const timeline = buildTimeline(threats);

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>

      {/* Page header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600, color:'#e6edf3', margin:0 }}>Dashboard</h1>
          <p style={{ fontSize:13, color:'#8b949e', margin:'4px 0 0' }}>Real-time threat monitoring overview</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {session && <RiskBadge level={session.systemRiskLevel} large />}
          <ScanControls scanning={scanning} onScanChange={v => { setScanning(v); if (!v) fetchResults(); }} />
        </div>
      </div>

      {/* Scanning banner */}
      {scanning && (
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(88,166,255,0.06)', border:'1px solid rgba(88,166,255,0.2)', borderRadius:9, padding:'12px 16px' }}>
          <Activity size={15} style={{ color:'#58a6ff' }} className="pulse" />
          <span style={{ fontSize:13, color:'#58a6ff' }}>Scanning system — analyzing processes, network traffic, and file system...</span>
          <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
            {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#58a6ff', opacity: 0.6, animation:`pulse ${0.8 + i*0.2}s ease-in-out infinite` }} />)}
          </div>
        </div>
      )}

      {/* Stat row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
        <StatCard icon={AlertTriangle} label="Total Threats"  value={threats.length}                                    color="#f85149" />
        <StatCard icon={ShieldCheck}   label="Active Threats" value={threats.filter(t=>t.status==='ACTIVE').length}    color="#f0883e" />
        <StatCard icon={Server}        label="Ports Scanned"  value={session?.portsScanned || 0}                       color="#58a6ff" />
        <StatCard icon={Wifi}          label="Open Ports"     value={data?.ports?.filter(p=>p.open).length || 0}       color="#d29922" />
        <AccuracyCard metrics={data?.metrics} />
      </div>

      {/* Attack cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {['DDOS','RANSOMWARE','ZERO_DAY','PHISHING'].map(t => (
          <AttackCard key={t} type={t} count={data?.attackBreakdown?.[t] || 0} />
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Card title="Attack Distribution">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={3}>
                  {pieData.map(e => <Cell key={e.name} fill={PIE_COLORS[e.name] || '#8b949e'} />)}
                </Pie>
                <Tooltip content={<ChartTip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
          {pieData.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 16px', marginTop:12 }}>
              {pieData.map(e => (
                <div key={e.name} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background: PIE_COLORS[e.name] }} />
                  <span style={{ fontSize:12, color:'#8b949e' }}>{e.name} <strong style={{ color:'#e6edf3' }}>{e.value}</strong></span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Threat Timeline">
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#58a6ff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#58a6ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="time" stroke="#484f58" tick={{ fontSize:11, fill:'#8b949e' }} />
                <YAxis stroke="#484f58" tick={{ fontSize:11, fill:'#8b949e' }} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="threats" stroke="#58a6ff" strokeWidth={2} fill="url(#aGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </Card>
      </div>

      {/* Threat table */}
      <Card title="Recent Threats" subtitle={`${threats.length} total — click any row for full details`}>
        {loading
          ? <p style={{ color:'#8b949e', fontSize:13, textAlign:'center', padding:'32px 0' }}>Loading...</p>
          : <ThreatTable threats={threats} onResolve={fetchResults} />
        }
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background:'#1c2333', border:'1px solid #30363d', borderRadius:10, padding:'16px 18px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <p style={{ fontSize:12, fontWeight:500, color:'#8b949e', margin:0 }}>{label}</p>
        <Icon size={15} style={{ color }} strokeWidth={2} />
      </div>
      <p style={{ fontSize:26, fontWeight:700, color, margin:0, lineHeight:1 }}>{value}</p>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div style={{ background:'#161b22', border:'1px solid #30363d', borderRadius:10, padding:20 }}>
      <div style={{ marginBottom:16 }}>
        <p style={{ fontSize:14, fontWeight:600, color:'#e6edf3', margin:0 }}>{title}</p>
        {subtitle && <p style={{ fontSize:12, color:'#8b949e', margin:'3px 0 0' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#484f58', fontSize:13 }}>No data — run a scan first</p>
    </div>
  );
}

function buildTimeline(threats) {
  const b = {};
  threats.forEach(t => {
    const k = new Date(t.detectedAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    b[k] = (b[k] || 0) + 1;
  });
  return Object.entries(b).map(([time, threats]) => ({ time, threats }));
}

function AccuracyCard({ metrics }) {
  if (!metrics) return (
    <div style={{ background:'#1c2333', border:'1px solid #30363d', borderRadius:10, padding:'16px 18px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <p style={{ fontSize:12, fontWeight:500, color:'#8b949e', margin:0 }}>Scan Accuracy</p>
        <Activity size={15} style={{ color:'#8b949e' }} strokeWidth={2} />
      </div>
      <p style={{ fontSize:26, fontWeight:700, color:'#8b949e', margin:0, lineHeight:1 }}>--</p>
    </div>
  );

  const accuracy = metrics.accuracyScore || 0;
  const color = accuracy >= 90 ? '#3fb950' : accuracy >= 75 ? '#58a6ff' : accuracy >= 60 ? '#d29922' : '#f85149';

  return (
    <div style={{ background:'#1c2333', border:'1px solid #30363d', borderRadius:10, padding:'16px 18px', position:'relative', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <p style={{ fontSize:12, fontWeight:500, color:'#8b949e', margin:0 }}>Scan Accuracy</p>
        <Activity size={15} style={{ color }} strokeWidth={2} />
      </div>
      <p style={{ fontSize:26, fontWeight:700, color, margin:0, lineHeight:1 }}>{accuracy.toFixed(1)}%</p>
      <div style={{ marginTop:8, fontSize:10, color:'#6e7681', display:'flex', flexDirection:'column', gap:2 }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span>Files:</span><span style={{ color:'#8b949e' }}>{metrics.filesScanned || 0}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span>Processes:</span><span style={{ color:'#8b949e' }}>{metrics.processesAnalyzed || 0}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span>Connections:</span><span style={{ color:'#8b949e' }}>{metrics.networkConnectionsChecked || 0}</span>
        </div>
      </div>
      {/* Progress bar background */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:'rgba(48,54,61,0.3)' }}>
        <div style={{ height:'100%', width:`${accuracy}%`, background:color, transition:'width 0.5s ease' }} />
      </div>
    </div>
  );
}
