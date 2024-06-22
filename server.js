const { default: mongoose } = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const { DATABASE, PASSWORD, PORT } = process.env;

const DB = DATABASE.replace('<PASSWORD>', PASSWORD)

mongoose.connect(DB).then(con => {
    console.log('Connected to the database')
}).catch(err => {
    console.log(err, "an error occured")
})  


const port = PORT;

app.listen(port, () => {
    console.log(`App running on port ${port}`)
})