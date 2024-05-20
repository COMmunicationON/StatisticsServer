var express = require('express');
var router = express.Router();

/* GET home page. */
//router.get('/', function (req, res, next) {
//
//  res.json({ session: req.session, user: req.user });
//});

router.get('/', (req, res, next) => {
    res.send('Statistics Server');
});

module.exports = router;