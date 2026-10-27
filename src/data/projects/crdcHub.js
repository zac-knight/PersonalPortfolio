import { FaPython } from 'react-icons/fa'
import { SiFastapi, SiPostgresql, SiSupabase, SiOpenai, SiNextdotjs, SiGooglecloud } from 'react-icons/si'

const base = import.meta.env.BASE_URL

const crdcHub = {
  title: 'CRDC Cotton Knowledge Hub',
  category: 'RAG optimisation · QUT × Cotton Research and Development Corporation',
  role: 'Team Leader, Team 16',
  status: 'Audit and target architecture delivered Oct 2026 · implementation in Semester 1, 2027',
  tagline: 'Auditing and re-architecting a production RAG system over 40 years of cotton research.',
  description:
    'A citation-grounded RAG assistant that answers questions across 1,995 research reports (80,442 passages, 1986–2025). Leading a six-person QUT team, I took over the production system and audited every stage of its retrieval pipeline. We found that one reranking step used about 86% of the tokens read for each question. We then designed a target architecture that cuts model calls from about 42 to 3–4 per question, with an estimated cost drop of roughly 95%.',
  fullDescription: `The Cotton Research and Development Corporation (CRDC) has funded about 40 years of Australian cotton research. The findings sit in roughly 2,000 dense, two-column PDF reports. The Knowledge Hub turns that archive into a natural-language assistant: it retrieves the most relevant passages, writes an answer for one of three reader personas, and footnotes every claim with a citation that opens the source PDF at the exact paragraph.
In August 2026 my QUT team (Team 16) inherited the live system from its original student builder. As team leader I coordinated six students across AI, Data Science and Cyber Security streams, ran the weekly cadence with the client, and set up the local development stack on Groq with a mock vector store, so the team could work without touching production services.
Our main technical work was a code-level review of the RAG pipeline, traced through all twelve stages from question to cited answer. We modelled the token cost of each stage, found the bottlenecks and silent failure modes, compared models and rerankers on price, capability and speed, and designed a target pipeline with a prioritised, measure-first roadmap. Alongside this we built out evaluation and regression testing and a prompt-injection baseline for the retrieval path.`,
  problemStatement: `Each question triggered about 42 model calls. A per-passage LLM reranker scored about 40 candidates one at a time and accounted for about 86% of the tokens read, yet only five passages reached the answer. Settings quietly capped answers at one passage per report and five sources. The keyword search leg required every query word to match. A failed rerank request scored as "irrelevant", which could make the system decline answerable questions. With only 63 test questions and RAGAS run on 3 of them, no change could be proven better or worse.`,
  architecture: [
    {
      layer: 'Ingestion',
      detail:
        'A custom scraper collects report PDFs and metadata from CRDC\'s Inside Cotton database. Azure Document Intelligence handles OCR and layout. Passages are chunked and embedded with text-embedding-3-small (1536-d), then stored in Postgres with pgvector.',
    },
    {
      layer: 'Hybrid retrieval',
      detail:
        'A pgvector HNSW cosine search and a Postgres full-text search run at the same time and are merged with Reciprocal Rank Fusion. Metadata filters for year, author, subject and document are applied in SQL on both searches before merging. An LLM reranker then scores the candidates.',
    },
    {
      layer: 'Routing & synthesis',
      detail:
        'A deterministic classifier routes broad questions to a map-reduce path: the top five reports are summarised in parallel, then combined in one synthesis call. Three personas set the answer style, with strict RAG for researchers and managers and hybrid RAG for growers.',
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
      impact: '53–86% fewer tokens (est.)',
    },
    {
      area: 'Failure handling',
      finding: 'A failed rerank request scored 0, the same as "irrelevant". Under rate limits every passage dropped below the decline threshold.',
      change: 'Record rerank failures explicitly and fall back to fusion order instead of declining.',
      impact: 'No false "no sources" answers',
    },
    {
      area: 'Keyword search',
      finding: 'The full-text search used plainto_tsquery, which requires every word in the question to match, so long natural questions often got no keyword hits.',
      change: 'Match on any key term so the BM25-style search still contributes to fusion.',
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
      finding: 'Off-topic and injection questions paid the full retrieval and rerank cost before abstaining.',
      change: 'Add a small judge-model gate before retrieval that classifies each question as answerable, chat, off-topic or injection.',
      impact: '~$0.05 per 1,000 questions',
    },
    {
      area: 'Model right-sizing',
      finding: 'All three production models had cheaper, higher-scoring successors, and two shortlisted nano models were scheduled for retirement.',
      change: 'Small models judge, a mid-tier model answers, a strong model handles deep synthesis, with model IDs kept in one config.',
      impact: '13–15× capability per dollar',
    },
    {
      area: 'Evaluation',
      finding: 'RAGAS had been run on only 3 queries (context recall 0.33), and stored gold answers were never used.',
      change: 'Grow golden retrieval sets past 50 questions and log tokens, latency and status for every stage.',
      impact: 'Changes become provable',
    },
  ],
  comparison: [
    { label: 'Model calls per question', today: '~42', target: '3–4' },
    { label: 'Reranking', today: '40 calls · failure scores 0', target: '1 call over 15 · failure keeps order' },
    { label: 'Keyword search', today: 'Every word must match', target: 'Any key term matches' },
    { label: 'Passages per report', today: '1 (max 5 sources)', target: '2, sources configurable' },
    { label: 'Off-topic questions', today: 'Full cost, then abstain', target: 'Turned away before retrieval' },
    { label: 'Answer checking', today: 'Citation markers exist', target: 'Number check + sampled support check' },
    { label: 'Est. cost / 1,000 questions', today: '$18.70–$57', target: '$0.93–$2.13' },
  ],
  chart: {
    title: 'Estimated tokens read per question, by reranking strategy',
    note: 'Estimates from a code-level token model, not billing data.',
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
      title: 'End-to-end pipeline audit',
      body: 'Traced all twelve stages of the production RAG chain in code, from query rewriting and hybrid retrieval to reranking, context assembly, generation and citation checks. Recorded 10 findings, each traced to the code responsible.',
    },
    {
      title: 'Token cost modelling',
      body: 'Estimated the tokens read and written at each stage of a typical question. This showed the reranker was about 6× the cost of writing the answer, and that every extra source adds about 400 tokens to the answer step.',
    },
    {
      title: 'Target RAG architecture',
      body: 'Designed a gated, measure-first pipeline: early query gate, forgiving hybrid search, single-call reranking with explicit failure handling, fenced and budgeted context, the right model size for each job, and per-stage logging.',
    },
    {
      title: 'Model & reranker bake-off plan',
      body: 'Compared 14 judge-model alternatives and the current model line-up on price, capability per dollar and speed, plus dedicated rerankers such as Voyage rerank-2.5. Every candidate must pass the same CRDC tests before any switch.',
    },
    {
      title: 'Evaluation & regression testing',
      body: 'Wrote 1,781 planned test cases as automated tests, with 1,126 of 1,223 backend tests passing (92.1%). Also wrote an evaluation strategy covering quality, completeness, speed and cost, and a regression gate for future changes.',
    },
    {
      title: 'Security in the RAG path',
      body: 'Ran a 15-case prompt-injection baseline (7 passed, 6 partly passed, 2 failed). Integrated a retrieved-context guard that marks source text as data, plus a fix to the PDF routes\' authentication.',
    },
  ],
  businessImpact: [
    { stat: '1,995', label: 'Reports indexed' },
    { stat: '86%', label: 'Tokens traced to one step' },
    { stat: '42 → 4', label: 'Model calls per question' },
    { stat: '~95%', label: 'Est. cost reduction' },
  ],
  skills: [FaPython, SiFastapi, SiPostgresql, SiSupabase, SiOpenai, SiNextdotjs, SiGooglecloud],
  skillLabels: ['Python', 'FastAPI', 'Postgres + pgvector', 'Supabase', 'OpenAI', 'Next.js', 'Cloud Run'],
  images: [
    `${base}projects/crdcHub/Home.png`,
    `${base}projects/crdcHub/Cited Answer.png`,
    `${base}projects/crdcHub/Source Viewer.png`,
    `${base}projects/crdcHub/Grower Persona.png`,
    // "&" is encoded so the path is a valid URL; the tab label decodes it back
    `${base}projects/crdcHub/R%26D Manager Persona.png`,
    `${base}projects/crdcHub/Off-topic Question.png`,
    `${base}projects/crdcHub/Research Library.png`,
    `${base}projects/crdcHub/Admin Ingestion.png`,
    `${base}projects/crdcHub/RAG Pipeline.png`,
    `${base}projects/crdcHub/Token Cost by Stage.png`,
  ],
}

export default crdcHub
