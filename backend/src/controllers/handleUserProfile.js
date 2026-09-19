const User = require("../models/userModel");

const handleUserProfile = async(req, res) => {
    const {id} = req.user;
    if(!id){
        return res.status(401).json({msg: "Invalid user"});
    }

    try{

        const profile =await User.findOne({_id : id}).select("-password -avatar -_id");
        if(!profile){
            return res.status(404).json({msg: "User not found"});
        }
        return res.status(200).json({msg: "Profile fetched successfully!",
            userProfile: profile
        })
    }catch(error){
        console.log(error);
        
        return res.status(500).json({msg: "Internal server error"})
    }



}

module.exports =  handleUserProfile;