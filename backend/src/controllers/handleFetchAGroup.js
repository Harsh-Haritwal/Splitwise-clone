const mongoose  = require("mongoose");
const Group = require("../models/groupModel");

const handleFetchAGroup = async(req, res) => {
    const {id} = req.user;
    if(!id){
        return res.status(401).json({msg:"User id is missing"});
    }
    const {groupId} = req.params;
    if(!groupId){
        return res.status(400).json({msg:"Group id is missing"});
    }
    if(!mongoose.Types.ObjectId.isValid(groupId)){
        return res.status(400).json({msg:"Group id is not valid"});
    }

    try {
        const group = await Group.findOne({_id: groupId, members :id})
        if(!group){
            return res.status(404).json({msg: "No group found"});
        }
        return res.status(200).json({msg: "Group found!", group})
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Internal server error"});
        
    }
}

module.exports = handleFetchAGroup;