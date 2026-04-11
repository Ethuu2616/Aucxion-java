import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ShieldCheck, LayoutDashboard, AlertOctagon, ScanLine, ChevronRight } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ThreatDetails from './pages/ThreatDetails';
import PortScanner from './pages/PortScanner';

function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink to={to} end={to === '/'} className={({ isActive }) =>
      `group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
        isActive
          ? 'bg-blue/10 text-blue border border-blue/20'
          : 'text-muted hover:text-text hover:bg-white/5 border border-transparent'
      }`
    }>
      <Icon size={16} strokeWidth={1.8} />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="text-xs bg-red/15 text-red border border-red/20 rounded-full px-1.5 py-0.5 leading-none">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

import Chatbot from './components/Chatbot';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1c2333', color: '#e6edf3', border: '1px solid #30363d', borderRadius: '8px', fontSize: '13px' },
        success: { iconTheme: { primary: '#3fb950', secondary: '#1c2333' } },
        error:   { iconTheme: { primary: '#f85149', secondary: '#1c2333' } },
      }} />

      <div className="flex h-screen overflow-hidden" style={{ background: '#0f1117' }}>
        {/* Sidebar */}
        <aside className="w-56 flex flex-col shrink-0" style={{ background: '#161b22', borderRight: '1px solid #21262d' }}>
          {/* Brand */}
          <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid #21262d' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1f6feb, #388bfd)' }}>
              <ShieldCheck size={16} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-text font-semibold text-sm leading-none">Aucxion</p>
              <p className="text-muted text-xs mt-0.5">Threat Monitor</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            <p className="text-muted text-xs font-medium px-3 py-2 uppercase tracking-wider">Navigation</p>
            <NavItem to="/"        icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/threats" icon={AlertOctagon}    label="Threats" />
            <NavItem to="/ports"   icon={ScanLine}        label="Port Scanner" />
          </nav>

          {/* Footer */}
          <div className="p-4" style={{ borderTop: '1px solid #21262d' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green pulse" />
              <span className="text-muted text-xs">System Online</span>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#0f1117' }}>
          <Routes>
            <Route path="/"        element={<Dashboard />} />
            <Route path="/threats" element={<ThreatDetails />} />
            <Route path="/ports"   element={<PortScanner />} />
          </Routes>
        </main>
      </div>
      <Chatbot />
    </BrowserRouter>
  );
}
