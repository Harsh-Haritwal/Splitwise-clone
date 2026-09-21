const mongoose  = require("mongoose");

const groupSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref:"User",
        validate: {
            validator: function(arr){
            return arr.length >= 1;
            },
            message: "Minimum 1 member is required!"
        },
        required: true
    }
},{timestamps: true})

const Group = mongoose.model("Group", groupSchema)

module.exports = Group;