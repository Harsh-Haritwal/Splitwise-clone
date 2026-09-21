const Group = require("../models/groupModel");

const handleTestRoute = async(req, res) => {
        const {id} = req.user;
        if(!id){
                return res.json("Bad request")
        }
        const {name ,members}  = req.body;
        if(!name || !members){
                return res.json("Info missing")
        }
        const group = await Group.create({
                name: name,
                createdBy: id,
                members: members
        })
        console.log(group)
        return res.status(200).json({msg: "Group Created!"})
}

module.exports = handleTestRoute;