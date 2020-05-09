let express = require('express');
const assert = require('assert');
let router = express.Router();
let commonmark = require('commonmark');
let sharedDB = require('./sharedDB');
// var MongoClient = require('mongodb').MongoClient

// var URL = 'mongodb://localhost:27017'

// let db;
// MongoClient.connect(URL,(err, client)=> {
//     if (err) return
//     db = client.db("BlogServer");
//     // var coll = db.collection('Posts');
//     // coll.insert({test: "1"}, function (findErr, result) {
//     //     if (findErr) throw findErr;
//     //     client.close();
//     //   });
// });

function postCallBack(request,response,next){
    let user = request.params.username;
    let postID = parseInt(request.params.postid);
    let db = sharedDB.getSharedDB();
    var coll = db.collection('Posts');
    let queryParams = {
        username: user,
        postid: postID 
    };
    coll.find(queryParams).toArray(function(err, results){
        if(err){
            //TODO::MAKE ERROR PAGE 
            response.sendStatus(404);
            //response.render('post',{test: "error"});
            return;
        }
        else if(results.length<=0){
            response.sendStatus(404);
            //response.render('post',{test:"errorrr"});
            return;
        }
        else{
            let currentPost = results[0];
            let r = new commonmark.Parser();
            let w = new commonmark.HtmlRenderer();
            let newTitle = w.render(r.parse(currentPost.title));
            let newBody = w.render(r.parse(currentPost.body));
            let newCreated = new Date(currentPost.created);
            let newModified = new Date(currentPost.modified);
            response.status(200);
            response.render('post',{
                username: currentPost.username,
                created: newCreated.toString(),
                modified: newModified.toString(),
                title: newTitle,
                body: newBody,
                postid: currentPost.postid
            });
        }
    });
}
function comparator(a,b){
    return parseInt(a.postid) - parseInt(b.postid);
}
function handlerFunction(results,request,response){
    if(results.length<=0){
        response.sendStatus(404);
    }
    else{
        results.sort(comparator);
        let morePosts = false;
        if(results.length >5){
            morePosts = true;
        }
        let display = results.splice(0,5);
        let largestID = display[display.length-1].postid;
        let newSkipID = largestID+1;
        let url = "/blog/"+request.params.username+"/"+newSkipID;
        let r = new commonmark.Parser();
        let w = new commonmark.HtmlRenderer();
        for(let i = 0; i< display.length;i++){
            let newTitle = w.render(r.parse(display[i].title));
            let newBody = w.render(r.parse(display[i].body));
            display[i].title = newTitle;
            display[i].body = newBody;
        }
        response.status(200);
        response.render('postsList',{
        results: display,
        nextUrl: url,
        nextButton: morePosts       
        })
    }
}
function listPostsCallBack(request,response,next){
    let db = sharedDB.getSharedDB();
    var coll = db.collection('Posts');
    let start=0;
    if(request.query.start){
        start = parseInt(request.query.start);
    }
    if(start == NaN){
        response.sendStatus(400);
        //response.render()
    }
    let user = request.params.username;
    if (user == null){
        response.sendStatus(400);
    }
    coll.find({username:user,postid:{"$gte":start}}).toArray().then(results =>{handlerFunction(results,request,response)}).catch(err=>{response.sendStatus(400)});
}
router.get('/:username/:postid', postCallBack );
router.get('/:username',listPostsCallBack)
module.exports = router;