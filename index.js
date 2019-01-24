const argv = require('minimist')(process.argv.slice(2))
const input = require('./src/input')
const getResults = require('./src/getResults')

const init = async () => {
    const inputInstance = input(argv)
    const getResultsInstance = getResults({ url: inputInstance.urls[0] })
    await getResultsInstance.getLightHouseInstance()
    process.exit()
}

init()
