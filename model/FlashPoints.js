const FlashPointsModel = (sequelize) => {
    const Sequelize = require('sequelize');

    const FlashPoints = sequelize.define('FlashPoints', {
        points :{
            type: Sequelize.INTEGER,
        }
    }, { timestamps: true });
    return FlashPoints;
}

module.exports = FlashPointsModel;