const GetResults = require('./getResults')
const errorMessages = require('./errorMessages')
const chalk = require('chalk')
/* globals test, expect, describe, jest, beforeAll, afterAll, xtest */

const url = 'https://google.com.au/'
const lighthouseResultObj = {
  requestedUrl: url,
  categories: {
    performance: {
      score: 0.5
    }
  },
  audits: {
    'first-contentful-paint': { score: 1111 },
    'first-meaningful-paint': { score: 2222 },
    'first-cpu-idle': { score: 3333 },
    'total-byte-weight': { score: 999999 }
  }
}
const lighthouseResultObj2 = JSON.parse(JSON.stringify(lighthouseResultObj))
lighthouseResultObj2.categories.performance.score = 0.3
lighthouseResultObj2.audits['first-contentful-paint'].score = 400
const lighthouseResultsListFormatted = [
  {
    tests: {
      performanceScore: 0.5,
      firstContentfulPaint: 1111,
      firstMeaningfulPaint: 2222,
      firstCPUIdle: 3333,
      totalByteWeight: 999999
    },
    info: { url: 'https://google.com.au/' }
  },
  {
    tests: {
      performanceScore: 0.3,
      firstContentfulPaint: 400,
      firstMeaningfulPaint: 2222,
      firstCPUIdle: 3333,
      totalByteWeight: 999999
    },
    info: { url: 'https://google.com.au/' }
  },
  {
    tests: {
      performanceScore: 0.5,
      firstContentfulPaint: 1111,
      firstMeaningfulPaint: 2222,
      firstCPUIdle: 3333,
      totalByteWeight: 999999
    },
    info: { url: 'https://google.com.au/' }
  }
]

const lighthouseResults = [
  lighthouseResultObj,
  lighthouseResultObj2,
  lighthouseResultObj
]

describe('I can get metrics from Lighthouse (sync tests)', () => {
  test('Shows error if no URL supplied', () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const resultsInstance = new GetResults({})
      expect(true).toBe(false) // force test fail if no error thrown
    } catch (e) {
      expect(e.message).toBe(errorMessages.getResults.noURL)
    }
  })

  test('Store results in correct format', () => {
    const resultsInstance = new GetResults({
      url
    })
    resultsInstance.storeResults(lighthouseResults)
    expect(resultsInstance.results[0].info.url).toBe(url)
    expect(resultsInstance.results[0].tests.performanceScore).toBe(
      lighthouseResults[0].categories.performance.score
    )
    expect(resultsInstance.results[1].tests.performanceScore).toBe(
      lighthouseResults[1].categories.performance.score
    )
    expect(resultsInstance.results[0].tests.firstContentfulPaint).toBe(
      lighthouseResults[0].audits['first-contentful-paint'].score
    )
    expect(resultsInstance.results[1].tests.firstMeaningfulPaint).toBe(
      lighthouseResults[0].audits['first-meaningful-paint'].score
    )
    expect(resultsInstance.results[0].tests.firstCPUIdle).toBe(
      lighthouseResults[0].audits['first-cpu-idle'].score
    )
    expect(resultsInstance.results[0].tests.totalByteWeight).toBe(
      lighthouseResults[0].audits['total-byte-weight'].score
    )
  })

  test('Returns averages for a set of tests', () => {
    const averageTests = GetResults.getAverageTests(
      lighthouseResultsListFormatted
    )
    expect(averageTests.performanceScore).toBe(0.43)
    expect(averageTests.firstContentfulPaint).toBe(874)
    expect(averageTests.firstMeaningfulPaint).toBe(2222)
  })

  test('Store averages in correct format', () => {
    const resultsInstance = new GetResults({
      url
    })
    resultsInstance.storeResults(lighthouseResults)
    expect(resultsInstance.resultsAverages.info.url).toBe(url)
    expect(resultsInstance.resultsAverages.tests.performanceScore).toBe(0.43)
    expect(resultsInstance.resultsAverages.tests.firstContentfulPaint).toBe(874)
    expect(resultsInstance.resultsAverages.tests.firstMeaningfulPaint).toBe(
      lighthouseResults[0].audits['first-meaningful-paint'].score
    )
    expect(resultsInstance.resultsAverages.tests.firstCPUIdle).toBe(
      lighthouseResults[0].audits['first-cpu-idle'].score
    )
    expect(resultsInstance.resultsAverages.tests.totalByteWeight).toBe(
      lighthouseResults[0].audits['total-byte-weight'].score
    )
  })

  test('Logs out test start and end', () => {
    // Record contents of console log
    let outputData = ''
    const storeLog = inputs => (outputData += inputs)
    process.stdout.write = jest.fn(storeLog)
    GetResults.logTestStart('https://google.com.au', 1, 3)
    expect(outputData).toMatch(
      `${chalk.blue('Testing')} https://google.com.au 2 of 3`
    )
    outputData = ''
    GetResults.logTestEnd('https://google.com.au', 1, 3, 0.5)
    // Can't test the clearLine / cursorTo here - not working in Jest
    expect(outputData).toEqual(
      expect.stringContaining(
        `${chalk.green('Complete')} https://google.com.au 2 of 3 ${chalk.green(
          '[50]'
        )}`
      )
    )
  })

  test('Logs out logTestFailed', () => {
    let outputData = ''
    const storeLog = inputs => (outputData += inputs)
    process.stdout.write = jest.fn(storeLog)
    GetResults.logTestFailed(url)
    expect(outputData).toEqual(
      expect.stringContaining(
        `\n${chalk.blue('Test failed - retrying')} ${url}`
      )
    )
  })

  test('Logs out logAllTestsFailed', () => {
    let outputData = ''
    const storeLog = inputs => (outputData += inputs)
    process.stdout.write = jest.fn(storeLog)
    GetResults.logAllTestsFailed(url)
    expect(outputData).toEqual(
      expect.stringContaining(chalk.red(`Testing ${url} failed`))
    )
  })
})

describe('I can get metrics from Lighthouse (async tests)', async () => {
  let resultsInstance = null

  beforeAll(() => {
    resultsInstance = new GetResults({
      url: 'https://google.com.au'
    })
  })

  afterAll(() => {
    resultsInstance.killChromeInstance()
  })

  test('Chrome opens page', async () => {
    const chromeInstance = await resultsInstance.getChromeInstance()
    expect(chromeInstance.port).toBeDefined()
  })

  test('Lighthouse runs', async () => {
    const lightHouseInstances = await resultsInstance.getLightHouseInstances()
    expect(lightHouseInstances[0].lhr).toBeDefined() // lhr is JS object of results
    resultsInstance.killChromeInstance()
  }, 30000)

  test('Results are stored', () => {
    expect(resultsInstance.results).toBeDefined()
    expect(resultsInstance.results[0].tests).toBeDefined()
    expect(resultsInstance.results[0].info).toBeDefined()
  })

  test('Averages are stored', () => {
    expect(resultsInstance.results).toBeDefined()
    expect(resultsInstance.resultsAverages.tests).toBeDefined()
    expect(resultsInstance.resultsAverages.info).toBeDefined()
  })

  test('Averages are returned', () => {
    const averages = resultsInstance.getAverageResults()
    expect(averages.tests).toBeDefined()
    expect(averages.info).toBeDefined()
  })

  xtest('Chrome returns page title', () => {
    expect(resultsInstance.results.info.pageTitle).toBe('title')
  })
})
