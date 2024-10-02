const referralHistoryModel = (sequelize) => {
    const Sequelize = require('sequelize');

    const ReferralHistory = sequelize.define('ReferralHistory', {
    }, { timestamps: true });
    return ReferralHistory;
}

module.exports = referralHistoryModel;