const { Task } = require('../../models/task');
const { User } = require('../../models/user');
const mongoose = require('mongoose')
const request = require('supertest');
const { result } = require('lodash');
let server;
describe('/api/task', () => {
    beforeEach(async () => {
        server = require('../../index');
        token = new User({ isAdmin: true }).generateAuthToken();

        await Task.collection.insertMany([
            { title: 'task1', priority: 1, date: "2022-08-10T20:59:35.269Z" },
            { title: 'task2', priority: 2, date: "2022-08-09T20:59:35.269Z" }
        ])
    })
    afterEach(async () => {
        server.close();
        await Task.deleteMany({})
    })
    describe('GET /', () => {
        it('should return all tasks sort with ascDate ', async () => {

            const result = await request(server)
                .get('/api/task/ascDate')
                .set('x-auth-token', token)

            expect(result.status).toBe(200)
            expect(result.body.length).toBe(2)
            expect(result.body[0].title).toBe('task2')
            expect(result.body[1].title).toBe('task1')

        })

        it('should return all tasks sort with descDate ', async () => {

            const result = await request(server)
                .get('/api/task/descDate')
                .set('x-auth-token', token)

            expect(result.status).toBe(200)
            expect(result.body.length).toBe(2)
            expect(result.body[1].title).toBe('task2')
            expect(result.body[0].title).toBe('task1')

        })

        it('should return all tasks sort with ascPriority ', async () => {

            const result = await request(server)
                .get('/api/task/ascPriority')
                .set('x-auth-token', token)

            expect(result.status).toBe(200)
            expect(result.body.length).toBe(2)
            expect(result.body[0].title).toBe('task1')
            expect(result.body[1].title).toBe('task2')

        })

        it('should return all tasks sort with descPriority ', async () => {

            const result = await request(server)
                .get('/api/task/descPriority')
                .set('x-auth-token', token)

            expect(result.status).toBe(200)
            expect(result.body.length).toBe(2)
            expect(result.body[0].title).toBe('task2')
            expect(result.body[1].title).toBe('task1')

        })

        it('should return task with our filter', async () => {
            const task = new Task({ title: 'task1', priority: 1, date: "2022-08-10T20:59:35.269Z" })
            await task.save()

            const result = await request(server)
            .get('/api/task/filter')
            .set('x-auth-token', token)
            .send({ title: 'task1' , priority: 1 , date: "2022-08-10T20:59:35.269Z"})
            expect(result.status).toBe(200)
            expect(result.body.length).not.toBe(0)
        })

        it('should return 404 if task not found', async () => {
            const task = new Task({ title: 'task1', priority: 1, date: "2022-08-10T20:59:35.269Z" })
            await task.save()

            const result = await request(server)
            .get('/api/task/filter')
            .set('x-auth-token', token)
            .send({ title: 'task123' , priority: 1 , date: "2022-08-10T20:59:35.269Z"})

            expect(result.status).toBe(404)
        })
        
    })

    describe('POST /', () => {
        let token = new User({ isAdmin: true }).generateAuthToken();;
        let title;
        const exec = async () => {
            return await request(server)
                .post('/api/task')
                .set('x-auth-token', token)
                .send({ title: title, priority: 1, date: "2022-08-10T20:59:35.269Z" });
        }
        beforeEach(async () => {
            token = new User({ isAdmin: true }).generateAuthToken();
            title = 'task2';

        })
        it('should return 401 if client is not logged in', async () => {
            token = ''
            const result = await exec()
            expect(result.status).toBe(401)
        })
        it('should return 400 if task title is less than 5 char', async () => {
            title = '1234'
            const result = await exec()

            expect(result.status).toBe(400)
        })

        it('should return 400 if task title is more than 50 char', async () => {

            title = new Array(52).join('a')
            const result = await exec()

            expect(result.status).toBe(400)
        })

        it('should return 400 if task is Repetitious', async () => {
            await exec()
            const result = await exec()

            expect(result.status).toBe(400)
        })

        it('should save task if it is valid', async () => {

            await exec()

            const task = await Task.find({ title: title, priority: 1, date: "2022-08-10T20:59:35.269Z" })

            expect(task).not.toBeNull()
        })

        it('should return task if it is valid', async () => {


            const result = await exec()

            expect(result.body).toHaveProperty('_id')
            expect(result.body).toHaveProperty('title', 'task2')
        })
    })

    describe('PUT /chaneStatuse/:id', () => {
        it('should return a task and change its status if id is valid', async () => {
            const task = new Task({ title: 'task1', priority: 1, date: "2022-08-10T20:59:35.269Z" })
            await task.save()

            const result = await request(server)
                .put('/api/task/changeStatuse/' + task._id)
                .set('x-auth-token', token)
                .send({ statuse: 'open' })
            expect(result.status).toBe(200);
            expect(result.body).toHaveProperty('title', task.title)
            expect(result.body).toHaveProperty('statuse', 'open')
        })

        it('should return 404 if id is invalid', async () => {

            const result = await request(server)
                .put('/api/task/changeStatuse/1')
                .set('x-auth-token', token)
                .send({ statuse: 'open' })

            expect(result.status).toBe(404);
        })
        it('should return 404 if no genre with the given id exist ', async () => {
            const id = new mongoose.Types.ObjectId()
            const result = await request(server)
                .put('/api/task/changeStatuse/' + id)
                .set('x-auth-token', token)
                .send({ statuse: 'open' })

            expect(result.status).toBe(404);
        })

        it('should return 400 statuse is invalid', async () => {
            const task = new Task({ title: 'task1', priority: 1, date: "2022-08-10T20:59:35.269Z" })
            await task.save()

            const result = await request(server)
                .put('/api/task/changeStatuse/' + task._id)
                .set('x-auth-token', token)
                .send({ statuse: 'o' })

            expect(result.status).toBe(400);
        })
    })

})