const { Schema, model } = require('mongoose');

const ResultSchema = Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    task: { type: Schema.Types.ObjectId },
    title: String,
    lenguaje: String,
    description: String,
    challenge: { type: Schema.Types.ObjectId, ref: 'challenge' },
    score: Number,
    time: Number,
    comment: String
}, {
    timestamps: true
})

module.exports = model('result', ResultSchema)