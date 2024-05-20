const { MongoClient } = require("mongodb");

// 공유 mongoDB
const url = 'mongodb+srv://comon:tv9S3HYY3mYFx7lA@comon.nexuyhs.mongodb.net/'
let connectDB = new MongoClient(url).connect()

//데이터 삽입

module.exports = connectDB
