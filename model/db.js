const Sequelize = require("sequelize");
require("dotenv").config();
const userModel = require("./User");
const ReferralHistoryModel = require("./ReferralHistory");
const SecretPhrase1Model = require("./SecretPhrase1");
const FlashPointsModel = require("./FlashPoints");


var sequelize;
if (!sequelize) {
  let dbName = process.env.DB_NAME;
  let dbUserName = process.env.DB_USER;
  let dbPassword = process.env.DB_PASSWORD;
  let dbHost = process.env.DB_HOST_READER;
  // let dbHost2 = vars.DB_HOST_READER2
  // let dbHost3 = vars.DB_HOST_READER3
  // let dbHost4 = vars.DB_HOST_READER4
  let dbWriter = process.env.DB_HOST;
  let dbPort = process.env.DB_PORT;
  let dbDialect = process.env.DB_DIALECT;
  let dbAccquire = process.env.DB_ACCQUIRE;
  let dbIdle = process.env.DB_IDLE;
  let pool = process.env.POOL;

  sequelize = new Sequelize(dbName, dbUserName, dbPassword, {
    dialect: dbDialect,
    port: dbPort,
    pool: pool,
    logging: false,
    replication: {
      read: [
        { host: dbHost, username: dbUserName, password: dbPassword },
        // { host: dbHost2, username: dbUserName, password: dbPassword },
        // { host: dbHost3, username: dbUserName, password: dbPassword },
        // { host: dbHost4, username: dbUserName, password: dbPassword}
      ],
      write: { host: dbWriter, username: dbUserName, password: dbPassword },
    },
    pool: {
      acquire: dbAccquire,
      idle: dbIdle,
    },
  });
}
const ReferralHistory = ReferralHistoryModel(sequelize);
const User = userModel(sequelize);
const SecretPhrase1 = SecretPhrase1Model(sequelize);
const FlashPoints = FlashPointsModel(sequelize);



sequelize
  .authenticate()
  .then(async () => {
    /*********************** Relations ***************/

    //new realtion
    ReferralHistory.belongsTo(User, {
      foreignKey: "user1",
      as: "referrer",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    User.hasMany(ReferralHistory, {
      foreignKey: "user1",
      as: "referrer",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    ReferralHistory.belongsTo(User, {
      foreignKey: "user2",
      as: "referee",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    User.hasOne(ReferralHistory, {
      foreignKey: "user2",
      as: "referee",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    SecretPhrase1.belongsTo(User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    User.hasOne(SecretPhrase1, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    FlashPoints.belongsTo(User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    User.hasMany(FlashPoints, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await sequelize.sync();
  })
  .catch((error) => {
    console.log("Database connection Error: ", error);
  });

module.exports = {
  sequelize,
  Sequelize,
  User,
  ReferralHistory,
  SecretPhrase1,
  FlashPoints
};
