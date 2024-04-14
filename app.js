const express = require('express')
const app = express()
//ejs
app.set('view engine', 'ejs')
// req.body
app.use(express.json())
app.use(express.urlencoded({extended:true}))
//path
const path = require('path');

const { MongoClient } = require('mongodb')

let connectDB = require('./db.js')
let db
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('everyoneCulture');

  //DB연결 성공 시, 서버 띄우기
  app.listen(8800, () =>{
    console.log('http://localhost:8800 에서 서버 실행중')
  })
}).catch((error) =>{
  console.log(error)
})

app.get('/', (req, res) => {
    res.send('start page')
})