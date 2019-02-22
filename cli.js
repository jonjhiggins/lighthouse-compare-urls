#!/usr/bin/env node

var App = require('./src/app')

var app = new App({ cliMode: true })
app.init()
