const { Schema, model, default: mongoose } = require('mongoose');

const NotificationSchema = Schema({
    from: { type: mongoose.Schema.ObjectId, ref: 'user' },
    to: { type: mongoose.Schema.ObjectId, ref: 'user' },
    type: String,
    seen: { type: Boolean, default: false }
}, {
    timestamps: true
})

module.exports = model('notification', NotificationSchema)