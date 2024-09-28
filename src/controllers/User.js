const User = require("../db/Schemas/User");
require('dotenv').config();
const { BlobServiceClient } = require('@azure/storage-blob');
const blobService = BlobServiceClient.fromConnectionString(process.env.AZURE_KEY)

const register = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        return res.status(200).json({ ok: 'Successful' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getUser = async (req, res) => {
    try {
        const { email } = req.params;
        const userFound = await User.findOne({ email });
        return res.status(200).send(userFound);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, lname, username, email, phone, country, birthdate, levelProgramming, favoriteLenguaje, timeProgramming, biografy, university, addressUniversity, profession } = req.body;
        await User.findOneAndUpdate({ _id: id }, { name, lname, username, email, phone, country, birthdate, levelProgramming, favoriteLenguaje, timeProgramming, biografy, university, addressUniversity, profession });
        return res.status(200).send({ ok: 'Successful' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const editPhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { buffer, originalname } = req.file;
        const containerClient = blobService.getContainerClient('photos');
        const blobClient = containerClient.getBlockBlobClient(`${id}_${originalname}`);
        await blobClient.uploadData(buffer);
        const photo = blobClient.url;
        await User.findOneAndUpdate({ _id: id }, { photo });
        return res.status(200).send({ ok: 'Successful' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error on server' });
    }
};
const updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findOneAndUpdate({ _id: id }, { test: true });
        return res.status(200).send({ ok: 'Successful' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports = {
    register,
    getUser,
    updateUser,
    editPhoto,
    updateTest
}

