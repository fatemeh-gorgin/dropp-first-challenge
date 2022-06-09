const { User } = require('../../models/user')
const { Task } = require('../../models/task')
const request = require('supertest')
describe('auth middleware', () => {
    beforeEach(() => { server = require('../../index'); })
    afterEach(async () => {
        await Task.deleteMany({})
        server.close();
    });

    let token;

    const exec = () => {
        return request(server)
            .post('/api/task')
            .set('x-auth-token', token)
            .send({ title: 'task1' , priority : 1 , date : "2022-08-10T20:59:35.269Z" });
    }

    beforeEach(() => {
        token = new User({isAdmin : true}).generateAuthToken();
    });
    it('should return 401 if no token is provided', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
    });

    it('should return 400 if token is invalid', async () => {
        token = 'a';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 200 if token is valid', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    });
});
    