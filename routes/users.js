var express = require('express');
const Router = express.Router();
const UserController = require("../controllers/user");
const {
  signup,
  login,
  verifyOtp,
  setReferralCode,
  secret_phrase_1,
  secret_phrase_2,
  secret_phrase_3

} = require("../middlewares/validations");
const authMiddleware = require("../middlewares/validations/auth");

Router.post("/signup",signup, UserController.createUser );
Router.post("/login",login, UserController.login );
Router.post("/verify/otp",verifyOtp, UserController.OtpCodeVerification);
Router.post("/secret_phrase_1",authMiddleware,secret_phrase_1,UserController.secret_phrase_1)
Router.post("/secret_phrase_2",authMiddleware,secret_phrase_2,UserController.secret_phrase_2)
Router.post("/secret_phrase_3",authMiddleware,secret_phrase_3,UserController.secret_phrase_3)
Router.get("/secret_phrase",authMiddleware,UserController.get_secret_phrase)

Router.post("/setReferralCode",authMiddleware,setReferralCode, UserController.setReferralCode );
Router.get("checkTransections",UserController.setReferralCode)

module.exports = Router;
