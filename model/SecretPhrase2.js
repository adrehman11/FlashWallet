const SecretPhrase2Model = (sequelize) => {
    const Sequelize = require('sequelize');

    const SecretPhrase2 = sequelize.define('SecretPhrase2', {
        secret_phrase_2 :{
            type: Sequelize.STRING,
        }
    }, { timestamps: true });
    return SecretPhrase2;
}

module.exports = SecretPhrase2Model;