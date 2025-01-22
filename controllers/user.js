
const {
    User,
    ReferralHistory,
    SecretPhrase1,
    // SecretPhrase2,
    // SecretPhrase3,
    Sequelize,
    FlashPoints,
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

const {verifyEthSign}  = require("../Helper/Web3Function")
exports.createUserMPC = async (req, res) => {
    try {
      const exist = await User.findOne({
        attributes: ["id"],
        where: {
          email: req.body.email,
          isMPC:true
        },
      });
      if (exist) {
        let otpCode = await otp_code()
        let otpCode_timestamp= Date.now()
        await User.update({otpCode:otpCode,otpCode_timestamp:otpCode_timestamp,udid:req.body.udid},{where:{email:req.body.email}})

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

      const user = await User.create({
        email:req.body.email,
        isMPC: true,
        udid:req.body.udid
      });
      if (req.body.referralCode) {
        //check if the udid is same or not
        const user1 = await User.findOne({
          attributes: ["id","udid"],
          where: { referral_code: req.body.referralCode },
        });
        let allReferralData = await ReferralHistory.findAll({where:{user1:user1.id},include:[{model:User,as:"referee",attributes:["udid"]}]})
        const isUdidPresent = allReferralData.some(referral => referral.dataValues.referee.udid === req.body.udid);
      if (user1) {
        if(user1.udid != req.body.udid && !isUdidPresent)
        {
          await ReferralHistory.create({
            user1: user1.id,
            user2: user.id,
          });
        }
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

exports.createUserImportedWallet = async (req, res) => {
  try {
    let verifyRSVToken = await verifyEthSign(req.body.walletAddress,req.body.sign)
    if(!verifyRSVToken)
    {
      return res.status(400).json({
        msg: "Invalid Sign",
      });
    }
    const exist = await User.findOne({
      where: {
        walletAddress: req.body.walletAddress,
        isMPC:false
      },
    });
    if (exist) {
      const secret =process.env.jwtSecret
      const token = JWT.sign({
        id: exist.id,
       }, secret, { expiresIn: '3650d' });
      
       //login work
       await User.update({isLogin: true},{where:{id:exist.id}})
      return res.status(200).json({
        token: token,
      });
    }
    
    const user = await User.create({
      walletAddress:req.body.walletAddress,
      udid: req.body.udid
    });
    if (req.body.referralCode) {
      const user1 = await User.findOne({
        attributes: ["id","udid"],
        where: { referral_code: req.body.referralCode },
      });
    if (user1) {
      if(user1.udid != req.body.udid)
      {
        await ReferralHistory.create({
          user1: user1.id,
          user2: user.id,
        });
      }
    }
  

 
    }
    const secret =process.env.jwtSecret
    const token = JWT.sign({
      id: user.id,
     }, secret, { expiresIn: '3650d' });
    
     //login work
     await User.update({isLogin: true},{where:{id:user.id}})
    return res.status(200).json({
      token: token,
    });
  } catch (error) {
    console.log("Error in Create::::", error);
    if (res.headersSent) return;
    return res.status(500).json({ msg: error.message });
  }
};

exports.OtpCodeVerification = async (req, res) => {
    try {
      let user = await User.findOne({
        where: { email: req.body.email,isMPC:true},
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
      if (elapsedTime > 2) {
        return res.status(400).json({ msg: 'Code expired. Please request for new code.' });
      }
      if (req.body.otpCode !== user.otpCode) {
        return res.status(409).json({ status: false, msg: 'Invalid code! Please request for a new code.' });
      }
      const secret =process.env.jwtSecret
      const token = JWT.sign({
        id: user.id,
       }, secret, { expiresIn: '3650d' });
      
       //login work
       await User.update({isLogin: true},{where:{id:user.id}})
       console.log(user.id)
      return res.status(200).json({ msg: "Verified",token:token });
    } catch (error) {
      console.log("error in link verification:::::", error);
      return res.status(500).json({ msg: error.message });
    }
};

exports.resendOTP = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email,isMPC:true },
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
      if (elapsedTime < 2) {
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
// exports.secret_phrase_2 = async (req,res) =>{
//   try
//   {
//     let user = req.user
//     let userRecord = await SecretPhrase2.findOne({where:{user_id : user.id }})
//     if (userRecord)
//     {
//       return res.status(400).json({ msg: "User Secret Phrase already set" });
//     }
//     await SecretPhrase2.create({secret_phrase_2:req.body.secret_phrase_2 ,user_id:user.id})
//     return res.status(200).json({ msg: "User Secret Phrase created" });

    
//   }
//   catch(error)
//   {
//       console.log("error in Secret phrase 1:::::", error);
//       return res.status(500).json({ msg: error.message });
//   }
// }
// exports.secret_phrase_3 = async (req,res) =>{
//   try
//   {
//     let user = req.user
//     let userRecord = await SecretPhrase3.findOne({where:{user_id : user.id }})
//     if (userRecord)
//     {
//       return res.status(400).json({ msg: "User Secret Phrase already set" });
//     }
//     await SecretPhrase3.create({secret_phrase_3:req.body.secret_phrase_3 ,user_id:user.id})
//     return res.status(200).json({ msg: "User Secret Phrase created" });

    
//   }
//   catch(error)
//   {
//       console.log("error in Secret phrase 1:::::", error);
//       return res.status(500).json({ msg: error.message });
//   }
// }
exports.get_secret_phrase = async (req,res) =>{
  try
  {
    let user = req.user
    let result = await SecretPhrase1.findOne({where:{user_id : user.id }})
    // let result2 = await SecretPhrase2.findOne({where:{user_id : user.id }})
    // let result3 = await SecretPhrase3.findOne({where:{user_id : user.id }})
    if(result )
    {
      return res.status(200).json({ SecretPhrase1: result.secret_phrase_1});

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
        where: {
          id: user.id,
        },
      });
      if(exist.referral_code)
      {
        return res.status(401).json({msg:"Code Already exsist"})
      }
      let codeAlreadyexsist = await User.findOne({where:{referral_code: req.body.code}})
      if(codeAlreadyexsist)
      {
        return res.status(401).json({msg:"This Referral code is  Already exsist"})
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

exports.setWalletAddress = async (req, res) => {
    try {
      let user = req.user
      const exist = await User.findOne({
        where: {
          walletAddress: req.body.walletAddress,
        },
      });
      if(exist)
      {
        return res.status(401).json({
          msg: "This Wallet Address already set",
        });
      }
      let userData = await User.findOne({
        where: {
          id: user.id,
        },
      });
      if (userData.walletAddress) {
        return res.status(401).json({
          msg: "Wallet Address already set",
        });
      }
      await User.update(
        { walletAddress: req.body.walletAddress },
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
  exports.logout = async (req, res) => {
    try {
      let user = req.user
      await User.update({  isLogin:false}, { where: { id: user.id } });
      return res.status(200).json({logoutStatus:true});
      
    } catch (error) {
      console.log("Error in Logout:::", error);
      return res.status(500).json({ msg: error.message });
    }
  };

  exports.topReferrals = async (req,res) => {
    try{
      let user = req.user
      let pointsLeaderBoard = await FlashPoints.findAll({
        where: {
          points: { [Op.gt]: 0 },
        },
        attributes: [
          [sequelize.fn("SUM", sequelize.col("points")), "totalPoints"],
        ],
        limit: 100,
        offset: 0,
        include: [
          {
            model: User,
            attributes: ["full_name", "email", "walletAddress", "id","profile_image"],
            required: true,
          },
        ],
        group: [["user_id"]],
        order: [[sequelize.literal("totalPoints"), "DESC"]],
      });
      if(pointsLeaderBoard.length > 0)
      {
        return res.status(200).json(pointsLeaderBoard);
      }
      else
      {
        return res.status(200).json({msg:"No data Found"});
      }
    }
    catch(error)
    {
      console.log("Error in Top Referrals:::", error);
      return res.status(500).json({ msg: error.message });
    }
  }

  exports.profileSetting = async (req, res) => {
    try {
      let user = req.user
      if (req.file) {
        req.body.profile_image =req.file.location
      }
       await User.update(req.body,{where:{id:user.id}})
       let userData = await User.findOne({
         attribute:["id","walletAddress","referral_code","profile_image"],
        where: { id: user.id }
      });
    return res.status(200).json({
        msg: "Updated",
        Data:userData

      });
    } catch (error) {
      console.log("Error in profile setting::::", error);
      return res.status(500).json({ msg: error.message });
    }
  };

  exports.profileData = async (req, res) => {
    try {
      let user = req.user
     let userData = await User.findOne({where:{id:user.id},attribute:["id","walletAddress","profile_image","referral_code","full_name"]})
    return res.status(200).json({
        Data:userData

      });
    } catch (error) {
      console.log("Error in profile setting::::", error);
      return res.status(500).json({ msg: error.message });
    }
  };

  exports.checkReferralCode = async (req, res) => {
    try {
     let userData = await User.findOne({where:{referral_code:req.body.code}})
     if(!userData)
     {
      return res.status(400).json({
        msg:"No user found with this code"

      });
     }
     else
     {
      return res.status(200).json({
        msg:"User found"

      });
     }
   
    } catch (error) {
      console.log("Error in check Refferalcode::::", error);
      return res.status(500).json({ msg: error.message });
    }
  };

  exports.getEarnedPoints = async (req, res) => {
    try {
      let user = req.user
      let dataPoints = await ReferralHistory.findAll({where:{user1 :user.id,isClaimed:false}, attributes: [
        "id",
        [Sequelize.literal('referralPoints + NFTpoints'), 'totalPoints']
    ]})
    let data = dataPoints.filter(item => item.get('totalPoints') > 0);
    if(data.length > 0)
    {
      return res.status(200).json(data)
    }
     else{
      return res.status(200).json({msg:"No Data Found"})
     }
    } catch (error) {
      console.log("Error in check Refferalcode::::", error);
      return res.status(500).json({ msg: error.message });
    }
  };

  exports.ClaimEarnedPoints = async (req, res) => {
    try {
      let user = req.user
      let data = await ReferralHistory.findOne({where:{id :req.body.id,isClaimed:false }, attributes: [
        "id",
        "user1",
        [Sequelize.literal('referralPoints + NFTpoints'), 'totalPoints']
    ]})
    if(!data)
    {
      return res.status(400).json({ msg: "No Data found " });
    }
    await FlashPoints.create({user_id:data.user1,points:data.dataValues.totalPoints,description:`Earned ${data.dataValues.totalPoints} Points for referring a User`})
    await ReferralHistory.update({isClaimed:true},{where:{id:req.body.id}})
    
     return res.status(200).json({msg:"claimed"})
    } catch (error) {
      console.log("Error in check Refferalcode::::", error);
      return res.status(500).json({ msg: error.message });
    }
  };
  exports.createpaylinkwebhook = async (req,res) =>{
    try
    {
      const paylinkId = "67627ec57cd45e1098223f5d";
    const targetUrl =
      "http://ec2-18-219-208-61.us-east-2.compute.amazonaws.com:3000/users/webhook/check";
    const events= ["STARTED", "ENDED"]
      const response = await axios.post(
        "https://api.hel.io/v1/webhook/stream/transaction",
        {
          "streamId": "67627ec57cd45e1098223f5d",
          "targetUrl": "http://ec2-18-219-208-61.us-east-2.compute.amazonaws.com:3000/users/webhook/check",
          "events": ["STARTED", "ENDED"]
       },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer X01mmVfmiOFU/e8vuozSbG5ZP38wCDnJIgOt9Kjy7Y4A7jTWnYhK+IdB6WznH3Hi0fjsQJXvo22Nb8VAFhKsn3+jwlg5UFZf6E8nw5j0CUqSGD1UB92ttL8Fmf68k/yJ`,
            "cache-control": "no-cache",
          },
          params: {
            apiKey: "m8ciibQ3rhBrz6FoE7pXSEE3mwGx9e0FsNm16sULMfyGR_ZFCHyjs9F.UbZmKQFs",
          },
        },
      );
        console.log(response.data)
      // return new Response(JSON.stringify(response.data), {
      //   status: 200,
      // });
    }
    catch(error)
    {
      console.log(error)
    }
  }
  exports.webhook = async (req, res) => {
    try {
    console.log(req.body)
     return res.status(200).json({msg:"claimed"})
    } catch (error) {
      console.log("Error in check Refferalcode::::", error);
      return res.status(500).json({ msg: error.message });
    }
  };

  exports.list = async (req,res) =>{
    try
    {
      const paylinkId = "67627ec57cd45e1098223f5d";
   
      const response = await axios.get(
        "https://api.hel.io/v1/webhook/stream/transaction?apiKey=m8ciibQ3rhBrz6FoE7pXSEE3mwGx9e0FsNm16sULMfyGR_ZFCHyjs9F.UbZmKQFs&streamId=67627ec57cd45e1098223f5d",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer X01mmVfmiOFU/e8vuozSbG5ZP38wCDnJIgOt9Kjy7Y4A7jTWnYhK+IdB6WznH3Hi0fjsQJXvo22Nb8VAFhKsn3+jwlg5UFZf6E8nw5j0CUqSGD1UB92ttL8Fmf68k/yJ`,
            "cache-control": "no-cache",
          },
          params: {
            apiKey: "m8ciibQ3rhBrz6FoE7pXSEE3mwGx9e0FsNm16sULMfyGR_ZFCHyjs9F.UbZmKQFs",
          },
        },
      );
        console.log(response.data)
      // return new Response(JSON.stringify(response.data), {
      //   status: 200,
      // });
    }
    catch(error)
    {
      console.log(error)
    }
  }