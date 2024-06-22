// const nodemailer = require("nodemailer");

// exports.sendEmail = async (options) => {
//     //1) Create a transporter

//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }

//         //Activate in gmail "less secure app" option
//     })


//     //2) Define the email option
//     const mailOptions = {
//         from: "Desmond Nzubechukwu",
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//         //*html :
//     }

//     //3) Send the email

//     await transporter.sendMail(mailOptions)
// }

//NODE MAILER

const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    try {

        const {EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD} = process.env
        // 1) Create a transporter
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: EMAIL_PORT,
            auth: {
                user: EMAIL_USERNAME,
                pass: EMAIL_PASSWORD
            }
        });

        // 2) Define the email options
        const {email, subject, message} = options
        const mailOptions = {
            from: "Desmond Nzubechukwu ", 
            to:  email,
            subject:  subject,
            text:  message
        };

        // 3) Send the email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', email);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
};

module.exports = sendEmail;
