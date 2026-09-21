const Group = require("../models/groupModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");

const handleCreateGroup = async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return res.status(401).json({ msg: "Unauthorized access" });
  }
  let { name, members } = req.body;
  if (!name || !members) {
    return res.status(400).json({ msg: "Bad request" });
  }
  if (typeof name !== "string") {
    return res.status(400).json({ msg: "Wrong data type" });
  }
  const trimmedName = name.trim();
  if (trimmedName === "") {
    return res.status(400).json({ msg: "Enter correct data" });
  }

  if (!Array.isArray(members)) {
    return res.status(400).json({ msg: "Wrong data type" });
  }
  if (members.length === 0) {
    return res.status(400).json({ msg: "Members must include atleast 1" });
  }
    members = members.map((memberId) => memberId.toString());

  const isCreatorPresent = members.some(
    (memberId) => memberId.toString() === id.toString(),
  );

  if (!isCreatorPresent) {
    members.push(id);
  }
  const uniqueMembers = new Set(members);
  members = [...uniqueMembers];

  const areValidIds = members.every((memberId) =>
    mongoose.Types.ObjectId.isValid(memberId),
  );
  if (!areValidIds) {
    return res.status(400).json({
      message: "One or more member IDs are invalid",
    });
  }
  try {
    const areValidMembers = await User.countDocuments({
      _id: { $in: members },
    });
    if (areValidMembers !== members.length) {
      return res.status(400).json({ msg: "One or more user does't exist" });
    }
    const newGroup = await Group.create({
      name: trimmedName,
      createdBy: id,
      members: members,
    });
    return res
      .status(201)
      .json({ msg: "Group created successfuly", Group: newGroup });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleCreateGroup;
