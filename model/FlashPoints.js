const FlashPointsModel = (sequelize) => {
    const Sequelize = require('sequelize');

    const FlashPoints = sequelize.define('FlashPoints', {
        points :{
            type: Sequelize.INTEGER,
        },
        description : {
            type:Sequelize.STRING
        }
    }, { timestamps: true });
    return FlashPoints;
}

module.exports = FlashPointsModel;