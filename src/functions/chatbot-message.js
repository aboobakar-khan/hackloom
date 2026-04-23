import { createClient } from 'npm:@insforge/sdk';

// ─── Simple step-by-step system prompt ──────────────────────
// Much simpler than before: AI just answers ONE question at a time
// Frontend tracks the step, AI just generates the reply + extracts value
const SYSTEM_PROMPT = `You are "Nexus AI" — a friendly hackathon creation assistant.
You are conducting a step-by-step interview to collect hackathon details.
You ask ONE question at a time. You are currently on a specific step.

CRITICAL RULES:
1. ALWAYS return valid JSON — no markdown, no code fences, just pure JSON
2. NEVER say "Sorry, I had a hiccup" — always give a real response
3. Accept ANY reasonable input and extract the intent
4. For event type: "offline", "Offline", "OFFLINE", "off", "it will be offline", "in person" → all mean "offline"
   "online", "Online", "ONLINE", "on", "it will be online", "virtual" → all mean "online"
   "hybrid", "Hybrid", "mixed" → "hybrid"
5. Be friendly, use emojis, keep it conversational

THE 10 STEPS IN ORDER:
0. Ask for hackathon name
1. Ask for theme/domain (e.g., AI/ML, Web3, HealthTech, EdTech, FinTech, Open Innovation, Climate, Cybersecurity, Web Dev, etc.)
2. Ask for event mode — Online, Offline, or Hybrid
3. Ask for expected number of participants
4. Ask for prize pool (total amount and currency)
5. Ask for registration deadline
6. Ask for hackathon dates (start and end)
7. Ask for team size (min and max)
8. Ask for eligibility (open to all / students only / professionals)
9. Ask for judging criteria (what will projects be judged on?)

AFTER ALL 10 STEPS: Generate a complete hackathon brief and set is_complete to true.

ALWAYS respond in this exact JSON structure:
{
  "message": "<your friendly reply to what user just said, then ask the NEXT question naturally>",
  "extracted_value": "<the value you extracted from user's message for the CURRENT step>",
  "extracted_fields": {
    "<field_name>": "<value>"
  },
  "completion_percentage": <0-100 number>,
  "is_complete": false
}

extracted_fields should only contain fields from what user just said.
Field name mapping:
- step 0: "name"
- step 1: "themes" (array) and optionally "description"
- step 2: "type" (must be exactly "online", "offline", or "hybrid")
- step 3: "max_teams" (number)
- step 4: "prize_1st", "prize_2nd", "prize_3rd" (split 50/30/20 if total given)
- step 5: "registration_closes" (YYYY-MM-DD)
- step 6: "registration_opens" (start date YYYY-MM-DD), "submission_deadline" (end date YYYY-MM-DD)
- step 7: "team_size_min", "team_size_max" (numbers)
- step 8: "eligibility" (one of: "open", "students", "professionals")
- step 9: "criteria" (object with keys: relevance, innovation, technical, completeness, presentation — must sum to 100)

Today's date: ${new Date().toISOString().split('T')[0]}`;

// ─── Robust JSON extractor ───────────────────────────────────
function extractJSON(raw) {
  if (!raw) throw new Error('Empty response');
  
  // 1. Direct parse
  try { return JSON.parse(raw.trim()); } catch {}
  
  // 2. Strip markdown fences
  const stripped = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(stripped); } catch {}
  
  // 3. Find first { ... } block
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  
  // 4. Last resort: build a safe fallback from raw text
  // Extract message text best we can
  const msgMatch = raw.match(/"message"\s*:\s*"([^"]+)"/);
  return {
    message: msgMatch ? msgMatch[1] : raw.substring(0, 200),
    extracted_fields: {},
    completion_percentage: 10,
    is_complete: false,
  };
}

export default async function(req) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
    anonKey: Deno.env.get('ANON_KEY'),
  });

  try {
    const body = await req.json();
    const { messages = [], currentStep = 0, today } = body;

    // Build context message telling AI what step we're on
    const stepContext = `\n\n[CURRENT STEP: ${currentStep}/9. The user just answered step ${currentStep}. After acknowledging their answer, ask step ${Math.min(currentStep + 1, 9)}'s question. Completion: ${Math.round((currentStep / 9) * 100)}%]`;

    const completion = await client.ai.chat.completions.create({
      model: 'deepseek/deepseek-v3.2',
      temperature: 0.6,
      maxTokens: 600,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + stepContext },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
    });

    const raw = completion?.choices?.[0]?.message?.content || '';
    const result = extractJSON(raw);

    // Ensure required fields exist with safe defaults
    const safe = {
      message: result.message || "Got it! Let's continue. 🚀",
      extracted_fields: result.extracted_fields || {},
      extracted_value: result.extracted_value || '',
      completion_percentage: typeof result.completion_percentage === 'number' 
        ? result.completion_percentage 
        : Math.round(((currentStep + 1) / 10) * 100),
      is_complete: result.is_complete === true,
      next_step: currentStep + 1,
    };

    return new Response(JSON.stringify(safe), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // NEVER return a generic error to the user — always give a fallback response
    console.error('chatbot-message error:', err);
    
    const fallback = {
      message: "Got it! Moving to the next question. 😊",
      extracted_fields: {},
      completion_percentage: 10,
      is_complete: false,
      next_step: 1,
      _error: err.message, // for debugging only
    };

    return new Response(JSON.stringify(fallback), {
      status: 200, // Return 200 even on error so frontend doesn't crash
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
}
