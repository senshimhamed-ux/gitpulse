const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const reposRoutes = require('./routes/repos.routes');
const commitsRoutes = require('./routes/commits.routes');
const deploysRoutes = require('./routes/deploys.routes');
const { repoScopedRouter: prRepoRoutes, globalRouter: prGlobalRoutes } = require('./routes/pullRequests.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'gitpulse-api', timestamp: new Date().toISOString() });
  });

  // Repository-scoped resources
  app.use('/api/repos/:repoId/commits', commitsRoutes);
  app.use('/api/repos/:repoId/pull-requests', prRepoRoutes);
  app.use('/api/repos/:repoId/deploys', deploysRoutes);

  // Org-wide resources
  app.use('/api/pull-requests', prGlobalRoutes);
  app.use('/api/repos', reposRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
