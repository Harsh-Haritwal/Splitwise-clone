const mongoose = require("mongoose");
const Group = require("../models/groupModel");

const handleDeleteGroup = async(req, res) => {
    const {id} = req.user;
    if(!id){
        return res.status(401).json({msg: "Unauthorized access"})
    }
    const {groupId} = req.params;
    if(!groupId){
        return res.status(400).json({msg: "Group id not found"})
    }
    if(!mongoose.Types.ObjectId.isValid(groupId)){
        return res.status(400).json({msg: "Invalid group id"})
    }
    try{
        const deletedGroup = await Group.findOneAndDelete({_id: groupId, members: id})
        if(!deletedGroup){
            return res.status(404).json({msg: "Group not found"})
        }
        return res.status(200).json({msg: "Group deleted Successfully"})
    }catch(error){
        console.log(error);
        return res.status(500).json({msg: "Internal server error"})
    }
}

module.exports = handleDeleteGroup;