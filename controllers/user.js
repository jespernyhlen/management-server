const User = require('../models/user');

const test = (req, res) => {
    return res.status(200).json({
        message: 'Test success.',
    });
};

const getBoard = (req, res) => {
    const userId = req.params.userid;
    User.findById(userId, (err, user) => {
        if (err) {
            return res.status(500).json({
                error: 'Database error. Please try again.',
            });
        }
        if (!user) {
            return res.status(400).json({
                error: 'User not found',
            });
        }
        board = {
            activities: user.activities,
            columns: user.columns,
            columnOrder: user.columnOrder,
        };
        boards = user.boards;

        return res.status(200).json(boards);
    });
};

const readUser = (req, res) => {
    const userId = req.params.id;
    User.findById(userId, (err, user) => {
        if (err) {
            return res.status(500).json({
                error: 'Database error. Please try again.',
            });
        }
        if (!user) {
            return res.status(400).json({
                error: 'User not found',
            });
        }
        user.hashed_password = undefined;
        user.salt = undefined;
        return res.status(200).json(user);
    });
};

const readUsers = (req, res) => {
    User.find({}, function (err, users) {
        if (err) {
            return res.status(500).json({
                error: 'Database error. Please try again.',
            });
        }
        if (!users) {
            return res.status(400).json({
                error: 'Users not found',
            });
        }
        var userMap = {};

        users.forEach(function (user) {
            userMap[user._id] = {
                name: user.name,
                role: user.role,
                email: user.email,
                created: user.createdAt,
            };
        });

        return res.status(200).json(userMap);
    });
};

const updateUser = (req, res) => {
    const { name, password } = req.body;

    if (!name) {
        return res.status(400).json({
            error: 'Name is required',
        });
    }

    if (password && password.length < 6) {
        return res.status(400).json({
            error: 'Password should be min 6 characters long',
        });
    }
    const { _id } = req.user;

    User.findById(_id, (err, user) => {
        if (err) {
            return res.status(500).json({
                error: 'Database error. Please try again.',
            });
        }
        if (!user) {
            return res.status(400).json({
                error: 'User not found',
            });
        }

        if (password) {
            user.password = password;
        }

        user.name = name;

        user.save((err, savedUser) => {
            if (err) {
                console.log('USER UPDATE ERROR', err);
                return res.status(400).json({
                    error: 'Error trying to update user.',
                });
            }
            savedUser.hashed_password = undefined;
            savedUser.salt = undefined;
            return res.status(200).json(savedUser);
        });
    });
};

const updateBoards = (req, res) => {
    const { boards } = req.body;

    const { _id } = req.user;

    if (!boards) {
        return res.status(400).json({
            error: 'Boards are missing.',
        });
    }

    User.findById(_id, (err, user) => {
        if (err) {
            return res.status(500).json({
                error: 'Database error. Please try again.',
            });
        }
        if (!user) {
            return res.status(400).json({
                error: 'User not found',
            });
        }

        user.boards = boards;

        user.save((err, savedUser) => {
            if (err) {
                console.log('USER UPDATE ERROR', err);
                return res.status(400).json({
                    error: 'Error trying to update user.',
                });
            }
            savedUser.hashed_password = undefined;
            savedUser.salt = undefined;
            return res.status(200).json(savedUser);
        });
        console.log(user);
    });
};

module.exports = {
    readUser,
    readUsers,
    updateUser,
    getBoard,
    updateBoards,
    test,
};
