const config = require('config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const _ = require('lodash')
const { User } = require('../models/user')
const moongose = require('mongoose');
const express = require('express');
const router = express.Router()
const Joi = require('joi')

router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(400).send('invalid email or password')
    }
    const validpasss = await bcrypt.compare(req.body.password , user.password)
    if(!validpasss) { return res.status(400).send('invalid email or password')}

    const token = user.generateAuthToken()
    const result = { "token" : token}
    res.send(result)
})


function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    })

    return schema.validate(req)
}
module.exports = router