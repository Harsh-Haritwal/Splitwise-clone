const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { cleanText, isValidEmail } = require("../utils/validateInput");

const handleUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ msg: "Email and password are required" });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ msg: "Enter a valid email" });
      return;
    }
    if (typeof password !== "string" || password.length > 128) {
      res.status(400).json({ msg: "Invalid email or password" });
      return;
    }
    const verifiedEmail = cleanText(email).toLowerCase();
    const user = await User.findOne({ email: verifiedEmail });
    if (!user) {
      res.status(401).json({ msg: "Invalid email or password" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        const payload = { id: user._id, role: 'user' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || "1h",
});
        res.status(200).json({ msg: "Successful login", token: token });
        return;
    }
    res.status(401).json({ msg: "Invalid email or password" });
    return;

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleUserLogin;
