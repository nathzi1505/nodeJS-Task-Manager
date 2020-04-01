const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const {userOneId, userOne, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: "Pritthijit Nath",
        email: "nath@example.com",
        password: "nath12345"
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assert that the response contains user details
    expect(response.body).toMatchObject({
        user: {
            name: "Pritthijit Nath",
            email: "nath@example.com",
        },
        token: user.tokens[0].token
    })

    // Assert that the plain text password was not saved
    expect(user.password).not.toBe('nath12345')

})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)

    // Assert that the token was saved in the databases
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non existent user', async () => {
    await request(app).post('/users/login').send({
        email: "Andrew Meid",
        password: "andrew12345"
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete profile for user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)

    // Assert whether user has been deleted or not
    expect(user).toBeNull()
})

test('Should not delete profile for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app) 
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    
    const user = await User.findById(userOneId)

    // Assert whether avatar was included
    expect(user.avatar).toEqual(expect.any(Buffer))    
})

test('Should update valid user fields', async () => {
    const response = await request(app) 
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "Jess"
        })
        .expect(200)
    
    const user = await User.findById(userOneId)

    // Assert whether the name was updated
    expect(user.name).toBe("Jess")    
})

test('Should not update invalid user fields', async () => {
    await request(app) 
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "Philadelphia"
        })
        .expect(400)
})

