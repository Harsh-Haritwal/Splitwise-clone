const mongoose = require("mongoose");
const Group = require("../models/groupModel");
const User = require("../models/userModel");

const handleAddNewMembers = async(req, res) => {
    const {id} = req.user;
    if(!id){
        return res.status(401).json({msg: "User id missing"});
    }
    const {groupId} = req.params;
    if(!groupId){
        return res.status(400).json({msg: "Group id missing"});
    }
    if(!mongoose.Types.ObjectId.isValid(groupId)){
        return res.status(400).json({msg:"Group id is not valid"})
    }
    const {newMemberId} = req.body;
    if(!newMemberId){
        return res.status(400).json({msg: "New member's id missing"});
    }
    if(!mongoose.Types.ObjectId.isValid(newMemberId)){
        return res.status(400).json({msg:"New member's id is not valid"});
    }
    try{
        const isValidGroup =  await Group.findOne({_id:groupId, members: id})
        if(!isValidGroup){
           return res.status(404).json({msg: "No group found"});
       }
       const isNewMemberValid = await User.findOne({_id: newMemberId})
       if(!isNewMemberValid){
          return res.status(404).json({msg: "New member is not a valid user"});
      }

       const newMemberAlreadyAdded = isValidGroup.members.some((member) => {
            return member.toString() === newMemberId.toString()
       })
       if(newMemberAlreadyAdded){
        return res.status(409).json({msg:"User already added"});
       }

       isValidGroup.members.push(newMemberId);
       await isValidGroup.save();
       return res.status(200).json({msg:"User added successfuly!"});

    }catch(error){
        console.log(error);
        return res.status(500).json({msg:"Internal server error"});
    }


}

module.exports = handleAddNewMembers;