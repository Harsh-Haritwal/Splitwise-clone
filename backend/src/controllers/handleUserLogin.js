const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const isValidEmail = (email) => {
  return emailRegex.test(email);
};

const handleUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ msg: "Bad request" });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ msg: "Enter valid details" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ msg: "Invalid email or password" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        res.status(200).json({ msg: "Successfull login" });
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