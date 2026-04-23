import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { MoveHorizontal, ChevronDown } from 'lucide-react';

export default function PricingSection() {
  const [mobileComparePlan, setMobileComparePlan] = useState('starter');
  return (
    <section id="pricing" className="relative bg-[#0A0A0A] py-24 md:py-32 px-4 overflow-hidden z-10">
      <div className="max-w-[1100px] mx-auto">
        
        {/* ═════ HEADER ═════ */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 border border-[#FF8C32]/30 bg-[#FF8C32]/[0.08] text-[#FF8C32] rounded-full px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C32] shadow-[0_0_8px_rgba(255,140,50,0.8)] animate-pulse" />
            Simple Pricing
          </div>
          <h2 className="text-[36px] md:text-[56px] font-bold text-white tracking-tight leading-[1.1] mb-5">
            Pick your plan.
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#888] max-w-[500px] mx-auto leading-relaxed">
            Pay once per hackathon. No subscriptions, no surprises. 
            Scale up exactly when you need to.
          </p>
        </div>

        {/* ═════ CARDS ═════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1080px] mx-auto items-stretch">
          
          {/* STARTER CARD */}
          <div className="bg-[#0F0F0F] border border-white/[0.08] hover:border-white/[0.15] rounded-[24px] p-8 flex flex-col transition-colors duration-300 relative group">
            <div className="mb-8">
              <h3 className="text-[20px] font-bold text-white mb-2">Starter</h3>
              <p className="text-[14px] text-[#888] leading-relaxed h-auto md:h-[42px]">Perfect for college fests & small communities.</p>
            </div>
            
            <div className="mb-8">
              <div className="text-[48px] font-bold text-white leading-none tracking-tight">₹4,999</div>
              <div className="text-[13px] font-medium text-[#555] mt-3 uppercase tracking-[0.08em]">Per Hackathon</div>
            </div>
            
            <a href="https://calendly.com/khnnabubakar786/new-meeting" target="_blank" rel="noopener noreferrer" className="w-full py-3.5 px-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white text-[14px] font-semibold rounded-xl text-center transition-all mb-8">
              Get Started
            </a>
            
            <div className="flex-1">
              <div className="text-[11px] font-bold tracking-wider text-white uppercase mb-5">Included features</div>
              <ul className="space-y-4">
                <FeatureListItem text="Up to 50 team submissions" />
                <FeatureListItem text="Code + PPT AI analysis" />
                <FeatureListItem text="Scoring across 5 criteria" />
                <FeatureListItem text="PDF report download" />
                <FeatureListItem text="Email support" />
              </ul>
            </div>
          </div>

          {/* PRO CARD */}
          <div className="bg-[#111] border border-[#FF8C32]/40 rounded-[24px] p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_16px_40px_rgba(255,140,50,0.1)]">
            {/* Glow line top */}
            <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#FF8C32] to-transparent opacity-80" />
            
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF8C32] text-[#000] text-[10px] font-black tracking-[0.15em] uppercase px-4 py-1 rounded-full shadow-[0_0_12px_rgba(255,140,50,0.5)] whitespace-nowrap">
              Most Popular
            </div>

            <div className="mb-8">
              <h3 className="text-[20px] font-bold text-[#FF8C32] mb-2">Pro</h3>
              <p className="text-[14px] text-[#888] leading-relaxed h-auto md:h-[42px]">For mid-size orgs & university events scaling up.</p>
            </div>
            
            <div className="mb-8">
              <div className="text-[48px] font-bold text-white leading-none tracking-tight">₹14,999</div>
              <div className="text-[13px] font-medium text-[#FF8C32]/70 mt-3 uppercase tracking-[0.08em]">Per Hackathon</div>
            </div>
            
            <a href="https://calendly.com/khnnabubakar786/new-meeting" target="_blank" rel="noopener noreferrer" className="w-full py-3.5 px-4 bg-[#FF8C32] hover:bg-[#FF6B00] border border-transparent text-[#000] text-[14px] font-bold rounded-xl text-center transition-all mb-8 shadow-[0_0_20px_rgba(255,140,50,0.2)]">
              Choose Pro
            </a>
            
            <div className="flex-1">
              <div className="text-[11px] font-bold tracking-wider text-white uppercase mb-5">Everything in Starter, plus</div>
              <ul className="space-y-4">
                <FeatureListItem text="Up to 200 team submissions" isPro />
                <FeatureListItem text="Demo video analysis" isPro />
                <FeatureListItem text="Plagiarism detection" isPro />
                <FeatureListItem text="White-label PDF reports" isPro />
                <FeatureListItem text="Participant leaderboard" isPro />
                <FeatureListItem text="Priority support" isPro />
              </ul>
            </div>
          </div>

          {/* ENTERPRISE CARD */}
          <div className="bg-[#0F0F0F] border border-white/[0.08] hover:border-white/[0.15] rounded-[24px] p-8 flex flex-col transition-colors duration-300 relative group">
            <div className="mb-8">
              <h3 className="text-[20px] font-bold text-white mb-2">Enterprise</h3>
              <p className="text-[14px] text-[#888] leading-relaxed h-auto md:h-[42px]">For large-scale corporate hackathons & agencies.</p>
            </div>
            
            <div className="mb-8">
              <div className="text-[42px] font-bold text-white leading-none tracking-tight mt-[6px]">Custom</div>
              <div className="text-[13px] font-medium text-[#555] mt-[13px] uppercase tracking-[0.08em]">Volume Pricing</div>
            </div>
            
            <a href="https://calendly.com/khnnabubakar786/new-meeting" target="_blank" rel="noopener noreferrer" className="w-full py-3.5 px-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white text-[14px] font-semibold rounded-xl text-center transition-all mb-8">
              Contact Sales
            </a>
            
            <div className="flex-1">
              <div className="text-[11px] font-bold tracking-wider text-white uppercase mb-5">Everything in Pro, plus</div>
              <ul className="space-y-4">
                <FeatureListItem text="Unlimited team submissions" />
                <FeatureListItem text="Custom judging criteria" />
                <FeatureListItem text="API access & custom domain" />
                <FeatureListItem text="Dedicated account manager" />
                <FeatureListItem text="Onboarding & training" />
                <FeatureListItem text="SLA guarantee" />
              </ul>
            </div>
          </div>

        </div>

        {/* ═════ LOGO MARQUEE (CSS-native, zero JS on scroll) ═════ */}
        <div className="w-full my-24 relative">
          <div className="text-center mb-8">
            <p className="opacity-60 text-[12px] md:text-[13px] tracking-[0.15em] font-bold text-[#A1A1AA] uppercase">
              POWERING HACKATHONS ACROSS TOP PLATFORMS
            </p>
          </div>
          <div className="marquee-wrapper" style={{ gap: 0 }}>
            <div className="marquee-row">
              <div className="marquee-track marquee-left" aria-hidden="true">
                {[...Array(3)].map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="marquee-item"><Icon icon="logos:google-developers" width="22" /><span>Google Developers</span></div>
                    <div className="marquee-item"><Icon icon="logos:microsoft-icon" width="22" /><span>Microsoft Reactor</span></div>
                    <div className="marquee-item"><Icon icon="simple-icons:devpost" width="22" color="#fff" /><span>Devpost</span></div>
                    <div className="marquee-item"><Icon icon="simple-icons:mlh" width="22" color="#fff" /><span>Major League Hacking</span></div>
                    <div className="marquee-item"><Icon icon="logos:aws" width="26" /><span>AWS Startups</span></div>
                    <div className="marquee-item"><Icon icon="simple-icons:ethereum" width="22" color="#fff" /><span>ETHGlobal</span></div>
                    <div className="marquee-item"><Icon icon="logos:stripe" width="30" /><span>Stripe Build</span></div>
                    <div className="marquee-item"><Icon icon="logos:vercel-icon" width="22" /><span>Vercel</span></div>
                    <div className="marquee-item"><Icon icon="simple-icons:ycombinator" width="22" /><span>Y Combinator</span></div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═════ COMPARISON TABLE (Modern SaaS Design) ═════ */}
        <div className="mt-16 md:mt-32 max-w-[1000px] mx-auto mb-20 relative">
          <div className="text-center mb-10 md:mb-16 px-4">
            <h3 className="text-[28px] md:text-[36px] font-bold text-white tracking-tight">Compare all features</h3>
            <p className="text-[15px] md:text-[16px] text-[#888] mt-3 font-medium max-w-[500px] mx-auto">
              Everything you need to run a world-class hackathon. Find the plan that fits your scale.
            </p>
          </div>

          {/* DESKTOP COMPARISON TABLE */}
          <div className="hidden md:block relative border border-white/[0.08] bg-[#0A0A0A] rounded-[24px] overflow-hidden shadow-2xl">
            {/* Scrollable Container */}
            <div className="w-full">
              <table className="w-full text-left min-w-[760px] border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-30 w-[40%] md:w-1/3 bg-[#0A0A0A] p-5 md:p-6 border-b border-white/[0.08] border-r border-white/[0.08]">
                      <span className="sr-only">Feature</span>
                    </th>
                    <th className="w-[20%] p-5 md:p-6 bg-[#0A0A0A] border-b border-white/[0.08] text-center relative">
                      <div className="text-[18px] md:text-[20px] font-bold text-white tracking-tight">Starter</div>
                      <div className="text-[11px] md:text-[12px] text-[#888] font-bold mt-1.5 uppercase tracking-[0.15em]">₹4,999</div>
                    </th>
                    <th className="w-[20%] p-5 md:p-6 bg-[#FF8C32]/[0.03] border-b border-white/[0.08] text-center relative border-l border-r border-[#FF8C32]/20">
                      {/* Glow top border */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF8C32] to-transparent opacity-80" />
                      <div className="text-[18px] md:text-[20px] font-bold text-[#FF8C32] tracking-tight">Pro</div>
                      <div className="text-[11px] md:text-[12px] text-[#FF8C32]/70 font-bold mt-1.5 uppercase tracking-[0.15em]">₹14,999</div>
                    </th>
                    <th className="w-[20%] p-5 md:p-6 bg-[#0A0A0A] border-b border-white/[0.08] text-center relative">
                      <div className="text-[18px] md:text-[20px] font-bold text-white tracking-tight">Enterprise</div>
                      <div className="text-[11px] md:text-[12px] text-[#888] font-bold mt-1.5 uppercase tracking-[0.15em]">Custom</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_DATA.map((group, gIdx) => (
                    <React.Fragment key={gIdx}>
                      {/* Group Header */}
                      <tr>
                        <td className="sticky left-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-md px-5 md:px-6 py-6 md:py-8 border-b border-white/[0.03] border-r border-white/[0.08]">
                          <span className="text-[12px] md:text-[13px] font-bold text-white uppercase tracking-[0.12em]">{group.group}</span>
                        </td>
                        <td className="bg-[#0A0A0A] border-b border-white/[0.03] p-4"></td>
                        <td className="bg-[#FF8C32]/[0.03] border-b border-white/[0.03] border-l border-r border-[#FF8C32]/10 p-4"></td>
                        <td className="bg-[#0A0A0A] border-b border-white/[0.03] p-4"></td>
                      </tr>
                      {/* Features */}
                      {group.items.map((item, iIdx) => {
                        const isLastInGroup = iIdx === group.items.length - 1;
                        const isLastOverall = isLastInGroup && gIdx === COMPARISON_DATA.length - 1;
                        const borderClass = isLastInGroup && !isLastOverall ? 'border-white/[0.08]' : (isLastOverall ? 'border-transparent' : 'border-white/[0.03]');
                        
                        return (
                          <tr key={iIdx} className="group hover:bg-white/[0.015] transition-colors">
                            <td className={`sticky left-0 z-20 bg-[#0A0A0A] group-hover:bg-[#0E0E0E] transition-colors px-5 md:px-6 py-4 md:py-5 border-b ${borderClass} border-r border-white/[0.08] font-medium text-[13px] md:text-[14px] text-[#A1A1AA]`}>
                              {item.feature}
                            </td>
                            <td className={`px-4 py-4 md:py-5 text-center border-b ${borderClass} text-[13px] md:text-[14px] font-semibold text-white`}>
                              <div className="flex justify-center items-center h-full">
                                {renderCellContent(item.v1)}
                              </div>
                            </td>
                            <td className={`px-4 py-4 md:py-5 text-center border-b ${borderClass} bg-[#FF8C32]/[0.03] group-hover:bg-[#FF8C32]/[0.06] border-l border-r border-[#FF8C32]/10 transition-colors text-[13px] md:text-[14px] font-semibold ${item.v2 === 'check' ? 'text-white' : 'text-[#FF8C32]'}`}>
                              <div className="flex justify-center items-center h-full">
                                {renderCellContent(item.v2, true)}
                              </div>
                            </td>
                            <td className={`px-4 py-4 md:py-5 text-center border-b ${borderClass} text-[13px] md:text-[14px] font-semibold text-white`}>
                              <div className="flex justify-center items-center h-full">
                                {renderCellContent(item.v3)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE COMPARISON UX */}
          <div className="md:hidden mt-8">
            {/* Sticky Compare Header */}
            <div className="sticky top-[60px] z-40 bg-[#0A0A0A]/95 backdrop-blur-md pt-4 pb-4 border-b border-white/[0.08] px-2 -mx-2 mb-8">
              <div className="flex items-center gap-3">
                
                {/* Secondary Plan Selector */}
                <div className="flex-1 relative">
                  <select 
                    value={mobileComparePlan}
                    onChange={(e) => setMobileComparePlan(e.target.value)}
                    className="w-full bg-[#151515] border border-white/[0.08] text-white text-[14px] font-bold rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-white/[0.2] transition-colors shadow-sm"
                  >
                    <option value="starter">Starter Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
                </div>

                <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.03] text-[#555]">
                  <span className="text-[10px] font-black italic">VS</span>
                </div>

                {/* Pinned Primary Plan (Pro) */}
                <div className="flex-1">
                  <div className="w-full bg-[#FF8C32]/[0.05] border border-[#FF8C32]/30 text-[#FF8C32] text-[14px] font-bold rounded-xl px-4 py-3 flex items-center justify-center gap-2 shadow-[inset_0_0_15px_rgba(255,140,50,0.05)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C32] shrink-0" />
                    Pro Plan
                  </div>
                </div>

              </div>
            </div>

            {/* Stacked Categories */}
            <div className="space-y-6">
              {COMPARISON_DATA.map((group, gIdx) => (
                <div key={gIdx} className="bg-[#111] border border-white/[0.05] rounded-2xl overflow-hidden shadow-lg">
                  {/* Category Header */}
                  <div className="bg-white/[0.02] px-5 py-4 border-b border-white/[0.05]">
                    <h4 className="text-[12px] font-bold text-white uppercase tracking-[0.1em]">{group.group}</h4>
                  </div>
                  
                  {/* Features */}
                  <div className="divide-y divide-white/[0.05]">
                    {group.items.map((item, iIdx) => {
                      const valLeft = mobileComparePlan === 'starter' ? item.v1 : item.v3;
                      const valRight = item.v2; // Always Pro
                      
                      return (
                        <div key={iIdx} className="px-5 py-4 flex flex-col gap-3 hover:bg-white/[0.01] transition-colors">
                          <div className="text-[14px] font-medium text-[#A1A1AA]">{item.feature}</div>
                          <div className="flex items-center justify-between mt-1">
                            {/* Left Value (Dynamic) */}
                            <div className="w-[45%] text-[14px] font-semibold text-white flex items-center">
                              {renderCellContent(valLeft)}
                            </div>
                            
                            {/* Divider Line */}
                            <div className="w-[1px] h-[20px] bg-white/[0.05]"></div>
                            
                            {/* Right Value (Pinned Pro) */}
                            <div className="w-[45%] text-[14px] font-semibold text-[#FF8C32] flex items-center justify-end">
                              {renderCellContent(valRight, true)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// DATA & HELPERS
// ═══════════════════════════════════════════════════════════

const COMPARISON_DATA = [
  {
    group: "Submissions & Analysis",
    items: [
      { feature: "Team submissions", v1: "50 teams", v2: "200 teams", v3: "Unlimited" },
      { feature: "Code analysis", v1: "check", v2: "check", v3: "check" },
      { feature: "PPT / slide analysis", v1: "check", v2: "check", v3: "check" },
      { feature: "Demo video analysis", v1: "dash", v2: "check", v3: "check" },
      { feature: "Plagiarism detection", v1: "dash", v2: "check", v3: "check" },
    ]
  },
  {
    group: "Scoring & Reports",
    items: [
      { feature: "Scoring criteria", v1: "5 criteria", v2: "Advanced", v3: "Custom" },
      { feature: "PDF report download", v1: "check", v2: "check", v3: "check" },
      { feature: "White-label reports", v1: "dash", v2: "check", v3: "check" },
      { feature: "Participant leaderboard", v1: "dash", v2: "check", v3: "check" },
      { feature: "Team email delivery", v1: "dash", v2: "check", v3: "check" },
    ]
  },
  {
    group: "Integrations & Access",
    items: [
      { feature: "API access", v1: "dash", v2: "dash", v3: "check" },
      { feature: "Custom domain", v1: "dash", v2: "dash", v3: "check" },
      { feature: "Custom judging rules", v1: "dash", v2: "dash", v3: "check" },
    ]
  },
  {
    group: "Support",
    items: [
      { feature: "Email support", v1: "check", v2: "check", v3: "check" },
      { feature: "Priority support", v1: "dash", v2: "check", v3: "check" },
      { feature: "Dedicated manager", v1: "dash", v2: "dash", v3: "check" },
      { feature: "Onboarding & training", v1: "dash", v2: "dash", v3: "check" },
      { feature: "SLA guarantee", v1: "dash", v2: "dash", v3: "check" },
    ]
  }
];

function renderCellContent(val, isPro = false) {
  if (val === 'check') return <CheckIconTable isPro={isPro} />;
  if (val === 'dash') return <DashIconTable />;
  return val;
}

// ═══════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════

function FeatureListItem({ text, isPro = false }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-[2px] flex-shrink-0">
        <CheckIcon isPro={isPro} />
      </div>
      <span className="text-[14px] text-[#CCC] leading-snug">
        {text}
      </span>
    </li>
  );
}

// Simple Check SVG for Cards (14x14)
function CheckIcon({ isPro }) {
  const color = isPro ? "#FF8C32" : "#A1A1AA";
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3 3 6-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Check SVG for Table
function CheckIconTable({ isPro }) {
  const color = isPro ? "#FF8C32" : "#FFFFFF";
  const bg = isPro ? "rgba(255,140,50,0.12)" : "rgba(255,255,255,0.06)";
  const stroke = isPro ? "rgba(255,140,50,0.3)" : "rgba(255,255,255,0.1)";
  
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill={bg} stroke={stroke} strokeWidth="1"/>
      <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Dash SVG for Table
function DashIconTable() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      <path d="M7 10h6" stroke="#333333" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
