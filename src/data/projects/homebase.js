import { FaPython, FaReact } from 'react-icons/fa'
import { SiTypescript, SiTailwindcss, SiVite, SiFastapi, SiPostgresql, SiGooglechrome } from 'react-icons/si'

const base = import.meta.env.BASE_URL

const homebase = {
  title: 'Homebase',
  aspect: '1440 / 900',
  category: 'Personal project · Chrome extension with an optional ML backend',
  role: 'Designer and developer · Solo build',
  status: 'Try the browser demo (sample bookmarks) · Extension, API and evaluation working',
  tagline: 'A new tab page that turns your bookmarks into something you actually use, with search by meaning and answers that only quote what you saved.',
  description:
    'Homebase replaces Chrome\'s new tab page with a clean, searchable home for bookmarks: folders as tabs, pinned favourites, a Tasks page, animated waves and seventeen themes. It works fully offline, and nothing leaves the browser unless sync is turned on. An optional FastAPI server adds hybrid search by meaning, extractive answers with sources, link health checks and suggested folders. Every ML feature is measured against a simple baseline, and the repo states plainly what has and has not been verified. The live demo runs the real new tab page in your browser with a sample library; the server features need the backend, so they are not in it.',
  fullDescription: `Most people save far more bookmarks than they ever open again. The browser gives them a flat list and a search box that only matches exact words, so the useful link is saved and then effectively lost. Homebase tries to fix that at the place people see most often, the new tab page.
The extension is the product. It is a Manifest V3 Chrome extension built with TypeScript, React, Vite and Tailwind: your bookmark folders become tabs, favourites are one click away, there is a Tasks page for the day, a command palette on Ctrl or Cmd K that tolerates typos, and an Insights view of what you use and what you ignore, including exact duplicates. It is local first. Sync is off until you turn it on, optional permissions such as page text and history are requested only when a feature needs them, and everything can be exported or deleted in one click.
The optional backend is where the machine learning lives. A FastAPI service stores bookmarks in PostgreSQL with pgvector and adds hybrid search that fuses BM25 and embedding results by rank, an "ask your bookmarks" feature that returns quoted sentences with their sources (or an honest "nothing relevant"), a link checker, and clustering and tagging that suggest folders. I chose extractive answers on purpose: quoting is less fluent than a generative model, but it cannot invent anything and no bookmark text goes to a third party.
I treated the ML as something to be tested, not assumed. Each feature has a dependency free baseline (keyword search, a hashing embedder, "most recent" and "most frequent" for the recommender), a labelled dataset of made up bookmarks and queries, and an evaluation script that reports intervals rather than bare averages. The write up includes results that went against my expectations, and a status document lists what is verified, what is written but untested, and what is not built.
To try the real extension: download the zip, unzip it, open chrome://extensions, turn on Developer mode, choose Load unpacked and pick the unzipped folder, then open a new tab. It reads your own Chrome bookmarks and keeps everything on your device (the server features stay off unless you run the backend and turn sync on).`,
  problemStatement:
    'Bookmarks are write mostly. People save links with good intentions, the folders grow, and finding one later means remembering its exact title. Smart features that fix this usually mean sending your browsing data to a server, which many people do not want. People needed a home page that works fully offline and privately, with optional, honest intelligence that is only turned on by choice and that shows its evidence.',
  architecture: [
    {
      layer: 'Extension',
      detail:
        'Manifest V3, TypeScript and React with Vite and Tailwind. A service worker handles sync, the link check schedule and optional page text capture. A single wrapper isolates every chrome.* call, so the whole UI also runs in a normal browser tab with a sample library for development and tests.',
    },
    {
      layer: 'Local intelligence',
      detail:
        'Typo tolerant search and a small recommender run on the device with no embeddings, so the new tab is instant and private. Appearance is only CSS variables and data attributes, so adding a theme is a single line.',
    },
    {
      layer: 'Backend',
      detail:
        'FastAPI with one router per area: sign in, sync, search, organise, insights, jobs and account. Bookmarks are keyed on their cleaned canonical URL rather than Chrome\'s per device ID, which makes sync an idempotent upsert that is safe to retry.',
    },
    {
      layer: 'Data and ML',
      detail:
        'PostgreSQL with pgvector holds relational data and vectors in one database. A pipeline canonicalises URLs, builds features and exports Parquet. Models cover hybrid search (BM25 plus embeddings fused by rank), clustering, folder tagging, a recommender and extractive question answering.',
    },
    {
      layer: 'Quality',
      detail:
        '20 extension unit tests, 36 browser tests in Playwright (keyboard only search, undoable deletes, an axe accessibility audit of every view and all 17 themes in light and dark, a 5,000 bookmark run), a test that loads the real built extension into Chromium, and 36 backend API tests.',
    },
  ],
  keyFeatures: [
    {
      title: 'A home you actually use',
      body: 'Folders as tabs, pinned favourites with drag and drop, one click removal with undo that restores the bookmark to its exact place, and a page that fits the window so there is nothing to scroll.',
    },
    {
      title: 'Search by meaning',
      body: 'Server side hybrid search fuses keyword and embedding rankings. On the demo set, hybrid beat keyword only (MRR 0.965 vs 0.900), but plain vector search scored 1.000, so I documented that hybrid is not automatically better.',
    },
    {
      title: 'Grounded answers',
      body: 'Ask a question and get quoted sentences from your own bookmarks, each citing its source, or an honest "nothing relevant". Extractive by design, so it cannot make anything up.',
    },
    {
      title: 'Suggested folders',
      body: 'Clustering and tagging propose where bookmarks belong, but never move anything on their own. Folder suggestion reached 0.68 macro F1 with MiniLM embeddings against 0.04 for a majority baseline.',
    },
    {
      title: 'Local first and minimal permissions',
      body: 'Works fully offline. Page reading, history and identity are optional permissions requested only when the matching feature is switched on, and sync, export and a delete everything button (vectors included) are all explicit.',
    },
    {
      title: 'Insights and link health',
      body: 'Usage charts with intervals rather than bare averages, exact duplicates, a weekly digest, and dead link detection when synced.',
    },
    {
      title: 'Make it yours',
      body: 'Seventeen colour themes in light and dark, custom accents, eight backgrounds including your own picture with optional animated waves, five typefaces, three corner styles and animations you can turn down or off.',
    },
    {
      title: 'Honest documentation',
      body: 'Separate documents cover the evaluation with caveats, a status page of verified versus untested work, design trade offs, and a threat model of what data exists, where it lives and who can see it.',
    },
  ],
  businessImpact: [
    { stat: '93', label: 'Automated tests' },
    { stat: '17', label: 'Accessible themes audited' },
    { stat: '0.68', label: 'Folder tagging macro F1' },
    { stat: '100%', label: 'Offline capable' },
  ],
  link: `${base}homebase-demo/`,
  linkLabel: 'Try live demo',
  download: { href: `${base}downloads/homebase-extension.zip`, label: 'Get the extension' },
  repo: 'https://github.com/zac-knight/Homebase',
  skills: [SiTypescript, FaReact, SiVite, SiTailwindcss, SiGooglechrome, FaPython, SiFastapi, SiPostgresql],
  skillLabels: ['TypeScript', 'React', 'Vite', 'Tailwind', 'Chrome MV3', 'Python', 'FastAPI', 'Postgres + pgvector'],
  images: [
    `${base}projects/homebase/Home.png`,
    `${base}projects/homebase/Search.png`,
    `${base}projects/homebase/Tasks.png`,
    `${base}projects/homebase/Insights.png`,
    `${base}projects/homebase/Themes.png`,
    `${base}projects/homebase/Stargazer.png`,
  ],

}

export default homebase
