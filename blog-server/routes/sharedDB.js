var MongoClient = require('mongodb').MongoClient

let db;
function startSharedDB(){
    var URL = 'mongodb://localhost:27017'
    MongoClient.connect(URL,(err, client)=> {
        if (err) return
        db = client.db("BlogServer");
    });
    return db;
}
function getSharedDB(){
    return db;
}

module.exports = {
    startSharedDB:startSharedDB,
    getSharedDB:getSharedDB
}