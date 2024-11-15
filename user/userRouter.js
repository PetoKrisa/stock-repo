const express = require("express")
const router = express.Router()
const stock = require("../stock/stockModel")
const user = require("../user/userModel")
const auth = require("../auth/middleware")

router.post("/user", async (req,res)=>{
    console.log("post user")
    if(!auth.hasPermission(req, true)){
    console.log("post user forbidden")
        res.status(403).json({status: "error", message: "Forbidden"})
        return
    }
    console.log("post user allowed")
    let id = await user.addUser(req.body.username, req.body.name, req.body.password)
    console.log(id)
    res.header("Location", "/").json({status: "ok", message: `User created with id: ${id}`})
})


module.exports = router