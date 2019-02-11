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

const differenceItem = {
  tests: {
    performanceScore: 0.36,
    firstContentfulPaint: -0.6,
    firstMeaningfulPaint: -0.6,
    firstCPUIdle: -1.21,
    totalByteWeight: -4
  },
  info: { url: 'Difference' }
}

const differenceResults = [...results, differenceItem]

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

  test('adds difference item', () => {
    const resultsWithDifference = FormatResults.getResultsWithDifference(
      results
    )
    const differenceItem = resultsWithDifference[2]
    expect(differenceItem.info.url).toMatch('Difference')
    expect(differenceItem.tests.performanceScore).toBe(
      results[1].tests.performanceScore - results[0].tests.performanceScore
    )

    const testKeys = Object.keys(results[0].tests)
    testKeys.forEach(key => {
      expect(differenceItem.tests[key]).toBe(
        results[1].tests[key] - results[0].tests[key]
      )
    })
  })

  test('formats results object for CLI Table', () => {
    const formattedResultsObj = FormatResults.formatDataForCLITable(
      differenceResults
    )
    expect(formattedResultsObj[0][0]).toMatch('')
    expect(formattedResultsObj[0][1]).toBe(results[0].info.url)
    expect(formattedResultsObj[0][2]).toBe(results[1].info.url)
    expect(formattedResultsObj[1][0]).toMatch('Performance Score')
    expect(formattedResultsObj[1][1]).toBe(results[0].tests.performanceScore)
    expect(formattedResultsObj[1][2]).toBe(results[1].tests.performanceScore)
  })

  test('get difference formatted correctly', () => {
    const test1 = 1.404
    const test2 = 3.21
    const difference = FormatResults.getDifference(test1, test2)
    expect(difference).toBe(1.81)
  })

  test('formats results object for XLSX export', () => {
    const formattedResultsObj = FormatResults.formatDataForXLSX(results)
    expect(formattedResultsObj[0].url).toMatch(results[0].info.url)
    expect(formattedResultsObj[1].url).toMatch(results[1].info.url)
    Object.keys(results[0].tests).forEach(testKey => {
      expect(formattedResultsObj[0][testKey]).toBe(results[0].tests[testKey])
      expect(formattedResultsObj[1][testKey]).toBe(results[1].tests[testKey])
    })
  })

  test('formats object specification for XLSX export', () => {
    const specification = FormatResults.getSpecificationForXLSX(results)
    const cellStyle1 = specification.url.cellStyle('', {
      url: 'https://google.com.au'
    })
    const cellStyle2 = specification.url.cellStyle('', {
      url: 'Difference'
    })
    expect(specification.url.displayName).toMatch('URL')
    expect(specification.performanceScore.displayName).toMatch(
      'Performance Score'
    )
    // Check difference row is formatted bold
    expect(cellStyle1).toEqual({ font: { bold: false } })
    expect(cellStyle2).toEqual({ font: { bold: true } })
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
    const xls = formatResultsInstance.getExcelBuffer()
    expect(xls.toString()).toEqual(expect.stringContaining('workbook.xml'))
  })
})
