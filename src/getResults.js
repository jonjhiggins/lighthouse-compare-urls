const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const errorMessages = require('./errorMessages')
const fs = require('fs')

/**
 * Perform Lighthouse test on a URL
 */
module.exports = class GetResults {
  /**
   * @param {object}
   * @prop {string} url url to test via Lighthouse
   */
  constructor({ url }) {
    if (!url) {
      throw new Error(errorMessages.getResults.noURL)
    }

    this.opts = {
      chromeFlags: ['--show-paint-rects'],
      onlyCategories: ['performance'],
      output: 'html'
    }

    this.config = null

    this.results = {}
    this.chromeInstance = null
    this.lightHouseInstance = null
    this.url = url
  }

  /**
   * Open a Chrome browser instance for Lighthouse to use
   * @returns {Promise}
   */
  async initChromeInstance() {
    this.chromeInstance = await chromeLauncher.launch({
      chromeFlags: this.opts.chromeFlags
    })
    this.opts.port = this.chromeInstance.port
    return this.chromeInstance
  }

  /**
   * Close the Chrome browser instance
   */
  killChromeInstance() {
    this.chromeInstance.kill()
  }

  /**
   * Return either active Chrome browser instance or create one
   * @returns {Promise|object}
   */
  async getChromeInstance() {
    // eslint-disable-next-line no-return-await
    return this.chromeInstance || (await this.initChromeInstance())
  }

  /**
   * Return either active Lighthouse instance or create one
   * @returns {Promise|object}
   */
  async getLightHouseInstance() {
    // eslint-disable-next-line no-return-await
    return this.lightHouseInstance || (await this.initLighthouse())
  }

  /**
   * Start a Lighthouse instance for a specific URL
   * @return {Promise|object}
   */
  async initLighthouse() {
    if (!this.chromeInstance) {
      await this.getChromeInstance()
    }

    const lighthouseResults = await lighthouse(this.url, this.opts, this.config)
    const storedResults = this.storeResults(lighthouseResults.lhr)
    await this.writeFile(storedResults)
    this.lightHouseInstance = lighthouseResults
    return lighthouseResults
  }

  /**
   * Store results from Lighthouse in specific format
   * @param {object} lighthouseResults
   */
  storeResults(lighthouseResults) {
    this.results.tests = {
      performanceScore: lighthouseResults.categories.performance.score,
      firstContentfulPaint:
        lighthouseResults.audits['first-contentful-paint'].score,
      firstMeaningfulPaint:
        lighthouseResults.audits['first-meaningful-paint'].score,
      firstCPUIdle: lighthouseResults.audits['first-cpu-idle'].score,
      totalByteWeight: lighthouseResults.audits['total-byte-weight'].score
    }
    this.results.info = {
      url: lighthouseResults.requestedUrl
    }
    return this.results
  }

  /**
   * Return stored results
   */
  getResults() {
    return this.results
  }

  /**
   * Write results to a JSON file
   * @param {object} results
   */
  async writeFile(results) {
    return new Promise((resolve, reject) => {
      fs.writeFile('data/results.json', JSON.stringify(results), err => {
        if (err) {
          return reject(err)
        }
        return resolve()
      })
    })
  }
}
