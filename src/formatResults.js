const errorMessages = require('./errorMessages')
const Table = require('cli-table')
const json2xls = require('json2xls')

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
    const tableData = FormatResults.formatDataForCLITable(
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
  static formatDataForCLITable(results1, results2) {
    const headings = ['', results1.info.url, results2.info.url]
    const tableData = Object.keys(results1.tests).map(testKey => {
      const label = fields.find(field => field.value === testKey).label
      return [label, results1.tests[testKey], results2.tests[testKey]]
    })
    return [headings, ...tableData]
  }

  /**
   * Format the performance results into array for use in json2xls
   * @param {object} results1
   * @param {object} results2
   * @returns {object[]}
   */
  static formatDataForXLSX(results1, results2) {
    return Object.keys(results1.tests).map(testKey => {
      const metric = fields.find(field => field.value === testKey).label
      return {
        metric,
        url1: results1.tests[testKey],
        url2: results2.tests[testKey]
      }
    })
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

  /**
   * Return results as an Excel XLSX format string
   */
  getExcelString() {
    const tableData = FormatResults.formatDataForXLSX(
      this.results[0],
      this.results[1]
    )
    return json2xls(tableData)
  }
}
