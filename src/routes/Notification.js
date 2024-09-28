const express = require('express');
const { getNotifications, changeVisible } = require('../controllers/Notification');
const router = express.Router();

router.get('/retrieve/:id', getNotifications);
router.put('/update/:id', changeVisible);
module.exports = router;