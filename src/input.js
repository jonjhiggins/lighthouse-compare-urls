const errorMessages = require('./errorMessages')

/**
 * Get input URLs from command line arguments
 * @param {object} argv
 */
module.exports = class Input {
    constructor(argv) {
        try {
            const urls = argv.urls.split(',')
            return {
                urls,
            }
        } catch (e) {
            throw new Error(errorMessages.input.noURLs)
        }
    }
}
