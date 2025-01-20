var express = require('express');
const Router = express.Router();
const UserController = require("../controllers/user");
const upload = require("../Helper/aws")
const {
  signup,
  login,
  verifyOtp,
  setReferralCode,
  secret_phrase_1,
  // secret_phrase_2,
  // secret_phrase_3,
  resendOTP,
  signupImportedWallet,
  setWalletAddress,
  claimEarnedPoints

} = require("../middlewares/validations");
const authMiddleware = require("../middlewares/validations/auth");

Router.post("/signup",signup, UserController.createUserMPC );
Router.post("/signup/importedWallet",signupImportedWallet, UserController.createUserImportedWallet );
Router.post("/verify/otp",verifyOtp, UserController.OtpCodeVerification);
Router.post("/resend/otp",resendOTP, UserController.resendOTP);
Router.post("/secret_phrase_1",authMiddleware,secret_phrase_1,UserController.secret_phrase_1)
// Router.post("/secret_phrase_2",authMiddleware,secret_phrase_2,UserController.secret_phrase_2)
// Router.post("/secret_phrase_3",authMiddleware,secret_phrase_3,UserController.secret_phrase_3)
Router.get("/secret_phrase",authMiddleware,UserController.get_secret_phrase)

Router.post("/setReferralCode",authMiddleware,setReferralCode, UserController.setReferralCode );
Router.post("/setWalletaddress",authMiddleware,setWalletAddress, UserController.setWalletAddress );
Router.post("/profileSetting",authMiddleware, upload.single("image"),UserController.profileSetting );
Router.get("/topReferrals",authMiddleware,UserController.topReferrals)
Router.get("/getProfileData",authMiddleware,UserController.profileData)
Router.get("/ReferralPointsEarned",authMiddleware,UserController.getEarnedPoints)
Router.post("/claimReferralPoints",authMiddleware,claimEarnedPoints,UserController.ClaimEarnedPoints)

Router.post("/checkReferralCode",setReferralCode,UserController.checkReferralCode)


//webhook end point for subscription

Router.post("/webhook/check",UserController.webhook)
Router.post("/webhook/paylink",UserController.createpaylinkwebhook)
Router.post("/webhook/list",UserController.list)


Router.get("/logout",authMiddleware,UserController.logout)


module.exports = Router;
