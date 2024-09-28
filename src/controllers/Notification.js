const Notification = require("../db/Schemas/Notification");

const getNotifications = async (req, res) => {
    try {
        const { id } = req.params;
        const notis = await Notification.find({ to: id, seen: false }).populate('from to');
        return res.status(200).send(notis);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error on server' });
    }
}
const changeVisible = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findOneAndUpdate({ _id: id }, { seen: true });
        return res.status(200).send({ ok: 'Successfull' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error on server' });
    }
}
module.exports = {
    getNotifications,
    changeVisible
}