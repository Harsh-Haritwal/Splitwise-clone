const jwt = require("jsonwebtoken");

const authMid = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ msg: "Authentication token is required" });
  }
  const [Bearer, token] = authHeader.split(" ");
  if (Bearer !== "Bearer") {
    return res.status(401).json({ msg: "Authentication token is required" });
  }
  if (!token) {
    return res.status(401).json({ msg: "Authentication token is required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      return res.status(401).json({
        msg: "Token has expired",
      });
    } else if (error.name == "JsonWebTokenError") {
      return res.status(401).json({
        msg: "Invalid authentication token",
      });
    }else{
        return res.status(401).json({msg:"Authentication failed"})
    }
  }
};

module.exports = authMid;
