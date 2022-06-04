const express = require('express')
const error = require('../middleware/error')
const auth = require('../routes/auth')
const task = require('../routes/tasks')
module.exports = function (app) {
    app.use(express.json())
    app.use('/api/auth', auth)
    app.use('/api/task' , task)
    app.use(error)

}