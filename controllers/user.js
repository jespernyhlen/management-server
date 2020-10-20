const _ = require('lodash');
const User = require('../models/user');
const Team = require('../models/team');

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
        console.log(user);
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
        var userList = [];

        users.forEach(function (user) {
            var userMap = {};

            userMap = {
                name: user.name,
                role: user.role,
                email: user.email,
                created: user.createdAt,
            };
            userList.push(userMap);
        });

        return res.status(200).json(userList);
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

const getTeam = (req, res) => {
    const teamID = req.params.teamid;

    Team.findById(teamID, (err, team) => {
        if (err) {
            return res.status(500).json({
                error: 'Database error. Please try again.',
            });
        }
        if (!team) {
            return res.status(400).json({
                error: 'Team not found',
            });
        }
        return res.status(200).json(team);
    });
};

const getTeams = (req, res) => {
    const { IDs } = req.body;

    Team.find({ _id: { $in: IDs } }, function (err, teams) {
        if (err) {
            return res.status(500).json({
                error: 'Database error. Please try again.',
            });
        }
        if (teams.length === 0) {
            return res.status(400).json({
                error: 'Teams not found',
            });
        }

        return res.status(200).json(teams);
    });
};

const addTeam = (req, res) => {
    const { token } = req.body;
    const { name, members } = req.body;

    if (!name) {
        return res.status(400).json({
            error: 'Name is missing.',
        });
    }

    let newTeam = {
        name: name,
        members: members,
    };

    const team = new Team(newTeam);

    team.save((err, savedTeam) => {
        if (err) {
            return res.status(400).json({
                error: 'Error trying to create a new team.',
            });
        }

        members.forEach((member) => {
            User.findOne({ email: member.email }, (err, user) => {
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
                console.log(user);

                user.teams.push(savedTeam._id);

                user.save((err, savedUser) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Error trying to save a new team to User.',
                        });
                    }
                });
            });
        });

        return res.status(200).json(savedTeam);
    });
};

const updateTeam = (req, res) => {
    const { _id, name, members, boards } = req.body;

    if (!_id) {
        return res.status(400).json({
            error: 'Team ID are missing.',
        });
    }

    Team.findById(_id, (err, team) => {
        if (err) {
            return res.status(500).json({
                error: 'Database error. Please try again.',
            });
        }
        if (!team) {
            return res.status(400).json({
                error: 'Team not found',
            });
        }

        let added = [];
        let deleted = [];

        if (members) {
            members.map((member) => {
                const found = team.members.find(
                    (element) => element.email == member.email
                );
                if (!found) added.push(member);
            });

            team.members.map((member) => {
                const found = members.find(
                    (element) => element.email == member.email
                );
                if (!found) deleted.push(member);
            });

            if (added.length > 0) {
                added.map((item) => {
                    console.log('Add :', item);

                    User.findOne({ email: item.email }, (err, user) => {
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
                        let newTeams = [...user.teams, _id];

                        user.teams = newTeams;
                        console.log(user.teams);
                        user.save((err, savedUser) => {
                            if (err) {
                                console.log('USER UPDATE ERROR', err);
                                return res.status(400).json({
                                    error: 'Error trying to update user.',
                                });
                            }
                        });
                    });
                });
            }

            if (deleted.length > 0) {
                deleted.map((item) => {
                    console.log('Delete :', item);

                    User.findOne({ email: item.email }, (err, user) => {
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

                        let newTeams = user.teams.filter((id) => _id != id);
                        user.teams = newTeams;
                        user.save((err, savedUser) => {
                            if (err) {
                                console.log('USER UPDATE ERROR', err);
                                return res.status(400).json({
                                    error: 'Error trying to update user.',
                                });
                            }
                        });
                    });
                });
            }
            team.members = members;
        }

        if (members && members.length <= 0) {
            team.remove((err, removedTeam) => {
                if (err) {
                    console.log('TEAM REMOVE ERROR', err);
                    return res.status(400).json({
                        error: 'Error trying to remove team.',
                    });
                }
                return res.status(200).json({
                    message: 'Removed team success.',
                });
            });
        } else {
            if (name) team.name = name;
            if (boards) team.boards = boards;

            team.save((err, savedTeam) => {
                if (err) {
                    console.log('TEAM UPDATE ERROR', err);
                    return res.status(400).json({
                        error: 'Error trying to update team.',
                    });
                }
                return res.status(200).json(savedTeam);
            });
            console.log(team);
        }
    });
};

module.exports = {
    readUser,
    readUsers,
    updateUser,
    getBoard,
    updateBoards,
    getTeam,
    getTeams,
    addTeam,
    updateTeam,
};
