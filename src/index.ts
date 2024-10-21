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
import shopData from './Routes/shopData.route'
import sendEmail from './Utils/sendEmail';
import couponData from './Routes/couponData.route';
import paymentData from './Routes/paymentData.route';

app.use(express.json());
app.use('/users',userData)
app.use('/bikeData',bikeData)
app.use('/shopData',shopData)
app.use('/coupon',couponData)
app.use('/payment',paymentData)



// send email 

app.post('/sendEmail', async (req: Request, res: Response): Promise<void> => {
  const mailData = req.body;
  console.log(mailData, 22);

  // Basic validation to check if required fields are provided
  if (!mailData || !mailData.to || !mailData.subject || !mailData.html) {
      res.send({ message: 'Incomplete email data provided.' });
      return;
  }

  try {
      const emailResponse = await sendEmail(mailData);
     console.log(emailResponse);
      res.send({ success: true, message: 'Email sent successfully!', });
  } catch (error) {
      console.error('Error sending email:', error); 
      
      res.send({ success: false, message: 'Error sending email.' });
  }
});


// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, RideHub is Running');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



