const express = require('express');
const router = express.Router();
const {handleTranslation} = require('../controllers/chatController');

router.post('/',handleTranslation);

module.exports = router;
