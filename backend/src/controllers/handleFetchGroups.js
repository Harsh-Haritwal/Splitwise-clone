const Group = require("../models/groupModel");

const handleFetchGroups = async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.status(401).json({ msg: "Id is missing" });
    }
    try {
        const groups = await Group.find({ members: id });
        if (groups.length == 0){
            return res.status(200).json({ msg: "No group found", groups });
        }
        return res.status(200).json({msg:"Groups fetched successfully",groups})

    }catch(error){
        console.log(error);
        return res.status(500).json({msg: "Internal server error"});
        
    }

}

module.exports = handleFetchGroups;