const errorMessages = require('./errorMessages')
// const Json2csvParser = require('json2csv').Parser
const Table = require('cli-table')
// const chalk = require('chalk')

const fields = [
  { label: 'First Contentful Paint', value: 'firstContentfulPaint' },
  { label: 'First Meaningful Paint', value: 'firstMeaningfulPaint' },
  { label: 'First CPU Idle', value: 'firstCPUIdle' },
  { label: 'Total Byte Weight', value: 'totalByteWeight' },
  { label: 'Performance Score', value: 'performanceScore' }
]

module.exports = class FormatResults {
  constructor(results) {
    if (!results || results.length !== 2) {
      throw new Error(errorMessages.formatResults.noResults)
    }
    this.results = results
  }

  /**
   * Get data formatted and output as CLI table
   * @param {Object[]} results
   * @returns {string}
   */
  getCLITable() {
    const tableData = FormatResults.formatDataForTable(
      this.results[0],
      this.results[1]
    )
    return FormatResults.createTables(tableData)
  }

  /**
   * Format the performance results into array for use in cli-table
   * @param {object} results1
   * @param {object} results2
   * @returns {object[]}
   */
  static formatDataForTable(results1, results2) {
    const headings = ['', results1.info.url, results2.info.url]
    const tableData = Object.keys(results1.tests).map(testKey => {
      const label = fields.find(field => field.value === testKey).label
      return [label, results1.tests[testKey], results2.tests[testKey]]
    })
    return [headings, ...tableData]
  }

  /**
   * Create a table for output on CLI
   * @param {object[]} tableData
   * @returns {string}
   */
  static createTables(tableData) {
    const table = new Table()
    table.push(...tableData)
    return table.toString()
  }

  // createCSV() {
  //   const opts = { fields }
  //   const parser = new Json2csvParser(opts)
  //   return parser.parse(resultsObj.tests)
  // }
}
