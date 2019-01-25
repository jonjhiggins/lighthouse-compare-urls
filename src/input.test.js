const Input = require('./input')
const errorMessages = require('./errorMessages')
const minimist = require('minimist')

describe('I can supply URLs to be tested', () => {
    test('Handles error when no URL supplied', () => {
        try {
            const inputInstance = new Input()
            // Fail test if above expression doesn't throw anything.
            expect(true).toBe(false)
        } catch (e) {
            expect(e.message).toBe(errorMessages.input.noURLs)
        }
    })

    test('via the command line', () => {
        const url1 = 'https://google.com.au'
        const url2 = 'https://google.co.uk'
        const nodeArgs = minimist(['--urls', `${url1},${url2}`])
        const inputInstance = new Input(nodeArgs)
        expect(inputInstance.urls[0]).toBe(url1)
        expect(inputInstance.urls[1]).toBe(url2)
    })
})
