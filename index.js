const argv = require('minimist')(process.argv.slice(2))
const Input = require('./src/input')
const GetResults = require('./src/getResults')

const init = async () => {
    const inputInstance = new Input(argv)
    const getResultsInstance = new GetResults({ url: inputInstance.urls[0] })
    await getResultsInstance.getLightHouseInstance()
    process.exit()
}

init()
