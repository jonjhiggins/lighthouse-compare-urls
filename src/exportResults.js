const fs = require('fs')
const path = require('path')
const filenamify = require('filenamify')
const errorMessages = require('./errorMessages')
const chalk = require('chalk')

const outputDir = 'results'
/**
 * Write XLS string to file
 * @param {string} testName
 * @param {string} contents
 */
const exportXLSX = (testName, contents) => {
  const fileName = getFileName(testName, 'xlsx')
  return writeFile(fileName, contents, { encoding: 'binary' })
}

/**
 * Write object to a JSON file
 * @param {string} testName
 * @param {object} contents
 */
const exportJSON = (testName, contents) => {
  const fileName = getFileName(testName, 'json')
  return writeFile(fileName, JSON.stringify(contents))
}

/**
 * Create a unique filename based on test name
 * and current date
 * @param {string} testName
 * @param {string} ext file extension (without dot)
 * @returns {string}
 */
const getFileName = (testName, ext) => {
  const url = testName.replace(/(http)(|s)(:\/\/)/g, '')
  const date = new Date().toISOString()
  const filename = filenamify(`${url}-${date}`)
  return `${filename}.${ext}`
}

/**
 * Write results to a file
 * @param {string} fileName
 * @param {string} contents
 * @param {object} options writeFile options obj
 */
const writeFile = async (fileName, contents, options) => {
  return new Promise((resolve, reject) => {
    if (!fileName || !contents) {
      return reject(new Error(errorMessages.exportResults.missingFile))
    }

    const fileNameSafe = filenamify(fileName)
    const fullPath = `${outputDir}/${fileNameSafe}`

    console.log(`${chalk.green('Writing file')} to ${fullPath}`)
    fs.writeFile(path.resolve(fullPath), contents, options, err => {
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  })
}

module.exports = {
  exportXLSX,
  exportJSON,
  writeFile,
  getFileName
}
