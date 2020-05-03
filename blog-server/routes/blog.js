let express = require('express');

let router = express.Router();

function postCallBack(request,response,next){
    let thing = request.params.username;
    response.render('post',{test: thing});
}
router.get('/:username/:postid', postCallBack );

module.exports = router;