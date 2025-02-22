const express = require('express');
const router = express.Router();
const {handleTranslation, generateAnswer} = require('../controllers/chatController');

router.post('/', handleTranslation);
router.post('/generate', generateAnswer);

module.exports = router;
