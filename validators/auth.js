const { check } = require('express-validator');

const validateRegisterFields = [
    check('name').notEmpty().withMessage('Name is required.'),
    check('email').isEmail().withMessage('Must be a valid email address.'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.'),
];

const validateLoginFields = [
    check('email').isEmail().withMessage('Must be a valid email address.'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.'),
];

const validateEmailField = [
    check('email').isEmail().withMessage('Must be a valid email address.'),
];
const validatePasswordField = [
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.'),
];

module.exports = {
    validateRegisterFields,
    validateLoginFields,
    validateEmailField,
    validatePasswordField,
};
