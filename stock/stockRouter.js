const express = require("express")
const router = express.Router()
const stock = require("../stock/stockModel")
const { checkLogin } = require("../auth/middleware")
const auth = require("../auth/middleware")

router.post("/stock", async (req,res)=>{
    if(!auth.hasPermission(req, true)){
        res.status(403).json({status: "error", message: "Forbidden"})
        return
    }

    await stock.addStock(req.body)
    res.header("Location","/").send("Redirecting")
})

router.delete("/stock", async (req,res)=>{
    if(!auth.hasPermission(req, true)){
        res.status(403).json({status: "error", message: "Forbidden"})
        return
    }
    
    await stock.deleteStock(req.body.id)
    res.header("Location","/").send("Redirecting")
}
)

router.get("/distribution/:username", async (req,res)=>{
    if(!auth.hasPermission(req, false, req.params.username)){
        res.status(403).json({status: "error", message: "Forbidden"})
        console.log("forbidden from viewing distribution")
        return
    }
    let dist = await stock.getDistributionOfUser(req.params.username)
    res.json(dist)

})

module.exports = router