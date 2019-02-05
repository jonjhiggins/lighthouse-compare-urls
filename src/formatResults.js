const errorMessages = require('./errorMessages')
const Table = require('cli-table')
const excel = require('node-excel-export')

const styles = {
  headerDark: {
    font: {
      bold: true
    }
  }
}

const fields = [
  { label: 'URL', value: 'url', width: 200 },
  { label: 'Performance Score', value: 'performanceScore' },
  { label: 'First Contentful Paint', value: 'firstContentfulPaint' },
  { label: 'First Meaningful Paint', value: 'firstMeaningfulPaint' },
  { label: 'First CPU Idle', value: 'firstCPUIdle' },
  { label: 'Total Byte Weight', value: 'totalByteWeight' }
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
   * @param {object[]} results
   * @param {object} results2
   * @returns {object[]}
   */
  static formatDataForXLSX(results) {
    return results.map(({ info: { url }, tests }) => ({
      url,
      ...tests
    }))
  }

  /**
   * Build a specifications object for node-excel-export
   * which tells it how to format columns in Excel
   * @param {object[]} results
   * @returns {object}
   */
  static getSpecificationForXLSX() {
    const obj = {}
    Object.keys(fields).forEach(fieldKey => {
      const field = fields[fieldKey]
      obj[field.value] = {
        displayName: field.label, // <- Here you specify the column header
        width: field.width || 120,
        headerStyle: styles.headerDark
      }
    })
    return obj
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
   * Return results as an Excel XLSX format buffer
   * @returns {Buffer}
   */
  getExcelBuffer() {
    const dataset = FormatResults.formatDataForXLSX(this.results)
    const specification = FormatResults.getSpecificationForXLSX()

    const report = excel.buildExport([
      {
        specification: specification,
        data: dataset
      }
    ])

    return report
  }
}
