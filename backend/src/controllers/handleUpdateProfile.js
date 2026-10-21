const User = require("../models/userModel");
const {
  cleanText,
  isValidName,
  isValidUrl,
} = require("../utils/validateInput");

const handleUpdateProfile = async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return res.status(404).json({ msg: "user not found" });
  }

  const { name, avatar } = req.body;
  if (name === undefined && avatar === undefined) {
    return res.status(400).json({ msg: "Nothing to update" });
  }

  const updateFields = {};
  if (name !== undefined) {
    if (!isValidName(name, 1, 50)) {
      return res.status(400).json({
        msg: "Name must be between 1 and 50 characters",
      });
    }
    updateFields.name = cleanText(name);
  }

  if (avatar !== undefined) {
    if (typeof avatar !== "string") {
      return res.status(400).json({
        msg: "Avatar must be a string",
      });
    }
    if (avatar.trim() !== "") {
      if (!isValidUrl(avatar)) {
        return res.status(400).json({
          msg: "Avatar must be a valid URL",
        });
      }
      updateFields.avatar = cleanText(avatar);
    }
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ msg: "Nothing to update" });
  }
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true, runValidators: true },
    ).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ msg: "user not found" });
    }
    res.status(200).json({
      msg: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ msg: "error while updating" });
  }
};

module.exports = handleUpdateProfile;
