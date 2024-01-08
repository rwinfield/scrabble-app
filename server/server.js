const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');//connects to mongodb database

const dotenv = require('dotenv').config({ path: './.env.mongo' });

const app = express();
const port = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const uri = process.env.REACT_APP_ATLAS_URI;
console.log(uri);
mongoose.connect(uri, {});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const userRouter = require('./routes/users');

app.use('/users', userRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});