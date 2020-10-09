const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

const CLIENT_WEB_URL =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : process.env.CLIENT_URL;

mongoose
    .connect(process.env.DATABASE_URI, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.log('MongoDB connection error: ', err));

const authRoutes = require('./routes/auth');
const authSocialRoutes = require('./routes/authSocial');
const userRoutes = require('./routes/user');

app.use(morgan('dev'));
app.use(bodyParser.json());

if ((process.env.NODE_ENV = 'development')) {
    app.use(cors({ origin: CLIENT_WEB_URL }));
}

app.use('/api', authRoutes);
app.use('/api', authSocialRoutes);
app.use('/api', userRoutes);

const port = process.env.PORT || 8888;

app.listen(port, () => {
    console.log(`Server API is running on port ${port}`);
});
