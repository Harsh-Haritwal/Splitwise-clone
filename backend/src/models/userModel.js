const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true,
        minlength: [8, "At least 8 characters"],
        maxlength: [128, "At most 128 characters"],
    },
    avatar:{
        type: String,
        default: "https://static.vecteezy.com/system/resources/previews/019/896/008/original/male-user-avatar-icon-in-flat-design-style-person-signs-illustration-png.png"
    },
    
},{
    timestamps: true
})

const User = mongoose.model('user', userSchema);

module.exports = User;