const projectsRouter = require('express').Router()
const Project = require('../models/project')
const sendTeamsNotification = require('../utils/webhook')

//all variable names have been changed for security reasons

//GET methods
projectsRouter.get('/', (request, response, next) => {
    try {
        Project.find({})
            .populate('var1', {var2: 1})
            .then(projects => {
                response.json(projects)
            })
    }
    catch (error) {
        next(error)
    }
})

projectsRouter.get('/:id', (request, response, next) => {
    try {
        Project.findById(request.params.id)
            .populate('var1', {var1: 1})
            .then(project => {
                if (project) {
                response.json(project)
                } else {
                response.status(404).end()
                }
            })
            .catch(error => next(error))
    }
    catch (error) {
        next(error)
    }
})

//Project POST
projectsRouter.post('/', async (request, response, next) => {
    try {
        const body = request.body
    
        const project = new Project({
            var1: body.var1,
            var2: body.var2,
            var3: body.var3,
            var4: body.var4,
            var5: body.var5,
            var6: body.var6,
            var7: body.var7,
            var8: new Date(),
            var9: body.var9,
        })
    
        project.save()
            .then(savedProject => {
                // Specify the fields to populate ('field1', 'field2', etc.) from the referenced objects
                const populateFields = [
                    {path: 'var1', select: 'var2'}
                ]
    
                // Populate the specified fields from the referenced objects
                return Project.populate(savedProject, populateFields);
            })
            .then(populatedProject => {
                // Return the populated object as the response
                response.status(200).json({success: true, newProject: populatedProject})
            })
            .catch(error => {
                // Handle error
                next(error)
            })

        sendTeamsNotification(`${user.name} sent new project for approval`)
    }
    catch (error) {
        next(error)
    }
})

    //PATCH method
projectsRouter.patch('/:id', async (request, response, next) => {
    try {
        const patchData = request.body
    
        Project.findByIdAndUpdate(request.params.id, patchData, { new: true })
            .then(updatedProject => {
                // Specify the fields to populate ('field1', 'field2', etc.) from the referenced objects
                const populateFields = [
                    {path: 'var1', select: 'var2'}
                ]
    
                // Populate the specified fields from the referenced objects
                return Project.populate(updatedProject, populateFields);
            })
            .then(populatedProject => {
                // Return the populated object as the response
                response.status(200).json(populatedProject);
            })
            .catch(error => {
                // Handle error
                next(error)
            })
    }
    catch (error) {
        next(error)
    }
})

//DELETE methods
projectsRouter.delete('/:id', (request, response, next) => {
    try {
        Project.findByIdAndRemove(request.params.id)
            .then(() => {
                response.status(204).end()
            })
            .catch(error => next(error))
    }
    catch (error) {
        next(error)
    }
})

module.exports = projectsRouter