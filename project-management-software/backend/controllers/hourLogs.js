const hourlogRouter = require('express').Router()
const Hourlog = require('../models/hourLog')

//Number functions (I can make new schema type if required)
function minutesToStringFormat(break_time) {
    const hours = Math.floor(break_time / 60).toString().padStart(2, '0')
    const minutes = (break_time % 60).toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

function timeToStringFormat(hours, minutes) {
    hours = parseInt(hours).toString().padStart(2, '0')
    minutes = parseInt(minutes).toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

function stringToDateFormat(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return new Date(0, 0, 0, hours, minutes);
}

function totalWorkTime(start_h, start_min, end_h, end_min, break_min) {
    const startTime = parseInt(start_h * 60) + parseInt(start_min)
    const endTime = parseInt(end_h * 60) + parseInt(end_min)
    const breakTime = parseInt(break_min)
    
    const workTime = endTime - startTime - breakTime
    
    const hours = Math.floor(workTime / 60)
    const minutes = workTime % 60
    
    return `${hours}:${minutes}`
    
}

function doTimesOverlap(startTime1, endTime1, startTime2, endTime2) {
    return (startTime1 < endTime2 && endTime2 <= endTime1) || (startTime1 <= startTime2 && startTime2 < endTime1)
}

//all variable names have been changed for security reasons

//request
hourlogRouter.get('/', (request, response, next) => {
    try {
        Hourlog.find({})
        .populate('var1', {var2: 1})
        .populate('var3', {var4: 1})
        .then(hourlogs => {
            response.json(hourlogs)
        })
    }
    catch (error) {
        next(error)
    }
})
        
hourlogRouter.post('/', async (request, response, next) => {
    try {
        const body = request.body
        let isOverlapping = false
        let sameDateHourlogs = []
        
        if (body === undefined) {
            return response.status(400).json({ 
                error: 'content missing' 
            })
        }
    
        const work_date = new Date(body.work_date)
        work_date.setHours(6)
        work_date.setMinutes(0)
        work_date.setSeconds(0)
        work_date.setMilliseconds(0)
    
        //console.log(work_date)
    
        const hourlog = new Hourlog({
            var1: body.var1,
            var2: Date(),
            var3: work_date,
            var4: timeToStringFormat(body.start_h, body.start_min),
            var5: timeToStringFormat(body.end_h, body.end_min),
            var6: minutesToStringFormat(body.break_min),
            var7: totalWorkTime(body.start_h, body.start_min, body.end_h, body.end_min, body.break_min)
        })
    
        await Hourlog.find({var3: work_date, var1: body.var1})
            .then(foundHourlogs => {
                sameDateHourlogs = foundHourlogs
            })
        //console.log(sameDateHourlogs)
    
        if (sameDateHourlogs.length > 0) {
            const startTime1 = stringToDateFormat(hourlog.var4)
            const endTime1 = stringToDateFormat(hourlog.var5)
    
            for (const oldHourlog of sameDateHourlogs) {
                const startTime2 = stringToDateFormat(oldHourlog.var4)
                const endTime2 = stringToDateFormat(oldHourlog.var5)
                isOverlapping = doTimesOverlap(startTime1, endTime1, startTime2, endTime2)
                if (isOverlapping) {
                    break
                }
            }
        }
    
        if (isOverlapping) {
            //console.log('overlapping')
            const date = new Date(hourlog.work_date)
            const day = date.getDate()
            const month = date.getMonth() + 1
            const year = date.getFullYear()
            const dateToReturn = day + '.' + month + '.' + year
    
            //console.log(dateToReturn)
    
            response.status(400).json({error: `Entry on ${dateToReturn} from ${hourlog.var4} to ${hourlog.var5} is overlapping with existing entry!`})
        }
        else {
            //console.log('not overlapping')
            hourlog.save()
                .then(savedHourlog => {
                    // Specify the fields to populate ('field1', 'field2', etc.) from the referenced objects
                    const populateFields = [
                        {path: 'var1', select: 'var2'},
                        {path: 'var3', select: 'var4'}
                    ]
        
                    // Populate the specified fields from the referenced objects
                    return Hourlog.populate(savedHourlog, populateFields);
                })
                .then(populatedHourlog => {
                    // Return the populated object as the response
                    response.status(200).json(populatedHourlog);
                })
                .catch(error => {
                    // Handle error
                    next(error)
                })
        }    
    } catch (error) {
        next(error)
    }
})

hourlogRouter.patch('/:id', async (request, response, next) => {
    try {

        const body = request.body
        let isOverlapping = false
        let sameDateHourlogs = []
    
        const work_date = new Date(body.work_date)
        work_date.setHours(6)
        work_date.setMinutes(0)
        work_date.setSeconds(0)
        work_date.setMilliseconds(0)
    
        const hourlog = {
            var1: body.var1,
            var2: Date(),
            var3: work_date,
            var4: timeToStringFormat(body.start_h, body.start_min),
            var5: timeToStringFormat(body.end_h, body.end_min),
            var6: minutesToStringFormat(body.break_min),
            var7: totalWorkTime(body.start_h, body.start_min, body.end_h, body.end_min, body.break_min)
        }
    
        await Hourlog.find({var3: work_date, var1: body.var1})
            .then(foundHourlogs => {
                sameDateHourlogs = foundHourlogs
            })
        //console.log(work_date)
    
        if (sameDateHourlogs.length > 0) {
            const startTime1 = stringToDateFormat(hourlog.var4)
            const endTime1 = stringToDateFormat(hourlog.var5)
    
            for (const oldHourlog of sameDateHourlogs) {
                const startTime2 = stringToDateFormat(oldHourlog.var4)
                const endTime2 = stringToDateFormat(oldHourlog.var5)
                isOverlapping = doTimesOverlap(startTime1, endTime1, startTime2, endTime2)
                if (isOverlapping) {
                    break
                }
            }
        }
    
        if (isOverlapping) {
            //console.log('overlapping')
            const date = new Date(hourlog.work_date)
            const day = date.getDate()
            const month = date.getMonth() + 1
            const year = date.getFullYear()
            const dateToReturn = day + '.' + month + '.' + year
    
            //console.log(dateToReturn)
    
            response.status(400).json({error: `Entry on ${dateToReturn} from ${hourlog.var4} to ${hourlog.var5} is overlapping with existing entry!`})
        }
        else {
            Hourlog.findByIdAndUpdate(request.params.id, hourlog, {new: true})
                .then(updatedHourlog => {
                    const populateFields = [
                        {path: 'var1', select: 'var2'},
                        {path: 'var3', select: 'var4'}
                    ]
    
                    // Populate the specified fields from the referenced objects
                    return Hourlog.populate(updatedHourlog, populateFields);
                })
                .then(populatedHourlog => {
                    // Return the populated object as the response
                    response.status(200).json(populatedHourlog);
                })
                .catch(error => {
                    // Handle error
                    next(error)
                })
        }
    }
    catch (error) {
        next(error)
    }
})

hourlogRouter.patch('/updateMany/:id', (request, response, next) => {
    try {
        const body = request.body
        const filter = {status: body.prevStatus, project: request.params.id}
        const update = {status: body.status}
    
        Hourlog.updateMany(filter, update)
            .then(() => {
                response.send(204).end()
            })
            .catch(error => next(error))
    }
    catch (error) {
        next(error)
    }
})

hourlogRouter.delete('/:id', (request, response, next) => {
    try {
        Hourlog.findByIdAndRemove(request.params.id)
            .then(() => {
                response.status(204).end()
            })
            .catch(error => next(error))
    }
    catch (error) {
        next(error)
    }
})

module.exports = hourlogRouter