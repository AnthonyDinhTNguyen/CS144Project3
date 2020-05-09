let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let MonogClient = require('mongodb').MongoClient;
let secretKey = "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c";
let sharedDB = require('./sharedDB');

function handleLoginGet(request,response,next){
    let redirect = "";
    if (request.query.redirect){
        redirect = request.query.redirect;
    }
    let username = "";
    let password = "";
    response.status(200);
    response.render("login",{
        "username":username,
        "password":password,
        "redirect":redirect,
        "message": "Please Log In"
    });
}

function generateJWTToken(request,response, matches){
    if(matches){
        expiration = Math.floor((Date.now()/1000))+7200;
        payload = {
            "exp": expiration,
            "usr": request.body.username
        };
        jwtheader = {
            "alg": "HS256",
            "typ": "JWT"
        }

        cookieMonster = jwt.sign(payload, secretKey,{header:jwtheader});
        response.cookie("jwt",cookieMonster);
        if(request.body.redirect==null){
            response.status(200);
            response.send("successfully authenticated");
        }
        else if(request.body.redirect ==""){
            response.status(200);
            response.render("login",{
                "username":"",
                "password":"",
                "redirect":"",
                "message": "Successfully Authenticated"
            });
        }
        else{
            response.status(200);
            response.redirect(request.body.redirect);
        }
    }
    else{
        response.status(401);
        response.render("login",{
            "username":request.body.username,
            "password":request.body.password,
            "redirect":request.body.redirect,
            "message":"Failed to Log In Try Again. Password Doesn't Match"
        })
    }
}
function validateUser(request,response,next,results){
    if(results == null){
        response.status(401);
        response.render("login",{
            "username":request.body.username,
            "password":request.body.password,
            "redirect":request.body.redirect,
            "message":"Failed to Log In Try Again. No user found"
        })
        return;
    }
    else{
        bcrypt.compare(request.body.password,results.password).then(matches=>{generateJWTToken(request,response, matches)});
    }
}
function checkInput(request){
    if(request.body.username == null){
        return false;
    }
    else if(request.body.password == null){
        return false;
    }
    return true;
}
function handleLoginPost(request,response,next){
    if(checkInput(request) == false){
        response.sendStatus(401);
    }
    else{
        let db = sharedDB.getSharedDB();
        var coll = db.collection('Users');
        coll.findOne({"username":request.body.username}).then(results=>{validateUser(request,response,next,results)});
    }
}
router.get('/',handleLoginGet);
router.post('/',handleLoginPost);
module.exports = router;