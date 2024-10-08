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



const sendEmail = async (mailData : MailDataType) => {
    try {
        const mailRes = await transporter.sendMail(mailData);
        console.log("Email sent successfully:", mailRes);
        return mailRes;
    } catch (error) {
        console.log("Error sending email:", error);
        return error;
    }
};

 export default sendEmail;


//  const mailData = {
//     from: 'your-email@gmail.com',
//     to: 'receiver-email@gmail.com',
//     subject: 'Test Email',
//     html: '<h1>This is a test email</h1>',
// };