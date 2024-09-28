const express = require('express');
const { generate, getChallenge, getChallengeByCode, createInitialTest, generateIndividualChallenges } = require('../controllers/Challenge');
const router = express.Router();

router.post('/generate', generate);
router.get('/:id', getChallenge);
router.post('/generate/test', createInitialTest);
router.get('/generate/individual/:user', generateIndividualChallenges);

module.exports = router;