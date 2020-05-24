let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let secretKey = "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c";

function verifyJWT(request,response,next){
    let valid = verifyToken(request);
    if(valid){
        next();
    }
    else{
        response.redirect("/login?redirect=/editor/");
    }

}
function verifyToken(request){
    let token = request.cookies.jwt;
    let decoded;
    if(token == null){
        return false;
    }
    try{
        decoded = jwt.verify(token,secretKey);
    }catch(err){
        return false;
    }
    if(decoded.exp>Math.trunc(Date.now()/1000)){
        return true;
    }
    return false;
}

router.get("*",verifyJWT);
module.exports = router;