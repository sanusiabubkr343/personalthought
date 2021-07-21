// Todo configure server
// Install packages 
//import routes
// MongoDb Schema
//Update Routes
//Test Sign Up and Login
// Test consoles 
// Upload a with mongo and Heroku
const express  = require('express');
const  http = require("http"); 
const  logger = require("morgan"); 
const mongoose = require('mongoose');
const cors = require('cors');

const dotenv = require("dotenv");
dotenv.config(); 


const thoughtRoutes =  require('./Routes/Thought');
const  userRoutes = require ('./Routes/User');


//middlewears


const app =  express();
app.use(logger("dev"));
mongoose.connect('mongodb+srv://anova_96:'+process.env.MONGO_ATLAS_PW +'@cluster0.ol9y1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true ,  useUnifiedTopology: true ,useCreateIndex : true
}).then(() => {
    console.log('connected to db')
}).catch(err => {
    console.log('couldnt connect to db', err)
})



app.use(cors())

// make upload folder publicly available
app.use('/uploads',express.static('uploads'));


// for body parsers
app.use(express.json());
app.use(express.urlencoded({extended: false}));



//Handling routes
app.use('/thought',thoughtRoutes);
app.use('/user',userRoutes);

app.use('*',function(request,response)
{
    response.status(200).json({message:"API is working , but routes not defined"});
});




//serverListener
http.createServer(app).listen(3000);
