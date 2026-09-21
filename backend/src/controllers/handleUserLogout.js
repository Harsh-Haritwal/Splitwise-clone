const handleUserLogout = async(req, res) => {
    return res.status(200).json({msg: "Logout successful!"});
}

module.exports = handleUserLogout;