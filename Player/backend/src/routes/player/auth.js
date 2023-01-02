const express = require('express');
const { signup , signin, requireSignin } = require('../../controller/player/auth');
const router = express.Router();
router.post('/player/signup',signup);
router.post('/player/signin', signin);

module.exports = router;
