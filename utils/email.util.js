// import nodemailer from "nodemailer";

// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     console.log("EMAIL CONFIG:", {
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       secure: process.env.EMAIL_SECURE,
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS ? "SET" : "NOT SET",
//     });

//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: Number(process.env.EMAIL_PORT), // IMPORTANT
//       secure: process.env.EMAIL_SECURE === "true",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//       connectionTimeout: 30000,
//       greetingTimeout: 30000,
//       socketTimeout: 30000,
//       logger: true,
//       debug: true,
//     });

//     console.log("Verifying SMTP connection...");
//     await transporter.verify();
//     console.log("✅ SMTP VERIFIED");

//     const info = await transporter.sendMail({
//       from: `"Campus Rent" <${process.env.EMAIL_FROM}>`,
//       to,
//       subject,
//       html,
//     });

//     console.log("✅ Email sent:", info.messageId);

//     return info;
//   } catch (error) {
//     console.error("❌ FULL SMTP ERROR:", error);
//     throw error;
//   }
// };


import axios from "axios";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("Sending email via Brevo API...");

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Campus Rent",
          email: process.env.EMAIL_FROM,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.EMAIL_PASS,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "❌ Brevo Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};