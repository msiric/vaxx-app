import createError from "http-errors";
import nodemailer from "nodemailer";
import { mailer } from "../config/secret.js";

export const sendEmail = async ({
  emailSender = mailer.sender,
  emailReceiver,
  emailSubject,
  emailContent,
}) => {
  try {
    const smtpTransport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      auth: {
        user: mailer.email,
        pass: mailer.password,
      },
    });
    const mailOptions = {
      from: emailSender,
      to: emailReceiver,
      subject: emailSubject,
      html: emailContent,
    };
    await smtpTransport.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
    throw createError(400, "Email failed to send");
  }
};
