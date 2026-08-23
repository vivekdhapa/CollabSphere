import Mailgen from "mailgen";
import nodemailer from "nodemailer";

//sending mails
const sendEmail=async(options)=>{
    const mailGenerator=new Mailgen({
        theme:"default",
        product:{
            name:"Task Manager",
            link:"https://taskmanagerlink.com"
        }
    })

    const emailTextual=mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml=mailGenerator.generate(options.mailgenContent)

    const transporter=nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        secure: true,
        auth:{
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASS
        }
    })

    const mail={
        from:"vivekdhapa24@gmail.com",
        to:options.email,
        subject:options.subject,
        text:emailTextual,
        html:emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email service failed silently.Make sure that you have provided your mailtrap credentials in the .env file correctly ")
        console.error("Error:",error);
    }
}


//creating the email
const emailVerificationMailgenContent=(username,verificationUrl)=>{
    return{
        body:{
            name:username,
            intro:"Welcome to our App! we are excited to have you on board.",
            action:{
                instructions:"To verify your email please click on the following button",
                button:{
                    color:"#22BC66",
                    text:"verify your email",
                    link:verificationUrl
                }, 
            },
            outro:"Need help,or have questions? Just reply to this email,we'd love to help." 

        }
    }
}

const forgotPasswordMailgenContent=(username,passwordResetUrl)=>{
    return{
        body:{
            name:username,
            intro:"We got a request to reset the password of your account.",
            action:{
                instructions:"To reset your password click on the following button or link",
                button:{
                    color:"#22BC66",
                    text:"Reset password",
                    link:passwordResetUrl
                }, 
            },
            outro:"Need help,or have questions? Just reply to this email,we'd love to help." 

        }
    }
}



export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
}