const axios = require("axios");
const senderEmail = "ecoconnect@trial-ynrw7gy0qxol2k8e.mlsender.net";

async function getApiKey() {
  try {
    const response = await axios.get(
      "http://mommy.rya-orfe.ts.net:8069/mailersend_api_key"
    );
    return response.data;
  } catch (error) {
    console.error("Error retrieving API key:", error);
    throw error;
  }
}

async function sendEmail(recipientEmail, title, content) {
  try {
    const apiKey = await getApiKey();
    const response = await axios.post(
      "https://api.mailersend.com/v1/email",
      {
        from: {
          email: senderEmail,
        },
        to: [
          {
            email: recipientEmail,
          },
        ],
        subject: title,
        text: content,
        html: content,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    console.log("Email sent successfully:", response.data);
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response ? error.response.data : error.message
    );
  }
}

async function sendPasswordResetEmail(email, firstName) {
  let emailContent = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ecoconnect Reset Password</title>
    <style>
    :root{
      font-family: "Arial"
    }
    a {
      all: unset;
    }
      .m-8 {
  margin: 2rem;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.my-auto {
  margin-top: auto;
  margin-bottom: auto;
}
.mr-auto {
  margin-right: auto;
}
.flex {
  display: flex;
}
.h-20 {
  height: 5rem;
}
.w-40 {
  width: 10rem;
}
.w-44 {
  width: 11rem;
}
.w-full {
  width: 100%;
}
.w-max {
  width: max-content;
}
.flex-row {
  flex-direction: row;
}
.flex-col {
  flex-direction: column;
}
.justify-center {
  justify-content: center;
}
.gap-2 {
  gap: 0.5rem;
}
.gap-4 {
  gap: 1rem;
}
.rounded-xl {
  border-radius: 0.75rem;
}
.rounded-b-xl {
  border-bottom-right-radius: 0.75rem;
  border-bottom-left-radius: 0.75rem;
}
.border-2 {
  border-width: 2px;
}
.border-red-200 {
  border-color: rgb(254 202 202);
}
.border-red-300 {
  border-color: rgb(252 165 165);
}
.bg-red-500 {
  background-color: rgb(239 68 68);
}
.bg-white {
  background-color: rgb(255 255 255);
}
.p-8 {
  padding: 2rem;
}
.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.font-bold {
  font-weight: 700;
}
.text-red-900 {
  color: rgb(127 29 29);
}
.text-white {
  color: rgb(255 255 255);
}
.opacity-50 {
  opacity: 0.5;
}
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
.shadow-md {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
.\*\:my-auto > * {
  margin-top: auto;
  margin-bottom: auto;
}
.\*\:mr-auto > * {
  margin-right: auto;
}
.no-underline {
  text-decoration-line: none;
}
.h-3 {
    height: 1.5rem;
}
    
    </style>
  </head>
  <body style="background-color: white;">
    <div class="m-8 flex flex-col rounded-xl border-2 border-red-200 shadow-lg">
      <div class="flex flex-col gap-4 p-8 *:mr-auto">
        <img src="https://onedrive.live.com/download?resid=FDC8D8692E9A43C0%21425747&authkey=%21ADT2uhKbMIG4iqw&width=1310&height=212" alt="ecoconnect logo" class="w-44" />
        <h1 class="text-3xl font-bold text-red-900">Greetings, ${firstName}!</h1>
        <p>We have received your request to reset the password.<br />Click the button below to do so.</p>
        <a href="https://example.com/reset-password" class="rounded-xl border-2 border-red-300 bg-red-500 px-4 py-3 text-white shadow-md w-max no-underline">RESET PASSWORD</a>
        <p class="text-sm opacity-50">If you have not made a request to reset the password, feel free to ignore this email.</p>
        <p>Best regards,<br/><span class="font-bold text-red-900">ecoconnect administrators</span></p>
      </div>
      <div class="flex flex-col justify-center h-20 w-full rounded-b-xl bg-red-500 text-white">
        <div class="mx-auto flex w-max flex-row gap-2 *:my-auto">
          <img src="https://onedrive.live.com/download?resid=FDC8D8692E9A43C0%21425747&authkey=%21ADT2uhKbMIG4iqw&width=1310&height=212" alt="ecoconnect logo" class=" h-3 py-2 px-3 bg-white rounded-xl" />
          <p>· Connecting neighbourhoods together</p>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
  await sendEmail(
    email,
    "[Password Reset] Reset your password for ecoconnect",
    emailContent
  );
  popToast();
}

module.exports = { sendPasswordResetEmail };
