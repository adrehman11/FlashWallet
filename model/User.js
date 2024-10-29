const userModel = (sequelize) => {
  const Sequelize = require("sequelize");
  const User = sequelize.define("User",
    {
      full_name: {
        type: Sequelize.STRING,
        default:null

      },
      isActive:{
        type: Sequelize.BOOLEAN,
        default:false
      },
      otpCode: {
        type: Sequelize.INTEGER,
      },
      otpCode_timestamp: {
        type: Sequelize.STRING,
        default:null

      },
      email: {
        type: Sequelize.STRING,
        unique: true,
      },
      referral_code: {
        type: Sequelize.STRING,
        default:null
      },
      emailVerified:{
        type: Sequelize.BOOLEAN,
        default:false
      },
      walletAddress:{
        type: Sequelize.STRING,
        default:null

      },
      isLogin:{
        type: Sequelize.BOOLEAN,
        default:false

      }

    },
    { timestamps: true }
  );

  return User;
};

module.exports = userModel;
