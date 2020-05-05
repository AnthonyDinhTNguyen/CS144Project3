let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let MonogClient = require('mongodb').MongoClient;
let secretKey = "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c";
let sharedDB = require('./sharedDB');

function handleLoginGet(request,response,next){
    
}
router.get('/',handleLoginGet);