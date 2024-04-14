const { MongoClient } = require("mongodb");

const url = 'mongodb+srv://user:mongoPassword@cluster0.60xu7q2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
let connectDB = new MongoClient(url).connect()

module.exports = connectDB
