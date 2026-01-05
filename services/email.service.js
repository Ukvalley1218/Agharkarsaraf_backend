import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Gold App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP",
    html: `<h3>OTP: <b>${otp}</b></h3><p>Valid for 5 minutes</p>`
  });
};
