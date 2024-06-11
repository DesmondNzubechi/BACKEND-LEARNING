const express = require('express');
const morgan = require("morgan");
const userRouter = require('./Routes/userRouter')
const AppError = require('./Errors/appError')
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    console.log('hello from middle ware')
    next()
})



app.use('/users', userRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`can not find ${req.originalUrl} on this server`))
})
module.exports = app;