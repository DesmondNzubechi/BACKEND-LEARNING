const AppError = require("../../Errors/appError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate value ${value} please input another value`;
    return new AppError(message, 400)
}

const handleValidationError = err => {
    const erros = Object.values(err.error).map(el => el.message);
    const message = `Invalid data input ${erros}`
    return new AppError(message, 400)
}

const sendDevError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
}

const sendProdError = (err, res) => {
    if (err.isOperational) {
        //if the error is operation then display it to the client
        res.status(err.statusCode).json({
            status: err.status,
            message : err.message
        })
    } else {
        //if the error is operational then hide it from client

        res.status(500).json({
            status: 'fail',
            message : "Something went wrong"
        })
    }
}


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 404;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendDevError(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err }
        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === "ValidationError") error = handleValidationError(error) 
    }
}