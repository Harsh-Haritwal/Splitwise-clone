const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const isValidEmail = (email) => {
  return emailRegex.test(email);
};

const handleUserSignup = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ msg: "Bad request" });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ msg: "Bad request" });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ msg: "Enter valid email" });
      return;
    }
    const exist = await User.findOne({ email });
    if (exist) {
      res.status(409).json({ msg: "Conflict" });
      return;
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserDetails = {
      name: name,
      email: email,
      password: hashedPassword,
      ...(avatar ? { avatar: avatar } : {}),
    };
    const newUser = await User.insertOne(newUserDetails);
    const payload = { id: newUser._id, role: 'user' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ msg: "Signup done!", token: token });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({msg:"Internal server error"});
  }
};

module.exports = handleUserSignup;
