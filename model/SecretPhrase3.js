const SecretPhrase3Model = (sequelize) => {
    const Sequelize = require('sequelize');

    const SecretPhrase3 = sequelize.define('SecretPhrase3', {
        secret_phrase_3 :{
            type: Sequelize.STRING,
        }
    }, { timestamps: true });
    return SecretPhrase3;
}

module.exports = SecretPhrase3Model;