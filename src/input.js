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
      const urls = Input.formatURLs(argv.urls.split(','))
      const jsonExport = argv.jsonExport || false
      return {
        urls,
        jsonExport
      }
    } catch (e) {
      throw new Error(errorMessages.input.noURLs)
    }
  }

  /**
   * Take a flat array of URLs and return as an array
   * of URL pairs
   * @param {string[]} urls
   * @returns {string[][]}
   */
  static formatURLs(urls) {
    return urls.reduce((accumulator, url, index) => {
      const parentIndex = Math.floor(index / 2)
      if (!accumulator[parentIndex]) {
        accumulator[parentIndex] = []
      }
      accumulator[parentIndex].push(url)
      return accumulator
    }, [])
  }
}
