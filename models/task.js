const Joi = require('joi')
const moongose = require('mongoose')
const taskSchema = new moongose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    description: {
        type: String,
    },
    date: {
        type: Date, 
        // default: Date.now
    },
    priority:{
        type: Number,
        required : true
    },
    statuse:{
        type: String,
        enum: ['open', 'close'],
        default: 'open'
    }
})
const Task = moongose.model('Task', taskSchema)

function validateTask(task) {
    //   const schema = {
    //     name: Joi.string().min(5).max(50).required(),
    //     email: Joi.string().min(5).max(255).required().email(),
    //     password: Joi.string().min(5).max(255).required()
    //   };
    const schema = Joi.object({
        title: Joi.string().min(5).max(50).required(),
        date: Joi.date().required(),
        priority: Joi.number().required()
    })

    return schema.validate(task)
}

function validStatus(task){
    const schema = Joi.object({
        statuse : Joi.string().valid('open' , 'close').required()
    })
    return schema.validate(task)
}

module.exports.Task = Task
exports.validate = validateTask;
exports.validStatus = validStatus

