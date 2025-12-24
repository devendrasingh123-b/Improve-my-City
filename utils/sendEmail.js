// const { Resend } = require("resend");
const {Resend}=require("resend")
require('dotenv').config()


const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: "Authority <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Resend Email Error:", error);
    throw error;
  }
};

module.exports = sendEmail;



// import { Resend } from 'resend';

// const resend = new Resend('re_QcKxHtV4_5nwUH2X2smPPUddgF8CGKsCt');

// resend.emails.send({
//   from: 'onboarding@resend.dev',
//   to: 'devendrasingh20025@gmail.com',
//   subject: 'Hello World',
//   html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
// });
