const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/userModel");

const handleUserChangePassword = async(req, res) => {
    const {id} = req.user;
    if(!id){
        return res.status(401).json({msg: "Unauthorized"});
    }
    const {currentPass, updatedPass} = req.body;
    
    if(!currentPass || !updatedPass){
        return res.status(400).json({msg: "Bad request"});
    }
    if(typeof currentPass !== "string" || typeof updatedPass !== "string"){
        return res.status(400).json({msg: "Password must be string"});

    }
    if(currentPass === updatedPass){
        return res.status(400).json({msg: "New password must be different from current password"});
    }
    
    if(updatedPass.length > 128 || updatedPass.length < 8){
        return res.status(400).json({msg:"correct pass length"})
    }
    
    try {
        const existingUser = await User.findOne({_id: id})
        if(!existingUser){
            return res.status(404).json({msg: "User not found"});
        }
        const isMatch = await bcrypt.compare(currentPass, existingUser.password)
        if(!isMatch){
            return res.status(401).json({msg: "Invalid email or password"});
        }
        const genSalt = await bcrypt.genSalt(saltRounds);
        const hashedUpdatedPass = await bcrypt.hash(updatedPass, genSalt);
        const updatedUser = await User.findOneAndUpdate({_id: id},
            { $set: {password: hashedUpdatedPass}},
            {new: true, runValidators: true}
        )
        if(!updatedUser){
            return res.status(404).json({msg: "User not found"});
        }
        return res.status(200).json({msg: "Password updated successfully"});

    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Internal server error"})
    }
}

module.exports = handleUserChangePassword