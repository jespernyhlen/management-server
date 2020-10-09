const express = require('express');
const router = express.Router();

const {
    login,
    register,
    activateAccount,
    forgotPassword,
    resetPassword,
} = require('../controllers/auth');

const {
    validateRegisterFields,
    validateLoginFields,
    validateEmailField,
    validatePasswordField,
} = require('../validators/auth');
const { checkValidation } = require('../validators');

router.get('/check', (req, res) => {
    return res.status(200).json({ message: 'Check OK!' });
});

router.post('/login', validateLoginFields, checkValidation, login);
router.post('/register', validateRegisterFields, checkValidation, register);
router.post('/account-activation', activateAccount);
router.put(
    '/forgot-password',
    validateEmailField,
    checkValidation,
    forgotPassword
);
router.put(
    '/reset-password',
    validatePasswordField,
    checkValidation,
    resetPassword
);

module.exports = router;
