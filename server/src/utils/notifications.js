import nodemailer from "nodemailer";
import Notification from "../models/Notification.js";

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function notifyUser({ user, title, message, link = "" }) {
  const notification = await Notification.create({
    user: user._id || user,
    title,
    message,
    link
  });

  const transporter = createTransporter();
  if (transporter && user.email) {
    await transporter.sendMail({
      to: user.email,
      from: process.env.MAIL_FROM,
      subject: title,
      text: message
    });
  }

  return notification;
}
