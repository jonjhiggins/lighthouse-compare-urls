const chalk = require('chalk')

module.exports = {
    input: {
        noURLs: chalk.red(
            'No URLs supplied. Please use format: npm start -- --urls "https://google.com.au,https://google.co.uk"'
        ),
    },
    getResults: {
        noURL: chalk.red('No URL supplied to getResults'),
    },
}
