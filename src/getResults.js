const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const errorMessages = require('./errorMessages')
const fs = require('fs')

const opts = {
    chromeFlags: ['--show-paint-rects'],
    onlyCategories: ['performance'],
    output: 'html',
}

const config = null

module.exports = ({ url }) => {
    if (!url) {
        throw new Error(errorMessages.getResults.noURL)
    }

    let chromeInstance = null
    let lightHouseInstance = null
    const results = {}

    const initChromeInstance = async () => {
        chromeInstance = await chromeLauncher.launch({
            chromeFlags: opts.chromeFlags,
        })
        opts.port = chromeInstance.port
        return chromeInstance
    }

    const killChromeInstance = () => {
        chromeInstance.kill()
    }

    const getChromeInstance = async () =>
        chromeInstance || (await initChromeInstance())

    const getLightHouseInstance = async () =>
        lightHouseInstance || (await initLighthouse())

    const initLighthouse = async () => {
        if (!chromeInstance) {
            await getChromeInstance()
        }

        const lighthouseResults = await lighthouse(url, opts, config)
        const storedResults = storeResults(lighthouseResults.lhr)
        await writeFile(storedResults)
        lightHouseInstance = lighthouseResults
        return lighthouseResults
    }

    const storeResults = (lighthouseResults) => {
        results.tests = {
            performanceScore: lighthouseResults.categories.performance.score,
            firstContentfulPaint:
                lighthouseResults.audits['first-contentful-paint'].score,
            firstMeaningfulPaint:
                lighthouseResults.audits['first-meaningful-paint'].score,
            firstCPUIdle: lighthouseResults.audits['first-cpu-idle'].score,
            totalByteWeight:
                lighthouseResults.audits['total-byte-weight'].score,
        }
        results.info = {
            url: lighthouseResults.requestedUrl,
        }
        return results;
    }

    const writeFile = async (results) => {
        return new Promise((resolve, reject) => { 
            fs.writeFile('results.json', JSON.stringify(results), (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve()
            })
        })
    }

    return {
        getChromeInstance,
        getLightHouseInstance,
        killChromeInstance,
        storeResults,
        results,
    }
}
