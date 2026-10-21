const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, "At least 1 character"],
        maxlength: [50, "At most 50 characters"]
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: [254, "At most 254 characters"],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Enter a valid email"]
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

const User = mongoose.model('User', userSchema);

module.exports = User;