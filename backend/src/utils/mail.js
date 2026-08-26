import Mailgen from "mailgen";

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

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: { email: "vivekdhapa24@gmail.com", name: "CollabSphere" },
                to: [{ email: options.email }],
                subject: options.subject,
                htmlContent: emailHtml,
                textContent: emailTextual,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Brevo API returned ${response.status}: ${errorBody}`);
        }
    } catch (error) {
        console.error("Email service failed silently. Check BREVO_API_KEY and sender verification.")
        console.error("Error:",error);
    }
}


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