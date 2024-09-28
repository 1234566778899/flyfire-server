const { Schema, model } = require('mongoose');

const ChallengeSchema = Schema({
    users: [{ id: String, username: String }],
    count: Number,
    lenguaje: String,
    topics: [String],
    time: Number,
    level: String,
    code: String,
    bet: String
}, {
    timestamps: true
})

module.exports = model('challenge', ChallengeSchema)