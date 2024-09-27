import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';



const app = express();
const PORT:number = parseInt(process.env.PORT || '3000', 10)
dotenv.config();


// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));


import { connectDB, db } from './Utils/DB_Connection';
const dd= connectDB

import bikeData from './Routes/bikeData.route';
import userData from './Routes/userData.route'

app.use(express.json());
app.use('/users',userData)
app.use('/bikeData',bikeData)


// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, RideHub is Running');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
