const errorMessages = require('./errorMessages')
const Table = require('cli-table')
const excel = require('node-excel-export')

const styles = {
  headerDark: {
    font: {
      bold: true
    }
  },
  body: {
    font: {
      bold: false
    }
  },
  footer: {
    font: {
      bold: true
    },
    numFmt: '+0;-0;0'
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
    this.results = FormatResults.getResultsWithDifference(results)
  }

  /**
   * Add a "difference" item to the results that compares
   * the two URLs results for each test item
   * @param {object[]} results
   */
  static getResultsWithDifference(results) {
    const difference = {
      tests: Object.keys(results[0].tests).reduce((accumulator, key) => {
        accumulator[key] = FormatResults.getDifference(
          results[0].tests[key],
          results[1].tests[key]
        )
        return accumulator
      }, {}),
      info: {
        url: 'Difference'
      }
    }
    const resultsWithDiffererence = [...results, difference]
    return resultsWithDiffererence
  }

  /**
   * Get difference of two numbers, round to 2 decimal places
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  static getDifference(a, b) {
    return Math.round((b - a) * 100) / 100
  }

  /**
   * Get data formatted and output as CLI table
   * @param {Object[]} results
   * @returns {string}
   */
  getCLITable() {
    const tableData = FormatResults.formatDataForCLITable(this.results)
    return FormatResults.createTables(tableData)
  }

  /**
   * Format the performance results into array for use in cli-table
   * @param {object[]} differentResults
   * @returns {object[]}
   */
  static formatDataForCLITable(differentResults) {
    const getHeadings = differentResults.map(result => result.info.url)
    const headings = ['', ...getHeadings]
    const tableData = Object.keys(differentResults[0].tests).map(testKey => {
      const label = fields.find(field => field.value === testKey).label
      const getTests = differentResults.map(result => {
        const isDifference = result.info.url === 'Difference'
        const value = result.tests[testKey]
        const numberPrefix = value > 0 ? '+' : ''
        // Add + / - sign prefix for difference row values
        return isDifference ? `${numberPrefix}${value}` : value
      })
      return [label, ...getTests]
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
        headerStyle: styles.headerDark,
        // Format difference row bold
        cellStyle: function(value, row) {
          const isDifference = row.url === 'Difference'
          return isDifference ? styles.footer : styles.body
        }
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
