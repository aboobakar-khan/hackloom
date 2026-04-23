import { createClient } from 'npm:@insforge/sdk';

const EXTRACTION_PROMPT = (today, conversation) => `
You are extracting hackathon form data from a conversation.
Today's date: ${today}

=== CONVERSATION ===
${conversation}
=== END CONVERSATION ===

Extract ALL fields. For relative dates ("next month", "in 2 weeks"), calculate from today: ${today}
For missing optional fields, provide smart defaults. For missing required fields, use null.

Eligibility mapping: "open to all" / "everyone" → "open", "students" / "college" → "students", "professionals" → "professionals"
Type mapping: "online" → "online", "offline" / "in-person" / "on-site" → "offline", "hybrid" → "hybrid"

Themes must be from: AI/ML, Web3, HealthTech, EdTech, FinTech, Open Innovation, Climate, Cybersecurity

Return ONLY this JSON (no markdown):
{
  "name": "<string or null>",
  "tagline": "<string or null>",
  "description": "<write a proper 2-3 sentence description based on conversation, or null>",
  "type": "<online|offline|hybrid>",
  "themes": ["<theme1>"],
  "registration_opens": "<YYYY-MM-DDTHH:mm or null>",
  "registration_closes": "<YYYY-MM-DDTHH:mm or null>",
  "submission_deadline": "<YYYY-MM-DDTHH:mm or null>",
  "results_date": "<YYYY-MM-DDTHH:mm or null>",
  "team_size_min": <number, default 1>,
  "team_size_max": <number, default 4>,
  "max_teams": <number or null>,
  "eligibility": "<open|students|professionals>",
  "prizes": [
    { "place": "1st Place", "amount": "<string amount or empty string>" },
    { "place": "2nd Place", "amount": "<string amount or empty string>" },
    { "place": "3rd Place", "amount": "<string amount or empty string>" }
  ],
  "problem_statement": "<full problem statement or null>",
  "criteria": {
    "relevance": <number 0-100>,
    "innovation": <number 0-100>,
    "technical": <number 0-100>,
    "completeness": <number 0-100>,
    "presentation": <number 0-100>
  },
  "confidence": {
    "basic_info": <0-100>,
    "timeline": <0-100>,
    "prizes": <0-100>,
    "criteria": <0-100>
  },
  "needs_confirmation": ["<field the AI inferred and user should confirm>"],
  "missing_required": ["<truly missing required field>"]
}

IMPORTANT: criteria values MUST add up to exactly 100. Default: relevance:20, innovation:20, technical:20, completeness:20, presentation:20.
Prize amounts should be strings like "25000" or "₹25,000" — not numbers.
`;

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
    const { conversation, today } = await req.json();
    const todayStr = today || new Date().toISOString().split('T')[0];

    // Format conversation as text
    const convText = conversation
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const completion = await client.ai.chat.completions.create({
      model: 'deepseek/deepseek-v3.2',
      temperature: 0.1, // Very deterministic for extraction
      maxTokens: 2000,
      messages: [
        { role: 'system', content: 'Extract form data from conversation. Return valid JSON only. No markdown.' },
        { role: 'user', content: EXTRACTION_PROMPT(todayStr, convText) }
      ],
    });

    let raw = completion.choices[0].message.content.trim();
    if (raw.startsWith('```')) raw = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();

    const formData = JSON.parse(raw);

    // Ensure criteria sums to 100
    const c = formData.criteria || {};
    const total = Object.values(c).reduce((s, v) => s + Number(v || 0), 0);
    if (total !== 100) {
      formData.criteria = { relevance: 20, innovation: 20, technical: 20, completeness: 20, presentation: 20 };
    }

    return new Response(JSON.stringify(formData), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
}
