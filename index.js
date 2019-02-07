const argv = require('minimist')(process.argv.slice(2))
const Input = require('./src/input')
const GetResults = require('./src/getResults')
const FormatResults = require('./src/formatResults')
const { exportXLSX, exportJSON } = require('./src/exportResults')

const handleError = error => {
  console.log(error)
  process.exit()
}

const init = async () => {
  // Get URLs from the CLI arguments
  const inputInstance = new Input(argv)
  const { urls, jsonExport } = inputInstance
  // Get Lighthouse results for each URL
  const results = []
  for (let url of urls) {
    const getResultsInstance = new GetResults({ url })
    const lighthouseInstances = await getResultsInstance.getLightHouseInstances()
    results.push(getResultsInstance.getAverageResults())
    if (jsonExport) {
      await exportJSON(`${url}.json`, lighthouseInstances)
    }
  }
  // Format results into CLI table + XLSX string
  const formatResultsInstance = new FormatResults(results)
  console.log(formatResultsInstance.getCLITable())
  const excelString = formatResultsInstance.getExcelBuffer()
  // Export files
  await exportXLSX('test.xlsx', excelString)
  process.exit()
}

init().catch(handleError)
