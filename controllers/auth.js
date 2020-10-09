const User = require('../models/user');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const path = require('path');
const ejs = require('ejs');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const CLIENT_WEB_URL =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : process.env.CLIENT_URL;

const login = (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email }, (err, user) => {
        if (err) {
            return res.status(500).json({
                error: 'Database error. Please try again.',
            });
        }
        if (!user) {
            return res.status(400).json({
                error: 'User with specified email address do not exist.',
            });
        }
        if (!user.checkPassword(password)) {
            return res.status(400).json({
                error: 'Email and password do not match an existing account.',
            });
        }
        // Generate a token and send to client
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        const { _id, name, email, role } = user;

        return res.status(200).json({
            token,
            user: { _id, name, email, role },
        });
    });
};

const register = (req, res) => {
    const { name, email, password } = req.body;

    User.findOne({ email }, (err, user) => {
        if (err) {
            return res.status(500).json({
                error: 'Database error. Please try again.',
            });
        }
        // If user trying to register already existing email
        if (user) {
            return res.status(400).json({
                error: 'Email address is already registred.',
            });
        }
        // Create a JWT token as base for activation link, including activation token, name, email and password
        // At activation token gets verified
        // name, email and password get extracted from token to create new user
        const token = jwt.sign(
            { name, email, password },
            process.env.JWT_ACCOUNT_ACTIVATION,
            { expiresIn: '10m' }
        );

        ejs.renderFile(path.join(__dirname, '../views/activation-email.ejs'), {
            user_name: name,
            user_email: email,
            from_email: process.env.EMAIL_FROM,
            website_url: CLIENT_WEB_URL,
            confirm_link: `${CLIENT_WEB_URL}/auth/activate/${token}`,
        })
            .then((result) => {
                if (!result) {
                    return res.status(500).json({
                        error: 'Internal Server Error',
                    });
                }
                const emailTemplate = result;
                const emailData = {
                    from: process.env.EMAIL_FROM,
                    to: email,
                    subject: `Account activation link`,
                    html: emailTemplate,
                };

                sgMail
                    .send(emailData)
                    .then((sent) => {
                        return res.status(200).json({
                            message: `Email has been sent to ${email}. Follow the instruction to activate your account.`,
                        });
                    })
                    .catch((err) => {
                        return res.status(400).json({
                            message: err.message,
                        });
                    });
            })
            .catch((err) => {
                return res.status(400).json({
                    message:
                        'Something went wrong while sending the activation email. Please try again.',
                });
            });
    });
};

const activateAccount = (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            error: 'Token is missing.',
        });
    }

    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (
        err,
        decoded
    ) {
        if (err) {
            return res.status(400).json({
                error: 'Activation link has expired.',
            });
        }

        const { name, email, password } = jwt.decode(token);
        const user = new User({ name, email, password });

        user.save((err, savedUser) => {
            if (err) {
                return res.status(400).json({
                    error: 'Error trying to register a new user.',
                });
            }
            return res.status(200).json({
                message: `Account with email ${savedUser.email} successfully registered. You can now sign in to your account.`,
            });
        });
    });
};

const forgotPassword = (req, res) => {
    const { email } = req.body;

    User.findOne({ email }, (err, user) => {
        if (err) {
            return res.status(500).json({
                error: 'Database error. Please try again.',
            });
        }

        if (!user) {
            return res.status(400).json({
                error: 'User with specified email address do not exist.',
            });
        }
        const { _id, name } = user;
        const token = jwt.sign({ _id, name }, process.env.JWT_RESET_PASSWORD, {
            expiresIn: '10m',
        });

        user.updateOne({ passwordResetLink: token }, (err, docs) => {
            if (err) {
                return res.status(500).json({
                    error: 'Database error. Please try again.',
                });
            }
            ejs.renderFile(path.join(__dirname, '../views/reset-email.ejs'), {
                user_name: user.name,
                user_email: email,
                from_email: process.env.EMAIL_FROM,
                website_url: CLIENT_WEB_URL,
                confirm_link: `${CLIENT_WEB_URL}/auth/password/reset/${token}`,
            })
                .then((result) => {
                    if (!result) {
                        return res.status(500).json({
                            error: 'Internal Server Error',
                        });
                    }
                    const emailTemplate = result;
                    const emailData = {
                        from: process.env.EMAIL_FROM,
                        to: email,
                        subject: `Password Reset link`,
                        html: emailTemplate,
                    };

                    sgMail
                        .send(emailData)
                        .then((sent) => {
                            return res.status(200).json({
                                message: `Email has been sent to ${email}. Follow the instructions to reset your password.`,
                            });
                        })
                        .catch((err) => {
                            return res.status(400).json({
                                message: err.message,
                            });
                        });
                })
                .catch((err) => {
                    return res.status(400).json({
                        message:
                            'Something went wrong while sending the reset password email. Please try again.',
                    });
                });
        });
    });
};

const resetPassword = (req, res) => {
    const { passwordResetLink, password } = req.body;
    const newPassword = password;

    if (!passwordResetLink || !newPassword) {
        return res.status(400).json({
            error: 'Passwordlink or password is missing.',
        });
    }

    jwt.verify(passwordResetLink, process.env.JWT_RESET_PASSWORD, function (
        err,
        decoded
    ) {
        if (err) {
            return res.status(400).json({
                error: 'Password reset link has expired. Try again',
            });
        }

        User.findOne({ passwordResetLink }, (err, user) => {
            if (err) {
                return res.status(500).json({
                    error: 'Database error. Please try again.',
                });
            }

            if (!user) {
                return res.status(400).json({
                    error:
                        'Matching user could not be found. Please try again.',
                });
            }

            user.password = newPassword;
            user.passwordResetLink = '';

            user.save((err, savedUser) => {
                if (err) {
                    return res.status(400).json({
                        error: 'Error trying to reset password.',
                    });
                }
                return res.status(200).json({
                    message: `Password for ${savedUser.email} successfully updated. You can now login with your new password.`,
                });
            });
        });
    });
};

module.exports = {
    login,
    activateAccount,
    register,
    forgotPassword,
    resetPassword,
};
