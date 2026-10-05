const mongoose = require("mongoose");
const Group = require("../models/groupModel");

const handleDeleteGroupMember = async (req, res) => {
  const { id } = req.user;
  if (!id) {
    return res.status(401).json({ msg: "User id not found" });
  }
  const { groupId, memberId } = req.params;
  if (!groupId || !memberId) {
    return res.status(400).json({ msg: "Group or memberId id not found" });
  }

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ msg: "Group id is not valid" });
  }
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return res.status(400).json({ msg: "Member id is not valid" });
  }

  if(id.toString() === memberId.toString()){
    return res.status(403).json({msg: "Can't remove the admin of group"})
  }
  try {
    const group = await Group.findOne({ _id: groupId, members: id });
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }
    const isMemberAdded = group.members.some((member) => {
      return member.toString() === memberId.toString();
    });
    if (!isMemberAdded) {
      return res.status(404).json({ msg: "Member not found" });
    }
    if (group.members.length == 1) {
      return res.status(403).json({ msg: "Last member can't remove" });
    }
    const newMembersArray = group.members.filter((member) => {
      return member.toString() != memberId.toString();
    });

    const updatedGroup = await Group.findOneAndUpdate(
      { _id: groupId },
      { $set: { members: newMembersArray } },
      {new: true}
    );
    return res.status(200).json({ msg: "Member removed successfully" ,updatedGroup});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = handleDeleteGroupMember;
