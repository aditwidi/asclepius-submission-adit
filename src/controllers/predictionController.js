const { predict, getPredictionHistories } = require('../services/predictionService');
const { storePredictionData } = require('../services/storeData');

async function predictHandler(req, res) {
    try {
        // Check if a file is uploaded
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'No file uploaded',
            });
        }

        // Check file size
        if (req.file.size > 1000000) {
            return res.status(413).json({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000',
            });
        }

        // Get the model from app.locals
        const model = req.app.locals.model;

        // Perform prediction
        const predictionResult = await predict(model, req.file.buffer);

        // Store prediction result
        await storePredictionData(predictionResult);

        // Send success response
        return res.status(201).json({
            status: 'success',
            message: 'Model is predicted successfully',
            data: predictionResult,
        });
    } catch (error) {
        // Handle prediction errors (e.g., invalid input image or model failure)
        console.error('Error in prediction handler:', error.message);
        return res.status(400).json({
            status: 'fail',
            message: error.message || 'Terjadi kesalahan dalam melakukan prediksi',
        });
    }
}

async function getPredictionHistoriesHandler(req, res) {
    try {
        const histories = await getPredictionHistories();
        return res.status(200).json({
            status: 'success',
            data: histories,
        });
    } catch (error) {
        console.error('Error fetching prediction histories:', error);
        return res.status(500).json({
            status: 'fail',
            message: 'Failed to retrieve prediction histories',
        });
    }
}

module.exports = { predictHandler, getPredictionHistoriesHandler };
