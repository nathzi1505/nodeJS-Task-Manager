const express = require('express')
const User = require('../models/user')
const Task = require('../models/task')

const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task ({
            ...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(201).send(task)
    } catch( error){
        res.status(400).send(error)
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt_asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    if (req.query.completed)
        match.completed = req.query.completed.toLowerCase() === 'true'
    
    const sort = {}
    if (req.query.sortBy)
    {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error){
        res.status(500).send(error)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id})
        if (!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch(error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if (!isValidOperation)
        return res.status(400).send({ error: "Invalid update"})

    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id})
        if (!task){
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)        
    }catch (error){
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if (!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch (error){
        res.status(500).send(error)
    }
})

module.exports = router