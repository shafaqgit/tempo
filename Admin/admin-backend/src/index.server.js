const express = require('express');
const env = require ('dotenv');
const app = express();
const bodyParse = require('body-parser');
const mongoose = require('mongoose');
var multiparty = require('multiparty');

//routes
const userRoutes= require('./routes/user');
const QuesRoutes= require('./routes/question');
const topicRoutes= require('./routes/topic');
const difficultyRoutes= require('./routes/difficulty');
const categoryRoutes= require('./routes/category');
//environment variable
env.config();
//mongo connection
mongoose.connect(
    //mongodb+srv://root:<password>@cluster0.sf0pb7x.mongodb.net/?retryWrites=true&w=majority
    `mongodb+srv://ibtisam:shehifib.90@cluster0.07v8s.mongodb.net/PROJECT0?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
        //useCreateIndex: true
    }).then(() => {
      console.log('Database connected');
});
//app.use(bodyParser());
app.use(bodyParse());//json to pass data
app.use('/api', userRoutes);
app.use('/api', QuesRoutes);
app.use('/api', topicRoutes);
app.use('/api', difficultyRoutes);
app.use('/api', categoryRoutes);


app.listen(process.env.PORT, () => {
    
    console.log(`Server is running on port ${process.env.PORT}`);
});