import nodemailer from "nodemailer";

/**
 * Send Email Utility
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for others
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
    });
    await transporter.verify();
console.log("SMTP VERIFIED");

    // Send mail
    await transporter.sendMail({
      from: `"Campus Rent" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
  console.error("FULL SMTP ERROR:", error);
  throw error;
}
};
