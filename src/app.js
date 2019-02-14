const argv = require('minimist')(process.argv.slice(2))
const Input = require('./input')
const GetResults = require('./getResults')
const FormatResults = require('./formatResults')
const errorMessages = require('./errorMessages')
const { exportXLSX, exportJSON } = require('./exportResults')

module.exports = class App {
  /**
   * Run everything:
   * - get URLs and CLI arguments
   * - get Lighthouse results
   * - export
   */
  async init() {
    try {
      const { urls, jsonExport } = App.getInputValues(argv)

      for (let urlPairs of urls) {
        await App.getResultsAndExport(urlPairs, jsonExport)
      }

      process.exit()
    } catch (e) {
      App.handleError(e)
    }
  }

  /**
   * Get the Lighthouse results for a pair of URLs
   * that are to be compared and export results
   * @param {string[]} urlPair
   * @param {boolean} jsonExport
   */
  static async getResultsAndExport(urlPair, jsonExport) {
    // Get Lighthouse results for each URL
    const results = await App.getResults(urlPair, jsonExport)
    // Format results into CLI table + XLSX string
    const formattedResults = App.getFormattedResults(results)
    const { cliTable, excelBuffer } = formattedResults
    App.outputCLITable(cliTable)
    // Export files
    await exportXLSX(urlPair.join('-'), excelBuffer)
  }

  /**
   * Get URLs and options from the CLI arguments
   * @param {object} argv CLI arguments from minimist
   * @returns {object}
   * @prop {array[]} urls
   * @prop {boolean} jsonExport
   */
  static getInputValues(argv) {
    const inputInstance = new Input(argv)
    const { urls, jsonExport } = inputInstance
    return { urls, jsonExport }
  }

  /**
   * Throw error and end/exit the whole process
   * @param {object} error
   */
  static handleError(error) {
    console.error(`\n ${error}`)
    process.exit()
  }

  /**
   * Get results from an array of URL pairs
   * @param {string[]} urlPair
   * @param {boolean} jsonExport
   * @returns {object[]}
   */
  static async getResults(urlPair, jsonExport) {
    if (urlPair.constructor !== Array) {
      throw new Error(errorMessages.app.getResultsNoArray)
    }
    // Can't use Array.map async here
    const results = []
    for (let url of urlPair) {
      const getResultsInstance = new GetResults({ url })
      const lighthouseInstances = await getResultsInstance.getLightHouseInstances()
      results.push(getResultsInstance.getAverageResults())
      if (jsonExport) {
        await exportJSON(`${url}.json`, lighthouseInstances)
      }
    }
    return results
  }

  /**
   * Output results in various formats
   * @param {object[]} results
   * @returns {object}
   * @prop {string} cliTable
   * @prop {Buffer} excelBuffer
   */
  static getFormattedResults(results) {
    const formatResultsInstance = new FormatResults(results)
    return {
      cliTable: formatResultsInstance.getCLITable(),
      excelBuffer: formatResultsInstance.getExcelBuffer()
    }
  }

  /**
   * Output a table of results to the console log
   * @param {string} cliTable
   */
  static outputCLITable(cliTable) {
    console.log(cliTable)
  }
}
