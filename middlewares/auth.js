const User = require('../models/user');
const expressJwt = require('express-jwt');

// Makes the decoded JWT payload available on the request object.
// The default behavior of the module is to extract the JWT from the Authorization header
// Can access req.user._id
const authenticate = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
});

// Middleware to ensure only admin access
const authenticateAdmin = (req, res, next) => {
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

        if (user.role !== 'admin') {
            return res.status(400).json({
                error: 'User need to be authorized admin to access this route.',
            });
        }
        next();
    });
};

module.exports = {
    authenticate,
    authenticateAdmin,
};
