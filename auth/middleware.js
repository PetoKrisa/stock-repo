function hasPermission(req, adminOnly, owner=undefined){
    if(!req.session.user){
        return false
    }
    if(adminOnly && !checkAdmin(req)){
        return false
    }
    if(owner!=undefined && owner!=req.session.user.username && !checkAdmin(req)){
        return false
    }
    return true
}

function resetCookie(req,res,next){
    if(!req.session.user){
        res.redirect("/login")
    } else{
        req.session.touch()
        let exp = new Date(req.session.cookie.expires)
        res.cookie("expire", exp.valueOf())
        next()
    }
}

function checkAdmin(req){
    try{
        if(req.session.user.isAdmin){
            return true
        } else{
            return false
        }
    } catch (e){
        return false
    }

}

module.exports = {checkAdmin, resetCookie,hasPermission}