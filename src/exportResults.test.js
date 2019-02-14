const {
  exportJSON,
  exportXLSX,
  writeFile,
  getFileName
} = require('./exportResults')
const fs = require('fs')
const errorMessages = require('./errorMessages')
const path = require('path')
const chalk = require('chalk')

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
    const fsWriteFile = jest
      .spyOn(fs, 'writeFile')
      .mockImplementationOnce((fileName, contents, options, callback) => {
        callback()
        writeFile.fileName = fileName
        writeFile.contents = contents
      })
    await exportJSON(testName, contents)
    expect(fsWriteFile).toHaveBeenCalled()
    expect(writeFile.fileName).toEqual(
      expect.stringContaining('www.google.com.au')
    )
    expect(JSON.parse(writeFile.contents)).toEqual(contents)
    fsWriteFile.mockRestore()
  })

  test('Export XLSX file', async () => {
    const testName = 'https://www.google.com.au'
    const contents = { test: true }
    const writeFile = {}
    const fsWriteFile = jest
      .spyOn(fs, 'writeFile')
      .mockImplementationOnce((fileName, contents, options, callback) => {
        callback()
        writeFile.fileName = fileName
        writeFile.contents = contents
      })
    await exportXLSX(testName, contents)
    // Mock fs.writeFile
    expect(fsWriteFile).toHaveBeenCalled()
    expect(writeFile.fileName).toEqual(
      expect.stringContaining('www.google.com.au')
    )
    const ext = path.parse(writeFile.fileName).ext
    expect(ext).toMatch('.xlsx')
    expect(writeFile.contents).toEqual(contents)
    fsWriteFile.mockRestore()
  })

  test('Failed writeFile throw error', async () => {
    const fsWriteFile = jest
      .spyOn(fs, 'writeFile')
      .mockImplementationOnce(() => {})

    try {
      await writeFile(null, '')
      expect(true).toBe(false) // force test fail if no error thrown
    } catch (e) {
      expect(e.message).toMatch(errorMessages.exportResults.missingFile)
    }

    fsWriteFile.mockRestore()
  })

  test('On writing file the path is logged to console', () => {
    let outputData = ''
    const storeLog = inputs => (outputData += inputs)
    console.log = jest.fn(storeLog)
    const fileName = 'file-name.ext'
    const fsWriteFile = jest
      .spyOn(fs, 'writeFile')
      .mockImplementationOnce(() => {})
    writeFile(fileName, 'contents', () => {})
    fsWriteFile.mockRestore()
    expect(outputData).toEqual(
      `${chalk.green('Writing file')} to results/${fileName}`
    )
  })
})
