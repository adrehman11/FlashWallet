
const {
    User,
    ReferralHistory,
    SecretPhrase1,
    SecretPhrase2,
    SecretPhrase3,
    Sequelize,
    sequelize
  } = require("../model/db");

const Op = Sequelize.Op;
const {otp_code} = require('../Helper/HelperFunction')
const JWT = require("jsonwebtoken");
const randomstring = require("randomstring");
require("dotenv").config();
const axios = require('axios');
const sgMail = require("@sendgrid/mail");
const moment = require('moment');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const {CheckTransectionHistory}  = require("../Helper/Web3Function")
exports.createUser = async (req, res) => {
    try {
      
      const exist = await User.findOne({
        attributes: ["id"],
        where: {
          email: req.body.email,
        },
      });
      
      if (exist) {
        let otpCode = await otp_code()
        let otpCode_timestamp= Date.now()
        await User.update({otpCode:otpCode,otpCode_timestamp:otpCode_timestamp},{where:{email:req.body.email}})

         const msg = {
            to: req.body.email,
            from: {
               email: process.env.SENDER_EMAIL,
                name: process.env.SENDER_NAME,
             },
            templateId: process.env.SINGUP_OTP_EMAIL_TEMPLATE_ID,
            dynamicTemplateData: {
            otpCode,
            },
        };

      await sgMail.send(msg);
        return res.status(200).json({
          msg: "OTP Sended",
          // token:token
        });
      }
      const user = await User.create(req.body);
      if (req.body.referralCode) {
        const user1 = await User.findOne({
          attributes: ["id"],
          where: { referral_code: req.body.referralCode },
        });
      if (user1) {
          await ReferralHistory.create({
            user1: user1.id,
            user2: user.id,
          });

          // let checkTransectionsHistory = await CheckTransectionHistory (req.body.walletAddress);
      }
    

   
    }
    // const link = `${process.env.FRONTEND_SINGUP_VERIFY_LINK}/?token=${token}`;
    let otpCode = await otp_code()
    let otpCode_timestamp= Date.now()
    await User.update({otpCode:otpCode,otpCode_timestamp:otpCode_timestamp},{where:{email:req.body.email}})
    const msg = {
      to: req.body.email,
      from: {
         email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME,
       },
      templateId: process.env.SINGUP_OTP_EMAIL_TEMPLATE_ID,
      dynamicTemplateData: {
      otpCode,
      },
  };

await sgMail.send(msg);
    return res.status(200).json({
        msg: "OTP Sended",
        // token:token
      });
    } catch (error) {
      console.log("Error in Create::::", error);
      if (res.headersSent) return;
      return res.status(500).json({ msg: error.message });
    }
};


exports.OtpCodeVerification = async (req, res) => {
    try {
      
      const user = await User.findOne({
        where: { email: req.body.email },
      }); // finding User In DB
      if (!user) {
        return res
          .status(404)
          .json({ status: false, msg: "No user Found" });
      }
      if (!user.otpCode_timestamp || !user.otpCode) {
        return res.status(400).json({ msg: "Please request for new email code." });
      }
      const now = moment(Date.now());
      const expDate = moment(parseInt(user.otpCode_timestamp, 10));
      const duration = moment.duration(now.diff(expDate));
      const elapsedTime = duration.asMinutes();
      if (elapsedTime > 10) {
        return res.status(400).json({ msg: 'Code expired. Please request for new code.' });
      }
      if (req.body.otpCode !== user.otpCode) {
        return res.status(409).json({ status: false, msg: 'Invalid code! Please request for a new code.' });
      }
      const secret =process.env.jwtSecret
      const token = JWT.sign({
        id: user.id,
       }, secret, { expiresIn: '3650d' });
      
      return res.status(200).json({ msg: "Verified",token:token });
    } catch (error) {
      console.log("error in link verification:::::", error);
      return res.status(500).json({ msg: error.message });
    }
};

exports.resendOTP = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
    }); // finding User In DB
    if (!user) {
      return res
        .status(404)
        .json({ status: false, msg: "No user Found" });
    }

    if(user.otpCode_timestamp )
    {
      const now = moment(Date.now());
      const expDate = moment(parseInt(user.otpCode_timestamp, 10));
      const duration = moment.duration(now.diff(expDate));
      const elapsedTime = duration.asMinutes();
      if (elapsedTime < 10) {
        return res.status(400).json({ msg: 'OTP email already sended to your email' });
      }
    }
      let otpCode = await otp_code()
      let otpCode_timestamp= Date.now()
      await User.update({otpCode:otpCode,otpCode_timestamp:otpCode_timestamp},{where:{email:req.body.email}})
      const msg = {
        to: req.body.email,
        from: {
           email: process.env.SENDER_EMAIL,
            name: process.env.SENDER_NAME,
         },
        templateId: process.env.SINGUP_OTP_EMAIL_TEMPLATE_ID,
        dynamicTemplateData: {
        otpCode,
        },
    };
  await sgMail.send(msg);
      return res.status(200).json({
        msg: "OTP Sended",
        // token:token
      });

  } catch (error) {
    console.log("error in link verification:::::", error);
    return res.status(500).json({ msg: error.message });
  }
};
exports.secret_phrase_1 = async (req,res) =>{
  try
  {
    let user = req.user
    let userRecord = await SecretPhrase1.findOne({where:{user_id : user.id }})
    if (userRecord)
    {
      return res.status(400).json({ msg: "User Secret Phrase already set" });
    }
    await SecretPhrase1.create({secret_phrase_1:req.body.secret_phrase_1 ,user_id:user.id})
    return res.status(200).json({ msg: "User Secret Phrase created" });

    
  }
  catch(error)
  {
      console.log("error in Secret phrase 1:::::", error);
      return res.status(500).json({ msg: error.message });
  }
}
exports.secret_phrase_2 = async (req,res) =>{
  try
  {
    let user = req.user
    let userRecord = await SecretPhrase2.findOne({where:{user_id : user.id }})
    if (userRecord)
    {
      return res.status(400).json({ msg: "User Secret Phrase already set" });
    }
    await SecretPhrase2.create({secret_phrase_2:req.body.secret_phrase_2 ,user_id:user.id})
    return res.status(200).json({ msg: "User Secret Phrase created" });

    
  }
  catch(error)
  {
      console.log("error in Secret phrase 1:::::", error);
      return res.status(500).json({ msg: error.message });
  }
}
exports.secret_phrase_3 = async (req,res) =>{
  try
  {
    let user = req.user
    let userRecord = await SecretPhrase3.findOne({where:{user_id : user.id }})
    if (userRecord)
    {
      return res.status(400).json({ msg: "User Secret Phrase already set" });
    }
    await SecretPhrase3.create({secret_phrase_3:req.body.secret_phrase_3 ,user_id:user.id})
    return res.status(200).json({ msg: "User Secret Phrase created" });

    
  }
  catch(error)
  {
      console.log("error in Secret phrase 1:::::", error);
      return res.status(500).json({ msg: error.message });
  }
}
exports.get_secret_phrase = async (req,res) =>{
  try
  {
    let user = req.user
    let result1 = await SecretPhrase1.findOne({where:{user_id : user.id }})
    let result2 = await SecretPhrase2.findOne({where:{user_id : user.id }})
    let result3 = await SecretPhrase3.findOne({where:{user_id : user.id }})
    if(result1 && result2 && result3)
    {
      return res.status(200).json({ SecretPhrase1: result1.secret_phrase_1, SecretPhrase2: result2.secret_phrase_2, SecretPhrase3: result3.secret_phrase_3,});

    }
    else
    {
      return res.status(400).json({ msg: "Invalid secret phrase" });
    }
    
  }
  catch(error)
  {
      console.log("error in Secret phrase 1:::::", error);
      return res.status(500).json({ msg: error.message });
  }
}



exports.setReferralCode = async (req, res) => {
    try {
      let user = req.user
      const exist = await User.findOne({
        attributes: ["id"],
        where: {
          id: user.id,
        },
      });
      
      if (!exist) {
        return res.status(401).json({
          msg: "No wallet Address found ",
        });
      }
      await User.update(
        { referral_code: req.body.code },
        { where: { id: user.id } }
      );
    return res.status(200).json({
        msg: "Updated",
      });
    } catch (error) {
      console.log("Error in Create::::", error);
      return res.status(500).json({ msg: error.message });
    }
  };
  

exports.checkTransection = async (req, res) => {
    try {

      
      return res.status(200).json({ msg:"checked" });
      
    } catch (error) {
      console.log("Error in Create::::", error);
      return res.status(500).json({ msg: error.message });
    }
  };