const express = require('express')
var app = express();

//뷰 엔진
app.set('view engine', 'ejs');
//app.set('view engine', 'jade');

// req.body
app.use(express.json())
app.use(express.urlencoded({extended:true}))
//path
const path = require('path');

const { MongoClient } = require('mongodb')
const mongoose = require('mongoose');

let connectDB = require('./src/controllers/dbController.js')
let db

// app.listen(3000, '0.0.0.0', () =>{
//   console.log('서버가 80번 포트에서 실행되었습니다.');
// })

app.listen(8800, () =>{
  console.log('서버가 8800번 포트에서 실행되었습니다.');
})

const indexRouter = require('./src/routes/indexRouter');
const statisticsRouter = require('./src/routes/StatisticsRouter');
const weakRouter = require('./src/routes/weakRouter');
const alarmRouter = require('./src/routes/alarmRouter');


app.use('/', indexRouter);
app.use('/statistics', statisticsRouter);
app.use('/weak', weakRouter);
app.use('/alarm', alarmRouter);

module.exports = app;
