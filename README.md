# lighthouse-automated-tests

Compare two URLs via Google's [Lighthouse](https://github.com/GoogleChrome/lighthouse) to check for performance differences.

Useful for comparing an staging URL with changes against a current live site to see the performance impact of changes.

Results are exported as XLSX file in `results` directory.

## Install

- `npm install`

## Run

- `npm start -- --urls "[URL 1],[URL 2]"`, e.g. `npm start -- --urls "https://google.com.au,https://google.com"`

## Test

- `npm test` and `npm run test:watch`. Tests are written in [Jest](https://jestjs.io).