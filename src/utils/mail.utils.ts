import nodemailer from "nodemailer";
import { smtp_config } from "../config/config.js";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

const can_send_mail = (): boolean =>
  Boolean(
    smtp_config.host &&
      smtp_config.port &&
      smtp_config.user &&
      smtp_config.pass
  );

const transporter = nodemailer.createTransport({
  host: smtp_config.host,
  port: smtp_config.port,
  secure: smtp_config.port === 465,
  auth: {
    user: smtp_config.user,
    pass: smtp_config.pass,
  },
});

export const send_email = async ({
  to,
  subject,
  html,
}: SendEmailInput): Promise<void> => {
  if (!can_send_mail()) {
    return;
  }

  await transporter.sendMail({
    from: smtp_config.from || smtp_config.user,
    to,
    subject,
    html,
  });
};

export const sendEmail = async (
  email: string,
  subject: string,
  html: string
): Promise<void> => {
  await send_email({ to: email, subject, html });
};

export default sendEmail;
