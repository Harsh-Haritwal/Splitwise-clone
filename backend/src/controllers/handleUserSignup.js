const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const {
  cleanText,
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidUrl,
} = require("../utils/validateInput");

const handleUserSignup = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ msg: "Name, email and password are required" });
      return;
    }
    if (!isValidName(name, 2, 50)) {
      res.status(400).json({ msg: "Name must be between 2 and 50 characters" });
      return;
    }
    if (!isValidPassword(password)) {
      res.status(400).json({ msg: "Password must be between 8 and 128 characters" });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ msg: "Enter a valid email" });
      return;
    }
    if (avatar !== undefined && avatar !== "" && !isValidUrl(avatar)) {
      res.status(400).json({ msg: "Avatar must be a valid URL" });
      return;
    }

    const newName = cleanText(name);
    const newEmail = cleanText(email).toLowerCase();
    const exist = await User.findOne({ email: newEmail });
    if (exist) {
      res.status(409).json({ msg: "Email already registered" });
      return;
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserDetails = {
      name: newName,
      email: newEmail,
      password: hashedPassword,
    };
    if (avatar) {
      newUserDetails.avatar = cleanText(avatar);
    }
    const newUser = await User.create(newUserDetails);
    const payload = { id: newUser._id, role: 'user' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || "1h",
});
    res.status(201).json({ msg: "Signup done!", token: token });
  } catch (error) {
    console.log(error);

    res.status(500).json({msg:"Internal server error"});
  }
};

module.exports = handleUserSignup;
