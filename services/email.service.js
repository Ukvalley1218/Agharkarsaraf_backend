import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {

  console.log(process.env.EMAIL_USER);
  console.log(process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Gold App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP",
    html: `<h3>OTP: <b>${otp}</b></h3><p>Valid for 5 minutes</p>`,
  });
};