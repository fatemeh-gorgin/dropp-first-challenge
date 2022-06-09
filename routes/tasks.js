const validateObjectID = require('../middleware/validateObjectId')
const { Task, validate , validStatus } = require('../models/task')
const moongose = require('mongoose');
const express = require('express');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin');
const { date } = require('joi');

// const { default: mongoose } = require('mongoose');
const router = express.Router()

router.get('/ascDate', [auth, admin], async (req, res) => {
    const tasks = await Task.find()
        .sort('date')
    res.status(200).send(tasks)
})

router.get('/descDate', [auth, admin], async (req, res) => {
    const tasks = await Task.find()
        .sort({ date: -1 })
    res.status(200).send(tasks)
})

router.get('/ascPriority', [auth, admin], async (req, res) => {
    const tasks = await Task.find()
        .sort({ priority: 1 })
    res.status(200).send(tasks)
})

router.get('/descPriority', [auth, admin], async (req, res) => {
    const tasks = await Task.find()
        .sort({ priority: -1 })
    res.status(200).send(tasks)
})

router.post('/', [auth, admin], async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let task = await Task.findOne({
        title: req.body.title,
        date: req.body.date,
        priority: req.body.priority
    })
    if (task) {
        return res.status(400).send('task is Repetitious')
    }
    let newTask = new Task({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        priority: req.body.priority
    })
    newTask = await newTask.save()
    res.status(200).send(newTask)
})

router.put('/changeStatuse/:id',validateObjectID, [auth, admin], async (req, res) => {
    const { error } = validStatus(req.body)
    if (error) return res.status(400).send(error.details[0].message)
    let task = await Task.findByIdAndUpdate(req.params.id,
        {
            statuse: req.body.statuse
        }, { new: true })
    if (!task) return res.status(404).send('This task not found!');
    let newTask = await task.save()
    res.status(200).send(newTask)
})

router.get('/filter', [auth, admin], async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let task = await Task.find({
        title: req.body.title,
        date:{ $eq : req.body.date} ,
        priority: req.body.priority
    })

    if(task.length == 0){
        return res.status(404).send('task not found!')
    }
    res.status(200).send(task)
})
module.exports = router;