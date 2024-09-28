const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    name: String,
    lname: String,
    username: String,
    email: String,
    birthdate: Date,
    active: { type: Boolean, default: true },
    photo: String,
    phone: String,
    country: String,
    levelProgramming: String,
    favoriteLenguaje: String,
    timeProgramming: String,
    biografy: String,
    university: String,
    addressUniversity: String,
    profession: String,
    test: { type: Boolean, default: false }
}, {
    timestamps: true
})

module.exports = model('user', UserSchema)