import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';


const app = express();


app.use(cors({origin:"*",credentials:true}));
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ extended: true, limit:'50mb' }));
app.use(morgan('dev'));
app.use(cookieParser());


app.use('/check',(req,res)=>{
    res.send("API is working");
});

app.use('/api/v1',routes);


export default app;

