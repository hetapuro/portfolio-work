
const express = require('express')
const cors = require('cors')
const path = require('path')
const middleware = require('./utils/middleware')
const app = express()

const projectsRouter = require('./controllers/projects')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

app.use('', projectsRouter)

app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, './build/index.html'))
}) 

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app