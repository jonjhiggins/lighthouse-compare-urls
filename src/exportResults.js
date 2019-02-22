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
 * @param {boolean} cliMode
 */
const exportXLSX = (testName, contents, cliMode) => {
  const fileName = getFileName(testName, 'xlsx')
  return writeFile(fileName, contents, { encoding: 'binary' }, cliMode)
}

/**
 * Write object to a JSON file
 * @param {string} testName
 * @param {object} contents
 * @param {boolean} cliMode
 */
const exportJSON = (testName, contents, cliMode) => {
  const fileName = getFileName(testName, 'json')
  return writeFile(fileName, JSON.stringify(contents), {}, cliMode)
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
const writeFile = async (fileName, contents, options, cliMode) => {
  return new Promise((resolve, reject) => {
    if (!fileName || !contents) {
      return reject(new Error(errorMessages.exportResults.missingFile))
    }

    const fileNameSafe = filenamify(fileName)
    const filePath = cliMode
      ? `${fileNameSafe}`
      : `${outputDir}/${fileNameSafe}`
    const fullPath = path.resolve(filePath)

    console.log(`${chalk.green('Writing file')} to ${fullPath}`)
    fs.writeFile(fullPath, contents, options, err => {
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
