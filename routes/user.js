const express = require('express');
const router = express.Router();

const { authenticate, authenticateAdmin } = require('../middlewares/auth');
const {
    readUser,
    readUsers,
    updateUser,
    getBoard,
    updateBoards,
    getTeam,
    getTeams,
    addTeam,
    updateTeam,
} = require('../controllers/user');

router.get('/user/:id', authenticate, readUser);
router.get('/board/:userid', authenticate, getBoard);
router.put('/board/update', authenticate, updateBoards);
router.put('/teams', getTeams);
router.get('/team/:teamid', getTeam);
router.post('/teams/add', addTeam);
router.put('/teams/update', updateTeam);

router.get('/users', authenticate, readUsers);

router.put('/user/update', authenticate, updateUser);
router.put('/admin/update', authenticate, authenticateAdmin, updateUser);

module.exports = router;
