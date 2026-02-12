import { createTransport} from 'nodemailer';
import { email } from 'zod';



const sendmail = async ({email, subject, html}) => {

const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.SMTP_USER ,
        pass: process.env.SMTP_PASSWORD ,
    }
}); 

await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,
}); 


};


export default sendmail;    