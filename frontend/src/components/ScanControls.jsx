import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Loader, AlertCircle, Activity, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { scanApi } from '../api/aucxionApi';

export default function ScanControls({ scanning, onScanChange }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');

  const scanTasks = [
    { label: 'Analyzing network connections...', duration: 5 },
    { label: 'Scanning running processes...', duration: 7 },
    { label: 'Checking file system...', duration: 8 },
    { label: 'Reviewing system logs...', duration: 6 },
    { label: 'Scanning ports...', duration: 4 }
  ];

  useEffect(() => {
    if (showProgress) {
      let elapsed = 0;
      let taskIndex = 0;
      const totalDuration = 30; // 30 seconds total
      
      setCurrentTask(scanTasks[0].label);
      
      const interval = setInterval(() => {
        elapsed += 0.1;
        const newProgress = (elapsed / totalDuration) * 100;
        setProgress(Math.min(newProgress, 100));
        
        // Update current task based on elapsed time
        let cumulativeDuration = 0;
        for (let i = 0; i < scanTasks.length; i++) {
          cumulativeDuration += scanTasks[i].duration;
          if (elapsed < cumulativeDuration) {
            if (taskIndex !== i) {
              taskIndex = i;
              setCurrentTask(scanTasks[i].label);
            }
            break;
          }
        }
        
        // Close dialog after 30 seconds
        if (elapsed >= totalDuration) {
          clearInterval(interval);
          setShowProgress(false);
          setProgress(0);
          toast.success('Scan completed successfully!');
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [showProgress]);

  const handleStart = async () => {
    setShowConfirm(true);
  };

  const confirmStart = async () => {
    setShowConfirm(false);
    setShowProgress(true);
    setProgress(0);
    
    try {
      await scanApi.start();
      toast.success('System scan initiated — analyzing files, processes, network, and logs');
      onScanChange(true);
    } catch (err) {
      setShowProgress(false);
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
      setShowProgress(false);
      setProgress(0);
    } catch (err) {
      toast.error(err?.code === 'ERR_NETWORK' ? 'Backend offline' : err?.message || 'Failed to stop scan');
    }
  };

  const handleRescan = async () => {
    try {
      await scanApi.stop().catch(() => {});
      setTimeout(async () => {
        setShowConfirm(true);
      }, 400);
    } catch (err) {
      toast.error(err?.message || 'Rescan failed');
    }
  };

  return (
    <>
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

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)'
        }} onClick={() => setShowConfirm(false)}>
          <div style={{
            background: '#161b22', border: '1px solid #30363d', borderRadius: 12,
            padding: 24, maxWidth: 480, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8, background: 'rgba(88,166,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <AlertCircle size={20} style={{ color: '#58a6ff' }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3', margin: 0 }}>
                Start System Scan?
              </h3>
            </div>
            
            <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.6, marginBottom: 20 }}>
              This will perform a comprehensive security scan of your system including:
            </p>
            
            <ul style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8, marginBottom: 20, paddingLeft: 20 }}>
              <li>Network connections and traffic analysis</li>
              <li>Running processes and services</li>
              <li>File system for suspicious files</li>
              <li>System and security log files</li>
              <li>Open ports and vulnerabilities</li>
            </ul>
            
            <p style={{ fontSize: 12, color: '#6e7681', marginBottom: 20, padding: '8px 12px', background: 'rgba(88,166,255,0.05)', borderRadius: 6, border: '1px solid rgba(88,166,255,0.1)' }}>
              <strong style={{ color: '#58a6ff' }}>Note:</strong> The scan may take 30-60 seconds depending on system size.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirm(false)} style={{
                padding: '8px 16px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: '#1c2333', border: '1px solid #30363d', color: '#8b949e'
              }}>
                Cancel
              </button>
              <button onClick={confirmStart} style={{
                padding: '8px 16px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: 'linear-gradient(135deg, #1f6feb, #388bfd)',
                border: '1px solid rgba(88,166,255,0.3)', color: '#fff'
              }}>
                Start Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanning Progress Dialog */}
      {showProgress && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: '#161b22', border: '1px solid #30363d', borderRadius: 12,
            padding: 32, maxWidth: 500, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10, background: 'rgba(88,166,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Activity size={24} style={{ color: '#58a6ff' }} className="pulse" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#e6edf3', margin: 0 }}>
                  Scanning System
                </h3>
                <p style={{ fontSize: 13, color: '#8b949e', margin: '4px 0 0' }}>
                  Please wait while we analyze your system...
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ 
                height: 8, 
                background: 'rgba(48,54,61,0.5)', 
                borderRadius: 4, 
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${progress}%`, 
                  background: 'linear-gradient(90deg, #1f6feb, #58a6ff)',
                  transition: 'width 0.1s linear',
                  borderRadius: 4,
                  boxShadow: '0 0 10px rgba(88,166,255,0.5)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#8b949e' }}>{currentTask}</span>
                <span style={{ fontSize: 12, color: '#58a6ff', fontWeight: 600 }}>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Scanning Tasks */}
            <div style={{ 
              background: 'rgba(48,54,61,0.3)', 
              borderRadius: 8, 
              padding: 16,
              border: '1px solid rgba(48,54,61,0.5)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {scanTasks.map((task, index) => {
                  const taskProgress = Math.max(0, Math.min(100, 
                    ((progress / 100) * 30 - scanTasks.slice(0, index).reduce((sum, t) => sum + t.duration, 0)) / task.duration * 100
                  ));
                  const isComplete = taskProgress >= 100;
                  const isActive = taskProgress > 0 && taskProgress < 100;
                  
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: isComplete ? 'rgba(63,185,80,0.2)' : isActive ? 'rgba(88,166,255,0.2)' : 'rgba(48,54,61,0.5)',
                        border: `2px solid ${isComplete ? '#3fb950' : isActive ? '#58a6ff' : '#30363d'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}>
                        {isComplete && <CheckCircle size={12} style={{ color: '#3fb950' }} />}
                        {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#58a6ff' }} className="pulse" />}
                      </div>
                      <span style={{ 
                        fontSize: 12, 
                        color: isComplete ? '#3fb950' : isActive ? '#58a6ff' : '#6e7681',
                        fontWeight: isActive ? 500 : 400,
                        transition: 'all 0.3s ease'
                      }}>
                        {task.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p style={{ 
              fontSize: 11, 
              color: '#6e7681', 
              textAlign: 'center', 
              marginTop: 16, 
              marginBottom: 0 
            }}>
              Do not close this window. Scan will complete automatically.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
