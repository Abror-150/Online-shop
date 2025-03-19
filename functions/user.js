const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const api = axios.create({
  baseURL: "https://notify.eskiz.uz/api/",
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDQwMjE3MzMsImlhdCI6MTc0MTQyOTczMywicm9sZSI6InRlc3QiLCJzaWduIjoiZGU3OGFmYzk1MzYxOTU5ZjA4MzQyNDQ5YzcyN2IwNmJlOWZlNTdjMGYxZjY2ZTdmMDVkMTFhNDY5ZjZkYjFiOSIsInN1YiI6IjEwMTQ4In0.PIE_ZLIZqD_5Z9HXGBZV72-_Rhet32bqMAh0sJ2d4R8`,
  },
});

const transporters = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bozorboyevazizjon56@gmail.com",
    pass: "rgqh wpaa xgwg kwna",
  },
});

async function sendEmail(email, otp) {
  await transporters.sendMail({
    to: email,
    subject: "verify auth",
    from: "urazalievv.abror@gmail.com",
    text: `your one time password ${otp} `,
  });
  console.log("sended email");
}

function getToken(id, role) {
  let token = jwt.sign({ id: id, role: role }, "getToken", {
    expiresIn: "15m",
  });
  return token;
}
function refreshToken(user) {
  let token = jwt.sign({ id: user.id, role: user.role }, "refresh", {
    expiresIn: "7d",
  });
  return token;
}

async function sendSms(tel, otp) {
  try {
    api.post("message/sms/send", {
      mobile_phone: tel,
      message: "Bu Eskiz dan test",
      from: "4546",
    });
    console.log("sended sms", tel, otp);
  } catch (error) {
    console.log(error);
  }
}

module.exports = { sendEmail, getToken, refreshToken, sendSms };
