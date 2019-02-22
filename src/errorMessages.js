const chalk = require('chalk')

module.exports = {
  app: {
    getResultsNoArray: 'getResults - urlPair must be an array'
  },
  input: {
    noURLs: `${chalk.red(
      'No URLs supplied. Please use format:'
    )} lighthouse-compare-urls --urls "https://google.com.au,https://google.co.uk"
    `
  },
  getResults: {
    noURL: chalk.red('No URL supplied to getResults')
  },
  formatResults: {
    noResults: chalk.red(
      'Two sets of results must be supplied to FormatResults'
    )
  },
  exportResults: {
    missingFile: chalk.red('Missing filename or contents')
  }
}
