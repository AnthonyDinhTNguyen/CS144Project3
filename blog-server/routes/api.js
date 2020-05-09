let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let MonogClient = require('mongodb').MongoClient;
let sharedDB = require('./sharedDB');
let secretKey = "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c";


function getAllPosts(request,response,next){
    if(verifyToken(request)){
        let db = sharedDB.getSharedDB();
        var coll = db.collection('Posts');
        let queryParams = {
            username: request.params.username,
        };
        coll.find(queryParams).toArray(function(err,results){
            if(err){
                response.status(404);
                response.json({error: 'query error'});
            }
            else{
                response.status(200);
                response.json(results);
            }
        })
    }
    else{
        response.sendStatus(401)
    }
}

function getOnePostCallback(request,response,next,results){
    if(results==null){
        response.sendStatus(404);
    }
    else{
        response.status(200);
        response.json(results);
    }
}
function getOnePost(request,response,next){
    if(verifyToken(request)){
        let db = sharedDB.getSharedDB();
        var coll = db.collection('Posts');
        let user = request.params.username;
        let id = parseInt(request.params.postid);
        let queryParams = {
            username: user,
            postid: id
        };
        coll.findOne(queryParams).then(results=>{getOnePostCallback(request,response,next,results)}).catch(err=>{response.sendStatus(404)});
    }
    else{
        response.sendStatus(401)
    }
}

function checkPostInput(request){
    try{
        if(request.body.body == null){
            return false;
        }
        if(request.body.title == null){
            return false;
        }
        if(parseInt(request.params.postid)==NaN){
            return false;
        }
    }catch(err){
        return false;
    }
    return true;
}

function insertNewPostCallback(request,response,next,results,coll,user,id){
    if(results!= null){
        response.sendStatus(400);
        return;
    }
    else{
        coll.insertOne({
            "username":user,
            "postid":id,
            "created": Date.now(),
            "modified":Date.now(),
            "body":request.body.body,
            "title":request.body.title
        },function(error,res){
            if(error){
                response.sendStatus(400);
            }
            else{
                response.sendStatus(201);
            }
        })
    }
}
function insertNewPost(request,response,next){
    if(verifyToken(request)){    
        let db = sharedDB.getSharedDB();
        var coll = db.collection('Posts');
        if(checkPostInput(request) == false){
            response.sendStatus(400);
        }
        else{
            let user = request.params.username;
            let id = parseInt(request.params.postid);
            let queryParams = {
                username: user,
                postid: id
            }
            coll.findOne(queryParams).then(results=>{insertNewPostCallback(request,response,next,results,coll,user,id)}).catch(err=>{response.sendStatus(400)})
        }
    }
    else{
        response.sendStatus(401)
    }
}

function updatePost(request,response,next){
    if(verifyToken(request)){
        let db = sharedDB.getSharedDB();
        var coll = db.collection('Posts');
        if(checkPostInput(request) == false){
            response.sendStatus(400);
        }
        else{
            let user = request.params.username;
            let id = parseInt(request.params.postid);
            let queryParams = {
                username: user,
                postid: id
            };
            let setParams = {
                $set:{
                    title: request.body.title,
                    body: request.body.body,
                    modified: Date.now()
                }
            }
            coll.updateOne(queryParams,setParams).then(results=>{if(results.modifiedCount==1){response.sendStatus(200)}else{response.sendStatus(400)}}).catch(err=>response.sendStatus(400))
        }
    }
    else{
        response.sendStatus(401)
    }
}

function deletePost(request,response,next){
    if(verifyToken(request)){
        let db = sharedDB.getSharedDB();
        var coll = db.collection('Posts');
        let user = request.params.username;
        let id = parseInt(request.params.postid);
        let queryParams = {
            username: user,
            postid: id
        };
        coll.deleteOne(queryParams).then(results=>{if(results.deletedCount ==1){response.sendStatus(204)}else{response.sendStatus(400)}}).catch(err=>response.sendStatus(400))
    }
    else{
        response.sendStatus(401)
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
    if(decoded.usr != request.params.username){
        return false;
    }
    if(decoded.exp>Math.trunc(Date.now()/1000)){
        return true;
    }
    return false;
}

router.get("/:username",getAllPosts);
router.get("/:username/:postid",getOnePost);
router.post("/:username/:postid",insertNewPost);
router.put("/:username/:postid",updatePost);
router.delete("/:username/:postid",deletePost);
module.exports = router;