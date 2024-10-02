const userModel = (sequelize) => {
  const Sequelize = require("sequelize");
  const User = sequelize.define("User",
    {
      full_name: {
        type: Sequelize.STRING,
        default:null

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

      }

    },
    { timestamps: true }
  );

  return User;
};

module.exports = userModel;
