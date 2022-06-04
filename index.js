// require("express-async-errors")
const mongoose = require('mongoose')
const winston = require('winston')

const express = require('express')
const app = express()


require('./startup/db')();
require('./startup/routes')(app)

console.log(new Date)
const port = process.env.PORT || 3000
const server = app.listen(port , () => winston.info(`Listening on port ${port} ...`))
