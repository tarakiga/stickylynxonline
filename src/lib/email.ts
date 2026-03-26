import nodemailer from "nodemailer";

const port = parseInt(process.env.EMAIL_SERVER_PORT || "465");
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port,
  secure: port === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'Stickylynx'}" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
}
