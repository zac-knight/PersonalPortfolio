import { FaHtml5 } from 'react-icons/fa'
import { SiJavascript, SiHuggingface, SiThemoviedatabase, SiPwa } from 'react-icons/si'

const base = import.meta.env.BASE_URL

const releaseRadar = {
  title: 'Release Radar AU',
  aspect: '1512 / 900',
  category: 'Personal project · On device AI and a group recommender',
  role: 'Designer and developer · Solo build',
  status: 'Live · open demo mode, no key needed',
  tagline: 'What is in Australian cinemas, what is heading to streaming, and what the whole group will actually agree to watch.',
  description:
    'A release tracker for Australian viewers that asks a few guided questions instead of showing a wall of filters. It uses Australian release dates and services (Stan, Binge, ABC iview), runs a sentence embedding model entirely in the browser so you can search by mood, and includes a Movie Night mode that picks one title for a group and explains why. No backend, no build step, no tracking, and 45 passing tests over the logic that is easiest to get subtly wrong.',
  fullDescription: `Release dates are surprisingly hard to pin down. Studios announce them years ahead and then move them, cinema openings differ by country, and streaming services rarely say when something is being added. Most trackers are US centric, so they show American dates and barely register the services Australians actually use. Release Radar AU is my answer to that: one place with Australian dates, Australian services and an honest status on every title.
Instead of a wall of filters, the app asks five questions (what are you looking for, movies or TV, what kind of story, where do you watch, and when) and turns the answers into a sentence above the results. Every highlighted phrase is editable in one click, so changing your mind never means starting over. Behind it sits live data from The Movie Database (TMDB), with a pooled and retrying client, layered caching, and a service worker so repeat visits paint instantly.
The machine learning is the part I enjoyed most, and all of it runs on the visitor's device. A MiniLM sentence transformer (via Transformers.js and WebAssembly) lets someone describe a mood and find titles that mean the same thing. A group recommender takes each person's favourite films and finds the one title everybody will enjoy, using an average plus a "least misery" rule so a film one person adores and another hates is pushed down, then explains its pick in plain English with the arithmetic shown. An Insights view measures the models against baselines, so the app reports its own hit rate, silhouette score and AUC rather than just claiming to work.
It is deliberately private: no analytics, no tracking and no server. The API key, watchlist and taste profile live in the browser. The whole thing is plain ES modules with no bundler, and it deploys as static files. Open the live demo and it runs in demo mode with fictional titles, so every feature can be explored without a key.`,
  problemStatement:
    'Choosing what to watch is spread across too many places. Release dates move, openings differ by country, services rarely announce additions, and the tools that exist assume you are in the US. Picking something for a group is worse: someone ends up watching a film they did not want, and nobody can explain why that title won. People needed one Australian aware place that answers "what is coming and where can I watch it" in a few questions, and a fair way to settle the group decision.',
  architecture: [
    {
      layer: 'Data',
      detail:
        'TMDB v3 per country release types give the Australian cinema date, digital release dates and per platform series premieres. There is no "added to Netflix" feed, so Coming to streaming is built from what can be known. A pooled client with 12 concurrent requests, backoff on HTTP 429, response trimming and LRU eviction keeps it fast and polite.',
    },
    {
      layer: 'Logic',
      detail:
        'Filtering, grouping, status and date maths live in pure modules with no DOM access. Delays are inferred by remembering the first date seen per title and region, then flagging any later date as Delayed with the original struck through. Pure modules made the logic easy to unit test.',
    },
    {
      layer: 'On device ML',
      detail:
        'all-MiniLM-L6-v2 runs in the browser through Transformers.js and WebAssembly, with vectors cached in IndexedDB. If the model cannot load, a hashed TF-IDF fallback takes over and the interface says which engine ran. PCA, k-means++, logistic regression and the evaluation metrics are implemented from scratch, seeded and deterministic.',
    },
    {
      layer: 'Interface',
      detail:
        'Vanilla JavaScript and CSS design tokens with no framework. A grid with a preview pane, a calendar shaded by release density, a detail dialog that takes on the poster colour, and a purpose built phone layout with a thumb reach tab bar. Christmas, Halloween and Easter re-skin the app by redefining tokens only.',
    },
    {
      layer: 'Delivery',
      detail:
        'No build step, bundler or runtime dependency. A service worker caches posters, fonts and app files so it works offline after the first visit, and it deploys to GitHub Pages as static files.',
    },
  ],
  keyFeatures: [
    {
      title: 'Guided search as a sentence',
      body: 'Five questions become "Showing action or adventure movies coming to streaming on Netflix or Stan in the next 3 months". Click any phrase to change it. Genre tiles show live counts and example films, and tiles with no matches disappear.',
    },
    {
      title: 'Search by meaning',
      body: 'Describe a mood such as "tense space thriller with a twist" and an embedding model running in the browser finds titles with the same meaning. Nothing about what you search leaves your device.',
    },
    {
      title: 'Movie Night',
      body: 'Everyone names a few films they love. Each person becomes a taste centroid, a title scores half on the group average and half on the lowest match, and the result shows per person bars, who is least sold, and a "Why this one?" explanation.',
    },
    {
      title: 'Honest match percentages',
      body: 'Scores are calibrated on an absolute scale per engine rather than rescaled within each result set, so the top result does not look like a strong match when nothing is similar. Anything below a relevance floor is dropped entirely.',
    },
    {
      title: 'It measures itself',
      body: 'Insights adds release density, genre mix and distributions, a PCA and k-means film map, and a model report: neighbour hit rate against a random baseline, silhouette score and taste model AUC.',
    },
    {
      title: 'Seasonal modes',
      body: 'Christmas, Halloween and Easter re-skin and animate the app, and filter every list at the source by resolving season keywords through TMDB at run time. Easter\'s date is computed, so it moves each year.',
    },
    {
      title: 'Built for phones and keyboards',
      body: 'A dedicated phone layout with bottom tabs, full screen sheets and 44px touch targets, plus keyboard shortcuts, skip links, ARIA live regions and reduced motion support.',
    },
    {
      title: 'Private by design',
      body: 'No analytics, no tracking and no backend. The key, watchlist and taste profile live in the browser, and calendar and CSV exports are generated locally.',
    },
  ],
  businessImpact: [
    { stat: '45', label: 'Passing unit tests' },
    { stat: '0', label: 'Servers or trackers' },
    { stat: '9', label: 'Streaming services covered' },
    { stat: '3', label: 'Seasonal modes' },
  ],
  link: 'https://zac-knight.github.io/ReleaseRadar/',
  linkLabel: 'Open live app',
  skills: [SiJavascript, FaHtml5, SiHuggingface, SiThemoviedatabase, SiPwa],
  skillLabels: ['Vanilla JS', 'HTML + CSS', 'Transformers.js', 'TMDB API', 'Service worker'],
  images: [
    `${base}projects/releaseRadar/Guided Start.jpg`,
    `${base}projects/releaseRadar/Cinemas.jpg`,
    `${base}projects/releaseRadar/Movie Night.jpg`,
    `${base}projects/releaseRadar/Insights.jpg`,
    `${base}projects/releaseRadar/AI Lab.jpg`,
    `${base}projects/releaseRadar/Calendar.jpg`,
    `${base}projects/releaseRadar/Detail.jpg`,
    `${base}projects/releaseRadar/Halloween Mode.jpg`,
  ],
}

export default releaseRadar
