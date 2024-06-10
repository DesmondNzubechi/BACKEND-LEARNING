const express = require('express');
const morgan = require("morgan");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    console.log('hello from middle ware')
    next()
})


const port = 3000;

app.post('/app/v1/realtor', (req, res) => {

    res.send()
})

app.get('/app/v1/realtor/:id', (req, res) => {
    res.status(200).json({
        status: "success",
        result: {},
        data: {
            
        }
    })
})

app.listen(port, () => {
    console.log(`App running on port ${port}`)
})