"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.EMAIL_APP_PASS,
    },
});
const sendMail = (mailData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mailRes = yield transporter.sendMail(mailData);
        console.log("Email sent successfully:", mailRes);
        return mailRes;
    }
    catch (error) {
        console.log("Error sending email:", error);
        return error;
    }
});
const sendEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const mailData = req.body;
    // Basic validation to check if required fields are provided
    if (!mailData || !mailData.to || !mailData.subject || !mailData.html) {
        res.send({ message: 'Incomplete email data provided.' });
        return;
    }
    try {
        const emailResponse = yield sendMail(mailData);
        res.send({ success: true, message: 'Email sent successfully!', });
    }
    catch (error) {
        console.error('Error sending email:', error);
        res.send({ success: false, message: 'Error sending email.' });
    }
});
exports.default = sendEmail;
//  const mailData = {
//     from: 'your-email@gmail.com',
//     to: 'receiver-email@gmail.com',
//     subject: 'Test Email',
//     html: '<h1>This is a test email</h1>',
// };
