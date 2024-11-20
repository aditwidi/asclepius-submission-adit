const ClientError = require('./ClientError');

class InputError extends ClientError {
    constructor(message) {
        super(message, 413); // Set default status code for input errors
        this.name = 'InputError';
    }
}

module.exports = InputError;
