const mongoose = require("mongoose");
const Group = require("../models/groupModel");
const User = require("../models/userModel");

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const handleAddNewMembers = async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return res.status(401).json({ msg: "User id missing" });
  }
  const { groupId } = req.params;
  if (!groupId) {
    return res.status(400).json({ msg: "Group id missing" });
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ msg: "Group id is not valid" });
  }

  const { newMemberId, newMemberEmail } = req.body;
  if (!newMemberId && !newMemberEmail) {
    return res.status(400).json({ msg: "New member's id or email is missing" });
  }
  if (newMemberId && !mongoose.Types.ObjectId.isValid(newMemberId)) {
    return res.status(400).json({ msg: "New member's id is not valid" });
  }
  if (newMemberEmail && typeof newMemberEmail !== "string") {
    return res.status(400).json({ msg: "New member's email is not valid" });
  }
  if (newMemberEmail && newMemberEmail.trim().length > 254) {
    return res.status(400).json({ msg: "Enter a valid email" });
  }

  try {
    const isValidGroup = await Group.findOne({ _id: groupId, members: id });
    if (!isValidGroup) {
      return res.status(404).json({ msg: "No group found" });
    }

    let newMember;
    if (newMemberId) {
      newMember = await User.findOne({ _id: newMemberId });
    } else {
      const email = newMemberEmail.trim().toLowerCase();
      if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: "Enter a valid email" });
      }
      newMember = await User.findOne({ email: email });
    }

    if (!newMember) {
      return res.status(404).json({
        msg: "No user found with this id or email. Ask them to sign up first.",
      });
    }

    const newMemberAlreadyAdded = isValidGroup.members.some((member) => {
      return member.toString() === newMember._id.toString();
    });
    if (newMemberAlreadyAdded) {
      return res.status(409).json({ msg: "User already added" });
    }
    if (isValidGroup.members.length >= 100) {
      return res.status(400).json({ msg: "A group can have at most 100 members" });
    }

    isValidGroup.members.push(newMember._id);
    await isValidGroup.save();
    return res.status(200).json({ msg: "User added successfuly!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleAddNewMembers;
