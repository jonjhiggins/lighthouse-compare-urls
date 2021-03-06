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
    const filePath = path.resolve(`results/${fileName}`)
    const fsWriteFile = jest
      .spyOn(fs, 'writeFile')
      .mockImplementationOnce(() => {})
    writeFile(fileName, 'contents', () => {})
    fsWriteFile.mockRestore()
    expect(outputData).toEqual(`${chalk.green('Writing file')} to ${filePath}`)
  })

  test('On writing file the path changes in CLI mode', async () => {
    const fileName = 'file-name.ext'
    const filePath = path.resolve(`results/${fileName}`)
    const filePathCLI = path.resolve(`${fileName}`)
    const results = {}
    const fsWriteFile = jest
      .spyOn(fs, 'writeFile')
      .mockImplementation((testFilePath, contents, options, callback) => {
        results.filePath = testFilePath
        return callback()
      })
    await writeFile(fileName, 'contents', {}, false)
    expect(results.filePath).toEqual(filePath)
    await writeFile(fileName, 'contents', {}, true)
    expect(results.filePath).toEqual(filePathCLI)
    fsWriteFile.mockRestore()
  })

  test('with long filenames', () => {
    const longName =
      'https://www.google.com.au/search?source=hp&ei=L1JmXIbaApWb9QPN54_wDA&q=mixcloud+transitions+real+lies&btnK=Google+Search&oq=mixcloud+transitions+real+lies&gs_l=psy-ab.3...4015.15427..15581...2.0..0.279.5204.0j30j3....2..0....1..gws-wiz.....0..0i131j0j0i10j0i22i30j0i13i30j0i8i13i30j33i160.uKszLZFBHm0'
    const ext = '.ext'
    const fileName = getFileName(longName, ext)
    const parsedFilename = path.parse(fileName)
    expect(parsedFilename.ext).toEqual(ext)
  })
})
