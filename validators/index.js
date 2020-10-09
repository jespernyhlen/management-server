const { validationResult } = require('express-validator');

// Extracts the validation errors from the request
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    const hasErrors = !errors.isEmpty();

    if (hasErrors) {
        return res.status(422).json({
            error: errors.array()[0].msg,
        });
    }
    next();
};

module.exports = {
    checkValidation,
};
