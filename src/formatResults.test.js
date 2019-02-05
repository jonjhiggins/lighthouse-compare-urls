const FormatResults = require('./formatResults')
const errorMessages = require('./errorMessages')

/* globals test, expect, describe */

const results = [
  {
    tests: {
      performanceScore: 0.5,
      firstContentfulPaint: 1.5,
      firstMeaningfulPaint: 1.5,
      firstCPUIdle: 2,
      totalByteWeight: 5
    },
    info: { url: 'https://google.com.au/' }
  },
  {
    tests: {
      performanceScore: 0.86,
      firstContentfulPaint: 0.9,
      firstMeaningfulPaint: 0.9,
      firstCPUIdle: 0.79,
      totalByteWeight: 1
    },
    info: { url: 'https://google.com/' }
  }
]

const tableLabels = [
  results[0].info.url,
  results[1].info.url,
  'First Contentful Paint',
  'First Meaningful Paint',
  'First CPU Idle',
  'Total Byte Weight',
  'Performance Score'
]

describe('I can get results formatted', () => {
  test('throws error if 2 sets of results not provided', () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const formatResultsInstance = new FormatResults()
      // Fail test if above expression doesn't throw anything.
      expect(false).toBe(true)
    } catch (e) {
      expect(e.message).toBe(errorMessages.formatResults.noResults)
    }
  })

  test('formats results object for CLI Table', () => {
    const formattedResultsObj = FormatResults.formatDataForCLITable(
      results[0],
      results[1]
    )
    expect(formattedResultsObj[0][0]).toMatch('')
    expect(formattedResultsObj[0][1]).toBe(results[0].info.url)
    expect(formattedResultsObj[0][2]).toBe(results[1].info.url)
    expect(formattedResultsObj[1][0]).toMatch('Performance Score')
    expect(formattedResultsObj[1][1]).toBe(results[0].tests.performanceScore)
    expect(formattedResultsObj[1][2]).toBe(results[1].tests.performanceScore)
  })

  test('formats results object for XLSX export', () => {
    const formattedResultsObj = FormatResults.formatDataForXLSX(
      results[0],
      results[1]
    )
    expect(formattedResultsObj[0].metric).toMatch('Performance Score')
    expect(formattedResultsObj[0].url1).toBe(results[0].tests.performanceScore)
    expect(formattedResultsObj[0].url2).toBe(results[1].tests.performanceScore)
  })

  test('creates a CLI table from formatted object', () => {
    const resultsObj = [
      ['', results[0].info.url, results[1].info.url],
      ['Performance Score', 0.5, 0.86],
      ['First Contentful Paint', 1.5, 0.9],
      ['First Meaningful Paint', 1.5, 0.9],
      ['First CPU Idle', 2, 0.79],
      ['Total Byte Weight', 5, 1]
    ]
    const table = FormatResults.createTables(resultsObj)

    tableLabels.forEach(label => {
      expect(table).toEqual(expect.stringContaining(label))
    })
  })

  test('returns CLI table', () => {
    const formatResultsInstance = new FormatResults(results)
    const table = formatResultsInstance.getCLITable()
    tableLabels.forEach(label => {
      expect(table).toEqual(expect.stringContaining(label))
    })
  })

  test('returns XLS string', () => {
    const formatResultsInstance = new FormatResults(results)
    const xls = formatResultsInstance.getExcelString()
    expect(xls).toEqual(expect.stringContaining('workbook.xml'))
  })
})
