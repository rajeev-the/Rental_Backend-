import dotenv from 'dotenv';
dotenv.config();
import app from './app.js'
import connectDB from './config/db.js';
import redis from './config/redis.js'

const PORT = process.env.PORT || 3000;

connectDB();


app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})

