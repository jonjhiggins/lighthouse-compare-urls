const {
  exportJSON,
  exportXLSX,
  writeFile,
  getFileName
} = require('./exportResults')
const fs = require('fs')
const errorMessages = require('./errorMessages')
const path = require('path')

/* globals test, expect, describe, jest */

describe('I can export results', async () => {
  test('Format filenames', () => {
    const fileName = getFileName('https://www.google.com.au', 'xlsx')
    const date = new Date().toISOString().substring(0, 10)
    const ext = path.parse(fileName).ext
    expect(fileName).not.toEqual(expect.stringContaining('https'))
    expect(fileName).toEqual(expect.stringContaining('www.google.com.au'))
    expect(fileName).toEqual(expect.stringContaining(date))
    expect(ext).toMatch('.xlsx')
  })

  test('Export JSON file', async () => {
    const testName = 'https://www.google.com.au'
    const contents = { test: true }
    const writeFile = {}
    fs.writeFile = jest.fn((fileName, contents, options, callback) => {
      callback()
      writeFile.fileName = fileName
      writeFile.contents = contents
    })
    await exportJSON(testName, contents)
    expect(fs.writeFile).toHaveBeenCalled()
    expect(writeFile.fileName).toEqual(
      expect.stringContaining('www.google.com.au')
    )
    expect(JSON.parse(writeFile.contents)).toEqual(contents)
  })

  test('Export XLSX file', async () => {
    const testName = 'https://www.google.com.au'
    const contents = { test: true }
    const writeFile = {}
    fs.writeFile = jest.fn((fileName, contents, options, callback) => {
      callback()
      writeFile.fileName = fileName
      writeFile.contents = contents
    })
    await exportXLSX(testName, contents)
    // Mock fs.writeFile
    expect(fs.writeFile).toHaveBeenCalled()
    expect(writeFile.fileName).toEqual(
      expect.stringContaining('www.google.com.au')
    )
    const ext = path.parse(writeFile.fileName).ext
    expect(ext).toMatch('.xlsx')
    expect(writeFile.contents).toEqual(contents)
  })

  test('Failed writeFile throw error', async () => {
    try {
      await writeFile(null, '')
      expect(true).toBe(false) // force test fail if no error thrown
    } catch (e) {
      expect(e.message).toMatch(errorMessages.exportResults.missingFile)
    }

    try {
      await writeFile('//', '😀')
      expect(true).toBe(false) // force test fail if no error thrown
    } catch (e) {
      expect(e.message).toBeDefined()
    }
  })
})
