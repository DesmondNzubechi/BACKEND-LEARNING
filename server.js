const { default: mongoose } = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology : true,
}).then(con => {
    console.log('Connected to the database')
}).catch(err => {
    console.log(err, "an error occured")
})

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`App running on port ${port}`)
})