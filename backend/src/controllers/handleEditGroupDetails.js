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
    try {
        const updatedGroup = await Group.findOneAndUpdate(
            {_id: groupId, members: id},
            {$set : {name: newName}},
            {new : true}
        )
        if(!updatedGroup){
            return res.status(404).json({msg: "Group not found"});

        }
        return res.status(200).json({msg: "Group details updated", updatedGroup})
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: "Internal server error"})
        
    }

}

module.exports = handleEditGroupDetails;