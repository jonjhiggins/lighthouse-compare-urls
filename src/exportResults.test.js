const { exportJSON, exportXLSX } = require('./exportResults')
const fs = require('fs')

/* globals test, expect, describe */

describe('I can export results', async () => {
  test('Export JSON file', async () => {
    const fileName = 'results-test.json'
    const filePath = `results/${fileName}`
    await exportJSON(fileName, { test: true })
    const resultsFile = new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
    const results = JSON.parse(await resultsFile)
    expect(resultsFile).toBeDefined()
    expect(results.test).toBeTruthy()
    fs.unlink(filePath)
  })

  test('Export XLSX file', async () => {
    const fileName = 'results-test.xlsx'
    const filePath = `results/${fileName}`
    const testString = 'xlsx string'
    await exportXLSX(fileName, testString)
    const resultsFile = new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
    await resultsFile
    expect(resultsFile).toBeDefined()
    const results = await resultsFile
    expect(results).toEqual(expect.stringMatching(testString))
    fs.unlink(filePath)
  })
})
