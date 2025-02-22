const express = require('express');
const router = express.Router();
const {handleTranslation, generateAnswer, getDomain} = require('../controllers/chatController');

router.post('/', handleTranslation);
router.post('/generate', generateAnswer);
router.get('/getDomain/:id', getDomain);

module.exports = router;
