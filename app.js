const express = require('express');
const morgan = require("morgan");
const userRouter = require('./Routes/userRouter');
const AppError = require('./Errors/appError');
const globalErrorHandler = require("./Controllers/utils/errorController");
const rateLimit = require('express-rate-limit');
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp")
const app = express();

//GLOBAL MIDDLEWARE

//set http header
app.use(helmet())

//development logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
}


const limiter = rateLimit({
    max: 1000,
    window: 60 * 60 * 1000,
    message: "Too many request from this IP. Please try again"
})
app.use("/", limiter)


//body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

//Data sanitization against NoSQL query injection
app.use(mongoSanitize())

//Data sanitization against XSS
app.use(xss())

//prevent parameter pollution
app.use(hpp({
    whitelist: [
        "duration",
        "ratingQuantity",
        "ratingsAverage",
        "maxGroupSize",
        "difficulty",
        "price"
    ]
}))

//test middleware
app.use((req, res, next) => {
    console.log('hello from middle ware')
    next() 
})



app.use('/users', userRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`can not find ${req.originalUrl} on this server`))
})

app.use(globalErrorHandler);

module.exports = app;