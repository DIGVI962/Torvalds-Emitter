const express = require('express');
const router = express.Router();
const multer = require('multer');
const ingestionController = require('../controllers/ingestionController');

// Configure multer for Excel file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only Excel files are allowed!'));
        }
    }
});

// Routes
router.post('/ingest', upload.single('file'), ingestionController.ingestLawyers);
router.get('/', ingestionController.getAllLawyers);
router.get('/expertise/:expertise', ingestionController.getLawyersByExpertise);
router.get('/location/:location', ingestionController.getLawyersByLocation);

module.exports = router;