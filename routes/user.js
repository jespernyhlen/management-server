const express = require('express');
const router = express.Router();

const { authenticate, authenticateAdmin } = require('../middlewares/auth');
const {
    readUser,
    readUsers,
    updateUser,
    getActivities,
    getBoard,
    updateBoards,
} = require('../controllers/user');

router.get('/user/:id', authenticate, readUser);
router.get('/board/:userid', authenticate, getBoard);
router.put('/board/update', authenticate, updateBoards);

router.get('/users', authenticate, readUsers);

router.put('/user/update', authenticate, updateUser);
router.put('/admin/update', authenticate, authenticateAdmin, updateUser);

module.exports = router;
