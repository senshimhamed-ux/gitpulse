const express = require('express');
const { listRepos, getRepo, getRepoLanguages, getLanguageSummary } = require('../controllers/repos.controller');

const router = express.Router();

router.get('/languages/summary', getLanguageSummary);
router.get('/', listRepos);
router.get('/:repoId', getRepo);
router.get('/:repoId/languages', getRepoLanguages);

module.exports = router;
