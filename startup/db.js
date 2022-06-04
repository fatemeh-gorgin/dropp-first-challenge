const mongoose = require('mongoose')
const config = require('config')
const winston = require('winston')
module.exports = function () {
    const db = config.get('db')
    // console.log("dbbbbbbbbbb" , db)
    mongoose.connect(db)

        .then(() => winston.info(`connect to mongoDB ${db} `))
        .catch(err => console.error('could not connect', err.message))
}