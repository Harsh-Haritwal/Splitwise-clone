const User = require("../models/userModel");

const handleUserDelete = async(req, res) => {
     const {id} = req.user;
     if(!id){
        return res.status(401).json({msg: "Unauthorized"})
     }
     try {
        const deletedUser = await User.findOneAndDelete({_id: id});
        if(!deletedUser){
            return res.status(404).json({msg:"User not found"})
        }
        return res.status(200).json({msg:"User deleted Successfully"})
     } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Internal server error"});
        
     }
}

module.exports = handleUserDelete;