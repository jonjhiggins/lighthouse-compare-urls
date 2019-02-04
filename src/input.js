const errorMessages = require('./errorMessages')

/**
 * Get input URLs from command line arguments
 */
module.exports = class Input {
  /**
   * @param {object} argv node CLI arguments
   * @prop {string} urls
   */
  constructor(argv) {
    try {
      const urls = argv.urls.split(',')
      return {
        urls
      }
    } catch (e) {
      throw new Error(errorMessages.input.noURLs)
    }
  }
}
