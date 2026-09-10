/**
 * Base repository catalogue.
 * This is the single source of truth for repo identities that the
 * various mock data generators (commits, PRs, deploys) key off of,
 * so numbers stay consistent across endpoints within a server run.
 */

const REPOSITORIES = [
  {
    id: 'repo_pulse-core',
    name: 'pulse-core',
    owner: 'gitpulse-labs',
    description: 'Core event ingestion and metrics pipeline.',
    primaryLanguage: 'TypeScript',
    languages: { TypeScript: 62, Go: 21, Shell: 9, Dockerfile: 8 },
    visibility: 'private',
    defaultBranch: 'main',
    stars: 341,
    openIssues: 12,
    createdAt: '2022-03-14T00:00:00.000Z'
  },
  {
    id: 'repo_signal-ui',
    name: 'signal-ui',
    owner: 'gitpulse-labs',
    description: 'Design system and shared React component library.',
    primaryLanguage: 'TypeScript',
    languages: { TypeScript: 71, CSS: 18, JavaScript: 7, MDX: 4 },
    visibility: 'public',
    defaultBranch: 'main',
    stars: 1204,
    openIssues: 27,
    createdAt: '2021-11-02T00:00:00.000Z'
  },
  {
    id: 'repo_forge-cli',
    name: 'forge-cli',
    owner: 'gitpulse-labs',
    description: 'Command-line tooling for scaffolding and deploying services.',
    primaryLanguage: 'Go',
    languages: { Go: 84, Makefile: 9, Shell: 7 },
    visibility: 'public',
    defaultBranch: 'main',
    stars: 588,
    openIssues: 6,
    createdAt: '2023-01-20T00:00:00.000Z'
  },
  {
    id: 'repo_beacon-api',
    name: 'beacon-api',
    owner: 'gitpulse-labs',
    description: 'Public API gateway and auth layer.',
    primaryLanguage: 'Python',
    languages: { Python: 68, HCL: 14, Shell: 10, Dockerfile: 8 },
    visibility: 'private',
    defaultBranch: 'main',
    stars: 152,
    openIssues: 19,
    createdAt: '2022-08-09T00:00:00.000Z'
  },
  {
    id: 'repo_orbit-mobile',
    name: 'orbit-mobile',
    owner: 'gitpulse-labs',
    description: 'React Native client for iOS and Android.',
    primaryLanguage: 'TypeScript',
    languages: { TypeScript: 58, Swift: 20, Kotlin: 18, Ruby: 4 },
    visibility: 'private',
    defaultBranch: 'develop',
    stars: 97,
    openIssues: 33,
    createdAt: '2023-05-30T00:00:00.000Z'
  },
  {
    id: 'repo_ledger-infra',
    name: 'ledger-infra',
    owner: 'gitpulse-labs',
    description: 'Terraform modules and infrastructure-as-code for all environments.',
    primaryLanguage: 'HCL',
    languages: { HCL: 76, Shell: 15, Python: 9 },
    visibility: 'private',
    defaultBranch: 'main',
    stars: 44,
    openIssues: 4,
    createdAt: '2022-01-11T00:00:00.000Z'
  }
];

module.exports = { REPOSITORIES };
