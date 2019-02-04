const chalk = require('chalk')

module.exports = {
  input: {
    noURLs: chalk.red(
      'No URLs supplied. Please use format: npm start -- --urls "https://google.com.au,https://google.co.uk"'
    )
  },
  getResults: {
    noURL: chalk.red('No URL supplied to getResults')
  },
  formatResults: {
    noResults: chalk.red(
      'Two sets of results must be supplied to FormatResults'
    )
  }
}
