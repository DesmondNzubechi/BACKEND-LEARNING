const express = require('express');
const morgan = require("morgan");
const userRouter = require('./Routes/userRouter')

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    console.log('hello from middle ware')
    next()
})



app.use('/users', userRouter)


module.exports = app;