# Handoff: Hackloom — B2B Hackathon Judging & Operations Platform

## Product summary
Hackloom is a B2B hackathon operations platform designed for organizers, universities, and companies. It automates submission analysis, judging workflows, scoring, and rankings using an AI pipeline. It features an end-to-end registration flow, an organizer dashboard, and participant-facing public pages.

## Current priority
Transitioning development to final polish, focusing on remaining organizer tools (feedback PDF uploads, email notifications via InsForge functions), completing the participant team onboarding flow (email verification), and general UX refinement for production release.

## Implemented features
- **Landing Page & Authentication**: Complete with dynamic 3D WebGL background (`WebGLBackground.jsx`), Google/GitHub OAuth, and Email Auth (`Auth.jsx`).
- **Hackathon Creation**: Multi-step wizard (`CreateHackathon.jsx`) with AI-assisted form filling via chatbot (`HackathonChatbot.jsx`).
- **Registration Flow**: Multi-step persistent wizard (`RegisterWizard.jsx`) enforcing unique registrations per hackathon per user via DB constraints. Replaces broken register button logic.
- **Participant Public Page**: Dark-mode premium event page (`HackathonPublic.jsx`).
- **Organizer Dashboard**: Comprehensive dashboard (`Dashboard.jsx`) with KPIs, submission tracking, AI analysis triggers, and human review overrides.
- **AI Judging Pipeline**: InsForge edge function (`src/functions/analyze-project.js`) that analyzes GitHub repos, extracts presentation text, parses YouTube demo transcripts, and calculates a final weighted score based on organizer rubrics.
- **Results Management**: Organizer panel (`OrganizerResults.jsx`) for managing scores and uploading feedback PDFs. Participant view (`ResultsPage.jsx`) with RLS-protected private feedback and a public leaderboard.
- **Deployment**: Live at https://5gm9m8pa.insforge.site

## In-progress features
- **Team Onboarding Flow**: The "Verified/Pending" status logic is implemented in `RegisterWizard.jsx` state, but the frontend verification UI for the invitee's side is incomplete.
- **File Uploads for Feedback**: The `feedback-pdfs` storage bucket exists, and the DB schema supports `feedback_pdf_url`. However, `OrganizerResults.jsx` currently uses a text input for the URL instead of a direct file upload component.

## Broken or incomplete features
- **Email Invitations**: The database schema tracks "pending" invites, but there is no integration with an email service provider (e.g., Resend) to send actual invitations. Needs an InsForge edge function.
- **Browser Subagent Capacity**: Recent attempts to use browser testing agents failed due to model capacity limits; manual UI testing or URL fetching is required for validation.

## Frontend architecture
- **Framework**: React 19 + Vite + React Router DOM (v7)
- **Styling**: Tailwind CSS 3.4 (locked to v3.4 per user rules) + PostCSS. Scoped custom CSS in `dashboard.css` and `index.css`.
- **Icons**: Lucide React
- **Animation**: GSAP + Framer Motion
- **State Management**: React Context (`AuthContext.jsx`, `HackathonContext.jsx`) and local state.

## Backend / database / auth architecture
- **BaaS**: InsForge (PostgreSQL, Auth, Storage, Edge Functions)
- **SDK**: `@insforge/sdk` initialized in `src/lib/insforge.js`
- **Auth**: InsForge Auth (Email + OAuth). Handled via `AuthContext.jsx`.
- **Security**: Row Level Security (RLS) enabled on key tables (e.g., `results` table allows public read if `is_published=true` or user owns the record; admin has full access).
- **Storage**: `feedback-pdfs` bucket created (private).

## AI analysis pipeline
- **Implementation**: InsForge Edge Function (`src/functions/analyze-project.js`).
- **Model**: DeepSeek V3.2 (via `client.ai.chat.completions.create`).
- **Process**:
    1. Fetches GitHub repo structure and code samples.
    2. Extracts text from presentation PDFs using `fileParser`.
    3. Fetches YouTube demo transcripts (or falls back to descriptions).
    4. Calculates a weighted final score based on the organizer's rubric (code quality, technical complexity, innovation, presentation, problem relevance).
    5. Saves results and step-by-step progress logs (JSONB) to the `project_analyses` table.

## Core product flows
1. **Organizer creates Hackathon**: `/create-hackathon` -> AI assists with form -> Saves to `hackathons` table.
2. **Participant registers**: `/hackathon/:id` -> Clicks Register -> `RegisterWizard.jsx` -> Saves to `registrations` table (unique constraint applied). Button state persists as "Registered".
3. **Participant submits**: (UI for this flow is likely handled in a separate or mocked component, data goes to `submissions` table).
4. **Organizer analyzes**: `/dashboard` -> Triggers `analyze-project.js` edge function -> Reviews AI score -> Overrides if necessary.
5. **Organizer publishes results**: `/hackathon/:id/manage-results` -> Uploads PDF feedback -> Marks published.
6. **Participant views results**: `/hackathon/:id/results` -> Views private feedback summary (RLS protected) and public winners.

## Important routes, pages, and components
- `/` -> Landing page (`App.jsx`)
- `/auth` -> Authentication (`Auth.jsx`)
- `/dashboard` -> Organizer Dashboard (`Dashboard.jsx`)
- `/create-hackathon` -> Hackathon creation wizard (`CreateHackathon.jsx`)
- `/hackathon/:id` -> Public event page (`HackathonPublic.jsx`)
- `/hackathon/:id/results` -> Participant results page (`ResultsPage.jsx`)
- `/hackathon/:id/manage-results` -> Organizer results panel (`OrganizerResults.jsx`)

## Important files to read first
1. `src/AuthContext.jsx`: Understand auth state management.
2. `src/HackathonPublic.jsx`: Note the recent fix where `useAuth` replaced independent `getUser` calls to fix the registration flow.
3. `src/RegisterWizard.jsx`: The core registration logic and state persistence.
4. `src/functions/analyze-project.js`: The AI judging engine logic.
5. `src/Dashboard.jsx`: The organizer's main control panel.

## Data models / tables / schemas
- `hackathons`: Hackathon details, timeline, config, organizer_id.
- `registrations`: user_id, hackathon_id, mode (solo/team), team details, github_url, etc. Unique index on `(hackathon_id, user_id)`.
- `submissions`: team_name, project_name, github_url, demo_url, ppt_url, status (pending, evaluating, evaluated, flagged), score.
- `project_analyses`: Detailed AI analysis logs, final_result JSON, progress_log JSONB.
- `results`: registration_id, hackathon_id, user_id, rank, score, feedback_summary, judge_remarks (private), feedback_pdf_url, is_published.

## Design and UX decisions already made
- **Aesthetic**: Premium dark product UI. Background `#080808` / `#0A0A0A`, surfaces `#111111`, accent orange `#E8650A` / `#F97316`.
- **Typography**: Inter (body), Space Grotesk (headings).
- **Style**: Modern, minimal, professional. Avoid AI-generic or overdecorated looks.
- **Mobile**: High priority. Layouts use specific mobile bottom bars (`dashboard.css`) and responsive grids. Avoid compressed desktop layouts on mobile.
- **Feedback Privacy**: Judge remarks are strictly private (`results` table). Only `feedback_summary` is shown to participants unless published.

## Constraints and non-goals
- **CSS**: Do NOT upgrade Tailwind to v4. Stick to v3.4.17.
- **Design**: Do not use generic colors (plain red, blue). Stick to the established color palette.

## Known bugs / weak areas
- File upload UI is missing; currently using text inputs for storage URLs.
- Email integration is entirely missing.
- Dashboard might have performance bottlenecks if the `project_analyses` progress logs grow extremely large.

## Environment setup
- Environment variables required: `VITE_INSFORGE_BASE_URL`, `VITE_INSFORGE_ANON_KEY`, and for edge functions: `INSFORGE_BASE_URL`, `ANON_KEY`.
- Run locally: `npm run dev`
- Build: `npm run build`

## Next tasks in priority order
1. Implement the file upload component in `OrganizerResults.jsx` to upload PDFs directly to the `feedback-pdfs` InsForge storage bucket.
2. Create an InsForge edge function to handle email sending (e.g., via Resend API) for team member invitations.
3. Build the frontend UI for invitees to accept/reject team invitations (updating the `pending` status in the registration flow).

## Recommended first task for Codex
Review `OrganizerResults.jsx` and implement the file upload logic for the `feedback_pdf_url` field, integrating it with the InsForge storage SDK for the `feedback-pdfs` bucket. Ensure the UI aligns with the premium dark theme.
