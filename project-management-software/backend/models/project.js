const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

//all variable names have been changed for security reasons

const member = new mongoose.Schema({
    var1: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    var2: String,
    var3: {
        type: Number,
        required: true
    },
    var4: String,
    var5: String
})

    //Schema without members and creator for user database is not yet
const projectSchema = new mongoose.Schema({
    var1: {
        type: String,
        minLength: 2,
        maxLength: 100,
        required: true
    },
    var2: String,
    var3: [member],
    var4: {type: [String]},
    var5: {
        type: String,
        maxLength: 450,
        required: true
    },
    var6: {
        type: Number,
        required: true
    },
    var7: Date,
    var8: {
        type: Boolean,
        required: true
    }
})
    
projectSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject.__v
        delete returnedObject._id
    }
})

module.exports = mongoose.model('Project', projectSchema)