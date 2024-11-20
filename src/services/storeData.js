const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore with environment variables
const firestore = new Firestore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

async function storePredictionData(data) {
    try {
        const predictionsCollection = firestore.collection('predictions');
        
        // Use the prediction's id as the document ID
        await predictionsCollection.doc(data.id).set(data);
        console.log('Prediction data stored successfully');
    } catch (error) {
        console.error('Error storing prediction data:', error);
        throw error;
    }
}

module.exports = { storePredictionData };
