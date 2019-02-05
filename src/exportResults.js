const fs = require('fs')
const path = require('path')
const outputDir = 'results'
const errorMessages = require('./errorMessages')

/**
 * Write XLS string to file
 * @param {string} fileName
 * @param {string} contents
 */
const exportXLSX = (fileName, contents) => {
  return writeFile(fileName, contents, { encoding: 'binary' })
}

/**
 * Write object to a JSON file
 * @param {string} fileName
 * @param {object} contents
 */
const exportJSON = (fileName, contents) => {
  return writeFile(fileName, JSON.stringify(contents))
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

    fs.writeFile(
      path.resolve(`${outputDir}/${fileName}`),
      contents,
      options,
      err => {
        if (err) {
          return reject(err)
        }

        return resolve()
      }
    )
  })
}

module.exports = {
  exportXLSX,
  exportJSON,
  writeFile
}
