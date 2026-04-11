import React from 'react';
import { Play, Square, RotateCcw, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { scanApi } from '../api/aucxionApi';

export default function ScanControls({ scanning, onScanChange }) {
  const handleStart = async () => {
    try {
      await scanApi.start();
      toast.success('Scan started successfully');
      onScanChange(true);
    } catch (err) {
      const msg = err?.code === 'ERR_NETWORK'
        ? 'Cannot connect to backend — ensure Spring Boot is running on port 8080'
        : err?.response?.data?.message || err?.message || 'Failed to start scan';
      toast.error(msg, { duration: 6000 });
    }
  };

  const handleStop = async () => {
    try {
      await scanApi.stop();
      toast('Scan stopped');
      onScanChange(false);
    } catch (err) {
      toast.error(err?.code === 'ERR_NETWORK' ? 'Backend offline' : err?.message || 'Failed to stop scan');
    }
  };

  const handleRescan = async () => {
    try {
      await scanApi.stop().catch(() => {});
      setTimeout(async () => {
        await scanApi.start();
        toast.success('Rescan initiated');
        onScanChange(true);
      }, 400);
    } catch (err) {
      toast.error(err?.message || 'Rescan failed');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!scanning ? (
        <button onClick={handleStart} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          background: 'linear-gradient(135deg, #1f6feb, #388bfd)',
          border: '1px solid rgba(88,166,255,0.3)', color: '#fff',
        }}>
          <Play size={13} strokeWidth={2.5} /> Start Scan
        </button>
      ) : (
        <button onClick={handleStop} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          background: 'rgba(248,81,73,0.12)', border: '1px solid rgba(248,81,73,0.3)', color: '#f85149',
        }}>
          <Square size={13} strokeWidth={2.5} /> Stop Scan
        </button>
      )}
      <button onClick={handleRescan} disabled={scanning} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 12px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: scanning ? 'not-allowed' : 'pointer',
        background: '#1c2333', border: '1px solid #30363d', color: scanning ? '#484f58' : '#8b949e',
      }}>
        {scanning ? <Loader size={13} className="spin" /> : <RotateCcw size={13} />}
        Rescan
      </button>
    </div>
  );
}
