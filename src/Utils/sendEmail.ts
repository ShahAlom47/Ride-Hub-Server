import { Request, Response } from "express";

const nodemailer = require("nodemailer");
interface MailDataType {
    from: string;
    to: string;
    subject: string;
    html?: string; 
    text?: string; 
}

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.USER_EMAIL , 
        pass: process.env.EMAIL_APP_PASS, 
    },
});



const sendMail = async (mailData : MailDataType) => {
    try {
        const mailRes = await transporter.sendMail(mailData);
        console.log("Email sent successfully:", mailRes);
        return mailRes;
    } catch (error) {
        console.log("Error sending email:", error);
        return error;
    }
};



const sendEmail=async (req: Request, res: Response): Promise<void> => {
    const mailData = req.body;
    console.log(mailData, 22);
  
    // Basic validation to check if required fields are provided
    if (!mailData || !mailData.to || !mailData.subject || !mailData.html) {
        res.send({ message: 'Incomplete email data provided.' });
        return;
    }
  
    try {
        const emailResponse = await sendMail(mailData);
       console.log(emailResponse);
        res.send({ success: true, message: 'Email sent successfully!', });
    } catch (error) {
        console.error('Error sending email:', error); 
        
        res.send({ success: false, message: 'Error sending email.' });
    }
  }




 export default sendEmail;


//  const mailData = {
//     from: 'your-email@gmail.com',
//     to: 'receiver-email@gmail.com',
//     subject: 'Test Email',
//     html: '<h1>This is a test email</h1>',
// };