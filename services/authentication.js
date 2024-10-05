const jwt = require('jsonwebtoken');

exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            msg: 'Access Denied. No token provided.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            msg: 'Invalid token.'
        });
    }
};