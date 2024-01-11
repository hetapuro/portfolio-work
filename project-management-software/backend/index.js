const mongoose = require('mongoose') 
const app = require('./app')
const config = require('./utils/config')

const url = process.env.MONGODB_URI

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to Mongo DB:', error.message)
    })

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`)
})