const Input = require('./input')
const errorMessages = require('./errorMessages')
const minimist = require('minimist')

/* globals test, expect, describe */

describe('I can specify CLI arguements', () => {
  test('Handles error when no URL supplied', () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const inputInstance = new Input()
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false)
    } catch (e) {
      expect(e.message).toBe(errorMessages.input.noURLs)
    }
  })

  test('setting URLs via the command line', () => {
    const url1 = 'https://google.com.au'
    const url2 = 'https://google.co.uk'
    const nodeArgs = minimist(['--urls', `${url1},${url2}`])
    const inputInstance = new Input(nodeArgs)
    expect(inputInstance.urls[0]).toBe(url1)
    expect(inputInstance.urls[1]).toBe(url2)
  })

  test('setting JSON export', () => {
    const url1 = 'https://google.com.au'
    const url2 = 'https://google.co.uk'
    const nodeArgs = minimist(['--urls', `${url1},${url2}`, '--jsonExport'])
    const inputInstance = new Input(nodeArgs)
    expect(inputInstance.jsonExport).toBe(true)
  })
})
