const App = require('./app')
const errorMessages = require('./errorMessages')

/* globals test, expect, describe, jest */

describe('App', () => {
  const app = new App()

  test('Can init', () => {
    expect(app).toBeDefined()
  })

  test('can get URL input values', () => {
    const argv = { _: [], urls: 'https://google.com.au,https://google.com' }
    const inputValues = App.getInputValues(argv)
    expect(inputValues.urls[0][0]).toBe('https://google.com.au')
    expect(inputValues.urls[0][1]).toBe('https://google.com')
    expect(inputValues.jsonExport).toBe(false)
  })

  test('can get jsonExport values', () => {
    const argv = {
      _: [],
      urls: 'https://google.com.au,https://google.com',
      jsonExport: true
    }
    const inputValues = App.getInputValues(argv)
    expect(inputValues.jsonExport).toBe(true)
  })

  test('can format results', () => {
    const results = [
      {
        tests: {
          performanceScore: 0.79,
          firstContentfulPaint: 0.97,
          firstMeaningfulPaint: 0.93,
          firstCPUIdle: 0.71,
          totalByteWeight: 1
        },
        info: { url: 'https://google.com.au/' }
      },
      {
        tests: {
          performanceScore: 0.89,
          firstContentfulPaint: 0.97,
          firstMeaningfulPaint: 0.96,
          firstCPUIdle: 0.87,
          totalByteWeight: 1
        },
        info: { url: 'https://google.com/' }
      }
    ]
    const formattedResults = App.getFormattedResults(results)
    const { cliTable, excelBuffer } = formattedResults
    expect(cliTable).toEqual(expect.stringContaining('Performance Score'))
    expect(excelBuffer).toBeInstanceOf(Buffer)
  })

  test('can output CLI table', () => {
    let outputData = ''
    const storeLog = inputs => (outputData += inputs)
    console.log = jest.fn(storeLog)
    const table = '/n table'
    App.outputCLITable(table)
    expect(outputData).toMatch(table)
  })
})

describe('App (async)', async () => {
  const app = new App()

  test('handle error throws error and quits', async () => {
    let outputData = ''
    const storeLog = inputs => (outputData += inputs)
    console.log = jest.fn(storeLog)
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
    App.handleError('error')
    expect(typeof outputData).toBe('string')
    expect(mockExit).toHaveBeenCalled()
  })

  test('init works', async () => {
    const getInputValues = () => ({
      urls: [
        ['https://google.com.au', 'https://google.com'],
        ['https://google.co.uk', 'https://google.fr']
      ]
    })
    const getResultsAndExport = jest
      .spyOn(App, 'getResultsAndExport')
      .mockImplementation(() => {})
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
    App.getInputValues = jest.fn(getInputValues)
    await app.init()
    expect(getResultsAndExport).toHaveBeenCalledTimes(2)
    expect(mockExit).toHaveBeenCalled()
  })

  test('can get results', async () => {
    const urls = ['https://google.com.au', 'https://google.com']
    const results = await App.getResults(urls, false)
    expect(results[0].tests.performanceScore).toBeDefined()
    expect(results[1].tests.performanceScore).toBeDefined()
    expect(results[0].info.url).toBe('https://google.com.au/')
    expect(results[1].info.url).toBe('https://google.com/')
  }, 30000)

  test('getResults error is handled', async () => {
    try {
      const urls = 'https://google.com.au'
      // eslint-disable-next-line no-unused-vars
      const results = await App.getResults(urls, false)
      expect(true).toBe(false) // force test fail if no error thrown
    } catch (e) {
      expect(e.message).toBe(errorMessages.app.getResultsNoArray)
    }
  })
})
