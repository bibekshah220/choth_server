interface OtpHtmlInput {
  email: string;
  otp: string;
}

interface VerifyEmailHtmlInput {
  email: string;
  token: string;
}

const escape_html = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const getOtpHtml = ({ email, otp }: OtpHtmlInput): string => {
  const safe_email = escape_html(email);
  const safe_otp = escape_html(otp);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>Authentication App Verification Code</title>
<style>
html, body {
margin: 0;
padding: 0;
}
body {
background: #f6f7fb;
color: #111;
-webkit-text-size-adjust: 100%;
-ms-text-size-adjust: 100%;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol', sans-serif;
}
table {
border-collapse: collapse;
}
img {
border: 0;
line-height: 100%;
outline: none;
text-decoration: none;
display: block;
max-width: 100%;
height: auto;
}
.wrapper {
width: 100%;
background: #f6f7fb;
}
.outer {
width: 100%;
}
.container {
width: 600px;
max-width: 600px;
background: #ffffff;
border-radius: 12px;
overflow: hidden;
border: 1px solid #e9ecf3;
}
.p-24 {
padding: 24px;
}
.p-32 {
padding: 32px;
}
.header {
background: #111827;
padding: 18px 24px;
text-align: center;
}
.brand {
display: inline-block;
color: #ffffff;
font-weight: 700;
font-size: 16px;
letter-spacing: 0.3px;
text-decoration: none;
}
.title {
margin: 0 0 12px 0;
font-size: 22px;
line-height: 1.3;
color: #111;
font-weight: 700;
}
.text {
margin: 0 0 16px 0;
font-size: 15px;
line-height: 1.6;
color: #444;
}
.muted {
color: #555;
font-size: 14px;
line-height: 1.6;
margin: 0 0 12px 0;
}
.otp-wrap {
margin: 20px 0;
width: 100%;
}
.otp {
display: inline-block;
background: #f3f4f6;
border: 1px solid #e5e7eb;
border-radius: 10px;
padding: 14px 18px;
font-size: 32px;
letter-spacing: 10px;
font-weight: 700;
color: #111;
font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
.btn {
display: inline-block;
background: #111827;
color: #ffffff !important;
text-decoration: none;
padding: 12px 18px;
border-radius: 8px;
font-weight: 600;
font-size: 14px;
}
.footer {
text-align: center;
color: #6b7280;
font-size: 12px;
line-height: 1.6;
padding: 16px 24px 0 24px;
}
@media only screen and (max-width: 600px) {
.container {
width: 100% !important;
}
.p-32 {
padding: 24px !important;
}
.otp {
font-size: 28px !important;
letter-spacing: 6px !important;
}
}
</style>
</head>
<body>
<table role="presentation" class="wrapper" width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td align="center" class="p-24">
<table role="presentation" class="container" border="0" cellspacing="0" cellpadding="0">
<tr>
<td class="header">
<span class="brand">Authentication App</span>
</td>
</tr>
<tr>
<td class="p-32">
<h1 class="title">Verify your email - ${safe_email}</h1>
<p class="text">
Use the verification code below to complete your sign-in to Authentication App.
</p>
<table role="presentation" class="otp-wrap" border="0" cellspacing="0" cellpadding="0">
<tr>
<td align="center">
<div class="otp">${safe_otp}</div>
</td>
</tr>
</table>
<p class="muted">This code will expire in <strong>5 minutes</strong>.</p>
<p class="muted">If this was not initiated, this email can be safely ignored.</p>
</td>
</tr>
<tr>
<td class="footer">
&copy; 2025 Authentication App. All rights reserved.
</td>
</tr>
<tr>
<td height="16" aria-hidden="true"></td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
};

export const getVerifyEmailHtml = ({
  email,
  token,
}: VerifyEmailHtmlInput): string => {
  const app_name = process.env.APP_NAME || "Authentication App";
  const base_url = process.env.FRONTEND_URL || "http://localhost:5173";
  const verify_url = `${base_url.replace(/\/+$/, "")}/token/${encodeURIComponent(token)}`;

  const safe_app_name = escape_html(app_name);
  const safe_email = escape_html(email);
  const safe_verify_url = escape_html(verify_url);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>${safe_app_name} Verify Your Account</title>
<style>
html, body { margin: 0; padding: 0; }
body {
background: #f6f7fb;
color: #111;
-webkit-text-size-adjust: 100%;
-ms-text-size-adjust: 100%;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol', sans-serif;
}
table { border-collapse: collapse; }
img {
border: 0;
line-height: 100%;
outline: none;
text-decoration: none;
display: block;
max-width: 100%;
height: auto;
}
.wrapper { width: 100%; background: #f6f7fb; }
.container {
width: 600px;
max-width: 600px;
background: #ffffff;
border-radius: 12px;
overflow: hidden;
border: 1px solid #e9ecf3;
}
.p-24 { padding: 24px; }
.p-32 { padding: 32px; }
.header {
background: #111827;
padding: 18px 24px;
text-align: center;
}
.brand {
display: inline-block;
color: #ffffff;
font-weight: 700;
font-size: 16px;
letter-spacing: 0.3px;
text-decoration: none;
}
.title {
margin: 0 0 12px 0;
font-size: 22px;
line-height: 1.3;
color: #111;
font-weight: 700;
}
.text {
margin: 0 16px 16px 0;
font-size: 15px;
line-height: 1.6;
color: #444;
}
.muted {
color: #555;
font-size: 14px;
line-height: 1.6;
margin: 0 0 12px 0;
}
.btn {
display: inline-block;
background: #111827;
color: #ffffff !important;
text-decoration: none;
padding: 12px 18px;
border-radius: 8px;
font-weight: 600;
font-size: 14px;
}
.footer {
text-align: center;
color: #6b7280;
font-size: 12px;
line-height: 1.6;
padding: 16px 24px 0 24px;
}
.link {
color: #111827;
text-decoration: underline;
word-break: break-all;
}
@media only screen and (max-width: 600px) {
.container { width: 100% !important; }
.p-32 { padding: 24px !important; }
}
</style>
</head>
<body>
<table role="presentation" class="wrapper" width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td align="center" class="p-24">
<table role="presentation" class="container" border="0" cellspacing="0" cellpadding="0">
<tr>
<td class="header">
<span class="brand">${safe_app_name}</span>
</td>
</tr>
<tr>
<td class="p-32">
<h1 class="title">Verify your account - ${safe_email}</h1>
<p class="text">
Thanks for registering with ${safe_app_name}. Click the button below to verify your account.
</p>
<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 16px 0 20px 0;">
<tr>
<td align="center">
<a class="btn" href="${safe_verify_url}" target="_blank" rel="noopener">Verify account</a>
</td>
</tr>
</table>
<p class="muted">
If the button does not work, copy and paste this link into your browser:
</p>
<p class="muted">
<a class="link" href="${safe_verify_url}" target="_blank" rel="noopener">${safe_verify_url}</a>
</p>
<p class="muted">
If this was not you, you can safely ignore this email.
</p>
</td>
</tr>
<tr>
<td class="footer">
&copy; ${new Date().getFullYear()} ${safe_app_name}. All rights reserved.
</td>
</tr>
<tr>
<td height="16" aria-hidden="true"></td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
};
