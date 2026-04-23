import { useState, useRef, useEffect, useCallback } from 'react';
import { insforge } from './lib/insforge';
import {
  Send, Sparkles, CheckCircle,
  Bot, RefreshCw, X, FileText, ChevronRight, Check
} from 'lucide-react';

// ─── Step definitions ────────────────────────────────────────
const STEPS = [
  { key: 'name', label: 'Hackathon Name', quick: [] },
  { key: 'themes', label: 'Theme / Domain', quick: ['AI/ML 🤖', 'Web Dev 🌐', 'Web3 ⛓️', 'HealthTech 🏥', 'EdTech 📚', 'FinTech 💰', 'Climate 🌱', 'Open Innovation 💡'] },
  { key: 'type', label: 'Event Mode', quick: ['Online 🌐', 'Offline 📍', 'Hybrid 🔀'] },
  { key: 'max_teams', label: 'Expected Participants', quick: ['50–100', '100–300', '300–500', '500+'] },
  { key: 'prizes', label: 'Prize Pool', quick: ['₹50,000', '₹1,00,000', '$5,000', '$10,000'] },
  { key: 'registration_closes', label: 'Registration Deadline', quick: [] },
  { key: 'dates', label: 'Hackathon Dates', quick: [] },
  { key: 'team_size', label: 'Team Size', quick: ['Solo only', '2–4 members', '1–5 members', '2–6 members'] },
  { key: 'eligibility', label: 'Eligibility', quick: ['Open to all 🌍', 'College students only 🎓', 'Professionals only 💼'] },
  { key: 'criteria', label: 'Judging Criteria', quick: ['Use standard split (20/20/20/20/20)', 'Technical + Innovation focus', 'Impact + Presentation focus'] },
];

// ─── Typing Indicator ────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-4 mb-6 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shrink-0 shadow-sm relative">
        <Bot size={16} className="text-[#FF8C32]" />
      </div>
      <div className="bg-[#111] border border-white/5 rounded-2xl rounded-bl-sm px-5 py-4">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#888]"
              style={{ animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HackathonChatbot({ onFormFill, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! 👋 I'm Hackloom AI. I'll help you structure and set up your hackathon in just a few minutes.\n\nLet's start with the basics: **What do you want to name your hackathon?**",
    }
  ]);
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [allExtracted, setAllExtracted] = useState({});
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if (!isThinking && window.innerWidth > 768) {
      inputRef.current?.focus();
    }
  }, [isThinking]);

  const quickReplies = STEPS[currentStep]?.quick || [];

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || isThinking) return;

    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsThinking(true);

    try {
      const { data, error } = await insforge.functions.invoke('chatbot-message', {
        body: {
          messages: newMessages,
          currentStep,
          today: new Date().toISOString().split('T')[0],
        }
      });

      if (error) {
        console.warn('Function invoke error:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Got it! Let's keep going. 😊 What's next?"
        }]);
        setCurrentStep(s => Math.min(s + 1, 9));
        setProgress(p => Math.min(p + 10, 100));
        setIsThinking(false);
        return;
      }

      if (data?.extracted_fields) {
        const clean = Object.fromEntries(
          Object.entries(data.extracted_fields).filter(([, v]) => v !== null && v !== undefined && v !== '')
        );
        setAllExtracted(prev => ({ ...prev, ...clean }));
      }

      const newProgress = data?.completion_percentage ?? Math.round(((currentStep + 1) / 10) * 100);
      setProgress(Math.min(newProgress, 100));

      const nextStep = Math.min(currentStep + 1, 9);
      setCurrentStep(nextStep);

      const reply = data?.message || "Got it! Let's continue. 🚀";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      if (data?.is_complete || nextStep >= 10) {
        setIsComplete(true);
        setProgress(100);
      }
    } catch (err) {
      console.error('Chatbot send error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Noted! ✅ Let's move on to the next question."
      }]);
      setCurrentStep(s => Math.min(s + 1, 9));
      setProgress(p => Math.min(p + 10, 100));
    } finally {
      setIsThinking(false);
    }
  }, [input, messages, isThinking, currentStep]);

  const fillForm = useCallback(async () => {
    setIsExtracting(true);
    try {
      const { data, error } = await insforge.functions.invoke('chatbot-extract', {
        body: {
          conversation: messages,
          today: new Date().toISOString().split('T')[0],
        }
      });

      if (error) throw new Error(error.message);
      onFormFill(data);
    } catch (err) {
      console.error('Extract error:', err);
      onFormFill(allExtracted);
    } finally {
      setIsExtracting(false);
    }
  }, [messages, onFormFill, allExtracted]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Sub-components ──────────────────────────────
  const FormPreviewPanel = () => (
    <div className="h-full flex flex-col bg-[#050505]">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#050505]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-[#FF8C32]" />
          <h3 className="text-[15px] font-bold text-white tracking-wide">Form Blueprint</h3>
        </div>
        <div className="text-[12px] font-bold bg-[#FF8C32]/10 text-[#FF8C32] px-2.5 py-1 rounded-md">
          {progress}%
        </div>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <p className="text-[13px] text-[#888] mb-6 leading-relaxed">
          I'm actively building your hackathon configuration. Here is what we have so far:
        </p>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-white/5">
          {STEPS.map((step, i) => {
            const hasData = allExtracted[step.key] !== undefined || i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step.key} className={`relative pl-8 ${isCurrent ? 'opacity-100' : hasData ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`absolute left-0 top-[2px] w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                  hasData && !isCurrent ? 'bg-[#FF8C32] border-[#FF8C32] text-black' : 
                  isCurrent ? 'bg-[#0A0A0A] border-[#FF8C32] text-[#FF8C32]' : 
                  'bg-[#0A0A0A] border-white/20 text-[#666]'
                }`}>
                  {hasData && !isCurrent ? <Check size={12} /> : i + 1}
                </div>
                <div className={`text-[13px] font-bold ${isCurrent ? 'text-white' : 'text-[#A1A1AA]'} mb-1`}>{step.label}</div>
                {allExtracted[step.key] && (
                  <div className="text-[13px] text-white font-medium bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-2 truncate">
                    {allExtracted[step.key].toString()}
                  </div>
                )}
                {isCurrent && !allExtracted[step.key] && (
                  <div className="text-[12px] text-[#FF8C32] animate-pulse mt-1">Collecting now...</div>
                )}
              </div>
            );
          })}
        </div>
        
        {progress >= 60 && !isComplete && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <button
              onClick={fillForm}
              disabled={isExtracting}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white rounded-xl py-3 text-[13px] font-bold transition-all disabled:opacity-50"
            >
               Skip to Generation
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center sm:p-4 md:p-6 bg-[#0A0A0A] sm:bg-black/60 sm:backdrop-blur-sm">
      <div className="w-full h-full sm:max-w-5xl sm:h-[90vh] bg-[#0A0A0A] sm:rounded-[32px] sm:border border-white/10 flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
        
        {/* ─── Mobile Form Preview Overlay ─── */}
        {showMobilePreview && (
          <div className="absolute inset-0 z-50 bg-[#050505] flex flex-col md:hidden animate-fade-in">
             <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-[#0A0A0A]">
                <h3 className="text-[16px] font-bold text-white flex items-center gap-2"><FileText size={16} className="text-[#FF8C32]" /> Form Blueprint</h3>
                <button onClick={() => setShowMobilePreview(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-white"><X size={16}/></button>
             </div>
             <div className="flex-1 overflow-y-auto">
               <FormPreviewPanel />
             </div>
          </div>
        )}

        {/* ─── Left: Chat Interface ─── */}
        <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] relative z-10">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-white/[0.04] bg-[#0A0A0A]/90 backdrop-blur-xl shrink-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shrink-0">
                <Bot size={18} className="text-[#FF8C32]" />
              </div>
              <div>
                <div className="text-[15px] sm:text-[16px] font-bold text-white flex items-center gap-2 tracking-tight">
                  Hackloom AI
                  <span className="text-[9px] font-bold bg-[#FF8C32]/10 text-[#FF8C32] px-1.5 py-0.5 rounded-sm uppercase tracking-wider hidden sm:block">Assistant</span>
                </div>
                <div className="text-[12px] text-[#888] font-medium hidden sm:block">Building your event config...</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Preview Toggle */}
              <button onClick={() => setShowMobilePreview(true)} className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-[#111] border border-white/10 rounded-lg text-[12px] font-bold text-white">
                <FileText size={14} className="text-[#FF8C32]"/> {progress}% Built
              </button>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-transparent hover:bg-white/10 flex items-center justify-center text-[#888] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Progress Bar (Header bottom border) */}
          <div className="h-[2px] bg-white/[0.02] w-full shrink-0">
            <div
              className="h-full bg-[#FF8C32] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,140,50,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-6 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shrink-0 shadow-sm relative mb-1 hidden sm:flex">
                    <Bot size={14} className="text-[#FF8C32]" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-5 py-4 text-[15px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#1A1A1A] text-white rounded-3xl rounded-br-md font-medium border border-white/5'
                      : 'bg-transparent text-[#E5E5E5] rounded-3xl rounded-bl-md font-light'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isThinking && <TypingIndicator />}

            {/* Complete banner */}
            {isComplete && !isExtracting && (
              <div className="flex flex-col items-center gap-4 py-8 animate-fade-in border-t border-white/5 mt-8">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <CheckCircle size={24} className="text-green-500" />
                </div>
                <div className="text-[16px] font-bold text-white tracking-tight">Configuration Complete!</div>
                <button
                  onClick={fillForm}
                  className="flex items-center gap-2 bg-[#FF8C32] hover:bg-[#FF6B00] text-black rounded-xl px-8 py-3.5 text-[15px] font-bold transition-transform active:scale-[0.98] shadow-lg shadow-[#FF8C32]/20"
                >
                  <Sparkles size={16} />
                  Generate Hackathon Form
                </button>
              </div>
            )}

            {isExtracting && (
              <div className="flex flex-col items-center justify-center gap-3 py-10">
                <RefreshCw size={24} className="animate-spin text-[#FF8C32]" />
                <div className="text-[14px] text-white font-medium">Assembling your hackathon form...</div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          {quickReplies.length > 0 && !isThinking && !isComplete && (
            <div className="px-4 sm:px-8 py-3 flex gap-2 overflow-x-auto hide-scrollbar bg-gradient-to-t from-[#0A0A0A] to-transparent shrink-0">
              {quickReplies.map((r, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(r)}
                  className="shrink-0 text-[13px] font-medium bg-[#111] hover:bg-[#1A1A1A] border border-white/10 text-white rounded-full px-5 py-2.5 transition-transform active:scale-[0.96] shadow-sm"
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="px-4 sm:px-8 py-4 sm:py-5 border-t border-white/[0.04] bg-[#0A0A0A] shrink-0" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isComplete ? 'Chat complete!' : 'Message Hackloom AI...'}
                rows={1}
                disabled={isThinking || isExtracting}
                readOnly={isComplete}
                className="flex-1 bg-[#111] border border-white/10 focus:border-[#FF8C32]/50 focus:ring-1 focus:ring-[#FF8C32]/50 rounded-2xl px-5 py-3.5 text-[15px] text-white placeholder-[#666] outline-none resize-none transition-all disabled:opacity-50 min-h-[52px] max-h-[140px] shadow-inner"
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isThinking || isExtracting || isComplete}
                className="w-[52px] h-[52px] rounded-2xl bg-[#FF8C32] hover:bg-[#FF6B00] disabled:bg-white/10 disabled:text-[#666] flex items-center justify-center transition-transform active:scale-[0.95] shrink-0 shadow-md text-black"
              >
                <Send size={20} />
              </button>
            </div>
            
            <div className="text-center mt-3 hidden sm:block">
               <span className="text-[11px] font-medium text-[#555]">Hackloom AI can make mistakes. Please verify the generated form before publishing.</span>
            </div>
          </div>
        </div>

        {/* ─── Right: Form Preview / Progress (Desktop) ─── */}
        <div className="hidden md:flex w-[340px] lg:w-[380px] bg-[#050505] border-l border-white/5 flex-col shrink-0 relative z-20">
           <FormPreviewPanel />
        </div>
        
      </div>

      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
