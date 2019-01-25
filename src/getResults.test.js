const GetResults = require('./getResults')
const errorMessages = require('./errorMessages')
const fs = require('fs')

const url = 'https://google.com.au/'

describe('I can get metrics from Lighthouse (sync tests)', () => {
    test('Shows error if no URL supplied', () => {
        try {
            const resultsInstance = new GetResults({})
            expect(true).toBe(false) // force test fail if no error thrown
        } catch (e) {
            expect(e.message).toBe(errorMessages.getResults.noURL)
        }
    })

    test('Store results in correct format', () => {
        const resultsInstance = new GetResults({
            url,
        })
        const lighthouseResults = {
            requestedUrl: url,
            categories: {
                performance: {
                    score: 0.5,
                },
            },
            audits: {
                'first-contentful-paint': { score: 1111 },
                'first-meaningful-paint': { score: 2222 },
                'first-cpu-idle': { score: 3333 },
                'total-byte-weight': { score: 999999 },
            },
        }
        resultsInstance.storeResults(lighthouseResults)
        expect(resultsInstance.results.info.url).toBe(url)
        expect(resultsInstance.results.tests.performanceScore).toBe(
            lighthouseResults.categories.performance.score
        )
        expect(resultsInstance.results.tests.firstContentfulPaint).toBe(
            lighthouseResults.audits['first-contentful-paint'].score
        )
        expect(resultsInstance.results.tests.firstMeaningfulPaint).toBe(
            lighthouseResults.audits['first-meaningful-paint'].score
        )
        expect(resultsInstance.results.tests.firstCPUIdle).toBe(
            lighthouseResults.audits['first-cpu-idle'].score
        )
        expect(resultsInstance.results.tests.totalByteWeight).toBe(
            lighthouseResults.audits['total-byte-weight'].score
        )
    })
})

describe('I can get metrics from Lighthouse (async tests)', async () => {
    let resultsInstance = null

    beforeAll(() => {
        resultsInstance = new GetResults({
            url: 'https://google.com.au',
        })
    })

    afterAll(() => {
        resultsInstance.killChromeInstance()
    })

    test('Chrome opens page', async () => {
        const chromeInstance = await resultsInstance.getChromeInstance()
        expect(chromeInstance.port).toBeDefined()
    })

    test('Lighthouse runs', async () => {
        const lightHouseInstance = await resultsInstance.getLightHouseInstance()
        expect(lightHouseInstance.lhr).toBeDefined() // lhr is JS object of results
        resultsInstance.killChromeInstance()
    }, 30000)

    test('Results are stored', () => {
        expect(resultsInstance.results).toBeDefined()
        expect(resultsInstance.results.tests).toBeDefined()
        expect(resultsInstance.results.info).toBeDefined()
    })

    xtest('Chrome returns page title', () => {
        expect(resultsInstance.results.info.pageTitle).toBe('title')
    })

    test('File is written to disk', async () => {
        const resultsFile = new Promise((resolve, reject) => {
            fs.readFile('data/results.json', 'utf8', (err, data) => {
                if (err) {
                    return reject(err)
                }
                return resolve(data)
            })
        })
        const results = JSON.parse(await resultsFile)
        expect(resultsFile).toBeDefined()
        expect(results.info.url).toBe(url)
    })
})
