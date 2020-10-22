const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/auth');
const {
    readUser,
    readUsers,
    updateUser,
    getBoard,
    updateBoards,
} = require('../controllers/user');

const {
    getTeam,
    getTeams,
    addTeam,
    updateTeam,
} = require('../controllers/team');

router.put('/user/update', authenticate, updateUser);
router.get('/user/:id', authenticate, readUser);
router.get('/board/:userid', authenticate, getBoard);
router.put('/board/update', authenticate, updateBoards);

router.get('/team/:teamid', authenticate, getTeam);
router.put('/teams', authenticate, getTeams);
router.post('/teams/add', authenticate, addTeam);
router.put('/teams/update', authenticate, updateTeam);

router.get('/users', authenticate, readUsers);

module.exports = router;
