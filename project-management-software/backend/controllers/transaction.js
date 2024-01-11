const transactionRouter = require('express').Router()
const conn = require('../utils/connection')
const Project = require('../models/project')
const Hourlog = require('../models/hourLog')
const Notification = require('../models/notification')
const sendTeamsNotification = require('../utils/webhook')

//all variable names have been changed for security reasons

// Report transaction.
transactionRouter.post('/report/:id', async (request, response, next) => {
    const session = await conn.startSession()
    const body = request.body
    const filter = {status: body.hourlog.prevStatus, project: request.params.id}
    const update = {status: body.hourlog.status}
    const initNotif = body.notif

    try {
        session.startTransaction()

        // 1. update member's status in the project
        const project = await Project.findById(request.params.id).lean()
        const memberUpdate = {members: updateMember(project, user.id, {status: 2})}

        const updatedProject = await Project.findByIdAndUpdate(request.params.id, memberUpdate, { new: true, session })
        
        const populateFields = [
            {path: 'var1', select: 'var2'}
        ]

        // Populate the specified fields from the referenced objects
        const populatedProject = await Project.populate(updatedProject, populateFields);

        // 2. update all project's hourlogs
        await Hourlog.updateMany(filter, update, { session })

        const notif = new Notification({
            ...initNotif,
            var1: body.var1,
            var2: initNotif.var2 || null,
            var3: new Date(),
            var4: false
        })

        // 3. create report notif
        await notif.save({session})

        await session.commitTransaction()
        session.endSession()

        sendTeamsNotification(`New report from ${user.name}`)

        //console.log('success')
        response.json(populatedProject)
    } catch (error) {
        //console.log('error', error)
        await session.abortTransaction()
        session.endSession()
        next(error)
    }
})

// Join project from invite transaction.
transactionRouter.post('/joinProject/:id1/:id2', async (request, response, next) => {
    const session = await conn.startSession()
    const body = request.body
    const member = body.member
    const notifPatch = body.updatedNotif
    const initNotif = body.notif

    try {
        session.startTransaction()

        // 1. update project's members
        const project = await Project.findById(request.params.id1).lean()
        const memberUpdate = {members: [...project.members, member]}

        const updatedProject = await Project.findByIdAndUpdate(request.params.id1, memberUpdate, { new: true, session })

        const populateFields = [
            {path: 'var1', select: 'var2'}
        ]

        // Populate the specified fields from the referenced objects
        const populatedProject = await Project.populate(updatedProject, populateFields);
        
        // 2. create notif to the project's owner
        const notif = new Notification({
            ...initNotif,
            var1: body.var1,
            var2: initNotif.var2 || null,
            var3: new Date(),
            var4: false
        })
        
        await notif.save({ session });

        // 3. update invite notif
        await Notification.findByIdAndUpdate(request.params.id2, notifPatch, { session });

        await session.commitTransaction()
        session.endSession()

        //console.log('success')
        response.json(populatedProject)
    } catch (error) {
        //console.log('error', error)
        await session.abortTransaction()
        session.endSession()
        next(error)
    }
})

//example transaction
transactionRouter.post('/example', async (request, response, next) => {
    const session = await conn.startSession()
    const body = request.body
    const patchData = body.updatedObject
    const initObject = body.object

    try {
        session.startTransaction()

        await Model.create([{ /* payload */ }], { session });

        await Model.deleteOne({ /* conditions */ }, { session });

        await Model.updateOne({ /* conditions */ }, { /* payload */ }, { session } );

        await Model.findByIdAndUpdate(_id, { /* payload */  }, { session });

        const object = new Model( /* payload */);
        await object.save({ session });

        await session.commitTransaction()
        session.endSession()

        //console.log('success')
        response.json(object)
    } catch (error) {
        //console.log('error', error)
        await session.abortTransaction()
        session.endSession()
        next(error)
    }
})

module.exports = transactionRouter