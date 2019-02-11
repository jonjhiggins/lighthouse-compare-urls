const Input = require('./input')
const errorMessages = require('./errorMessages')
const minimist = require('minimist')

/* globals test, expect, describe */

const urlsList = [
  'https://google.com.au',
  'https://google.co.uk',
  'https://google.com',
  'https://google.fr',
  'https://google.de',
  'https://google.nl'
]

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

  test('formatURLs outputs an multidimensional array', () => {
    const formattedURLs = Input.formatURLs(urlsList)
    urlsList.forEach((url, index) => {
      const parentIndex = Math.floor(index / 2)
      const childIndex = index % 2
      expect(formattedURLs[parentIndex][childIndex]).toBe(url)
    })
  })

  test('setting URLs via the command line', () => {
    const url1 = 'https://google.com.au'
    const url2 = 'https://google.co.uk'
    const nodeArgs = minimist(['--urls', `${url1},${url2}`])
    const inputInstance = new Input(nodeArgs)
    expect(inputInstance.urls[0][0]).toBe(url1)
    expect(inputInstance.urls[0][1]).toBe(url2)
  })

  test('setting multiple URL pairs via the command line', () => {
    const nodeArgs = minimist(['--urls', urlsList.join(',')])
    const inputInstance = new Input(nodeArgs)
    urlsList.forEach((url, index) => {
      const parentIndex = Math.floor(index / 2)
      const childIndex = index % 2
      expect(inputInstance.urls[parentIndex][childIndex]).toBe(url)
    })
  })

  test('setting JSON export', () => {
    const url1 = 'https://google.com.au'
    const url2 = 'https://google.co.uk'
    const nodeArgs = minimist(['--urls', `${url1},${url2}`, '--jsonExport'])
    const inputInstance = new Input(nodeArgs)
    expect(inputInstance.jsonExport).toBe(true)
  })
})
