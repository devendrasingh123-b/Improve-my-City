const BlacklistTokenModel = require("../models/blacklistTokenModel");


 const BlacklistCheckMiddleware = async (req, res, next) => {
//   console.log("🟡 Query:", req.query); // Debug
  const { token } = req.query;
//   console.log("hi")

  if (!token) {
    return res.status(400).json({ message: "Token missing" });
  }

  // Token expired check or decode handled by other middleware
  // Is Token pehle use hua hai kya?
  const isBlacklisted = await BlacklistTokenModel.findOne({ token });

  if (isBlacklisted) {
    return res.status(403).json({
      message: "This reset link has already been used. Please request again."
    });
  }

  next();
};

//  BlacklistCheckMiddleware;
module.exports=BlacklistCheckMiddleware
