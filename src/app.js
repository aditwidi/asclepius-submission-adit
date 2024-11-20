require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const loadModel = require('./services/loadModel');
const predictionRoute = require('./routes/predictionRoute');
const ClientError = require('./exceptions/clientError');
const InputError = require('./exceptions/inputError');

const app = express();
const port = process.env.PORT || 8080; // Use PORT from environment or default to 8080

app.use(cors());

// Function to initialize the app
async function initializeApp() {
    try {
        // Load the model
        const model = await loadModel();
        app.locals.model = model;
        console.log('Model loaded successfully');

        // Start the server after the model is loaded
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to initialize the model:', error);
        process.exit(1); // Exit the process if the model fails to load
    }
}

// Initialize the app
initializeApp();

// Use the prediction route
app.use('/', predictionRoute);

app.get('/', (req, res) => {
    if (app.locals.model) {
        res.send('Hello World! Model is loaded.');
    } else {
        res.status(500).send('Model is not loaded.');
    }
});

// Error-handling middleware
app.use((err, req, res, next) => {
    // Handle Multer file size limit error
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            status: 'fail',
            message: 'Payload content length greater than maximum allowed: 1000000',
        });
    }

    // Handle other ClientError instances
    if (err instanceof ClientError) {
        return res.status(err.statusCode).json({
            status: 'fail',
            message: err.message,
        });
    }

    // Generic error handler for other cases
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
});
