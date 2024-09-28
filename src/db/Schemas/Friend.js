const { Schema, model, default: mongoose } = require('mongoose');

const FriendSchema = Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'user' },
    friend: { type: mongoose.Schema.ObjectId, ref: 'user' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, {
    timestamps: true
})

module.exports = model('friends', FriendSchema)