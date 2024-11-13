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
        },
        isClaimed :{
            type: Sequelize.BOOLEAN,
            default:false
        },
        NFTpoints:{
            type: Sequelize.INTEGER,
            default:0
        },
        referralPoints:{
            type: Sequelize.INTEGER,
            default:0
        }
    }, { timestamps: true });
    return ReferralHistory;
}

module.exports = referralHistoryModel;