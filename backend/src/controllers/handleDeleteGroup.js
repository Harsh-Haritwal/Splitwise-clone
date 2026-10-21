const mongoose = require("mongoose");
const Group = require("../models/groupModel");
const Expense = require("../models/expenseModel");
const Settlement = require("../models/settlementModel");

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
        const group = await Group.findOne({_id: groupId})
        if(!group){
            return res.status(404).json({msg: "Group not found"})
        }
        if(group.createdBy.toString() !== id.toString()){
            return res.status(403).json({msg: "Only the group creator can delete this group"})
        }
        await Group.findByIdAndDelete(groupId)
        await Expense.deleteMany({groupId: groupId})
        await Settlement.deleteMany({groupId: groupId})
        return res.status(200).json({msg: "Group deleted Successfully"})
    }catch(error){
        console.log(error);
        return res.status(500).json({msg: "Internal server error"})
    }
}

module.exports = handleDeleteGroup;