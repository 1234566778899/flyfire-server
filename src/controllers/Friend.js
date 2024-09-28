const Friend = require("../db/Schemas/Friend");
const User = require("../db/Schemas/User");
const Notification = require('../db/Schemas/Notification');

const sendRequest = async (req, res) => {
    try {
        const { userId, friend } = req.body;
        const b = await User.findOne({ email: friend });
        if (!b) {
            return res.status(400).send({ error: 'Usuario no encontrado' });
        }
        const friendFound = await Friend.findOne({ user: userId, friend: b._id });
        if (friendFound) {
            return res.status(400).send({ error: 'La solicitud ya fue enviada' });
        }
        const newFriend = new Friend({ user: userId, friend: b._id });
        await newFriend.save();

        const noti = new Notification({ from: userId, to: b._id, type: 'request' })
        await noti.save();
        return res.status(200).send({ ok: 'Successfull' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error on server' });
    }
}
const changeStatus = async (req, res) => {
    try {
        const { from, to, status } = req.body;
        await Friend.findOneAndUpdate({ user: from, friend: to }, { status });
        const noti = new Notification({ from: to, to: from, type: status })
        await noti.save();
        return res.status(200).send({ ok: 'Successfull' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error on server' });
    }
}
const getFriends = async (req, res) => {
    try {
        const { id } = req.params;
        const friends = await Friend.find({ status: 'accepted', $or: [{ user: id }, { friend: id }] })
            .populate('user friend')
            .lean();
        const data = friends.map(x => x.friend._id == id ? { ...x.user } : { ...x.friend })
        return res.status(200).send(data);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error on server' });
    }
}
module.exports = {
    sendRequest,
    getFriends,
    changeStatus
}
