import { createClient } from 'npm:@insforge/sdk';

// ═══════════════════════════════════════════════════════════
// SYSTEM PROMPT — Sets the AI judge persona
// ═══════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `You are an expert hackathon judge and senior software engineer with 10+ years of experience evaluating technical projects.

CRITICAL RULES:
- You are evaluating ONE specific project only. Ignore everything else.
- The project data you receive belongs ONLY to the team mentioned in PROJECT_ID.
- Do NOT mix or compare with any other project.
- Evaluate ONLY against the PROBLEM STATEMENT provided by the organizer.
- If the project does not address the problem statement, score problem_relevance low.
- You do NOT consider team size, college name, or personal information.
- Respond in valid JSON only. No extra text. No markdown. Pure JSON.
- Be specific — mention exact file names, functions, or slide content in feedback.`;

// ═══════════════════════════════════════════════════════════
// PROMPT TEMPLATES
// ═══════════════════════════════════════════════════════════
function buildCodePrompt(ctx) {
  return `=== ISOLATED PROJECT EVALUATION — DO NOT MIX WITH OTHER PROJECTS ===

PROJECT_ID: ${ctx.project_id}
PROJECT_NAME: ${ctx.project_name}
TEAM_NAME: ${ctx.team_name}
SUBMISSION_TIMESTAMP: ${ctx.submitted_at}

=== HACKATHON PROBLEM STATEMENT (by organizer) ===
${ctx.problem_statement || 'No specific problem statement provided. Evaluate the project on its own technical merit.'}

=== THIS TEAM'S GITHUB REPOSITORY ===
Repo URL: ${ctx.github_url}
Repo Name: ${ctx.repo_name || 'N/A'}
Description: ${ctx.repo_description || 'N/A'}
Languages Used: ${ctx.languages || 'N/A'}
Total Files: ${ctx.total_files || 'N/A'}
Last Commit: ${ctx.last_updated || 'N/A'}

File Structure:
${ctx.file_tree || 'N/A'}

README Content:
${ctx.readme_content || 'No README found.'}

Code Sample (main files):
${ctx.code_sample || 'No code samples extracted.'}

=== YOUR TASK ===
Analyze ONLY the above repository for PROJECT_ID: ${ctx.project_id}.
Evaluate how well it solves the PROBLEM STATEMENT above.

Return this exact JSON:
{
  "project_id": "${ctx.project_id}",
  "team_name": "${ctx.team_name}",
  "analysis_type": "code",
  "code_quality_score": "<0-100>",
  "code_quality_reason": "<2 specific sentences mentioning actual files/functions>",
  "technical_complexity_score": "<0-100>",
  "technical_complexity_reason": "<2 specific sentences>",
  "tech_stack": ["<tech1>", "<tech2>"],
  "complexity_level": "<basic|intermediate|advanced>",
  "innovation_score": "<0-100>",
  "innovation_reason": "<2 specific sentences>",
  "unique_aspects": ["<aspect1>", "<aspect2>"],
  "problem_relevance_score": "<0-100>",
  "problem_relevance_reason": "<does this code actually solve the organizer problem statement? be specific>",
  "solves_problem": "<true|false>",
  "how_it_solves": "<1 sentence — map code features to problem statement>",
  "code_positives": ["<positive 1>", "<positive 2>", "<positive 3>"],
  "code_concerns": ["<concern 1>", "<concern 2>"],
  "plagiarism_flag": "<true|false>",
  "plagiarism_reason": "<reason or null>",
  "confidence": "<0-100>"
}`;
}

function buildDocPrompt(ctx) {
  return `=== ISOLATED PROJECT EVALUATION — DO NOT MIX WITH OTHER PROJECTS ===

PROJECT_ID: ${ctx.project_id}
PROJECT_NAME: ${ctx.project_name}
TEAM_NAME: ${ctx.team_name}
SUBMISSION_TIMESTAMP: ${ctx.submitted_at}

=== HACKATHON PROBLEM STATEMENT (by organizer) ===
${ctx.problem_statement || 'No specific problem statement provided.'}

=== THIS TEAM'S DOCUMENT ===
File Name: ${ctx.file_name || 'presentation'}
File Type: ${ctx.file_type || 'unknown'}

Extracted Text:
${ctx.extracted_text || 'No document text available.'}

=== YOUR TASK ===
Analyze ONLY the above document for PROJECT_ID: ${ctx.project_id}.
Evaluate how well it presents a solution to the PROBLEM STATEMENT above.

Return this exact JSON:
{
  "project_id": "${ctx.project_id}",
  "team_name": "${ctx.team_name}",
  "analysis_type": "document",
  "presentation_score": "<0-100>",
  "presentation_reason": "<2 specific sentences>",
  "slide_structure": "<poor|fair|good|excellent>",
  "problem_understanding_score": "<0-100>",
  "problem_understanding_reason": "<does the team understand the organizer's problem? be specific>",
  "problem_correctly_identified": "<true|false>",
  "solution_clarity_score": "<0-100>",
  "solution_clarity_reason": "<2 specific sentences>",
  "solution_explained_well": "<true|false>",
  "impact_score": "<0-100>",
  "impact_reason": "<2 specific sentences>",
  "target_users_identified": "<true|false>",
  "real_world_applicability": "<low|medium|high>",
  "doc_positives": ["<positive 1>", "<positive 2>"],
  "doc_concerns": ["<concern 1>", "<concern 2>"],
  "confidence": "<0-100>"
}`;
}

function buildFinalPrompt(ctx, codeResult, docResult, rubric) {
  const w_code = rubric.technical || 20;
  const w_tech = rubric.completeness || 20;
  const w_innovation = rubric.innovation || 20;
  const w_presentation = rubric.presentation || 20;
  const w_relevance = rubric.relevance || 20;

  return `=== FINAL EVALUATION — ISOLATED TO ONE PROJECT ONLY ===

PROJECT_ID: ${ctx.project_id}
PROJECT_NAME: ${ctx.project_name}
TEAM_NAME: ${ctx.team_name}

=== HACKATHON PROBLEM STATEMENT (by organizer) ===
${ctx.problem_statement || 'No specific problem statement provided.'}

=== CODE ANALYSIS RESULT (for this project only) ===
${JSON.stringify(codeResult, null, 2)}

=== DOCUMENT ANALYSIS RESULT (for this project only) ===
${JSON.stringify(docResult, null, 2)}

=== ORGANIZER RUBRIC WEIGHTS ===
Code Quality:          ${w_code}%
Technical Complexity:  ${w_tech}%
Innovation:            ${w_innovation}%
Presentation:          ${w_presentation}%
Problem Relevance:     ${w_relevance}%
(Total = 100%)

=== YOUR TASK ===
1. Combine ONLY the above two analyses for PROJECT_ID: ${ctx.project_id}
2. Calculate weighted final score
3. Write honest, specific feedback directly to the team
4. If the project does NOT solve the organizer's problem statement — reflect that clearly in problem_relevance and overall score

WEIGHTED SCORE FORMULA:
final_score = (
  code_quality_score      × ${w_code} / 100 +
  technical_complexity    × ${w_tech} / 100 +
  innovation_score        × ${w_innovation} / 100 +
  presentation_score      × ${w_presentation} / 100 +
  problem_relevance_score × ${w_relevance} / 100
)

Return this exact JSON:
{
  "project_id": "${ctx.project_id}",
  "team_name": "${ctx.team_name}",
  "project_name": "${ctx.project_name}",
  "analysis_type": "final",
  "final_score": "<0.0-100.0, rounded to 1 decimal>",
  "score_breakdown": {
    "code_quality": "<raw score 0-100>",
    "technical_complexity": "<raw score 0-100>",
    "innovation": "<raw score 0-100>",
    "presentation": "<raw score 0-100>",
    "problem_relevance": "<raw score 0-100>",
    "weighted_total": "<final weighted score>"
  },
  "grade": "<A+|A|B+|B|C+|C|D|F>",
  "verdict": "<Top Contender|Strong Submission|Good Attempt|Average|Needs Work|Incomplete>",
  "problem_statement_match": {
    "addressed": "<true|false>",
    "match_percentage": "<0-100>",
    "match_reason": "<1-2 sentences: how well does this project solve the organizer's exact problem>"
  },
  "team_feedback": {
    "opening": "<1 honest sentence about overall impression>",
    "strengths": [
      "<strength 1 — mention specific file, feature, or slide>",
      "<strength 2 — mention specific file, feature, or slide>",
      "<strength 3 — mention specific file, feature, or slide>"
    ],
    "improvements": [
      "<improvement 1 — say exactly what to fix and how>",
      "<improvement 2 — say exactly what to fix and how>",
      "<improvement 3 — say exactly what to fix and how>"
    ],
    "closing": "<1 motivating sentence>"
  },
  "organizer_notes": {
    "one_line_summary": "<max 12 words>",
    "shortlist_recommendation": "<true|false>",
    "human_review_needed": "<true|false>",
    "human_review_reason": "<reason or null>",
    "red_flag": "<any serious concern or null>"
  },
  "evaluation_confidence": "<0-100>"
}`;
}

// ═══════════════════════════════════════════════════════════
// GITHUB REPO FETCHER
// ═══════════════════════════════════════════════════════════
async function fetchGitHubRepo(githubUrl) {
  try {
    // Parse owner/repo from URL
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return { error: 'Invalid GitHub URL' };
    
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');
    const headers = { 'User-Agent': 'NexusJudgeEngine/1.0', 'Accept': 'application/vnd.github.v3+json' };

    // Fetch repo metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) return { error: `GitHub API error: ${repoRes.status}` };
    const repoData = await repoRes.json();

    // Fetch file tree (recursive, first 100 files)
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`, { headers });
    let fileTree = 'Could not fetch file tree.';
    let totalFiles = 0;
    let codeFiles = [];
    
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      const files = (treeData.tree || []).filter(f => f.type === 'blob');
      totalFiles = files.length;
      
      // Build file tree string (limit to 80 files for context window)
      fileTree = files.slice(0, 80).map(f => f.path).join('\n');
      
      // Identify main code files (skip images, lock files, etc.)
      const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.rb', '.php', '.swift', '.kt', '.dart', '.vue', '.svelte'];
      const skipPatterns = ['node_modules', 'package-lock', 'yarn.lock', '.git', 'dist/', 'build/', '.next/', '__pycache__', '.env'];
      
      codeFiles = files.filter(f => {
        const ext = '.' + f.path.split('.').pop();
        const isCode = codeExtensions.includes(ext);
        const isSkipped = skipPatterns.some(p => f.path.includes(p));
        return isCode && !isSkipped && f.size < 50000; // skip huge files
      }).sort((a, b) => {
        // Prioritize main/index/app files
        const priority = ['main', 'index', 'app', 'server', 'routes', 'api'];
        const aScore = priority.some(p => a.path.toLowerCase().includes(p)) ? 0 : 1;
        const bScore = priority.some(p => b.path.toLowerCase().includes(p)) ? 0 : 1;
        return aScore - bScore;
      }).slice(0, 5); // Top 5 most important files
    }

    // Fetch README
    let readmeContent = 'No README found.';
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        readmeContent = atob(readmeData.content.replace(/\n/g, ''));
        if (readmeContent.length > 4000) readmeContent = readmeContent.substring(0, 4000) + '\n... (truncated)';
      }
    } catch (e) { /* no readme */ }

    // Fetch code samples (top 5 files)
    let codeSample = '';
    for (const file of codeFiles) {
      try {
        const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`, { headers });
        if (fileRes.ok) {
          const fileData = await fileRes.json();
          let content = atob(fileData.content.replace(/\n/g, ''));
          if (content.length > 2000) content = content.substring(0, 2000) + '\n... (truncated)';
          codeSample += `\n--- FILE: ${file.path} ---\n${content}\n`;
        }
      } catch (e) { /* skip file */ }
    }
    if (!codeSample) codeSample = 'No code files could be extracted.';
    if (codeSample.length > 12000) codeSample = codeSample.substring(0, 12000) + '\n... (truncated)';

    // Detect languages
    let languages = 'N/A';
    try {
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
      if (langRes.ok) {
        const langData = await langRes.json();
        languages = Object.keys(langData).join(', ');
      }
    } catch (e) { /* skip */ }

    return {
      repo_name: repoData.full_name,
      repo_description: repoData.description || 'No description',
      languages,
      total_files: totalFiles,
      last_updated: repoData.pushed_at,
      file_tree: fileTree,
      readme_content: readmeContent,
      code_sample: codeSample,
    };
  } catch (err) {
    return { error: `Failed to fetch GitHub repo: ${err.message}` };
  }
}

// ═══════════════════════════════════════════════════════════
// AI CALL HELPER
// ═══════════════════════════════════════════════════════════
async function callAI(client, prompt) {
  const completion = await client.ai.chat.completions.create({
    model: 'deepseek/deepseek-v3.2',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    maxTokens: 4000,
  });

  const raw = completion.choices[0].message.content;
  
  // Robust JSON extraction
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();
  
  // Try direct parse first, then regex extract
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  throw new Error('Failed to parse AI response as JSON');
}

// ═══════════════════════════════════════════════════════════
// PROGRESS LOG — writes live step-by-step details to DB
// ═══════════════════════════════════════════════════════════
async function logProgress(client, analysisId, step, detail, status = 'running', extraFields = {}) {
  // Append to progress_log array
  const logEntry = {
    step,
    detail,
    status, // 'running' | 'done' | 'error' | 'skipped'
    timestamp: new Date().toISOString(),
  };

  await client.database
    .from('project_analyses')
    .update({
      step,
      updated_at: new Date().toISOString(),
      progress_log: client.database.raw(`COALESCE(progress_log, '[]'::jsonb) || '${JSON.stringify(logEntry)}'::jsonb`),
      ...extraFields,
    })
    .eq('id', analysisId);
}

// Simpler version that just updates step + extra fields (for large JSONB saves)
async function updateAnalysis(client, analysisId, fields) {
  await client.database
    .from('project_analyses')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', analysisId);
}

// Append a log entry via raw SQL (more reliable for JSONB append)
async function appendLog(client, analysisId, step, detail, status = 'done') {
  const entry = JSON.stringify({ step, detail, status, timestamp: new Date().toISOString() });
  await client.database.raw(
    `UPDATE project_analyses SET progress_log = COALESCE(progress_log, '[]'::jsonb) || $1::jsonb, step = $2, updated_at = NOW() WHERE id = $3`,
    [entry, step, analysisId]
  ).catch(() => {
    // Fallback: just update step
    client.database.from('project_analyses').update({ step, updated_at: new Date().toISOString() }).eq('id', analysisId);
  });
}

// ═══════════════════════════════════════════════════════════
// YOUTUBE TRANSCRIPT FETCHER
// ═══════════════════════════════════════════════════════════
async function fetchYouTubeTranscript(videoUrl) {
  try {
    // Extract video ID from various YouTube URL formats
    let videoId = null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
      const m = videoUrl.match(p);
      if (m) { videoId = m[1]; break; }
    }
    if (!videoId) return { error: 'Could not extract YouTube video ID', transcript: '' };

    // Try fetching transcript via public innertube API
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    if (!res.ok) return { error: `YouTube page fetch failed: ${res.status}`, transcript: '' };
    
    const html = await res.text();
    
    // Extract video title
    const titleMatch = html.match(/<title>(.+?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown';
    
    // Extract caption track URL from page data
    const captionMatch = html.match(/"captionTracks":\[(.*?)\]/);
    if (!captionMatch) {
      // No captions available — extract description instead
      const descMatch = html.match(/"shortDescription":"(.*?)"/);
      const desc = descMatch ? descMatch[1].replace(/\\n/g, '\n').substring(0, 2000) : '';
      return {
        video_id: videoId,
        title,
        transcript: '',
        description: desc,
        has_captions: false,
        note: 'No captions/subtitles available. Using video description instead.',
      };
    }

    // Parse caption track and fetch transcript
    try {
      const trackData = JSON.parse(`[${captionMatch[1]}]`);
      const englishTrack = trackData.find(t => t.languageCode === 'en') || trackData[0];
      
      if (englishTrack?.baseUrl) {
        const captionUrl = englishTrack.baseUrl.replace(/\\u0026/g, '&');
        const captionRes = await fetch(captionUrl);
        if (captionRes.ok) {
          const captionXml = await captionRes.text();
          // Extract text from XML caption format
          const texts = [];
          const textMatches = captionXml.matchAll(/<text[^>]*>(.*?)<\/text>/gs);
          for (const m of textMatches) {
            texts.push(m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'));
          }
          const transcript = texts.join(' ').substring(0, 5000);
          return { video_id: videoId, title, transcript, has_captions: true };
        }
      }
    } catch (e) { /* fall through */ }

    return { video_id: videoId, title, transcript: '', has_captions: false, note: 'Could not parse captions.' };
  } catch (err) {
    return { error: `YouTube fetch failed: ${err.message}`, transcript: '' };
  }
}

// ═══════════════════════════════════════════════════════════
// VIDEO ANALYSIS PROMPT
// ═══════════════════════════════════════════════════════════
function buildVideoPrompt(ctx) {
  return `=== ISOLATED PROJECT EVALUATION — DO NOT MIX WITH OTHER PROJECTS ===

PROJECT_ID: ${ctx.project_id}
PROJECT_NAME: ${ctx.project_name}
TEAM_NAME: ${ctx.team_name}

=== HACKATHON PROBLEM STATEMENT (by organizer) ===
${ctx.problem_statement || 'No specific problem statement provided.'}

=== THIS TEAM'S DEMO VIDEO ===
Video Title: ${ctx.video_title || 'N/A'}
Video URL: ${ctx.demo_url || 'N/A'}
Has Captions: ${ctx.has_captions ? 'Yes' : 'No'}

${ctx.video_transcript ? `Transcript:\n${ctx.video_transcript}` : ''}
${ctx.video_description ? `Description:\n${ctx.video_description}` : ''}
${ctx.video_note || ''}

=== YOUR TASK ===
Analyze ONLY the above demo video content for PROJECT_ID: ${ctx.project_id}.
Evaluate: demo clarity, feature coverage, working product proof, presentation quality.

Return this exact JSON:
{
  "project_id": "${ctx.project_id}",
  "team_name": "${ctx.team_name}",
  "analysis_type": "video",
  "demo_quality_score": "<0-100>",
  "demo_quality_reason": "<2 specific sentences about demo quality>",
  "feature_coverage_score": "<0-100>",
  "feature_coverage_reason": "<what features were shown vs missing>",
  "working_product_proof": "<true|false>",
  "working_product_reason": "<did they show a working product?>",
  "video_positives": ["<positive 1>", "<positive 2>"],
  "video_concerns": ["<concern 1>", "<concern 2>"],
  "confidence": "<0-100>"
}`;
}

// ═══════════════════════════════════════════════════════════
// MAIN HANDLER — V2 with progress logging + YouTube analysis
// ═══════════════════════════════════════════════════════════
export default async function(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
    anonKey: Deno.env.get('ANON_KEY'),
  });

  try {
    const body = await req.json();
    const { submission_id } = body;

    if (!submission_id) {
      return new Response(JSON.stringify({ error: 'submission_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── Step 0: Fetch submission + hackathon ───
    const { data: submission, error: subErr } = await client.database
      .from('submissions').select().eq('id', submission_id).single();

    if (subErr || !submission) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let hackathon = {};
    if (submission.hackathon_id) {
      const { data: h } = await client.database
        .from('hackathons').select().eq('id', submission.hackathon_id).single();
      if (h) hackathon = h;
    }

    // ─── Create analysis row with empty progress log ───
    await client.database.from('project_analyses').delete().eq('submission_id', submission_id);
    
    const initLog = [{ step: 'init', detail: `Starting analysis for "${submission.project_name}" by ${submission.team_name}`, status: 'done', timestamp: new Date().toISOString() }];

    const { data: analysis, error: insertErr } = await client.database
      .from('project_analyses')
      .insert([{
        submission_id,
        hackathon_id: submission.hackathon_id,
        team_name: submission.team_name,
        status: 'analyzing',
        step: 'fetching_code',
        progress_log: initLog,
      }])
      .select().single();

    if (insertErr) {
      return new Response(JSON.stringify({ error: 'Failed to create analysis', details: insertErr }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aid = analysis.id;
    await client.database.from('submissions').update({ status: 'evaluating' }).eq('id', submission_id);

    // ─── Stage 1: Fetch GitHub Repo ───
    await updateAnalysis(client, aid, { step: 'fetching_code', progress_log: [...initLog, { step: 'fetching_code', detail: `Fetching GitHub repository: ${submission.github_url || 'None provided'}`, status: 'running', timestamp: new Date().toISOString() }] });

    let repoData = {};
    if (submission.github_url) {
      repoData = await fetchGitHubRepo(submission.github_url);
    }

    const codeLog = { step: 'fetching_code', detail: repoData.error ? `GitHub fetch error: ${repoData.error}` : `Fetched repo: ${repoData.repo_name || 'N/A'} — ${repoData.total_files || 0} files, languages: ${repoData.languages || 'N/A'}`, status: repoData.error ? 'error' : 'done', timestamp: new Date().toISOString() };

    const context = {
      project_id: submission.id,
      project_name: submission.project_name,
      team_name: submission.team_name,
      submitted_at: submission.submitted_at || submission.created_at,
      problem_statement: hackathon.problem_statement || hackathon.description || '',
      github_url: submission.github_url || '',
      repo_name: repoData.repo_name || '',
      repo_description: repoData.repo_description || '',
      languages: repoData.languages || '',
      total_files: repoData.total_files || 0,
      last_updated: repoData.last_updated || '',
      file_tree: repoData.file_tree || '',
      readme_content: repoData.readme_content || '',
      code_sample: repoData.code_sample || '',
    };

    // ─── Stage 2: Code Analysis ───
    const logs = [...initLog, codeLog];
    logs.push({ step: 'analyzing_code', detail: 'Running AI code analysis — evaluating structure, quality, innovation, and problem relevance...', status: 'running', timestamp: new Date().toISOString() });
    await updateAnalysis(client, aid, { step: 'analyzing_code', progress_log: logs });
    
    let codeResult = {};
    try {
      codeResult = await callAI(client, buildCodePrompt(context));
      logs.push({ step: 'analyzing_code', detail: `Code analysis complete — Quality: ${codeResult.code_quality_score}/100, Tech: ${codeResult.technical_complexity_score}/100, Innovation: ${codeResult.innovation_score}/100. Tech stack: ${(codeResult.tech_stack || []).join(', ')}`, status: 'done', timestamp: new Date().toISOString() });
    } catch (e) {
      codeResult = { error: e.message, code_quality_score: 0, technical_complexity_score: 0, innovation_score: 0, problem_relevance_score: 0 };
      logs.push({ step: 'analyzing_code', detail: `Code analysis failed: ${e.message}`, status: 'error', timestamp: new Date().toISOString() });
    }
    await updateAnalysis(client, aid, { step: 'analyzing_doc', code_result: codeResult, progress_log: logs });

    // ─── Stage 3: PPT / Document Analysis ───
    let docResult = {};
    if (submission.ppt_url) {
      logs.push({ step: 'analyzing_doc', detail: `Extracting text from presentation: ${submission.ppt_url.split('/').pop() || 'document'}`, status: 'running', timestamp: new Date().toISOString() });
      await updateAnalysis(client, aid, { step: 'analyzing_doc', progress_log: logs });

      try {
        const extractionResult = await client.ai.chat.completions.create({
          model: 'deepseek/deepseek-v3.2',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Extract ALL text content from this document. Return the complete text as-is, preserving slide/section structure. Do not summarize.' },
              { type: 'file', file: { filename: 'presentation', file_data: submission.ppt_url } }
            ]
          }],
          fileParser: { enabled: true },
          maxTokens: 8000,
        });

        const extractedText = extractionResult.choices[0].message.content;
        context.file_name = submission.ppt_url.split('/').pop() || 'presentation';
        context.file_type = context.file_name.split('.').pop() || 'unknown';
        context.extracted_text = extractedText;

        logs.push({ step: 'analyzing_doc', detail: `Extracted ${extractedText.length} characters from presentation. Running AI analysis...`, status: 'running', timestamp: new Date().toISOString() });
        await updateAnalysis(client, aid, { progress_log: logs });

        docResult = await callAI(client, buildDocPrompt(context));
        logs.push({ step: 'analyzing_doc', detail: `Presentation analysis complete — Score: ${docResult.presentation_score}/100, Clarity: ${docResult.solution_clarity_score}/100, Structure: ${docResult.slide_structure}`, status: 'done', timestamp: new Date().toISOString() });
      } catch (e) {
        docResult = { error: e.message, presentation_score: 50, problem_understanding_score: 50, solution_clarity_score: 50, impact_score: 50 };
        logs.push({ step: 'analyzing_doc', detail: `Document analysis failed: ${e.message}`, status: 'error', timestamp: new Date().toISOString() });
      }
    } else {
      docResult = { analysis_type: 'document', presentation_score: 50, presentation_reason: 'No presentation submitted.', problem_understanding_score: 50, solution_clarity_score: 50, impact_score: 50, note: 'No document — neutral scores.' };
      logs.push({ step: 'analyzing_doc', detail: 'No presentation file submitted — using neutral scores (50/100).', status: 'skipped', timestamp: new Date().toISOString() });
    }
    await updateAnalysis(client, aid, { doc_result: docResult, progress_log: logs });

    // ─── Stage 4: YouTube Demo Analysis (NEW) ───
    let videoResult = {};
    if (submission.demo_url) {
      logs.push({ step: 'analyzing_video', detail: `Fetching YouTube transcript for: ${submission.demo_url}`, status: 'running', timestamp: new Date().toISOString() });
      await updateAnalysis(client, aid, { step: 'analyzing_video', progress_log: logs });

      const ytData = await fetchYouTubeTranscript(submission.demo_url);
      
      if (ytData.error) {
        logs.push({ step: 'analyzing_video', detail: `YouTube fetch issue: ${ytData.error}`, status: 'error', timestamp: new Date().toISOString() });
      } else {
        context.video_title = ytData.title;
        context.demo_url = submission.demo_url;
        context.has_captions = ytData.has_captions;
        context.video_transcript = ytData.transcript;
        context.video_description = ytData.description || '';
        context.video_note = ytData.note || '';

        const transcriptInfo = ytData.has_captions ? `Transcript: ${ytData.transcript.length} chars` : 'No captions — using description';
        logs.push({ step: 'analyzing_video', detail: `Video: "${ytData.title}". ${transcriptInfo}. Running AI analysis...`, status: 'running', timestamp: new Date().toISOString() });
        await updateAnalysis(client, aid, { progress_log: logs });

        try {
          videoResult = await callAI(client, buildVideoPrompt(context));
          logs.push({ step: 'analyzing_video', detail: `Video analysis complete — Demo quality: ${videoResult.demo_quality_score}/100, Features: ${videoResult.feature_coverage_score}/100, Working proof: ${videoResult.working_product_proof}`, status: 'done', timestamp: new Date().toISOString() });
        } catch (e) {
          videoResult = { error: e.message, demo_quality_score: 50, feature_coverage_score: 50 };
          logs.push({ step: 'analyzing_video', detail: `Video analysis failed: ${e.message}`, status: 'error', timestamp: new Date().toISOString() });
        }
      }
    } else {
      videoResult = { analysis_type: 'video', demo_quality_score: 50, note: 'No demo video submitted.' };
      logs.push({ step: 'analyzing_video', detail: 'No demo video submitted — skipping video analysis.', status: 'skipped', timestamp: new Date().toISOString() });
    }
    await updateAnalysis(client, aid, { video_result: videoResult, progress_log: logs });

    // ─── Stage 5: Final Scoring ───
    logs.push({ step: 'scoring', detail: 'Combining all analyses — calculating weighted final score...', status: 'running', timestamp: new Date().toISOString() });
    await updateAnalysis(client, aid, { step: 'scoring', progress_log: logs });

    const rubric = hackathon.criteria || { relevance: 20, technical: 20, innovation: 20, completeness: 20, presentation: 20 };

    let finalResult = {};
    try {
      finalResult = await callAI(client, buildFinalPrompt(context, codeResult, docResult, rubric));
      logs.push({ step: 'scoring', detail: `Final score: ${finalResult.final_score}/100, Grade: ${finalResult.grade}, Verdict: ${finalResult.verdict}`, status: 'done', timestamp: new Date().toISOString() });
    } catch (e) {
      finalResult = { error: e.message, final_score: 0, grade: 'F' };
      logs.push({ step: 'scoring', detail: `Final scoring failed: ${e.message}`, status: 'error', timestamp: new Date().toISOString() });
    }

    // ─── Save Everything ───
    const finalScore = parseFloat(finalResult.final_score) || 0;
    const grade = finalResult.grade || 'N/A';
    const shortlisted = finalResult.organizer_notes?.shortlist_recommendation === true;
    const needsReview = finalResult.organizer_notes?.human_review_needed === true;

    let newStatus = 'evaluated';
    let flagReason = null;
    if (needsReview) {
      newStatus = 'flagged';
      flagReason = finalResult.organizer_notes?.human_review_reason || 'AI flagged for human review';
    }

    const maxScore = submission.max_score || 25;
    const normalizedScore = Math.round((finalScore / 100) * maxScore * 10) / 10;

    const dimensions = {};
    if (finalResult.score_breakdown) {
      const sb = finalResult.score_breakdown;
      dimensions.code_quality = Math.round((sb.code_quality || 0) / 20);
      dimensions.technical = Math.round((sb.technical_complexity || 0) / 20);
      dimensions.innovation = Math.round((sb.innovation || 0) / 20);
      dimensions.presentation = Math.round((sb.presentation || 0) / 20);
      dimensions.relevance = Math.round((sb.problem_relevance || 0) / 20);
    }

    logs.push({ step: 'done', detail: `✅ Analysis complete! Score: ${finalScore}/100 (${grade}). Normalized: ${normalizedScore}/${maxScore}`, status: 'done', timestamp: new Date().toISOString() });

    await updateAnalysis(client, aid, {
      status: 'completed',
      step: 'done',
      final_result: finalResult,
      final_score: finalScore,
      grade,
      shortlisted,
      progress_log: logs,
    });

    await client.database.from('submissions').update({
      score: normalizedScore,
      status: newStatus,
      flag_reason: flagReason,
      dimensions,
    }).eq('id', submission_id);

    return new Response(JSON.stringify({
      success: true,
      analysis_id: aid,
      final_score: finalScore,
      normalized_score: normalizedScore,
      grade,
      verdict: finalResult.verdict,
      shortlisted,
      needs_review: needsReview,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
