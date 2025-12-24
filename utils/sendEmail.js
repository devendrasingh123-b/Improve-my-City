const { Resend } = require("resend");
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
