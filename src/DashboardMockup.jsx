import React from 'react';
import { Icon } from '@iconify/react';

const submissions = [
  { rank: 1, team: 'NeuralVault',   project: 'AI Code Analyzer',       score: 9.2, innovation: 9.4, technical: 9.1, status: 'Reviewed',  badge: '#22c55e' },
  { rank: 2, team: 'DataForge',     project: 'Real-time ML Pipeline',   score: 8.8, innovation: 8.7, technical: 9.3, status: 'Reviewed',  badge: '#22c55e' },
  { rank: 3, team: 'PixelMind',     project: 'Generative UI Engine',    score: 8.7, innovation: 9.2, technical: 8.4, status: 'Pending',   badge: '#F97316' },
  { rank: 4, team: 'ByteShift',     project: 'Smart Contract Auditor',  score: 8.4, innovation: 8.5, technical: 9.0, status: 'Parsing',   badge: '#3b82f6' },
  { rank: 5, team: 'CloudWeave',    project: 'Serverless Orchestrator', score: 8.2, innovation: 7.9, technical: 8.8, status: 'Reviewed',  badge: '#22c55e' },
];

const bars = [62, 85, 40, 78, 92, 56, 70];
const days = ['M','T','W','T','F','S','S'];

export default function DashboardMockup() {
  return (
    <div className="dm-root">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="dm-sidebar">
        <div className="dm-brand">
          <div className="dm-brand-dot" />
          <span>Hackloom</span>
        </div>

        <nav className="dm-nav">
          {[
            { icon: 'solar:widget-5-bold-duotone',         label: 'Overview',     active: true  },
            { icon: 'solar:document-text-bold-duotone',    label: 'Submissions',  active: false },
            { icon: 'solar:chart-2-bold-duotone',          label: 'Analytics',    active: false },
            { icon: 'solar:settings-bold-duotone',         label: 'Rubrics',      active: false },
            { icon: 'solar:users-group-rounded-bold-duotone', label: 'Judges',    active: false },
          ].map((item, i) => (
            <div key={i} className={`dm-nav-item ${item.active ? 'active' : ''}`}>
              <Icon icon={item.icon} width="18" />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="dm-sidebar-card">
          <div className="dm-sidebar-card-label">Projects Parsed</div>
          <div className="dm-sidebar-card-value">
            147<span className="dm-sidebar-card-total">/200</span>
          </div>
          <div className="dm-progress-track">
            <div className="dm-progress-fill" style={{ width: '73%' }} />
          </div>
          <div className="dm-sidebar-card-sub">73% complete · 53 remaining</div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="dm-main">

        {/* Top bar */}
        <div className="dm-topbar">
          <div className="dm-topbar-left">
            <span className="dm-topbar-title">Overview</span>
            <span className="dm-topbar-event">Spring Hackathon 2025</span>
          </div>
          <div className="dm-topbar-right">
            <div className="dm-status-pill">
              <span className="dm-status-dot" />
              Live · 3 judges online
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="dm-stats">
          {[
            { icon: 'solar:inbox-bold-duotone',    label: 'Submissions',   value: '200',  delta: '+12 today',  color: '#F97316', bg: 'rgba(249,115,22,0.08)'  },
            { icon: 'solar:star-bold-duotone',     label: 'Avg. Score',    value: '8.6',  delta: '↑ 0.3 pts',  color: '#22c55e', bg: 'rgba(34,197,94,0.08)'  },
            { icon: 'solar:clock-circle-bold-duotone', label: 'Time Saved',value: '42h',  delta: 'vs manual',  color: '#3b82f6', bg: 'rgba(59,130,246,0.08)'  },
            { icon: 'solar:chart-bold-duotone',    label: 'Cost Reduction', value: '68%', delta: '↓ $12k saved',color: '#a855f7', bg: 'rgba(168,85,247,0.08)'  },
          ].map((s, i) => (
            <div key={i} className="dm-stat-card">
              <div className="dm-stat-icon" style={{ background: s.bg, color: s.color }}>
                <Icon icon={s.icon} width="20" />
              </div>
              <div className="dm-stat-body">
                <div className="dm-stat-label">{s.label}</div>
                <div className="dm-stat-value">{s.value}</div>
                <div className="dm-stat-delta" style={{ color: s.color }}>{s.delta}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Mini panel row */}
        <div className="dm-mid-row">

          {/* Activity chart */}
          <div className="dm-chart-card">
            <div className="dm-chart-header">
              <span className="dm-chart-title">Parsing Activity</span>
              <span className="dm-chart-badge">This week</span>
            </div>
            <div className="dm-chart-area">
              {bars.map((h, i) => (
                <div key={i} className="dm-bar-col">
                  <div
                    className="dm-bar"
                    style={{
                      height: `${h}%`,
                      background: i === 4
                        ? 'linear-gradient(180deg, #F97316 0%, rgba(249,115,22,0.3) 100%)'
                        : 'rgba(255,255,255,0.07)',
                      boxShadow: i === 4 ? '0 0 20px rgba(249,115,22,0.4)' : 'none',
                    }}
                  />
                  <span className="dm-bar-day">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score distribution */}
          <div className="dm-dist-card">
            <div className="dm-chart-title" style={{ marginBottom: 20 }}>Score Breakdown</div>
            {[
              { label: 'Innovation',    pct: 88, color: '#F97316' },
              { label: 'Technical',     pct: 76, color: '#3b82f6' },
              { label: 'Presentation', pct: 82, color: '#22c55e' },
              { label: 'Impact',        pct: 71, color: '#a855f7' },
            ].map((r, i) => (
              <div key={i} className="dm-dist-row">
                <span className="dm-dist-label">{r.label}</span>
                <div className="dm-dist-track">
                  <div className="dm-dist-fill" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
                <span className="dm-dist-val" style={{ color: r.color }}>{r.pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard table */}
        <div className="dm-table-card">
          <div className="dm-table-header">
            <span className="dm-chart-title">Leaderboard</span>
            <span className="dm-chart-badge">Top 5 teams</span>
          </div>
          <div className="dm-table-scroll">
            <div className="dm-table-head">
              <span>#</span><span>Team</span><span>Project</span>
              <span>Innov.</span><span>Tech.</span><span>Score</span><span>Status</span>
            </div>
            {submissions.map((s) => (
              <div key={s.rank} className={`dm-table-row ${s.rank === 1 ? 'dm-row-top' : ''}`}>
                <span className="dm-rank">{s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : s.rank}</span>
                <span className="dm-team">{s.team}</span>
                <span className="dm-project">{s.project}</span>
                <span className="dm-score-cell">{s.innovation}</span>
                <span className="dm-score-cell">{s.technical}</span>
                <span className="dm-score-total">{s.score}</span>
                <span className="dm-badge" style={{ background: `${s.badge}18`, color: s.badge, borderColor: `${s.badge}30` }}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
