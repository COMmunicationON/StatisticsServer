const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const problemSchema = new Schema({
    problemNumber: {
        type: Number,
        required: true,
        unique: true
    },
    incorrectNumber: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Problem', problemSchema);