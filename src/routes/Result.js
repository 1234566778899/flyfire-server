const express = require('express');
const { addResult, getSubmissions, getCurrentRanking, generalRanking } = require('../controllers/Result');
const router = express.Router();

router.post('/register', addResult);
router.post('/retrieve', getSubmissions);
router.get('/ranking/:id', getCurrentRanking);
router.get('/ranking', generalRanking);


module.exports = router;