const expressJwt = require('express-jwt');

// Makes the decoded JWT payload available on the request object.
// The default behavior of the module is to extract the JWT from the Authorization header
// Can access req.user._id
const authenticate = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
});

module.exports = {
    authenticate,
};
