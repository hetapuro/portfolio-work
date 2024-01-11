const unknownEndpoint = (request, respond, next) => {
    const error = new Error('Unknown endpoint')
    error.status = 404
    next(error)
}

const errorHandler = (error, request, response, next) => {
    console.error('Error: ', error.message, error.name)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'Malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    } else if (error.name ===  'JsonWebTokenError') {
      return response.status(401).json({ error: 'Logout: Token missing or invalid' })
    } else if (error.name === 'TokenExpiredError') {
      return response.status(401).json({error: 'Logout: Token expired'})
    } 
    
    next(error)
}

module.exports = { unknownEndpoint, errorHandler }