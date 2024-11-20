const express = require('express');
const multer = require('multer');
const { predictHandler, getPredictionHistoriesHandler } = require('../controllers/predictionController');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Define the /predict route
router.post('/predict', upload.single('image'), predictHandler);

// Define the /predict/histories route
router.get('/predict/histories', getPredictionHistoriesHandler);

module.exports = router;
