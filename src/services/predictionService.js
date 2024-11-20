const tf = require('@tensorflow/tfjs-node');
const { v4: uuidv4 } = require('uuid');
const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore
const firestore = new Firestore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

async function predict(model, imageBuffer) {
    try {
        // Decode the image buffer into a tensor
        const imageTensor = tf.node.decodeImage(imageBuffer);

        // Check if the image is RGB
        if (imageTensor.shape[2] !== 3) {
            throw new Error('Image is not in RGB format');
        }

        const resizedTensor = imageTensor
            .resizeNearestNeighbor([224, 224]) // Resize to the required dimensions
            .toFloat()
            .expandDims(); // Add a batch dimension

        // Make prediction
        const prediction = model.predict(resizedTensor);
        const predictionArray = prediction.arraySync();
        
        // Interpret the result
        const predictionValue = predictionArray[0][0];
        const isCancer = predictionValue > 0.5;

        // Create response data
        const result = isCancer ? 'Cancer' : 'Non-cancer';
        const suggestion = isCancer ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.';

        return {
            id: uuidv4(),
            result,
            suggestion,
            createdAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error during prediction:', error);
        throw new Error('Terjadi kesalahan dalam melakukan prediksi');
    }
}

async function getPredictionHistories() {
    const predictionsCollection = firestore.collection('predictions');
    const snapshot = await predictionsCollection.get();
    const histories = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        histories.push({
            id: doc.id,
            history: {
                result: data.result,
                createdAt: data.createdAt,
                suggestion: data.suggestion,
                id: doc.id,
            },
        });
    });

    return histories;
}

module.exports = { predict, getPredictionHistories };
