import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';



const app = express();
const PORT:number = parseInt(process.env.PORT || '4000', 10)
dotenv.config();


// Middleware
app.use(cors({
  origin: ['http://localhost:5173',"https://ride-hub-ts.vercel.app"] ,
  credentials: true
}));




import { connectDB, db } from './Utils/DB_Connection';
const dd= connectDB

import bikeData from './Routes/bikeData.route';
import userData from './Routes/userData.route'
import shopData from './Routes/shopData.route'
import sendEmail from './Utils/sendEmail';
import couponData from './Routes/couponData.route';
import paymentData from './Routes/paymentData.route';
import userContact from './Routes/userContact'
import { upload, uploadImage } from './Utils/photoUpload';

app.use(express.json());
app.use('/users',userData)
app.use('/bikeData',bikeData)
app.use('/shopData',shopData)
app.use('/coupon',couponData)
app.use('/payment',paymentData)
app.use('/userContact',userContact)


app.post('/sendEmail', sendEmail )
app.post("/upload", upload.single("file"), uploadImage);




// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, RideHub is Running');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



