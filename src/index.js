import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import userRoutes from './routes/users.js'
import cors from 'cors'
import redis from 'redis'


const app = express()
app.use(morgan('dev'));

const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/user');
mongoose.connection.once('open',function(){
  console.log('DB connected');
}).on('error',function(error){
  console.log('error is:',error)
})

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());


app.use(function (req,res,next){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers','X-Requested-with,content-type');
    res.setHeader('Access-Control-Allow-Credentials',true);

    next();
})


app.use('/user', userRoutes)


app.use((req, res, next) => {
    const error =new Error("not found");
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});





app.listen(port, () =>{
    console.log(`Server running on ${port}`)
})




