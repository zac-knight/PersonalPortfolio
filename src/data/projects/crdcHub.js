import { FaPython } from 'react-icons/fa'
import { SiFastapi, SiPostgresql, SiSupabase, SiOpenai, SiNextdotjs, SiGooglecloud } from 'react-icons/si'

const base = import.meta.env.BASE_URL

const crdcHub = {
  title: 'CRDC Cotton Knowledge Hub',
  category: 'RAG analysis · QUT Industry Project × Cotton Research and Development Corporation',
  role: 'Work Integrated Learning Student · Team Leader, Team 16',
  status: 'Phase 1 delivered Oct 2026 · Phase 2 (advanced and graph RAG, security fixes) in 2027',
  tagline: 'Reverse engineering, testing and analysing a RAG assistant over 40 years of cotton research.',
  description:
    'A citation grounded RAG assistant over nearly 2,000 cotton research reports (1986 to 2025). Leading a six person QUT team on a local copy of the system, we reverse engineered it into requirements and a 240 story backlog, and built 1,796 automated tests that surfaced 101 bugs. Mapping the retrieval pipeline, we estimated that one relevance checking step accounts for about 86% of the AI reading per question, and proposed a design that would cut that step from about 40 model calls to 3 or 4.',
  fullDescription: `The Cotton Research and Development Corporation (CRDC) has funded about 40 years of Australian cotton research. The findings sit in roughly 2,000 dense, two column PDF reports. The Knowledge Hub turns that archive into a natural language assistant: it retrieves the most relevant passages, writes an answer for one of three reader personas, and footnotes every claim with a citation that opens the source PDF at the exact paragraph.
In August 2026, through a QUT Industry Project, my team (Team 16) took on the Knowledge Hub prototype. As team leader I coordinated six students across AI, Data Science and Cyber Security streams and ran the weekly meetings with the client. We worked from a local environment, with the Supabase backup restored into PostgreSQL, so nothing touched production services.
Phase 1 was about understanding the system before changing it. We reverse engineered it into a business requirements document (35 requirements) and a detailed design backlog, expanded from 22 to 240 user stories, then built 1,796 automated Cypress and pytest tests. 92.6% passed, and the failures surfaced 101 bugs, 23 of them high priority. Alongside that we mapped the RAG pipeline's nine judgment points, estimated where its AI effort goes, researched a lightweight judge model for relevance checks, and ran prompt injection testing. Our Phase 2 plan, shaped with the client, focuses on advanced and graph RAG and on fixing the highest priority security issues.`,
  problemStatement: `From the code, we estimated that each question triggers about 40 separate reranker calls, one per candidate passage, accounting for about 86% of the AI reading effort, yet only five passages reach the answer. Settings quietly capped answers at one passage per report and five sources. The keyword search leg required every query word to match. A failed rerank request scored as "irrelevant", which could make the system decline answerable questions. With only 63 test questions and RAGAS run on 3 of them, no change could be proven better or worse.`,
  architecture: [
    {
      layer: 'Ingestion',
      detail:
        'A custom scraper collects report PDFs and metadata from CRDC\'s Inside Cotton database. Azure Document Intelligence handles OCR and layout. Passages are chunked and embedded with text-embedding-3-small (1536 dimensions), then stored in Postgres with pgvector.',
    },
    {
      layer: 'Hybrid retrieval',
      detail:
        'A pgvector HNSW cosine search and a Postgres full text search run at the same time and are merged with Reciprocal Rank Fusion. Metadata filters for year, author, subject and document are applied in SQL on both searches before merging. An LLM reranker then scores the candidates.',
    },
    {
      layer: 'Routing & synthesis',
      detail:
        'A deterministic classifier routes broad questions to a map reduce path: the top five reports are summarised in parallel, then combined in one synthesis call. Three personas set the answer style, with strict RAG for researchers and managers and hybrid RAG for growers.',
    },
    {
      layer: 'Grounding',
      detail:
        'The model writes inline [S#] citations. Bounding boxes for deep links into the PDF are computed in Python from the OCR layout, never by the model, so every footnote opens the exact source paragraph.',
    },
    {
      layer: 'Platform',
      detail:
        'Next.js on Cloudflare Workers, a FastAPI backend on Google Cloud Run, Supabase for Postgres, auth and storage, and OpenAI for embeddings, reranking and generation.',
    },
  ],
  optimisations: [
    {
      area: 'Reranking',
      finding: 'About 40 separate gpt-5.4-mini calls per question, each repeating the instructions: about 86% of all tokens read.',
      change: 'Rerank 15 candidates in a single listwise call, or switch to a dedicated reranker or small judge model.',
      impact: '53% to 86% fewer tokens (est.)',
    },
    {
      area: 'Failure handling',
      finding: 'A failed rerank request scored 0, the same as "irrelevant". Under rate limits every passage dropped below the decline threshold.',
      change: 'Record rerank failures explicitly and fall back to fusion order instead of declining.',
      impact: 'No false "no sources" answers',
    },
    {
      area: 'Keyword search',
      finding: 'The full text search used plainto_tsquery, which requires every word in the question to match, so long natural questions often got no keyword hits.',
      change: 'Match on any key term so the BM25 style search still contributes to fusion.',
      impact: 'Restores the keyword half of hybrid search',
    },
    {
      area: 'Context assembly',
      finding: 'Answers were forced to one passage per report and five sources in total, overriding requests for more.',
      change: 'Default to 2 passages per report with a configurable number of sources, within a token budget.',
      impact: 'Broader answers to broad questions',
    },
    {
      area: 'Query gate',
      finding: 'Off topic and injection questions paid the full retrieval and rerank cost before abstaining.',
      change: 'Add a small judge model gate before retrieval that classifies each question as answerable, chat, off topic or injection.',
      impact: 'Off topic questions turned away before retrieval',
    },
    {
      area: 'Model right sizing',
      finding: 'All three production models had cheaper, higher scoring successors, and two shortlisted nano models were scheduled for retirement.',
      change: 'Small models judge, a mid tier model answers, a strong model handles deep synthesis, with model IDs kept in one config.',
      impact: 'Each job on a suitably sized model',
    },
    {
      area: 'Evaluation',
      finding: 'RAGAS had been run on only 3 queries (context recall 0.33), and stored gold answers were never used.',
      change: 'Grow golden retrieval sets past 50 questions and log tokens, latency and status for every stage.',
      impact: 'Changes become provable',
    },
  ],
  comparison: [
    { label: 'Model calls per question', today: '~42', target: '3 to 4' },
    { label: 'Reranking', today: '40 calls · failure scores 0', target: '1 call over 15 · failure keeps order' },
    { label: 'Keyword search', today: 'Every word must match', target: 'Any key term matches' },
    { label: 'Passages per report', today: '1 (max 5 sources)', target: '2, sources configurable' },
    { label: 'Off topic questions', today: 'Full cost, then abstain', target: 'Turned away before retrieval' },
    { label: 'Answer checking', today: 'Citation markers exist', target: 'Check the answer supports the question' },
  ],
  chart: {
    title: 'Estimated tokens read per question, by reranking strategy',
    note: 'Estimates from a code level token model, not billing data.',
    rows: [
      { label: 'Today: 40 passages, one call each', value: 20800, current: true },
      { label: '15 passages, one call each', value: 9700 },
      { label: '15 passages, one listwise call', value: 8800 },
      { label: 'Cheap judge, paid model for half', value: 6300 },
      { label: 'Cheap judge, paid model for a quarter', value: 4600 },
      { label: 'Cheap judge, paid model for a tenth', value: 3600 },
      { label: 'Cheap judge only', value: 3000 },
    ],
  },
  keyFeatures: [
    {
      title: 'Pipeline mapping',
      body: 'Mapped the RAG pipeline in code, from query sanitation and session memory through retrieval, fusion, reranking and filtering to answer synthesis, identifying nine points where it makes a judgment, each traced to the code responsible.',
    },
    {
      title: 'Token cost modelling',
      body: 'Estimated the tokens read and written at each stage of a typical question. This showed the reranker was about 6× the cost of writing the answer, and that every extra source adds about 400 tokens to the answer step.',
    },
    {
      title: 'Proposed RAG design',
      body: 'Proposed a gated pipeline: an early relevance and safety gate, a reranker cascade where a cheap judge settles clear cases and only uncertain ones reach the paid model, and a final check that the answer supports the question, all behind a swappable component. Not yet implemented.',
    },
    {
      title: 'Model evaluation plan',
      body: 'Planned how to compare judge models, rerankers and the current lineup on answer quality, traceability, speed, cost, completeness and maintainability, using real questions from CRDC users rather than cost alone.',
    },
    {
      title: 'Requirements & automated testing',
      body: 'Reverse engineered the system into a 35 requirement BRD and a 240 story backlog, then built 1,796 automated Cypress and pytest tests across 60 areas. 1,663 passed (92.6%), and the failures surfaced 101 bugs, 23 of them high priority, plus 22 unfinished features.',
    },
    {
      title: 'Security in the RAG path',
      body: 'Ran a 15 case prompt injection baseline (7 passed, 6 partly passed, 2 failed), then scanned 80 attack prompts with NVIDIA\'s Garak. Found two PDF routes missing the authentication check and prepared a patch, validated statically, with live verification still to do.',
    },
  ],
  businessImpact: [
    { stat: '1,796', label: 'Automated tests built' },
    { stat: '240', label: 'User stories documented' },
    { stat: '101', label: 'Bugs surfaced' },
    { stat: '86%', label: 'Est. AI effort in one step' },
  ],
  skills: [FaPython, SiFastapi, SiPostgresql, SiSupabase, SiOpenai, SiNextdotjs, SiGooglecloud],
  skillLabels: ['Python', 'FastAPI', 'Postgres + pgvector', 'Supabase', 'OpenAI', 'Next.js', 'Cloud Run'],
  images: [
    `${base}projects/crdcHub/Home.png`,
    `${base}projects/crdcHub/Cited Answer.png`,
    `${base}projects/crdcHub/Source Viewer.png`,
    `${base}projects/crdcHub/Grower Persona.png`,
    `${base}projects/crdcHub/Manager Persona.png`,
    `${base}projects/crdcHub/Off Topic Question.png`,
    `${base}projects/crdcHub/Research Library.png`,
    `${base}projects/crdcHub/Admin Ingestion.png`,
  ],
}

export default crdcHub
