const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = (req, res) => {
    const { idToken } = req.body;

    client
        .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
        .then((response) => {
            const { email_verified, name, email } = response.payload;

            if (!email_verified) {
                return res.status(400).json({
                    error: 'Error trying to login with Google.',
                });
            }
            User.findOne({ email }, (err, user) => {
                if (err) {
                    return res.status(500).json({
                        error: 'Database error. Please try again.',
                    });
                }
                // If no existing user is found in DB, register a new user
                if (!user) {
                    let password = email + process.env.JWT_SECRET;

                    user = new User({ name, email, password });
                    user.save((err, savedUser) => {
                        if (err) {
                            return res.status(400).json({
                                error: 'Error trying to register with Google.',
                            });
                        }
                        const token = jwt.sign(
                            { _id: savedUser._id },
                            process.env.JWT_SECRET,
                            { expiresIn: '7d' }
                        );
                        const { _id, email, name, role } = savedUser;
                        return res.status(200).json({
                            token,
                            user: { _id, email, name, role },
                        });
                    });
                } else {
                    // If user exists in DB, login
                    const token = jwt.sign(
                        { _id: user._id },
                        process.env.JWT_SECRET,
                        { expiresIn: '7d' }
                    );
                    const { _id, email, name, role } = user;
                    return res.status(200).json({
                        token,
                        user: { _id, email, name, role },
                    });
                }
            });
        })
        .catch((error) => {
            res.json({
                error: 'Error trying to connect with Google.',
            });
        });
};

const facebookLogin = (req, res) => {
    const { userID, accessToken } = req.body;
    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=name,email&access_token=${accessToken}`;

    fetch(url, {
        method: 'GET',
    })
        .then((response) => response.json())
        .then((response) => {
            const { email, name } = response;
            User.findOne({ email }, (err, user) => {
                if (err) {
                    return res.status(500).json({
                        error: 'Database error. Please try again.',
                    });
                }
                if (!user) {
                    let password = email + process.env.JWT_SECRET;

                    user = new User({ name, email, password });
                    user.save((err, savedUser) => {
                        if (err) {
                            return res.status(400).json({
                                error:
                                    'Error trying to register with Facebook.',
                            });
                        }
                        const token = jwt.sign(
                            { _id: savedUser._id },
                            process.env.JWT_SECRET,
                            { expiresIn: '7d' }
                        );
                        const { _id, email, name, role } = savedUser;

                        return res.status(200).json({
                            token,
                            user: { _id, email, name, role },
                        });
                    });
                } else {
                    const token = jwt.sign(
                        { _id: user._id },
                        process.env.JWT_SECRET,
                        { expiresIn: '7d' }
                    );
                    const { _id, email, name, role } = user;

                    return res.status(200).json({
                        token,
                        user: { _id, email, name, role },
                    });
                }
            });
        })
        .catch((error) => {
            res.json({
                error: 'Error trying to connect with Facebook.',
            });
        });
};

module.exports = {
    googleLogin,
    facebookLogin,
};
