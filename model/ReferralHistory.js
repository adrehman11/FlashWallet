const referralHistoryModel = (sequelize) => {
    const Sequelize = require('sequelize');

    const ReferralHistory = sequelize.define('ReferralHistory', { 
        isActiveRewarded :{
            type: Sequelize.BOOLEAN,
            default:false
        },
        isNFTRewarded :{
            type: Sequelize.BOOLEAN,
            default:false
        }
    }, { timestamps: true });
    return ReferralHistory;
}

module.exports = referralHistoryModel;