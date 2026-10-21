const mongoose  = require("mongoose");
const Group = require("../models/groupModel");

const handleEditGroupDetails = async(req, res) => {
    const {id} = req.user;
    if(!id){
        return res.status(401).json({msg: "Unauthorized access"});
    }
    const {groupId} = req.params;
    if(!groupId){
        return res.status(400).json({msg: "Group id not found"});
    }
    if(!mongoose.Types.ObjectId.isValid(groupId)){
        return res.status(400).json({msg: "Group id is not valid"})
    }
    const {name} = req.body;
    if(!name){
        return res.status(400).json({msg: "New name not found"});
    }
    if(typeof name !== "string"){
        return res.status(400).json({msg: "Invalid new name"});
    }
    const newName = name.trim();
    if(newName == ""){
        return res.status(400).json({msg: "Invalid new name"});
    }
    if(newName.length > 60){
        return res.status(400).json({msg: "Group name can be at most 60 characters"});
    }
    try {
        const group = await Group.findOne({ _id: groupId });
        if (!group) {
            return res.status(404).json({ msg: "Group not found" });
        }
        if (group.createdBy.toString() !== id.toString()) {
            return res.status(403).json({
                msg: "Only the group creator can rename this group",
            });
        }
        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { $set: { name: newName } },
            { new: true, runValidators: true },
        );
        return res.status(200).json({
            msg: "Group details updated",
            group: updatedGroup,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

module.exports = handleEditGroupDetails;