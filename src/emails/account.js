const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const myMail = process.env.MY_MAIL

const sendWelcomeEmail = (email, name) => {
    // sgMail.send({
    //     to: email,
    //     from: myMail,
    //     subject: "Thanks for joining in!",
    //     text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    // })
    console.log("Welcome email Sent!")
}

const sendCancellationEmail = (email, name) => {
    // sgMail.send({
    //     to: email,
    //     from: myMail,s
    //     subject: "Sorry to see you go!",
    //     text: `Goodbye ${name}! I am sorry to see you leave. Please do let me know if I can do anything to you.`
    // })
    console.log("Cancellation email Sent!")
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}



