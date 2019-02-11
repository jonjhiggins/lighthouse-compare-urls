const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const errorMessages = require('./errorMessages')
const chalk = require('chalk')
const readline = require('readline')

// Number of tests to take average from
// @TODO move to config
const numberOfTests = 3

/**
 * Perform multiple Lighthouse tests on a URL and return average results
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
      chromeFlags: ['--show-paint-rects', '--headless'],
      onlyCategories: ['performance'],
      output: 'html'
    }

    this.config = null

    this.results = {}
    this.resultsAverages = {}
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
  async getLightHouseInstances() {
    // eslint-disable-next-line no-return-await
    return this.lightHouseInstance || (await this.initLighthouse())
  }

  /**
   * Start a Lighthouse instance for a specific URL
   * @return {Promise[]|object[]}
   */
  async initLighthouse() {
    if (!this.chromeInstance) {
      await this.getChromeInstance()
    }

    const lighthouseResultsList = []

    for (let i = 0; i < numberOfTests; i += 1) {
      const lightHouseInstance = await this.runLighthouseTest({
        url: this.url,
        opts: this.opts,
        config: this.config,
        index: i,
        numberOfTests
      })
      lighthouseResultsList.push(lightHouseInstance)
    }

    this.storeResults(lighthouseResultsList.map(item => item.lhr))
    this.lightHouseInstance = lighthouseResultsList
    return lighthouseResultsList
  }

  async runLighthouseTest({ url, opts, config, index, numberOfTests }) {
    GetResults.logTestStart(url, index, numberOfTests)
    let lightHouseInstance = null
    // Repeat test if Lighthouse returns null
    // @TODO add test for this
    let failCounter = 0
    const failCounterLimit = 3
    while (
      !lightHouseInstance ||
      !lightHouseInstance.lhr ||
      !lightHouseInstance.lhr.categories.performance.score
    ) {
      failCounter += 1
      if (failCounter > failCounterLimit) {
        GetResults.logAllTestsFailed(url)
        this.killChromeInstance()
        process.exit()
      }
      if (failCounter > 1) {
        GetResults.logTestFailed(url)
      }
      lightHouseInstance = await GetResults.doLighthouseTest({
        url,
        opts,
        config
      })
    }
    GetResults.logTestEnd(
      url,
      index,
      numberOfTests,
      lightHouseInstance.lhr.categories.performance.score
    )
    this.killChromeInstance()
    return lightHouseInstance
  }

  static async doLighthouseTest({ url, opts, config }) {
    const lighthouseInstace = await lighthouse(url, opts, config)
    return lighthouseInstace
  }

  /**
   * Store results from Lighthouse in specific format
   * @param {object[]} lighthouseResultsList
   */
  storeResults(lighthouseResultsList) {
    this.results = lighthouseResultsList.map(lighthouseResultObj => ({
      tests: {
        performanceScore: lighthouseResultObj.categories.performance.score,
        firstContentfulPaint:
          lighthouseResultObj.audits['first-contentful-paint'].score,
        firstMeaningfulPaint:
          lighthouseResultObj.audits['first-meaningful-paint'].score,
        firstCPUIdle: lighthouseResultObj.audits['first-cpu-idle'].score,
        totalByteWeight: lighthouseResultObj.audits['total-byte-weight'].score
      },
      info: {
        url: lighthouseResultObj.requestedUrl
      }
    }))
    // Get the averages from the tests
    this.resultsAverages = {
      tests: GetResults.getAverageTests(this.results),
      info: {
        url: lighthouseResultsList[0].requestedUrl
      }
    }
  }

  /**
   * For each property in lighthouseResult.tests get
   * the average value accross all lighthouseResults passed in
   * @param {object[]} lighthouseResultsList
   * @returns {object}
   */
  static getAverageTests(lighthouseResultsList) {
    const testsCount = lighthouseResultsList.length
    const obj = {}
    const testKeys = Object.keys(lighthouseResultsList[0].tests)
    testKeys.forEach(testKey => {
      const sumOfValues = lighthouseResultsList
        .reduce((accumulator, lighthouseResult) => {
          accumulator.push(lighthouseResult.tests[testKey])
          return accumulator
        }, [])
        .reduce((total, value) => total + value)
      const average = sumOfValues / testsCount
      const averageFormatted = Math.round(average * 100) / 100
      obj[testKey] = averageFormatted
    })
    return obj
  }

  /**
   * Return stored average results
   */
  getAverageResults() {
    return this.resultsAverages
  }

  /**
   * Log out test start info
   * @param {string} url
   * @param {number} index
   * @param {number} testCount
   */
  static logTestStart(url, index, testCount) {
    process.stdout.write(
      `${chalk.blue('Testing')} ${url} ${index + 1} of ${testCount}`
    )
  }

  /**
   * Log out test start info
   * @param {string} url
   */
  static logTestFailed(url) {
    process.stdout.write(`\n${chalk.blue('Test failed - retrying')} ${url}`)
  }

  static logAllTestsFailed(url) {
    process.stdout.write(`\n${chalk.red(`Testing ${url} failed`)}\n`)
  }

  /**
   * Log out test end info
   * @param {string} url
   * @param {number} index
   * @param {number} testCount
   * @param {number} performanceScore
   */
  static logTestEnd(url, index, testCount, performanceScore) {
    readline.clearLine(process.stdout)
    readline.cursorTo(process.stdout, 0)
    process.stdout.write(
      `${chalk.green('Complete')} ${url} ${index +
        1} of ${testCount} ${chalk.green(`[${performanceScore * 100}]`)} \n`
    )
  }
}
