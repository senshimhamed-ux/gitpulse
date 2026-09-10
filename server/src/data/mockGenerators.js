const { REPOSITORIES } = require('./repositories');

/**
 * Deterministic seeded RNG (mulberry32) so repeated requests for the
 * same repo return stable-ish numbers within a server process instead
 * of pure noise on every call. Each generator re-seeds from a string.
 */
function seedFromString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFor(key) {
  const seedGen = seedFromString(key);
  return mulberry32(Math.floor(seedGen() * 4294967296));
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

const COMMIT_AUTHORS = [
  { name: 'Mia Torres', email: 'mia.torres@gitpulse.dev' },
  { name: 'Jae Park', email: 'jae.park@gitpulse.dev' },
  { name: 'Sam Osei', email: 'sam.osei@gitpulse.dev' },
  { name: 'Elena Novak', email: 'elena.novak@gitpulse.dev' },
  { name: 'Diego Ramirez', email: 'diego.ramirez@gitpulse.dev' },
  { name: 'Priya Nair', email: 'priya.nair@gitpulse.dev' },
  { name: 'Tom Whitfield', email: 'tom.whitfield@gitpulse.dev' },
  { name: 'Lina Haddad', email: 'lina.haddad@gitpulse.dev' }
];

const COMMIT_VERBS = ['Fix', 'Add', 'Refactor', 'Update', 'Remove', 'Optimize', 'Document', 'Revert', 'Tune', 'Harden'];
const COMMIT_SUBJECTS = [
  'rate limiter middleware', 'commit activity chart', 'auth token refresh', 'sidebar navigation state',
  'flaky integration test', 'deploy rollback logic', 'webhook signature check', 'pagination for repo list',
  'dark mode color tokens', 'metrics aggregation query', 'PR status polling', 'docker build cache',
  'language breakdown endpoint', 'event log filtering', 'CI timeout handling', 'staging environment config'
];

function hexHash(rng, length = 7) {
  const chars = 'abcdef0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(rng() * chars.length)];
  return out;
}

/** Generate `count` days of commit activity ending today, per repo. */
function generateCommitActivity(repoId, days = 30) {
  const rng = rngFor(`${repoId}:activity`);
  const today = new Date();
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isWeekend = [0, 6].includes(d.getDay());
    const base = isWeekend ? randInt(rng, 0, 4) : randInt(rng, 2, 14);
    series.push({
      date: d.toISOString().slice(0, 10),
      commits: base,
      additions: base * randInt(rng, 8, 40),
      deletions: base * randInt(rng, 2, 20)
    });
  }
  return series;
}

/** Generate a page of recent individual commits for a repo. */
function generateRecentCommits(repoId, limit = 20) {
  const rng = rngFor(`${repoId}:commits`);
  const commits = [];
  const now = Date.now();
  for (let i = 0; i < limit; i++) {
    const author = pick(rng, COMMIT_AUTHORS);
    const minutesAgo = i * randInt(rng, 20, 240) + randInt(rng, 0, 30);
    commits.push({
      sha: hexHash(rng),
      message: `${pick(rng, COMMIT_VERBS)} ${pick(rng, COMMIT_SUBJECTS)}`,
      author,
      timestamp: new Date(now - minutesAgo * 60 * 1000).toISOString(),
      additions: randInt(rng, 1, 220),
      deletions: randInt(rng, 0, 120),
      branch: pick(rng, ['main', 'develop', 'feature/metrics-v2', 'fix/rate-limit', 'chore/deps'])
    });
  }
  return commits;
}

const PR_TITLES = [
  'Add commit activity heatmap', 'Fix auth session expiry edge case', 'Introduce deploy health scoring',
  'Migrate charts to Recharts', 'Improve mobile sidebar behavior', 'Add language distribution endpoint',
  'Refactor mock data generators', 'Cache repository stats response', 'Add dark mode persistence',
  'Fix pagination off-by-one', 'Reduce bundle size for client', 'Add retry logic to webhook consumer',
  'Improve error boundary messaging', 'Add integration tests for PR controller', 'Tighten CORS policy'
];
const PR_STATES = ['open', 'merged', 'closed', 'draft'];

function generatePullRequests(repoId, limit = 12) {
  const rng = rngFor(`${repoId}:prs`);
  const now = Date.now();
  const prs = [];
  for (let i = 0; i < limit; i++) {
    const state = pick(rng, PR_STATES);
    const openedDaysAgo = randInt(rng, 1, 40);
    const openedAt = new Date(now - openedDaysAgo * 24 * 60 * 60 * 1000);
    const isResolved = state === 'merged' || state === 'closed';
    const resolvedAfterHours = randInt(rng, 2, 96);
    const resolvedAt = isResolved
      ? new Date(openedAt.getTime() + resolvedAfterHours * 60 * 60 * 1000)
      : null;
    prs.push({
      id: `pr_${repoId}_${1000 + i}`,
      number: 1000 + i,
      title: pick(rng, PR_TITLES),
      author: pick(rng, COMMIT_AUTHORS).name,
      state,
      reviewers: [pick(rng, COMMIT_AUTHORS).name, pick(rng, COMMIT_AUTHORS).name].filter(
        (v, idx, self) => self.indexOf(v) === idx
      ),
      additions: randInt(rng, 5, 600),
      deletions: randInt(rng, 0, 300),
      comments: randInt(rng, 0, 24),
      openedAt: openedAt.toISOString(),
      resolvedAt: resolvedAt ? resolvedAt.toISOString() : null,
      cycleTimeHours: resolvedAt ? resolvedAfterHours : null
    });
  }
  return prs;
}

const DEPLOY_ENVIRONMENTS = ['production', 'staging', 'preview'];

function generateDeployMetrics(repoId, limit = 15) {
  const rng = rngFor(`${repoId}:deploys`);
  const now = Date.now();
  const deploys = [];
  for (let i = 0; i < limit; i++) {
    const hoursAgo = i * randInt(rng, 4, 20) + randInt(rng, 0, 4);
    const startedAt = new Date(now - hoursAgo * 60 * 60 * 1000);
    const durationSeconds = randInt(rng, 45, 720);
    const outcomeRoll = rng();
    const status = outcomeRoll > 0.88 ? 'failed' : outcomeRoll > 0.8 ? 'rolled_back' : 'success';
    deploys.push({
      id: `dep_${repoId}_${i}`,
      environment: pick(rng, DEPLOY_ENVIRONMENTS),
      status,
      commitSha: hexHash(rng),
      triggeredBy: pick(rng, COMMIT_AUTHORS).name,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date(startedAt.getTime() + durationSeconds * 1000).toISOString(),
      durationSeconds
    });
  }

  const successCount = deploys.filter((d) => d.status === 'success').length;
  const failedCount = deploys.filter((d) => d.status === 'failed').length;
  const rolledBackCount = deploys.filter((d) => d.status === 'rolled_back').length;
  const avgDurationSeconds = Math.round(
    deploys.reduce((sum, d) => sum + d.durationSeconds, 0) / deploys.length
  );

  return {
    deploys,
    summary: {
      total: deploys.length,
      successCount,
      failedCount,
      rolledBackCount,
      successRate: Number(((successCount / deploys.length) * 100).toFixed(1)),
      avgDurationSeconds,
      lastDeployAt: deploys[0]?.startedAt ?? null
    }
  };
}

function generateRepoStats(repo) {
  const rng = rngFor(`${repo.id}:stats`);
  const commitActivity = generateCommitActivity(repo.id, 30);
  const totalCommits30d = commitActivity.reduce((sum, d) => sum + d.commits, 0);
  const prs = generatePullRequests(repo.id, 20);
  const openPRs = prs.filter((p) => p.state === 'open' || p.state === 'draft').length;
  const mergedPRs = prs.filter((p) => p.state === 'merged').length;
  const { summary: deploySummary } = generateDeployMetrics(repo.id, 15);

  return {
    id: repo.id,
    name: repo.name,
    owner: repo.owner,
    description: repo.description,
    visibility: repo.visibility,
    defaultBranch: repo.defaultBranch,
    primaryLanguage: repo.primaryLanguage,
    languages: repo.languages,
    stars: repo.stars,
    openIssues: repo.openIssues,
    createdAt: repo.createdAt,
    metrics: {
      commits30d: totalCommits30d,
      contributors: randInt(rng, 4, 12),
      openPullRequests: openPRs,
      mergedPullRequests: mergedPRs,
      deploySuccessRate: deploySummary.successRate,
      lastDeployAt: deploySummary.lastDeployAt,
      avgDeployDurationSeconds: deploySummary.avgDurationSeconds
    }
  };
}

function getRepoOr404(repoId) {
  return REPOSITORIES.find((r) => r.id === repoId) || null;
}

module.exports = {
  rngFor,
  randInt,
  pick,
  generateCommitActivity,
  generateRecentCommits,
  generatePullRequests,
  generateDeployMetrics,
  generateRepoStats,
  getRepoOr404
};
