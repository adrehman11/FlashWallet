const SecretPhrase1Model = (sequelize) => {
    const Sequelize = require('sequelize');

    const SecretPhrase1 = sequelize.define('SecretPhrase1', {
        secret_phrase_1 :{
            type: Sequelize.STRING,
        }
    }, { timestamps: true });
    return SecretPhrase1;
}

module.exports = SecretPhrase1Model;