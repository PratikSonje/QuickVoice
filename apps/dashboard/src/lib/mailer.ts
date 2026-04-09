// import { ResetPasswordEmail } from "@/emails/resetPasswordEmail";
// import { VerificationEmail } from "@/emails/verificationEmail";
// import { transporter } from "@/src/config/nodemailer";
// import { render } from "@react-email/components";
export async function sendEmail(type: "verifyEmail" | "resetPassword", email: string, url: string, fullName: string) {
  // if (type === "verifyEmail") {
  //   await transporter.sendMail({
  //     from: process.env.EMAIL_USER,
  //     to: email,
  //     subject: "Verify your email",
  //     html: await render(VerificationEmail({ url, fullName })),
  //   });
  // } else if (type === "resetPassword") {
  //   await transporter.sendMail({
  //     from: process.env.EMAIL_USER,
  //     to: email,
  //     subject: "Reset your password",
  //     html: await render(ResetPasswordEmail({ url, fullName })),
  //   });
  // }
  
}