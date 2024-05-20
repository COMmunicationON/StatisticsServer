const mongoose = require("mongoose");
const Schema = mongoose.Schema

const feedbackSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', unique: true },
    score: [{
        type: {
         type: String,
         required: true
         },
        accuracy_score: {
            type: Number,
            required: true,
            default: 0
        },
        fluency_score: {
            type: Number,
            required: true,
            default: 0
        },
        completeness_score: {
            type: Number,
            required: true,
            default: 0
        },
        pron_score: {
            type: Number,
            required: true,
            default: 0
        },
        createdAT: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Feedback', feedbackSchema);