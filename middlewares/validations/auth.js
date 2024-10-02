const JWT = require("jsonwebtoken");
const { User } = require("../../model/db");

module.exports = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ msg: "No Token", logoutStatus: true });
    }

    token = token.split(" ")[1];
    let secret= process.env.jwtSecret
    var decoded = JWT.verify(token, secret);

    let user = await User.findOne({
      where: {
        id: decoded.id,
      }
    });
    if (!user) {
      return res.status(401).json({
        msg: "No User Found",
        logoutStatus: true,
      });
    }
    req.token = decoded;
    req.user = user;
    req.accessToken = token;
    next();
  } catch (exception) {
    if (exception.name === "TokenExpiredError") {
      return res.status(501).json({
        isTokenExpire: true,
        msg: "session token is expire!",
        logoutStatus: false,
      });
    }
    return res.status(401).json({
      isTokenExpire: false,
      msg: exception.message,
      logoutStatus: true,
    });
  }
};
