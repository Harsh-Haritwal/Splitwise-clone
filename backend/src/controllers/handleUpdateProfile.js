const User = require("../models/userModel");

const handleUpdateProfile = async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return res.status(404).json({ msg: "user not found" });
  }

  const { name, avatar } = req.body;
  const updateFields = {};
  let trimmedName = "";
  let trimmedAvatar = "";
  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({
      msg: "Name must be a string",
    });
  }

  if (avatar !== undefined && typeof avatar !== "string") {
    return res.status(400).json({
      msg: "Avatar must be a string",
    });
  }
  if (name) {
    trimmedName = name.trim();
  }
  if (avatar) {
    trimmedAvatar = avatar.trim();
  }
  if (trimmedName != "") {
    updateFields.name = trimmedName;
  }
  if (trimmedAvatar != "") {
    updateFields.avatar = trimmedAvatar;
  }
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ msg: "Bad request" });
  }
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true, runValidators: true },
    ).select("-password -email -_id -createdAt -updatedAt");
    if (!updatedUser) {
      return res.status(404).json({ msg: "user not found" });
    }
    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ msg: "error while updating" });
  }
};

module.exports = handleUpdateProfile;
