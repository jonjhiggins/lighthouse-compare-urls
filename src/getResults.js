const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const errorMessages = require('./errorMessages')
const fs = require('fs')

module.exports = class GetResults {
    constructor({ url }) {
        if (!url) {
            throw new Error(errorMessages.getResults.noURL)
        }

        this.opts = {
            chromeFlags: ['--show-paint-rects'],
            onlyCategories: ['performance'],
            output: 'html',
        }

        this.config = null

        this.results = {}
        this.chromeInstance = null
        this.lightHouseInstance = null
        this.url = url
    }

    async initChromeInstance() {
        this.chromeInstance = await chromeLauncher.launch({
            chromeFlags: this.opts.chromeFlags,
        })
        this.opts.port = this.chromeInstance.port
        return this.chromeInstance
    }

    killChromeInstance() {
        this.chromeInstance.kill()
    }

    async getChromeInstance() {
        return this.chromeInstance || (await this.initChromeInstance())
    }

    async getLightHouseInstance() {
        return this.lightHouseInstance || (await this.initLighthouse())
    }

    async initLighthouse() {
        if (!this.chromeInstance) {
            await this.getChromeInstance()
        }

        const lighthouseResults = await lighthouse(
            this.url,
            this.opts,
            this.config
        )
        const storedResults = this.storeResults(lighthouseResults.lhr)
        await this.writeFile(storedResults)
        this.lightHouseInstance = lighthouseResults
        return lighthouseResults
    }

    storeResults(lighthouseResults) {
        this.results.tests = {
            performanceScore: lighthouseResults.categories.performance.score,
            firstContentfulPaint:
                lighthouseResults.audits['first-contentful-paint'].score,
            firstMeaningfulPaint:
                lighthouseResults.audits['first-meaningful-paint'].score,
            firstCPUIdle: lighthouseResults.audits['first-cpu-idle'].score,
            totalByteWeight:
                lighthouseResults.audits['total-byte-weight'].score,
        }
        this.results.info = {
            url: lighthouseResults.requestedUrl,
        }
        return this.results
    }

    async writeFile(results) {
        return new Promise((resolve, reject) => {
            fs.writeFile('data/results.json', JSON.stringify(results), err => {
                if (err) {
                    return reject(err)
                }
                return resolve()
            })
        })
    }
}
