const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { totp } = require("otplib");
// const { userLogger } = require("..//logger/log");
const jwt = require("jsonwebtoken");
const {
  sendEmail,
  getToken,
  refreshToken,
  sendSms,
} = require("../functions/user");
const route = Router()



route.get("/", async (req, res) => {
    let data = await User.findAll();
    // userLogger.log("info", "GET ishladi");
    res.send(data);
  });


  route.post("/send-otp", async (req, res) => {
    let { phone } = req.body;
    try {
      let user = await User.findOne({ where: { phone } });
      if (user) {
        return res.status(401).send({ message: "user already exists" });
      }
      let otp = totp.generate(phone + "lorem");
      await sendSms(phone, otp);
    //   userLogger.log("info", "otp jo'natildi");
      res.send(otp);
    } catch (error) {
      console.log(error);
    }
  });

  route.post("/verify-otp", async (req, res) => {
    let { otp, phone } = req.body;
    try {
      let match = totp.verify({ token: otp, secret: phone + "lorem" });
      if (!match) {
        return res.status(402).send({ message: "wrong error" });
      }
    //   userLogger.log("info", "otp tekshirildi");
      res.send(match);
    } catch (error) {
      console.log(error);
    }
  });

  route.post("/verify-email", async (req, res) => {
    let { otp, email } = req.body;
    try {
      let user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).send({ message: "user not found" });
      }
      let match = totp.verify({ token: otp, secret: email + "email" });
      if (!match) {
        return res.status(401).send({ message: "wrong error" });
      }
      await user.update({ status: "ACTIVE" });
    //   userLogger.log("info", "user activ boldi");
      res.send(match);
    } catch (error) {
      console.log(error);
    }
  });

  route.post("/register", async (req, res) => {
    let { userName, email, password, ...rest } = req.body;
    try {
      let user = await User.findOne({ where: { userName } });
      if (user) {
        return res.status(401).send({ message: "user already exists" });
      }
      let hash = bcrypt.hashSync(password, 10);
      let newUser = await User.create({
        ...rest,
        userName,
        email,
        password: hash,
        status: "PENDING",
      });
      let otp = totp.generate(email + "email");
      sendEmail(email, otp);
    //   userLogger.log("info", "user register qilindi");
      res.send(newUser);
    } catch (error) {
      console.log(error);
    }
  });

  route.post("/login", async (req, res) => {
    let { userName, password } = req.body;
    try {
      let user = await User.findOne({ where: { userName } });
      if (!user) {
        return res.status(404).send({ message: "user not found" });
      }
      let match = bcrypt.compareSync(password, user.password);
      if (!match) {
        return res.status(401).send({ message: "wrong password error" });
      }
      let accesToken = getToken(user.id, user.role);
      let refreToken = refreshToken(user);
    //   userLogger.log("info", "user ga accestoken va refresh token bold");
      res.send({ accesToken, refreToken });
    } catch (error) {
      console.log(error);
    }
  });
  
route.post("/refresh", async (req, res) => {
    let { refreshTok } = req.body;
    try {
      const user = jwt.verify(refreshTok, "refresh");
      const newAccestoken = getToken(user.id);
      res.send({ newAccestoken });
    } catch (error) {
      console.log(error);
    }
  });
  
module.exports = route;
