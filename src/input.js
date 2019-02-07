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
      const jsonExport = argv.jsonExport || false
      return {
        urls,
        jsonExport
      }
    } catch (e) {
      throw new Error(errorMessages.input.noURLs)
    }
  }
}
